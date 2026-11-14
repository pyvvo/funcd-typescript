// s3-roundtrip: an S3 client built from the AWS_* variables that funcd gives the worker. On each call the handler:
//   (a) PutObject  lakehouse/gold/roundtrip-<inv>.txt   — gold is the prefix it owns → allowed
//   (b) GetObject  it back                              — the body must match
//   (c) ListObjectsV2 prefix lakehouse/gold/            — the key must be present
//   (d) PutObject  lakehouse/other/x.txt                — refused with 403 on a platform; funcdctl dev allows it
//   (e) PutObject + GetObject  lakehouse/shared/granted-<inv>.txt — allowed by the role in rolesassignment.yaml
// It returns one field per step: put, get, list (the number of keys under gold/, or 0 without the new key), denied
// (true when (d) was refused) and granted (true when (e) read back what it wrote).
import type { CloudEvent, FunctionContext } from '@funcd-dev/shim';

import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

export interface FuncInput {
  /** Optional invocation tag woven into the object key (defaults to a timestamp). */
  inv?: string;
}
export interface FuncOutput {
  put: boolean;
  get: boolean;
  list: number;
  denied: boolean;
  /** true when the object written into shared, a prefix it neither owns nor binds, reads back unchanged: the role in
   *  rolesassignment.yaml allows the write and the read. */
  granted: boolean;
}

const BUCKET = 'lakehouse';
const GOLD = 'gold'; // the prefix this function owns
const OTHER = 'other'; // not owned, not bound: a platform refuses the write
const SHARED = 'shared'; // not owned, not bound: written through the role in rolesassignment.yaml

function newClient(): S3Client {
  return new S3Client({
    region: process.env.AWS_REGION,
    endpoint: process.env.AWS_ENDPOINT_URL_S3,
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
    },
    // The gateway refuses the SDK's default streaming checksum trailer, so the client sends and checks a checksum
    // only when an operation requires one.
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
  });
}

async function streamToString(body: unknown): Promise<string> {
  // In Node the GetObject Body is a Readable stream; transformToString is the SDK helper.
  const b = body as { transformToString?: () => Promise<string> } | undefined;
  if (b?.transformToString) {
    return b.transformToString();
  }
  return '';
}

export async function handle(ctx: FunctionContext, event: CloudEvent<FuncInput>): Promise<FuncOutput> {
  const inv = event.data?.inv ?? String(Date.now());
  const key = `${GOLD}/roundtrip-${inv}.txt`;
  const want = `roundtrip-${inv}`;
  const s3 = newClient();

  // (a) PutObject into gold, the prefix it owns → allowed.
  await s3.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: want }));
  ctx.log(`s3-roundtrip: PUT ${BUCKET}/${key} ok`);
  const put = true;

  // (b) GetObject it back → body must match.
  const got = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
  const body = await streamToString(got.Body);
  const get = body === want;
  ctx.log(`s3-roundtrip: GET ${BUCKET}/${key} → match=${get}`);

  // (c) ListObjectsV2 the gold prefix → the key must be present.
  const listed = await s3.send(new ListObjectsV2Command({ Bucket: BUCKET, Prefix: `${GOLD}/` }));
  const keys = (listed.Contents ?? []).map((o) => o.Key);
  const list = keys.includes(key) ? keys.length : 0;
  ctx.log(`s3-roundtrip: LIST ${GOLD}/ → ${keys.length} object(s), present=${keys.includes(key)}`);

  // (d) PutObject into other, which it neither owns nor binds → 403 on a platform; funcdctl dev allows it.
  let denied = false;
  try {
    await s3.send(new PutObjectCommand({ Bucket: BUCKET, Key: `${OTHER}/x.txt`, Body: 'nope' }));
    ctx.log(`s3-roundtrip: PUT ${OTHER}/x.txt allowed (denied=false)`);
  } catch (err) {
    const e = err as { $metadata?: { httpStatusCode?: number }; name?: string };
    const code = e?.$metadata?.httpStatusCode;
    denied = code === 403 || e?.name === 'AccessDenied';
    ctx.log(`s3-roundtrip: PUT ${OTHER}/x.txt denied=${denied} (status=${code}, name=${e?.name})`);
  }

  // (e) PutObject + GetObject into shared, which it neither owns nor binds → allowed by the role in
  //     rolesassignment.yaml.
  let granted = false;
  try {
    const gkey = `${SHARED}/granted-${inv}.txt`;
    await s3.send(new PutObjectCommand({ Bucket: BUCKET, Key: gkey, Body: want }));
    const g = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: gkey }));
    granted = (await streamToString(g.Body)) === want;
    ctx.log(`s3-roundtrip: PUT+GET ${gkey} via RolesAssignment grant → granted=${granted}`);
  } catch (err) {
    const e = err as { $metadata?: { httpStatusCode?: number }; name?: string };
    ctx.log(`s3-roundtrip: ${SHARED} write via grant FAILED (status=${e?.$metadata?.httpStatusCode}, name=${e?.name})`);
  }

  return { put, get, list, denied, granted };
}
