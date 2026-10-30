// GENERATED from shim/src/shim.ts by 'yarn build' (esbuild). Do not edit by hand.

// ../node_modules/@hono/node-server/dist/constants-BLSFu_RU.mjs
var X_ALREADY_SENT = "x-hono-already-sent";

// ../node_modules/@hono/node-server/dist/index.mjs
import { STATUS_CODES, createServer } from "node:http";
import { Http2ServerRequest, constants } from "node:http2";
import { Readable } from "node:stream";

// ../node_modules/hono/dist/helper/websocket/index.js
var defineWebSocketHelper = (handler) => {
  return ((...args) => {
    if (typeof args[0] === "function") {
      const [createEvents, options] = args;
      return async function upgradeWebSocket2(c, next) {
        const events = await createEvents(c);
        const result = await handler(c, events, options);
        if (result) {
          return result;
        }
        await next();
      };
    } else {
      const [c, events, options] = args;
      return (async () => {
        const upgraded = await handler(c, events, options);
        if (!upgraded) {
          throw new Error("Failed to upgrade WebSocket");
        }
        return upgraded;
      })();
    }
  });
};

// ../node_modules/@hono/node-server/dist/index.mjs
var RequestError = class extends Error {
  constructor(message, options) {
    super(message, options);
    this.name = "RequestError";
  }
};
var nonJoinedHeaders = /* @__PURE__ */ new Set([
  "age",
  "authorization",
  "content-length",
  "content-type",
  "etag",
  "expires",
  "from",
  "host",
  "if-modified-since",
  "if-unmodified-since",
  "last-modified",
  "location",
  "max-forwards",
  "proxy-authorization",
  "referer",
  "retry-after",
  "server",
  "user-agent"
]);
var validHeaderName = /^[!#$%&'*+\-.^_`|~\dA-Za-z]+$/;
var isHttpWhitespace = (code) => code === 9 || code === 10 || code === 13 || code === 32;
var normalizeHeaderValue = (value) => {
  if (!isHttpWhitespace(value.charCodeAt(0)) && !isHttpWhitespace(value.charCodeAt(value.length - 1))) return value;
  let start = 0;
  let end = value.length;
  while (start < end && isHttpWhitespace(value.charCodeAt(start))) start++;
  while (end > start && isHttpWhitespace(value.charCodeAt(end - 1))) end--;
  return value.slice(start, end);
};
var forbiddenHeaderValue = /[\0\r\n]/;
var GlobalHeaders = globalThis.Headers;
var materializeHeaders = (rawHeaders, HeadersCtor = GlobalHeaders) => {
  const headers = new HeadersCtor();
  for (let i = 0; i < rawHeaders.length; i += 2) {
    const name = rawHeaders[i];
    if (!name.startsWith(":")) headers.append(name, rawHeaders[i + 1]);
  }
  return headers;
};
var RequestHeaders = class {
  #incoming;
  #rawHeaders;
  #headers;
  #invalidValue;
  constructor(incoming) {
    this.#incoming = incoming;
    if (incoming instanceof Http2ServerRequest) this.#rawHeaders = incoming.rawHeaders.slice();
  }
  get #lazyRawHeaders() {
    return this.#rawHeaders ??= this.#incoming.rawHeaders.slice();
  }
  get #native() {
    if (!this.#headers) {
      this.#headers = materializeHeaders(this.#lazyRawHeaders);
      this.#rawHeaders = void 0;
    }
    return this.#headers;
  }
  #normalizedName(name) {
    if (typeof name !== "string") return;
    if (!validHeaderName.test(name)) throw new TypeError(`Invalid header name: ${name}`);
    return name.toLowerCase();
  }
  #lookupHttp1(lowerName) {
    const headers = this.#incoming instanceof Http2ServerRequest ? void 0 : this.#incoming.headers;
    if (!headers || nonJoinedHeaders.has(lowerName) || lowerName === "set-cookie" || lowerName === "__proto__") return;
    if (!Object.hasOwn(headers, lowerName)) return null;
    const rawValue = headers[lowerName];
    if (typeof rawValue === "string") {
      const value = normalizeHeaderValue(rawValue);
      return forbiddenHeaderValue.test(value) ? void 0 : value;
    }
  }
  #lookup(rawHeaders, lowerName) {
    const separator = lowerName === "cookie" ? "; " : ", ";
    let value = null;
    for (let i = 0; i < rawHeaders.length; i += 2) {
      const rawName = rawHeaders[i];
      if (rawName.length === lowerName.length && rawName.toLowerCase() === lowerName) {
        const rawValue = normalizeHeaderValue(rawHeaders[i + 1]);
        if (forbiddenHeaderValue.test(rawValue)) {
          this.#invalidValue = true;
          return;
        }
        value = value === null ? rawValue : value + separator + rawValue;
      }
    }
    return value;
  }
  append(name, value) {
    this.#native.append(name, value);
  }
  delete(name) {
    this.#native.delete(name);
  }
  get(name) {
    const lowerName = this.#normalizedName(name);
    if (lowerName && !this.#headers && !this.#invalidValue) {
      const http1Value = this.#lookupHttp1(lowerName);
      if (http1Value !== void 0) return http1Value;
      const value = this.#lookup(this.#lazyRawHeaders, lowerName);
      if (value !== void 0) return value;
    }
    return this.#native.get(name);
  }
  has(name) {
    const lowerName = this.#normalizedName(name);
    if (lowerName && !this.#headers && !this.#invalidValue) {
      const http1Value = this.#lookupHttp1(lowerName);
      if (http1Value !== void 0) return http1Value !== null;
      const value = this.#lookup(this.#lazyRawHeaders, lowerName);
      if (value !== void 0) return value !== null;
    }
    return this.#native.has(name);
  }
  set(name, value) {
    this.#native.set(name, value);
  }
  getSetCookie() {
    return this.#native.getSetCookie();
  }
  keys() {
    return this.#native.keys();
  }
  values() {
    return this.#native.values();
  }
  entries() {
    return this.#native.entries();
  }
  forEach(callback, thisArg) {
    this.#native.forEach((value, key) => {
      callback.call(thisArg, value, key, this);
    });
  }
  [Symbol.iterator]() {
    return this.entries();
  }
};
Object.defineProperty(RequestHeaders.prototype, /* @__PURE__ */ Symbol.for("nodejs.util.inspect.custom"), { value: function(depth, options, inspectFn) {
  return `Headers (lightweight) ${inspectFn(Object.fromEntries(this), {
    ...options,
    depth: depth == null ? null : depth - 1
  })}`;
} });
Object.setPrototypeOf(RequestHeaders.prototype, GlobalHeaders.prototype);
var newHeadersFromIncoming = (incoming) => globalThis.Headers === GlobalHeaders ? new RequestHeaders(incoming) : materializeHeaders(incoming.rawHeaders, globalThis.Headers);
var reValidRequestUrl = /^\/[!#$&-;=?-\[\]_a-z~]*$/;
var reDotSegment = /\/\.\.?(?:[/?#]|$)/;
var reValidHost = /^[a-z0-9._-]+(?::(?:[1-5]\d{3,4}|[6-9]\d{3}))?$/;
var buildUrl = (scheme, host, incomingUrl) => {
  const url = `${scheme}://${host}${incomingUrl}`;
  if (!reValidHost.test(host)) {
    const urlObj = new URL(url);
    if (urlObj.hostname.length !== host.length && urlObj.hostname !== (host.includes(":") ? host.replace(/:\d+$/, "") : host).toLowerCase()) throw new RequestError("Invalid host header");
    return urlObj.href;
  } else if (incomingUrl.length === 0) return url + "/";
  else {
    if (incomingUrl.charCodeAt(0) !== 47) throw new RequestError("Invalid URL");
    if (!reValidRequestUrl.test(incomingUrl) || reDotSegment.test(incomingUrl)) return new URL(url).href;
    return url;
  }
};
var toRequestError = (e) => {
  if (e instanceof RequestError) return e;
  return new RequestError(e.message, { cause: e });
};
var GlobalRequest = global.Request;
var Request$1 = class extends GlobalRequest {
  constructor(input, options) {
    if (typeof input === "object" && getRequestCache in input) {
      const hasReplacementBody = options !== void 0 && "body" in options && options.body != null;
      if (input[bodyConsumedDirectlyKey] && !hasReplacementBody) throw new TypeError("Cannot construct a Request with a Request object that has already been used.");
      input = input[getRequestCache]();
    }
    if (typeof options?.body?.getReader !== "undefined") options.duplex ??= "half";
    super(input, options);
  }
};
var wrapBodyStream = /* @__PURE__ */ Symbol("wrapBodyStream");
var byteExactEncodings = /* @__PURE__ */ new Set([
  "latin1",
  "binary",
  "hex",
  "base64",
  "base64url"
]);
var isByteExactEncoding = (encoding) => encoding === null || byteExactEncodings.has(encoding);
var bodyBufferedBeforeDisconnectKey = /* @__PURE__ */ Symbol("bodyBufferedBeforeDisconnect");
var bodyBufferedLengthBeforeDisconnectKey = /* @__PURE__ */ Symbol("bodyBufferedLengthBeforeDisconnect");
var toBufferChunk = (chunk, encoding) => Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding ?? "utf8");
var isRecoverableDisconnectedIncoming = (incoming) => !(incoming instanceof Http2ServerRequest) && !!incoming.complete && !!incoming.readableAborted && typeof incoming.read === "function" && isByteExactEncoding(incoming.readableEncoding);
var recordBodyBufferedBeforeDisconnect = (incoming) => {
  if (incoming.readableDidRead || !isRecoverableDisconnectedIncoming(incoming)) return;
  const incomingWithRecovery = incoming;
  incomingWithRecovery[bodyBufferedLengthBeforeDisconnectKey] ??= incoming.readableLength;
};
var readBodyBufferedBeforeDisconnect = (incoming, chunks) => {
  if (incoming.readableDidRead && !chunks || !isRecoverableDisconnectedIncoming(incoming)) return;
  const incomingWithRecovery = incoming;
  if (incomingWithRecovery[bodyBufferedBeforeDisconnectKey] !== void 0) return incomingWithRecovery[bodyBufferedBeforeDisconnectKey];
  let result;
  const errored = incoming.errored;
  if (errored && errored.code !== "ECONNRESET") result = errored;
  else if (incomingWithRecovery[bodyBufferedLengthBeforeDisconnectKey] !== void 0 && incoming.readableLength !== incomingWithRecovery[bodyBufferedLengthBeforeDisconnectKey]) result = newBodyUnusableError();
  else {
    const bodyChunks = chunks ?? [];
    const chunk = incoming.read();
    if (chunk !== null) bodyChunks.push(toBufferChunk(chunk, incoming.readableEncoding));
    const buffer = bodyChunks.length === 1 ? bodyChunks[0] : Buffer.concat(bodyChunks);
    result = buffer;
    const contentLength = incoming.headers["content-length"];
    if (typeof contentLength === "string" && /^\d+$/.test(contentLength)) {
      const expectedLength = Number(contentLength);
      if (Number.isSafeInteger(expectedLength) && buffer.length !== expectedLength) result = newBodyUnusableError();
    }
  }
  incomingWithRecovery[bodyBufferedBeforeDisconnectKey] = result;
  return result;
};
var enqueueBufferedBody = (controller, buffered) => {
  if (buffered instanceof Error) {
    controller.error(buffered);
    return;
  }
  if (buffered.length > 0) controller.enqueue(buffered);
  controller.close();
};
var newRequestFromIncoming = (method, url, headers, incoming, abortController) => {
  const init = {
    method,
    headers,
    signal: abortController.signal
  };
  if (method === "TRACE") {
    init.method = "GET";
    const req = new Request$1(url, init);
    Object.defineProperty(req, "method", { get() {
      return "TRACE";
    } });
    return req;
  }
  if (!(method === "GET" || method === "HEAD")) if ("rawBody" in incoming && incoming.rawBody instanceof Buffer) init.body = new ReadableStream({ start(controller) {
    controller.enqueue(incoming.rawBody);
    controller.close();
  } });
  else if (incoming[wrapBodyStream]) {
    let reader;
    init.body = new ReadableStream({ async pull(controller) {
      try {
        if (!reader) {
          const buffered = readBodyBufferedBeforeDisconnect(incoming);
          if (buffered !== void 0) {
            enqueueBufferedBody(controller, buffered);
            return;
          }
        }
        reader ||= Readable.toWeb(incoming).getReader();
        const { done, value } = await reader.read();
        if (done) controller.close();
        else controller.enqueue(value);
      } catch (error) {
        controller.error(error);
      }
    } });
  } else {
    const buffered = readBodyBufferedBeforeDisconnect(incoming);
    if (buffered !== void 0) init.body = new ReadableStream({ start(controller) {
      enqueueBufferedBody(controller, buffered);
    } });
    else init.body = Readable.toWeb(incoming);
  }
  return new Request$1(url, init);
};
var getRequestCache = /* @__PURE__ */ Symbol("getRequestCache");
var requestCache = /* @__PURE__ */ Symbol("requestCache");
var incomingKey = /* @__PURE__ */ Symbol("incomingKey");
var urlKey = /* @__PURE__ */ Symbol("urlKey");
var methodKey = /* @__PURE__ */ Symbol("methodKey");
var headersKey = /* @__PURE__ */ Symbol("headersKey");
var abortControllerKey = /* @__PURE__ */ Symbol("abortControllerKey");
var getAbortController = /* @__PURE__ */ Symbol("getAbortController");
var abortRequest = /* @__PURE__ */ Symbol("abortRequest");
var bodyBufferKey = /* @__PURE__ */ Symbol("bodyBuffer");
var bodyReadPromiseKey = /* @__PURE__ */ Symbol("bodyReadPromise");
var bodyConsumedDirectlyKey = /* @__PURE__ */ Symbol("bodyConsumedDirectly");
var bodyLockReaderKey = /* @__PURE__ */ Symbol("bodyLockReader");
var abortReasonKey = /* @__PURE__ */ Symbol("abortReason");
var newBodyUnusableError = () => {
  return /* @__PURE__ */ new TypeError("Body is unusable");
};
var rejectBodyUnusable = () => {
  return Promise.reject(newBodyUnusableError());
};
var textDecoder = new TextDecoder();
var consumeBodyDirectOnce = (request) => {
  if (request[bodyConsumedDirectlyKey]) return rejectBodyUnusable();
  request[bodyConsumedDirectlyKey] = true;
};
var toArrayBuffer = (buf) => {
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
};
var contentType = (request) => {
  return (request[headersKey] ||= newHeadersFromIncoming(request[incomingKey])).get("content-type") || "";
};
var methodTokenRegExp = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
var normalizeIncomingMethod = (method) => {
  if (typeof method !== "string" || method.length === 0) return "GET";
  switch (method) {
    case "DELETE":
    case "GET":
    case "HEAD":
    case "OPTIONS":
    case "PATCH":
    case "POST":
    case "PUT":
    case "QUERY":
      return method;
  }
  const upper = method.toUpperCase();
  switch (upper) {
    case "DELETE":
    case "GET":
    case "HEAD":
    case "OPTIONS":
    case "POST":
    case "PUT":
      return upper;
    default:
      return method;
  }
};
var validateDirectReadMethod = (method) => {
  if (!methodTokenRegExp.test(method)) return /* @__PURE__ */ new TypeError(`'${method}' is not a valid HTTP method.`);
  const normalized = method.toUpperCase();
  if (normalized === "CONNECT" || normalized === "TRACK" || normalized === "TRACE" && method !== "TRACE") return /* @__PURE__ */ new TypeError(`'${method}' HTTP method is unsupported.`);
};
var readBodyWithFastPath = (request, method, fromBuffer) => {
  if (request[bodyConsumedDirectlyKey]) return rejectBodyUnusable();
  const methodName = request.method;
  if (methodName === "GET" || methodName === "HEAD") return request[getRequestCache]()[method]();
  const methodValidationError = validateDirectReadMethod(methodName);
  if (methodValidationError) return Promise.reject(methodValidationError);
  if (request[requestCache]) {
    if (methodName !== "TRACE") return request[requestCache][method]();
  }
  const alreadyUsedError = consumeBodyDirectOnce(request);
  if (alreadyUsedError) return alreadyUsedError;
  const raw2 = readRawBodyIfAvailable(request);
  if (raw2) {
    const result = Promise.resolve(fromBuffer(raw2, request));
    request[bodyBufferKey] = void 0;
    return result;
  }
  return readBodyDirect(request).then((buf) => {
    const result = fromBuffer(buf, request);
    request[bodyBufferKey] = void 0;
    return result;
  });
};
var readRawBodyIfAvailable = (request) => {
  const incoming = request[incomingKey];
  if ("rawBody" in incoming && incoming.rawBody instanceof Buffer) return incoming.rawBody;
};
var normalizeAbortError = (request, incoming) => {
  if (incoming.errored) return incoming.errored;
  const reason = request[abortReasonKey];
  if (reason !== void 0) return reason instanceof Error ? reason : new Error(String(reason));
  return /* @__PURE__ */ new Error("Client connection prematurely closed.");
};
var readBodyDirect = (request) => {
  if (request[bodyBufferKey]) return Promise.resolve(request[bodyBufferKey]);
  if (request[bodyReadPromiseKey]) return request[bodyReadPromiseKey];
  const incoming = request[incomingKey];
  if (incoming.readableDidRead) return rejectBodyUnusable();
  const buffered = readBodyBufferedBeforeDisconnect(incoming);
  if (buffered !== void 0) {
    if (buffered instanceof Error) return Promise.reject(buffered);
    request[bodyBufferKey] = buffered;
    return Promise.resolve(buffered);
  }
  const promise = new Promise((resolve, reject) => {
    const chunks = [];
    let settled = false;
    const finish = (callback) => {
      if (settled) return;
      settled = true;
      cleanup();
      callback();
    };
    const recoverCompleteBodyAfterDisconnect = (error) => {
      const streamError = incoming.errored ?? error;
      if (!isRecoverableDisconnectedIncoming(incoming) || streamError && streamError.code !== "ECONNRESET") return false;
      finish(() => {
        const recovered = readBodyBufferedBeforeDisconnect(incoming, chunks);
        if (recovered instanceof Error) reject(recovered);
        else if (recovered === void 0) reject(error ?? normalizeAbortError(request, incoming));
        else {
          request[bodyBufferKey] = recovered;
          resolve(recovered);
        }
      });
      return true;
    };
    const onData = (chunk) => {
      chunks.push(toBufferChunk(chunk, incoming.readableEncoding));
    };
    const onEnd = () => {
      finish(() => {
        const buffer = chunks.length === 1 ? chunks[0] : Buffer.concat(chunks);
        request[bodyBufferKey] = buffer;
        resolve(buffer);
      });
    };
    const onError = (error) => {
      if (recoverCompleteBodyAfterDisconnect(error)) return;
      finish(() => {
        reject(error);
      });
    };
    const onClose = () => {
      if (incoming.readableEnded) {
        onEnd();
        return;
      }
      if (recoverCompleteBodyAfterDisconnect()) return;
      finish(() => {
        reject(normalizeAbortError(request, incoming));
      });
    };
    const cleanup = () => {
      incoming.off("data", onData);
      incoming.off("end", onEnd);
      incoming.off("error", onError);
      incoming.off("close", onClose);
      request[bodyReadPromiseKey] = void 0;
    };
    incoming.on("data", onData);
    incoming.on("end", onEnd);
    incoming.on("error", onError);
    incoming.on("close", onClose);
    queueMicrotask(() => {
      if (settled) return;
      if (incoming.readableEnded) onEnd();
      else if (incoming.errored) onError(incoming.errored);
      else if (incoming.destroyed) onClose();
    });
  });
  request[bodyReadPromiseKey] = promise;
  return promise;
};
var requestPrototype = {
  get method() {
    return this[methodKey];
  },
  get url() {
    return this[urlKey];
  },
  get headers() {
    return this[headersKey] ||= newHeadersFromIncoming(this[incomingKey]);
  },
  [abortRequest](reason) {
    if (this[abortReasonKey] === void 0) this[abortReasonKey] = reason;
    const abortController = this[abortControllerKey];
    if (abortController && !abortController.signal.aborted) abortController.abort(reason);
  },
  [getAbortController]() {
    this[abortControllerKey] ||= new AbortController();
    if (this[abortReasonKey] !== void 0 && !this[abortControllerKey].signal.aborted) this[abortControllerKey].abort(this[abortReasonKey]);
    return this[abortControllerKey];
  },
  [getRequestCache]() {
    const abortController = this[getAbortController]();
    if (this[requestCache]) return this[requestCache];
    const method = this.method;
    if (this[bodyConsumedDirectlyKey] && !(method === "GET" || method === "HEAD")) {
      this[bodyBufferKey] = void 0;
      const init = {
        method: method === "TRACE" ? "GET" : method,
        headers: this.headers,
        signal: abortController.signal
      };
      if (method !== "TRACE") {
        init.body = new ReadableStream({ start(c) {
          c.close();
        } });
        init.duplex = "half";
      }
      const req = new Request$1(this[urlKey], init);
      if (method === "TRACE") Object.defineProperty(req, "method", { get() {
        return "TRACE";
      } });
      return this[requestCache] = req;
    }
    return this[requestCache] = newRequestFromIncoming(this.method, this[urlKey], this.headers, this[incomingKey], abortController);
  },
  get body() {
    if (!this[bodyConsumedDirectlyKey]) return this[getRequestCache]().body;
    const request = this[getRequestCache]();
    if (!this[bodyLockReaderKey] && request.body) this[bodyLockReaderKey] = request.body.getReader();
    return request.body;
  },
  get bodyUsed() {
    if (this[bodyConsumedDirectlyKey]) return true;
    if (this[requestCache]) return this[requestCache].bodyUsed;
    return false;
  }
};
Object.defineProperty(requestPrototype, "signal", { get() {
  return this[getAbortController]().signal;
} });
[
  "cache",
  "credentials",
  "destination",
  "integrity",
  "mode",
  "redirect",
  "referrer",
  "referrerPolicy",
  "keepalive"
].forEach((k) => {
  Object.defineProperty(requestPrototype, k, { get() {
    return this[getRequestCache]()[k];
  } });
});
["clone", "formData"].forEach((k) => {
  Object.defineProperty(requestPrototype, k, { value: function() {
    if (this[bodyConsumedDirectlyKey]) {
      if (k === "clone") throw newBodyUnusableError();
      return rejectBodyUnusable();
    }
    return this[getRequestCache]()[k]();
  } });
});
Object.defineProperty(requestPrototype, "text", { value: function() {
  return readBodyWithFastPath(this, "text", (buf) => textDecoder.decode(buf));
} });
Object.defineProperty(requestPrototype, "arrayBuffer", { value: function() {
  return readBodyWithFastPath(this, "arrayBuffer", (buf) => toArrayBuffer(buf));
} });
Object.defineProperty(requestPrototype, "blob", { value: function() {
  return readBodyWithFastPath(this, "blob", (buf, request) => {
    const type = contentType(request);
    const init = type ? { headers: { "content-type": type } } : void 0;
    return new Response(buf, init).blob();
  });
} });
Object.defineProperty(requestPrototype, "json", { value: function() {
  if (this[bodyConsumedDirectlyKey]) return rejectBodyUnusable();
  return this.text().then(JSON.parse);
} });
Object.defineProperty(requestPrototype, /* @__PURE__ */ Symbol.for("nodejs.util.inspect.custom"), { value: function(depth, options, inspectFn) {
  return `Request (lightweight) ${inspectFn({
    method: this.method,
    url: this.url,
    headers: this.headers,
    nativeRequest: this[requestCache]
  }, {
    ...options,
    depth: depth == null ? null : depth - 1
  })}`;
} });
Object.setPrototypeOf(requestPrototype, Request$1.prototype);
var newRequest = (incoming, defaultHostname) => {
  const req = Object.create(requestPrototype);
  req[incomingKey] = incoming;
  req[methodKey] = normalizeIncomingMethod(incoming.method);
  const incomingUrl = incoming.url || "";
  if (incomingUrl[0] !== "/" && (incomingUrl.startsWith("http://") || incomingUrl.startsWith("https://"))) {
    if (incoming instanceof Http2ServerRequest) throw new RequestError("Absolute URL for :path is not allowed in HTTP/2");
    try {
      req[urlKey] = new URL(incomingUrl).href;
    } catch (e) {
      throw new RequestError("Invalid absolute URL", { cause: e });
    }
    return req;
  }
  const host = (incoming instanceof Http2ServerRequest ? incoming.authority : incoming.headers.host) || defaultHostname;
  if (!host) throw new RequestError("Missing host header");
  let scheme;
  if (incoming instanceof Http2ServerRequest) {
    scheme = incoming.scheme;
    if (!(scheme === "http" || scheme === "https")) throw new RequestError("Unsupported scheme");
  } else scheme = incoming.socket && incoming.socket.encrypted ? "https" : "http";
  try {
    req[urlKey] = buildUrl(scheme, host, incomingUrl);
  } catch (e) {
    if (e instanceof RequestError) throw e;
    else throw new RequestError("Invalid URL", { cause: e });
  }
  return req;
};
var defaultContentType = "text/plain; charset=UTF-8";
var responseCache = /* @__PURE__ */ Symbol("responseCache");
var getResponseCache = /* @__PURE__ */ Symbol("getResponseCache");
var cacheKey = /* @__PURE__ */ Symbol("cache");
var GlobalResponse = global.Response;
var Response$1 = class Response$12 {
  #body;
  #init;
  [getResponseCache]() {
    const cache = this[cacheKey];
    const liveHeaders = cache && cache[2] instanceof Headers ? cache[2] : void 0;
    delete this[cacheKey];
    return this[responseCache] ||= new GlobalResponse(this.#body, liveHeaders ? {
      status: this.#init?.status,
      statusText: this.#init?.statusText,
      headers: liveHeaders
    } : this.#init);
  }
  constructor(body, init) {
    let headers;
    this.#body = body;
    if (init instanceof GlobalResponse) {
      const cachedGlobalResponse = init[responseCache];
      if (cachedGlobalResponse) {
        this.#init = cachedGlobalResponse;
        this[getResponseCache]();
        return;
      }
      this.#init = init instanceof Response$12 ? init.#init : init;
      headers = new Headers(init.headers);
    } else this.#init = init;
    if (body == null || typeof body === "string" || typeof body?.getReader !== "undefined" || body instanceof Blob || body instanceof Uint8Array) this[cacheKey] = [
      init?.status || 200,
      body ?? null,
      headers || init?.headers
    ];
  }
  get headers() {
    const cache = this[cacheKey];
    if (cache) {
      if (!(cache[2] instanceof Headers)) cache[2] = new Headers(cache[2] || (cache[1] === null ? void 0 : { "content-type": defaultContentType }));
      return cache[2];
    }
    return this[getResponseCache]().headers;
  }
  get status() {
    return this[cacheKey]?.[0] ?? this[getResponseCache]().status;
  }
  get ok() {
    const status = this.status;
    return status >= 200 && status < 300;
  }
};
[
  "body",
  "bodyUsed",
  "redirected",
  "statusText",
  "trailers",
  "type",
  "url"
].forEach((k) => {
  Object.defineProperty(Response$1.prototype, k, { get() {
    return this[getResponseCache]()[k];
  } });
});
[
  "arrayBuffer",
  "blob",
  "clone",
  "formData",
  "json",
  "text"
].forEach((k) => {
  Object.defineProperty(Response$1.prototype, k, { value: function() {
    return this[getResponseCache]()[k]();
  } });
});
Object.defineProperty(Response$1.prototype, /* @__PURE__ */ Symbol.for("nodejs.util.inspect.custom"), { value: function(depth, options, inspectFn) {
  return `Response (lightweight) ${inspectFn({
    status: this.status,
    headers: this.headers,
    ok: this.ok,
    nativeResponse: this[responseCache]
  }, {
    ...options,
    depth: depth == null ? null : depth - 1
  })}`;
} });
Object.setPrototypeOf(Response$1, GlobalResponse);
Object.setPrototypeOf(Response$1.prototype, GlobalResponse.prototype);
var validRedirectUrl = /^https?:\/\/[!#-;=?-[\]_a-z~A-Z]+$/;
var parseRedirectUrl = (url) => {
  if (url instanceof URL) return url.href;
  if (validRedirectUrl.test(url)) return url;
  return new URL(url).href;
};
var validRedirectStatuses = /* @__PURE__ */ new Set([
  301,
  302,
  303,
  307,
  308
]);
Object.defineProperty(Response$1, "redirect", {
  value: function redirect(url, status = 302) {
    if (!validRedirectStatuses.has(status)) throw new RangeError("Invalid status code");
    return new Response$1(null, {
      status,
      headers: { location: parseRedirectUrl(url) }
    });
  },
  writable: true,
  configurable: true
});
Object.defineProperty(Response$1, "json", {
  value: function json(data, init) {
    const body = JSON.stringify(data);
    if (body === void 0) throw new TypeError("The data is not JSON serializable");
    const initHeaders = init?.headers;
    let headers;
    if (initHeaders) {
      headers = new Headers(initHeaders);
      if (!headers.has("content-type")) headers.set("content-type", "application/json");
    } else headers = { "content-type": "application/json" };
    return new Response$1(body, {
      status: init?.status ?? 200,
      statusText: init?.statusText,
      headers
    });
  },
  writable: true,
  configurable: true
});
async function readWithoutBlocking(readPromise) {
  return Promise.race([readPromise, Promise.resolve().then(() => Promise.resolve(void 0))]);
}
function writeFromReadableStreamDefaultReader(reader, writable, currentReadPromise) {
  const cancel = (error) => {
    reader.cancel(error).catch(() => {
    });
  };
  writable.on("close", cancel);
  writable.on("error", cancel);
  (currentReadPromise ?? reader.read()).then(flow, handleStreamError);
  return reader.closed.finally(() => {
    writable.off("close", cancel);
    writable.off("error", cancel);
  });
  function handleStreamError(error) {
    if (error) writable.destroy(error);
  }
  function onDrain() {
    reader.read().then(flow, handleStreamError);
  }
  function flow({ done, value }) {
    try {
      if (done) writable.end();
      else if (!writable.write(value)) writable.once("drain", onDrain);
      else return reader.read().then(flow, handleStreamError);
    } catch (e) {
      handleStreamError(e);
    }
  }
}
function writeFromReadableStream(stream, writable) {
  if (stream.locked) throw new TypeError("ReadableStream is locked.");
  else if (writable.destroyed) return;
  return writeFromReadableStreamDefaultReader(stream.getReader(), writable);
}
var buildOutgoingHttpHeaders = (headers, defaultContentType2) => {
  const res = {};
  if (!(headers instanceof Headers)) headers = new Headers(headers ?? void 0);
  if (headers.has("set-cookie")) {
    const cookies = [];
    for (const [k, v] of headers) if (k === "set-cookie") cookies.push(v);
    else res[k] = v;
    if (cookies.length > 0) res["set-cookie"] = cookies;
  } else for (const [k, v] of headers) res[k] = v;
  if (defaultContentType2) res["content-type"] ??= defaultContentType2;
  return res;
};
var outgoingEnded = /* @__PURE__ */ Symbol("outgoingEnded");
var incomingDraining = /* @__PURE__ */ Symbol("incomingDraining");
var DRAIN_TIMEOUT_MS = 500;
var MAX_DRAIN_BYTES = 64 * 1024 * 1024;
var drainIncoming = (incoming) => {
  const incomingWithDrainState = incoming;
  if (incoming.destroyed || incomingWithDrainState[incomingDraining]) return;
  incomingWithDrainState[incomingDraining] = true;
  if (incoming instanceof Http2ServerRequest) {
    try {
      incoming.stream?.close?.(constants.NGHTTP2_NO_ERROR);
    } catch {
    }
    return;
  }
  let bytesRead = 0;
  const cleanup = () => {
    clearTimeout(timer);
    incoming.off("data", onData);
    incoming.off("end", cleanup);
    incoming.off("error", cleanup);
  };
  const forceClose = () => {
    cleanup();
    const socket = incoming.socket;
    if (socket && !socket.destroyed) {
      if (typeof socket.destroySoon === "function") socket.destroySoon();
      else if (typeof socket.destroy === "function") socket.destroy();
    }
  };
  const timer = setTimeout(forceClose, DRAIN_TIMEOUT_MS);
  timer.unref?.();
  const onData = (chunk) => {
    bytesRead += chunk.length;
    if (bytesRead > MAX_DRAIN_BYTES) forceClose();
  };
  incoming.on("data", onData);
  incoming.on("end", cleanup);
  incoming.on("error", cleanup);
  incoming.resume();
};
var makeCloseHandler = (req, incoming, outgoing, needsBodyCleanup) => () => {
  if (incoming.errored) {
    recordBodyBufferedBeforeDisconnect(incoming);
    req[abortRequest](incoming.errored.toString());
  } else if (!outgoing.writableFinished) {
    recordBodyBufferedBeforeDisconnect(incoming);
    req[abortRequest]("Client connection prematurely closed.");
  }
  if (needsBodyCleanup && !incoming.readableEnded) setTimeout(() => {
    if (!incoming.readableEnded) setTimeout(() => {
      drainIncoming(incoming);
    });
  });
};
var isImmediateCacheableResponse = (res) => {
  if (!(cacheKey in res)) return false;
  const body = res[cacheKey][1];
  return body === null || typeof body === "string" || body instanceof Uint8Array;
};
var handleRequestError = () => new Response(null, { status: 400 });
var handleFetchError = (e) => new Response(null, { status: e instanceof Error && (e.name === "TimeoutError" || e.constructor.name === "TimeoutError") ? 504 : 500 });
var handleResponseError = (e, outgoing) => {
  const err = e instanceof Error ? e : new Error("unknown error", { cause: e });
  if (err.code === "ERR_STREAM_PREMATURE_CLOSE") console.info("The user aborted a request.");
  else {
    console.error(e);
    if (!outgoing.headersSent) outgoing.writeHead(500, { "Content-Type": "text/plain" });
    outgoing.end(`Error: ${err.message}`);
    outgoing.destroy(err);
  }
};
var flushHeaders = (outgoing) => {
  if ("flushHeaders" in outgoing && outgoing.writable) outgoing.flushHeaders();
};
var responseViaCache = async (res, outgoing) => {
  let [status, body, header] = res[cacheKey];
  if (!header) {
    if (body === null) {
      outgoing.writeHead(status);
      outgoing.end();
    } else if (typeof body === "string") {
      outgoing.writeHead(status, {
        "Content-Type": defaultContentType,
        "Content-Length": Buffer.byteLength(body)
      });
      outgoing.end(body);
    } else if (body instanceof Uint8Array) {
      outgoing.writeHead(status, {
        "Content-Type": defaultContentType,
        "Content-Length": body.byteLength
      });
      outgoing.end(body);
    } else if (body instanceof Blob) {
      outgoing.writeHead(status, {
        "Content-Type": defaultContentType,
        "Content-Length": body.size
      });
      outgoing.end(new Uint8Array(await body.arrayBuffer()));
    } else {
      outgoing.writeHead(status, { "Content-Type": defaultContentType });
      flushHeaders(outgoing);
      await writeFromReadableStream(body, outgoing)?.catch((e) => handleResponseError(e, outgoing));
    }
    outgoing[outgoingEnded]?.();
    return;
  }
  let hasContentLength = false;
  if (header instanceof Headers) {
    hasContentLength = header.has("content-length");
    header = buildOutgoingHttpHeaders(header, body === null ? void 0 : defaultContentType);
  } else if (Array.isArray(header)) {
    const headerObj = new Headers(header);
    hasContentLength = headerObj.has("content-length");
    header = buildOutgoingHttpHeaders(headerObj, body === null ? void 0 : defaultContentType);
  } else for (const key in header) if (key.length === 14 && key.toLowerCase() === "content-length") {
    hasContentLength = true;
    break;
  }
  if (!hasContentLength) {
    if (typeof body === "string") header["Content-Length"] = Buffer.byteLength(body);
    else if (body instanceof Uint8Array) header["Content-Length"] = body.byteLength;
    else if (body instanceof Blob) header["Content-Length"] = body.size;
  }
  outgoing.writeHead(status, header);
  if (body == null) outgoing.end();
  else if (typeof body === "string" || body instanceof Uint8Array) outgoing.end(body);
  else if (body instanceof Blob) outgoing.end(new Uint8Array(await body.arrayBuffer()));
  else {
    flushHeaders(outgoing);
    await writeFromReadableStream(body, outgoing)?.catch((e) => handleResponseError(e, outgoing));
  }
  outgoing[outgoingEnded]?.();
};
var isPromise = (res) => typeof res.then === "function";
var responseViaResponseObject = async (res, outgoing, options = {}) => {
  if (isPromise(res)) if (options.errorHandler) try {
    res = await res;
  } catch (err) {
    const errRes = await options.errorHandler(err);
    if (!errRes) return;
    res = errRes;
  }
  else res = await res.catch(handleFetchError);
  if (cacheKey in res) return responseViaCache(res, outgoing);
  const resHeaderRecord = buildOutgoingHttpHeaders(res.headers, res.body === null ? void 0 : defaultContentType);
  if (res.body) {
    const reader = res.body.getReader();
    const values = [];
    let done = false;
    let currentReadPromise = void 0;
    if (resHeaderRecord["transfer-encoding"] !== "chunked") {
      let maxReadCount = 2;
      for (let i = 0; i < maxReadCount; i++) {
        currentReadPromise ||= reader.read();
        const chunk = await readWithoutBlocking(currentReadPromise).catch((e) => {
          console.error(e);
          done = true;
        });
        if (!chunk) {
          if (i === 1) {
            await new Promise((resolve) => setTimeout(resolve));
            maxReadCount = 3;
            continue;
          }
          break;
        }
        currentReadPromise = void 0;
        if (chunk.value) values.push(chunk.value);
        if (chunk.done) {
          done = true;
          break;
        }
      }
      if (done && !("content-length" in resHeaderRecord)) resHeaderRecord["content-length"] = values.reduce((acc, value) => acc + value.length, 0);
    }
    outgoing.writeHead(res.status, resHeaderRecord);
    values.forEach((value) => {
      outgoing.write(value);
    });
    if (done) outgoing.end();
    else {
      if (values.length === 0) flushHeaders(outgoing);
      await writeFromReadableStreamDefaultReader(reader, outgoing, currentReadPromise);
    }
  } else if (resHeaderRecord[X_ALREADY_SENT]) {
  } else {
    outgoing.writeHead(res.status, resHeaderRecord);
    outgoing.end();
  }
  outgoing[outgoingEnded]?.();
};
var getRequestListener = (fetchCallback, options = {}) => {
  const autoCleanupIncoming = options.autoCleanupIncoming ?? true;
  if (options.overrideGlobalObjects !== false && global.Request !== Request$1) {
    Object.defineProperty(global, "Request", { value: Request$1 });
    Object.defineProperty(global, "Response", { value: Response$1 });
  }
  return async (incoming, outgoing) => {
    let res, req;
    let needsBodyCleanup = false;
    let closeHandlerAttached = false;
    const ensureCloseHandler = () => {
      if (!req || closeHandlerAttached) return;
      closeHandlerAttached = true;
      outgoing.on("close", makeCloseHandler(req, incoming, outgoing, needsBodyCleanup));
    };
    try {
      req = newRequest(incoming, options.hostname);
      needsBodyCleanup = autoCleanupIncoming && !(incoming.method === "GET" || incoming.method === "HEAD");
      if (needsBodyCleanup) {
        incoming[wrapBodyStream] = true;
        if (incoming instanceof Http2ServerRequest) outgoing[outgoingEnded] = () => {
          if (!incoming.readableEnded) setTimeout(() => {
            if (!incoming.readableEnded) setTimeout(() => {
              incoming.destroy();
              outgoing.destroy();
            });
          });
        };
      }
      res = fetchCallback(req, {
        incoming,
        outgoing
      });
      if (!isPromise(res) && isImmediateCacheableResponse(res)) {
        if (needsBodyCleanup && !incoming.readableEnded) outgoing.once("finish", () => {
          if (!incoming.readableEnded) drainIncoming(incoming);
        });
        return responseViaCache(res, outgoing);
      }
      ensureCloseHandler();
    } catch (e) {
      if (!res) if (options.errorHandler) {
        ensureCloseHandler();
        res = await options.errorHandler(req ? e : toRequestError(e));
        if (!res) return;
      } else if (!req) res = handleRequestError();
      else res = handleFetchError(e);
      else return handleResponseError(e, outgoing);
    }
    try {
      return await responseViaResponseObject(res, outgoing, options);
    } catch (e) {
      return handleResponseError(e, outgoing);
    }
  };
};
var CloseEvent = globalThis.CloseEvent ?? class extends Event {
  #eventInitDict;
  constructor(type, eventInitDict = {}) {
    super(type, eventInitDict);
    this.#eventInitDict = eventInitDict;
  }
  get wasClean() {
    return this.#eventInitDict.wasClean ?? false;
  }
  get code() {
    return this.#eventInitDict.code ?? 0;
  }
  get reason() {
    return this.#eventInitDict.reason ?? "";
  }
};
var ErrorEvent = globalThis.ErrorEvent ?? class extends Event {
  #eventInitDict;
  constructor(type, eventInitDict = {}) {
    super(type, eventInitDict);
    this.#eventInitDict = eventInitDict;
  }
  get message() {
    return this.#eventInitDict.message ?? "";
  }
  get filename() {
    return this.#eventInitDict.filename ?? "";
  }
  get lineno() {
    return this.#eventInitDict.lineno ?? 0;
  }
  get colno() {
    return this.#eventInitDict.colno ?? 0;
  }
  get error() {
    return this.#eventInitDict.error ?? null;
  }
};
var generateConnectionSymbol = () => /* @__PURE__ */ Symbol("connection");
var CONNECTION_SYMBOL_KEY = /* @__PURE__ */ Symbol("CONNECTION_SYMBOL_KEY");
var WAIT_FOR_WEBSOCKET_SYMBOL = /* @__PURE__ */ Symbol("WAIT_FOR_WEBSOCKET_SYMBOL");
var responseHeadersToSkip = /* @__PURE__ */ new Set([
  "connection",
  "content-length",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "sec-websocket-accept",
  "sec-websocket-extensions",
  "sec-websocket-protocol"
]);
var appendResponseHeaders = (headers, responseHeaders) => {
  if (!responseHeaders) return;
  responseHeaders.forEach((value, key) => {
    if (responseHeadersToSkip.has(key.toLowerCase())) return;
    headers.push(`${key}: ${value}`);
  });
};
var rejectUpgradeRequest = (socket, status, responseHeaders) => {
  const responseLines = ["Connection: close", "Content-Length: 0"];
  appendResponseHeaders(responseLines, responseHeaders);
  socket.end(`HTTP/1.1 ${status.toString()} ${STATUS_CODES[status] ?? ""}\r
${responseLines.join("\r\n")}\r
\r
`);
};
var createUpgradeRequest = (request) => {
  const protocol = request.socket.encrypted ? "https" : "http";
  const url = new URL(request.url ?? "/", `${protocol}://${request.headers.host ?? "localhost"}`);
  const headers = new Headers();
  for (const key in request.headers) {
    const value = request.headers[key];
    if (!value) continue;
    headers.append(key, Array.isArray(value) ? value[0] : value);
  }
  return new Request(url, { headers });
};
var setupWebSocket = (options) => {
  const { server, fetchCallback, wss } = options;
  const waiterMap = /* @__PURE__ */ new Map();
  wss.on("connection", (ws, request) => {
    const waiter = waiterMap.get(request);
    if (waiter) {
      waiter.resolve(ws);
      waiterMap.delete(request);
    }
  });
  const rejectWaiter = (request) => {
    const waiter = waiterMap.get(request);
    if (waiter) {
      waiterMap.delete(request);
      waiter.reject(/* @__PURE__ */ new Error("WebSocket handshake aborted"));
    }
  };
  const waitForWebSocket = (request, connectionSymbol) => {
    return new Promise((resolve, reject) => {
      waiterMap.set(request, {
        resolve,
        reject,
        connectionSymbol
      });
    });
  };
  server.on("upgrade", async (request, socket, head) => {
    if (request.headers.upgrade?.toLowerCase() !== "websocket") return;
    const env = {
      incoming: request,
      outgoing: void 0,
      wss,
      [WAIT_FOR_WEBSOCKET_SYMBOL]: waitForWebSocket
    };
    let status = 400;
    let responseHeaders;
    try {
      const response = await fetchCallback(createUpgradeRequest(request), env);
      if (response instanceof Response) {
        status = response.status;
        responseHeaders = response.headers;
      }
    } catch {
      if (server.listenerCount("upgrade") === 1) rejectUpgradeRequest(socket, 500);
      return;
    }
    const waiter = waiterMap.get(request);
    if (!waiter || waiter.connectionSymbol !== env[CONNECTION_SYMBOL_KEY]) {
      rejectWaiter(request);
      if (server.listenerCount("upgrade") === 1) rejectUpgradeRequest(socket, status, responseHeaders);
      return;
    }
    const addResponseHeaders = (headers) => {
      appendResponseHeaders(headers, responseHeaders);
    };
    const reclaimWaiterOnClose = () => rejectWaiter(request);
    socket.once("close", reclaimWaiterOnClose);
    wss.on("headers", addResponseHeaders);
    try {
      wss.handleUpgrade(request, socket, head, (ws) => {
        socket.off("close", reclaimWaiterOnClose);
        wss.emit("connection", ws, request);
      });
    } finally {
      wss.off("headers", addResponseHeaders);
    }
  });
  server.on("close", () => {
    wss.close();
  });
};
var upgradeWebSocket = defineWebSocketHelper(async (c, events, options) => {
  if (c.req.header("upgrade")?.toLowerCase() !== "websocket") return;
  const env = c.env;
  const waitForWebSocket = env[WAIT_FOR_WEBSOCKET_SYMBOL];
  if (!waitForWebSocket || !env.incoming) return new Response(null, { status: 500 });
  const connectionSymbol = generateConnectionSymbol();
  env[CONNECTION_SYMBOL_KEY] = connectionSymbol;
  (async () => {
    let ws;
    try {
      ws = await waitForWebSocket(env.incoming, connectionSymbol);
    } catch {
      return;
    }
    const messagesReceivedInStarting = [];
    const bufferMessage = (data, isBinary) => {
      messagesReceivedInStarting.push([data, isBinary]);
    };
    ws.on("message", bufferMessage);
    const ctx = {
      binaryType: "arraybuffer",
      close(code, reason) {
        ws.close(code, reason);
      },
      protocol: ws.protocol,
      raw: ws,
      get readyState() {
        return ws.readyState;
      },
      send(source, opts) {
        ws.send(source, { compress: opts?.compress });
      },
      url: new URL(c.req.url)
    };
    try {
      events?.onOpen?.(new Event("open"), ctx);
    } catch (e) {
      (options?.onError ?? console.error)(e);
    }
    const handleMessage = (data, isBinary) => {
      const datas = Array.isArray(data) ? data : [data];
      for (const data2 of datas) try {
        events?.onMessage?.(new MessageEvent("message", { data: isBinary ? data2 instanceof ArrayBuffer ? data2 : data2.buffer.slice(data2.byteOffset, data2.byteOffset + data2.byteLength) : typeof data2 === "string" ? data2 : Buffer.from(data2).toString("utf-8") }), ctx);
      } catch (e) {
        (options?.onError ?? console.error)(e);
      }
    };
    ws.off("message", bufferMessage);
    for (const message of messagesReceivedInStarting) handleMessage(...message);
    ws.on("message", (data, isBinary) => {
      handleMessage(data, isBinary);
    });
    ws.on("close", (code, reason) => {
      try {
        events?.onClose?.(new CloseEvent("close", {
          code,
          reason: reason.toString()
        }), ctx);
      } catch (e) {
        (options?.onError ?? console.error)(e);
      }
    });
    ws.on("error", (error) => {
      try {
        events?.onError?.(new ErrorEvent("error", { error }), ctx);
      } catch (e) {
        (options?.onError ?? console.error)(e);
      }
    });
  })();
  return new Response();
});
var createAdaptorServer = (options) => {
  const fetchCallback = options.fetch;
  const requestListener = getRequestListener(fetchCallback, {
    hostname: options.hostname,
    overrideGlobalObjects: options.overrideGlobalObjects,
    autoCleanupIncoming: options.autoCleanupIncoming
  });
  const server = (options.createServer || createServer)(options.serverOptions || {}, requestListener);
  if (options.websocket && options.websocket.server) {
    if (options.websocket.server.options.noServer !== true) throw new Error("WebSocket server must be created with { noServer: true } option");
    setupWebSocket({
      server,
      fetchCallback,
      wss: options.websocket.server
    });
  }
  return server;
};
var serve = (options, listeningListener) => {
  const server = createAdaptorServer(options);
  server.listen(options?.port ?? 3e3, options.hostname, () => {
    const serverInfo = server.address();
    listeningListener && listeningListener(serverInfo);
  });
  return server;
};

// ../node_modules/hono/dist/compose.js
var compose = (middleware, onError, onNotFound) => {
  return (context, next) => {
    let index = -1;
    return dispatch(0);
    async function dispatch(i) {
      if (i <= index) {
        throw new Error("next() called multiple times");
      }
      index = i;
      let res;
      let isError = false;
      let handler;
      if (middleware[i]) {
        handler = middleware[i][0][0];
        context.req.routeIndex = i;
      } else {
        handler = i === middleware.length && next || void 0;
      }
      if (handler) {
        try {
          res = await handler(context, () => dispatch(i + 1));
        } catch (err) {
          if (err instanceof Error && onError) {
            context.error = err;
            res = await onError(err, context);
            isError = true;
          } else {
            throw err;
          }
        }
      } else {
        if (context.finalized === false && onNotFound) {
          res = await onNotFound(context);
        }
      }
      if (res && (context.finalized === false || isError)) {
        context.res = res;
      }
      return context;
    }
  };
};

// ../node_modules/hono/dist/request/constants.js
var GET_MATCH_RESULT = /* @__PURE__ */ Symbol();

// ../node_modules/hono/dist/utils/buffer.js
var bufferToFormData = (arrayBuffer, contentType2) => {
  const response = new Response(arrayBuffer, {
    headers: {
      // Normalize the media type (case-insensitive) while keeping parameters like the boundary
      "Content-Type": contentType2.replace(/^[^;]+/, (mediaType) => mediaType.toLowerCase())
    }
  });
  return response.formData();
};

// ../node_modules/hono/dist/utils/body.js
var MAX_NESTING_DEPTH = 32;
var MAX_NESTED_OBJECTS = 1e4;
var isRawRequest = (request) => "headers" in request;
var parseBody = async (request, options = /* @__PURE__ */ Object.create(null)) => {
  const { all = false, dot = false } = options;
  const headers = isRawRequest(request) ? request.headers : request.raw.headers;
  const contentType2 = headers.get("Content-Type");
  const mediaType = contentType2?.split(";")[0].trim().toLowerCase();
  if (mediaType === "multipart/form-data" || mediaType === "application/x-www-form-urlencoded") {
    return parseFormData(request, { all, dot });
  }
  return {};
};
async function parseFormData(request, options) {
  if (!isRawRequest(request) && request.bodyCache.formData) {
    return convertFormDataToBodyData(
      await request.bodyCache.formData,
      options
    );
  }
  const headers = isRawRequest(request) ? request.headers : request.raw.headers;
  const arrayBuffer = await request.arrayBuffer();
  const formDataPromise = bufferToFormData(arrayBuffer, headers.get("Content-Type") || "");
  if (!isRawRequest(request)) {
    request.bodyCache.formData = formDataPromise;
  }
  const formData = await formDataPromise;
  if (formData) {
    return convertFormDataToBodyData(formData, options);
  }
  return {};
}
function convertFormDataToBodyData(formData, options) {
  const form = /* @__PURE__ */ Object.create(null);
  const nestingState = { count: 0 };
  formData.forEach((value, key) => {
    const shouldParseAllValues = options.all || key.endsWith("[]");
    if (!shouldParseAllValues) {
      form[key] = value;
    } else {
      handleParsingAllValues(form, key, value);
    }
  });
  if (options.dot) {
    Object.entries(form).forEach(([key, value]) => {
      const shouldParseDotValues = key.includes(".");
      if (shouldParseDotValues) {
        handleParsingNestedValues(form, key, value, nestingState);
        delete form[key];
      }
    });
  }
  return form;
}
var handleParsingAllValues = (form, key, value) => {
  if (form[key] !== void 0) {
    if (Array.isArray(form[key])) {
      ;
      form[key].push(value);
    } else {
      form[key] = [form[key], value];
    }
  } else {
    if (!key.endsWith("[]")) {
      form[key] = value;
    } else {
      form[key] = [value];
    }
  }
};
var handleParsingNestedValues = (form, key, value, state) => {
  if (/(?:^|\.)__proto__\./.test(key)) {
    return;
  }
  let nestedForm = form;
  const keys = key.split(".", MAX_NESTING_DEPTH + 2);
  if (keys.length > MAX_NESTING_DEPTH + 1) {
    throwNestingLimitExceeded();
  }
  keys.forEach((key2, index) => {
    if (index === keys.length - 1) {
      nestedForm[key2] = value;
    } else {
      if (!nestedForm[key2] || typeof nestedForm[key2] !== "object" || Array.isArray(nestedForm[key2]) || nestedForm[key2] instanceof File) {
        if (state.count++ >= MAX_NESTED_OBJECTS) {
          throwNestingLimitExceeded();
        }
        nestedForm[key2] = /* @__PURE__ */ Object.create(null);
      }
      nestedForm = nestedForm[key2];
    }
  });
};
var throwNestingLimitExceeded = () => {
  throw new Error("Nesting limit exceeded");
};

// ../node_modules/hono/dist/utils/url.js
var splitPath = (path2) => {
  const paths = path2.split("/");
  if (paths[0] === "") {
    paths.shift();
  }
  return paths;
};
var splitRoutingPath = (routePath) => {
  const { groups, path: path2 } = extractGroupsFromPath(routePath);
  const paths = splitPath(path2);
  return replaceGroupMarks(paths, groups);
};
var extractGroupsFromPath = (path2) => {
  const groups = [];
  path2 = path2.replace(/\{[^}]+\}/g, (match2, index) => {
    const mark = `@${index}`;
    groups.push([mark, match2]);
    return mark;
  });
  return { groups, path: path2 };
};
var replaceGroupMarks = (paths, groups) => {
  for (let i = groups.length - 1; i >= 0; i--) {
    const [mark] = groups[i];
    for (let j = paths.length - 1; j >= 0; j--) {
      if (paths[j].includes(mark)) {
        paths[j] = paths[j].replace(mark, groups[i][1]);
        break;
      }
    }
  }
  return paths;
};
var patternCache = {};
var getPattern = (label, next) => {
  if (label === "*") {
    return "*";
  }
  const match2 = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (match2) {
    const cacheKey2 = `${label}#${next}`;
    if (!patternCache[cacheKey2]) {
      if (match2[2]) {
        patternCache[cacheKey2] = next && next[0] !== ":" && next[0] !== "*" ? [cacheKey2, match2[1], new RegExp(`^${match2[2]}(?=/${next})`)] : [label, match2[1], new RegExp(`^${match2[2]}$`)];
      } else {
        patternCache[cacheKey2] = [label, match2[1], true];
      }
    }
    return patternCache[cacheKey2];
  }
  return null;
};
var tryDecode = (str, decoder) => {
  try {
    return decoder(str);
  } catch {
    return str.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match2) => {
      try {
        return decoder(match2);
      } catch {
        return match2;
      }
    });
  }
};
var tryDecodeURI = (str) => tryDecode(str, decodeURI);
var getPath = (request) => {
  const url = request.url;
  const start = url.indexOf("/", url.indexOf(":") + 4);
  let i = start;
  for (; i < url.length; i++) {
    const charCode = url.charCodeAt(i);
    if (charCode === 37) {
      const queryIndex = url.indexOf("?", i);
      const hashIndex = url.indexOf("#", i);
      const end = queryIndex === -1 ? hashIndex === -1 ? void 0 : hashIndex : hashIndex === -1 ? queryIndex : Math.min(queryIndex, hashIndex);
      const path2 = url.slice(start, end);
      return tryDecodeURI(path2.includes("%25") ? path2.replace(/%25/g, "%2525") : path2);
    } else if (charCode === 63 || charCode === 35) {
      break;
    }
  }
  return url.slice(start, i);
};
var getPathNoStrict = (request) => {
  const result = getPath(request);
  return result.length > 1 && result.at(-1) === "/" ? result.slice(0, -1) : result;
};
var mergePath = (base, sub, ...rest) => {
  if (rest.length) {
    sub = mergePath(sub, ...rest);
  }
  return `${base?.[0] === "/" ? "" : "/"}${base}${sub === "/" ? "" : `${base?.at(-1) === "/" ? "" : "/"}${sub?.[0] === "/" ? sub.slice(1) : sub}`}`;
};
var checkOptionalParameter = (path2) => {
  if (path2.charCodeAt(path2.length - 1) !== 63 || !path2.includes(":")) {
    return null;
  }
  const segments = path2.split("/");
  const results = [];
  let basePath = "";
  segments.forEach((segment) => {
    if (segment !== "" && !/\:/.test(segment)) {
      basePath += "/" + segment;
    } else if (/\:/.test(segment)) {
      if (segment.charCodeAt(segment.length - 1) === 63) {
        if (results.length === 0 && basePath === "") {
          results.push("/");
        } else {
          results.push(basePath);
        }
        const optionalSegment = segment.slice(0, -1);
        basePath += "/" + optionalSegment;
        results.push(basePath);
      } else {
        basePath += "/" + segment;
      }
    }
  });
  return results.filter((v, i, a) => a.indexOf(v) === i);
};
var tryDecodeURIComponent = (str) => str.indexOf("%") !== -1 ? tryDecode(str, decodeURIComponent_) : str;
var _decodeURI = (value) => {
  if (value.indexOf("+") !== -1) {
    value = value.replace(/\+/g, " ");
  }
  return tryDecodeURIComponent(value);
};
var _getQueryParam = (url, key, multiple) => {
  const hashIndex = url.indexOf("#", 8);
  if (hashIndex !== -1) {
    url = url.slice(0, hashIndex);
  }
  let encoded;
  if (!multiple && key && key.indexOf("%") === -1 && key.indexOf("+") === -1) {
    let keyIndex2 = url.indexOf("?", 8);
    if (keyIndex2 === -1) {
      return void 0;
    }
    if (!url.startsWith(key, keyIndex2 + 1)) {
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    while (keyIndex2 !== -1) {
      const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
      if (trailingKeyCode === 61) {
        const valueIndex = keyIndex2 + key.length + 2;
        const endIndex = url.indexOf("&", valueIndex);
        return _decodeURI(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
      } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) {
        return "";
      }
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    encoded = /[%+]/.test(url);
    if (!encoded) {
      return void 0;
    }
  }
  const results = /* @__PURE__ */ Object.create(null);
  encoded ??= /[%+]/.test(url);
  let keyIndex = url.indexOf("?", 8);
  while (keyIndex !== -1) {
    const nextKeyIndex = url.indexOf("&", keyIndex + 1);
    let valueIndex = url.indexOf("=", keyIndex);
    if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) {
      valueIndex = -1;
    }
    let name = url.slice(
      keyIndex + 1,
      valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex
    );
    if (encoded) {
      name = _decodeURI(name);
    }
    keyIndex = nextKeyIndex;
    if (name === "") {
      continue;
    }
    let value;
    if (valueIndex === -1) {
      value = "";
    } else {
      value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
      if (encoded) {
        value = _decodeURI(value);
      }
    }
    if (multiple) {
      if (!(results[name] && Array.isArray(results[name]))) {
        results[name] = [];
      }
      ;
      results[name].push(value);
    } else {
      results[name] ??= value;
    }
  }
  return key ? results[key] : results;
};
var getQueryParam = _getQueryParam;
var getQueryParams = (url, key) => {
  return _getQueryParam(url, key, true);
};
var decodeURIComponent_ = decodeURIComponent;

// ../node_modules/hono/dist/request.js
var HonoRequest = class {
  /**
   * `.raw` can get the raw Request object.
   *
   * @see {@link https://hono.dev/docs/api/request#raw}
   *
   * @example
   * ```ts
   * // For Cloudflare Workers
   * app.post('/', async (c) => {
   *   const metadata = c.req.raw.cf?.hostMetadata?
   *   ...
   * })
   * ```
   */
  raw;
  #validatedData;
  // Short name of validatedData
  #matchResult;
  routeIndex = 0;
  /**
   * `.path` can get the pathname of the request.
   *
   * @see {@link https://hono.dev/docs/api/request#path}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const pathname = c.req.path // `/about/me`
   * })
   * ```
   */
  path;
  bodyCache = {};
  constructor(request, path2 = "/", matchResult = [[]]) {
    this.raw = request;
    this.path = path2;
    this.#matchResult = matchResult;
  }
  param(key) {
    return key ? this.#getDecodedParam(key) : this.#getAllDecodedParams();
  }
  #getDecodedParam(key) {
    const paramKey = this.#matchResult[0][this.routeIndex]?.[1][key];
    const param = this.#getParamValue(paramKey);
    return param && tryDecodeURIComponent(param);
  }
  #getAllDecodedParams() {
    const decoded = {};
    const keys = Object.keys(this.#matchResult[0][this.routeIndex]?.[1] ?? {});
    for (const key of keys) {
      const value = this.#getParamValue(this.#matchResult[0][this.routeIndex][1][key]);
      if (value !== void 0) {
        decoded[key] = tryDecodeURIComponent(value);
      }
    }
    return decoded;
  }
  #getParamValue(paramKey) {
    return this.#matchResult[1] ? this.#matchResult[1][paramKey] : paramKey;
  }
  query(key) {
    return getQueryParam(this.url, key);
  }
  queries(key) {
    return getQueryParams(this.url, key);
  }
  header(name) {
    if (name) {
      return this.raw.headers.get(name) ?? void 0;
    }
    const headerData = /* @__PURE__ */ Object.create(null);
    this.raw.headers.forEach((value, key) => {
      headerData[key] = value;
    });
    return headerData;
  }
  async parseBody(options) {
    return parseBody(this, options);
  }
  #cachedBody = (key) => {
    const { bodyCache, raw: raw2 } = this;
    const cachedBody = bodyCache[key];
    if (cachedBody) {
      return cachedBody;
    }
    for (const anyCachedKey in bodyCache) {
      return bodyCache[anyCachedKey].then((body) => {
        if (anyCachedKey === "json") {
          body = JSON.stringify(body);
        }
        const contentType2 = anyCachedKey === "formData" ? void 0 : raw2.headers.get("content-type");
        return new Response(body, {
          headers: contentType2 ? { "Content-Type": contentType2 } : void 0
        })[key]();
      });
    }
    return bodyCache[key] = raw2[key]();
  };
  /**
   * `.json()` can parse Request body of type `application/json`
   *
   * @see {@link https://hono.dev/docs/api/request#json}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.json()
   * })
   * ```
   */
  json() {
    return this.#cachedBody("text").then((text) => JSON.parse(text));
  }
  /**
   * `.text()` can parse Request body of type `text/plain`
   *
   * @see {@link https://hono.dev/docs/api/request#text}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.text()
   * })
   * ```
   */
  text() {
    return this.#cachedBody("text");
  }
  /**
   * `.arrayBuffer()` parse Request body as an `ArrayBuffer`
   *
   * @see {@link https://hono.dev/docs/api/request#arraybuffer}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.arrayBuffer()
   * })
   * ```
   */
  arrayBuffer() {
    return this.#cachedBody("arrayBuffer");
  }
  /**
   * `.bytes()` parses the request body as a `Uint8Array`.
   *
   * @see {@link https://hono.dev/docs/api/request#bytes}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.bytes()
   * })
   * ```
   */
  bytes() {
    return this.#cachedBody("arrayBuffer").then((buffer) => new Uint8Array(buffer));
  }
  /**
   * Parses the request body as a `Blob`.
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.blob();
   * });
   * ```
   * @see https://hono.dev/docs/api/request#blob
   */
  blob() {
    return this.#cachedBody("blob");
  }
  /**
   * Parses the request body as `FormData`.
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.formData();
   * });
   * ```
   * @see https://hono.dev/docs/api/request#formdata
   */
  formData() {
    return this.#cachedBody("formData");
  }
  /**
   * Adds validated data to the request.
   *
   * @param target - The target of the validation.
   * @param data - The validated data to add.
   */
  addValidatedData(target, data) {
    ;
    (this.#validatedData ??= {})[target] = data;
  }
  valid(target) {
    return this.#validatedData?.[target];
  }
  /**
   * `.url()` can get the request url strings.
   *
   * @see {@link https://hono.dev/docs/api/request#url}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const url = c.req.url // `http://localhost:8787/about/me`
   *   ...
   * })
   * ```
   */
  get url() {
    return this.raw.url;
  }
  /**
   * `.method()` can get the method name of the request.
   *
   * @see {@link https://hono.dev/docs/api/request#method}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const method = c.req.method // `GET`
   * })
   * ```
   */
  get method() {
    return this.raw.method;
  }
  get [GET_MATCH_RESULT]() {
    return this.#matchResult;
  }
  /**
   * `.matchedRoutes()` can return a matched route in the handler
   *
   * @deprecated
   *
   * Use matchedRoutes helper defined in "hono/route" instead.
   *
   * @see {@link https://hono.dev/docs/api/request#matchedroutes}
   *
   * @example
   * ```ts
   * app.use('*', async function logger(c, next) {
   *   await next()
   *   c.req.matchedRoutes.forEach(({ handler, method, path }, i) => {
   *     const name = handler.name || (handler.length < 2 ? '[handler]' : '[middleware]')
   *     console.log(
   *       method,
   *       ' ',
   *       path,
   *       ' '.repeat(Math.max(10 - path.length, 0)),
   *       name,
   *       i === c.req.routeIndex ? '<- respond from here' : ''
   *     )
   *   })
   * })
   * ```
   */
  get matchedRoutes() {
    return this.#matchResult[0].map(([[, route]]) => route);
  }
  /**
   * `routePath()` can retrieve the path registered within the handler
   *
   * @deprecated
   *
   * Use routePath helper defined in "hono/route" instead.
   *
   * @see {@link https://hono.dev/docs/api/request#routepath}
   *
   * @example
   * ```ts
   * app.get('/posts/:id', (c) => {
   *   return c.json({ path: c.req.routePath })
   * })
   * ```
   */
  get routePath() {
    return this.#matchResult[0].map(([[, route]]) => route)[this.routeIndex].path;
  }
};

// ../node_modules/hono/dist/utils/html.js
var HtmlEscapedCallbackPhase = {
  Stringify: 1,
  BeforeStream: 2,
  Stream: 3
};
var raw = (value, callbacks) => {
  const escapedString = new String(value);
  escapedString.isEscaped = true;
  escapedString.callbacks = callbacks;
  return escapedString;
};
var resolveCallback = async (str, phase, preserveCallbacks, context, buffer) => {
  if (typeof str === "object" && !(str instanceof String)) {
    if (!(str instanceof Promise)) {
      str = str.toString();
    }
    if (str instanceof Promise) {
      str = await str;
    }
  }
  const callbacks = str.callbacks;
  if (!callbacks?.length) {
    return Promise.resolve(str);
  }
  if (buffer) {
    buffer[0] += str;
  } else {
    buffer = [str];
  }
  const resStr = Promise.all(callbacks.map((c) => c({ phase, buffer, context }))).then(
    (res) => Promise.all(
      res.filter(Boolean).map((str2) => resolveCallback(str2, phase, false, context, buffer))
    ).then(() => buffer[0])
  );
  if (preserveCallbacks) {
    return raw(await resStr, callbacks);
  } else {
    return resStr;
  }
};

// ../node_modules/hono/dist/context.js
var TEXT_PLAIN = "text/plain; charset=UTF-8";
var setDefaultContentType = (contentType2, headers) => {
  return {
    "Content-Type": contentType2,
    ...headers
  };
};
var createResponseInstance = (body, init) => new Response(body, init);
var Context = class {
  #rawRequest;
  #req;
  /**
   * `.env` can get bindings (environment variables, secrets, KV namespaces, D1 database, R2 bucket etc.) in Cloudflare Workers.
   *
   * @see {@link https://hono.dev/docs/api/context#env}
   *
   * @example
   * ```ts
   * // Environment object for Cloudflare Workers
   * app.get('*', async c => {
   *   const counter = c.env.COUNTER
   * })
   * ```
   */
  env = {};
  #var;
  finalized = false;
  /**
   * `.error` can get the error object from the middleware if the Handler throws an error.
   *
   * @see {@link https://hono.dev/docs/api/context#error}
   *
   * @example
   * ```ts
   * app.use('*', async (c, next) => {
   *   await next()
   *   if (c.error) {
   *     // do something...
   *   }
   * })
   * ```
   */
  error;
  #status;
  #executionCtx;
  #res;
  #layout;
  #renderer;
  #notFoundHandler;
  #preparedHeaders;
  #matchResult;
  #path;
  /**
   * Creates an instance of the Context class.
   *
   * @param req - The Request object.
   * @param options - Optional configuration options for the context.
   */
  constructor(req, options) {
    this.#rawRequest = req;
    if (options) {
      this.#executionCtx = options.executionCtx;
      this.env = options.env;
      this.#notFoundHandler = options.notFoundHandler;
      this.#path = options.path;
      this.#matchResult = options.matchResult;
    }
  }
  /**
   * `.req` is the instance of {@link HonoRequest}.
   */
  get req() {
    this.#req ??= new HonoRequest(this.#rawRequest, this.#path, this.#matchResult);
    return this.#req;
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#event}
   * The FetchEvent associated with the current request.
   *
   * @throws Will throw an error if the context does not have a FetchEvent.
   */
  get event() {
    if (this.#executionCtx && "respondWith" in this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no FetchEvent");
    }
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#executionctx}
   * The ExecutionContext associated with the current request.
   *
   * @throws Will throw an error if the context does not have an ExecutionContext.
   */
  get executionCtx() {
    if (this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no ExecutionContext");
    }
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#res}
   * The Response object for the current request.
   */
  get res() {
    return this.#res ||= createResponseInstance(null, {
      headers: this.#preparedHeaders ??= new Headers()
    });
  }
  /**
   * Sets the Response object for the current request.
   *
   * @param _res - The Response object to set.
   */
  set res(_res) {
    if (this.#res && _res) {
      _res = createResponseInstance(_res.body, _res);
      for (const [k, v] of this.#res.headers.entries()) {
        if (k === "content-type") {
          continue;
        }
        if (k === "set-cookie") {
          const cookies = this.#res.headers.getSetCookie();
          _res.headers.delete("set-cookie");
          for (const cookie of cookies) {
            _res.headers.append("set-cookie", cookie);
          }
        } else {
          _res.headers.set(k, v);
        }
      }
    }
    this.#res = _res;
    this.finalized = true;
  }
  /**
   * `.render()` can create a response within a layout.
   *
   * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
   *
   * @example
   * ```ts
   * app.get('/', (c) => {
   *   return c.render('Hello!')
   * })
   * ```
   */
  render = (...args) => {
    this.#renderer ??= (content) => this.html(content);
    return this.#renderer(...args);
  };
  /**
   * Sets the layout for the response.
   *
   * @param layout - The layout to set.
   * @returns The layout function.
   */
  setLayout = (layout) => this.#layout = layout;
  /**
   * Gets the current layout for the response.
   *
   * @returns The current layout function.
   */
  getLayout = () => this.#layout;
  /**
   * `.setRenderer()` can set the layout in the custom middleware.
   *
   * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
   *
   * @example
   * ```tsx
   * app.use('*', async (c, next) => {
   *   c.setRenderer((content) => {
   *     return c.html(
   *       <html>
   *         <body>
   *           <p>{content}</p>
   *         </body>
   *       </html>
   *     )
   *   })
   *   await next()
   * })
   * ```
   */
  setRenderer = (renderer) => {
    this.#renderer = renderer;
  };
  /**
   * `.header()` can set headers.
   *
   * @see {@link https://hono.dev/docs/api/context#header}
   *
   * @example
   * ```ts
   * app.get('/welcome', (c) => {
   *   // Set headers
   *   c.header('X-Message', 'Hello!')
   *   c.header('Content-Type', 'text/plain')
   *
   *   // Append multiple headers using the append option (e.g. Vary)
   *   c.header('Vary', 'Accept-Encoding', { append: true })
   *   c.header('Vary', 'User-Agent', { append: true })
   *
   *   return c.body('Thank you for coming')
   * })
   * ```
   */
  header = (name, value, options) => {
    if (this.finalized) {
      this.#res = createResponseInstance(this.#res.body, this.#res);
    }
    const headers = this.#res ? this.#res.headers : this.#preparedHeaders ??= new Headers();
    if (value === void 0) {
      headers.delete(name);
    } else if (options?.append) {
      headers.append(name, value);
    } else {
      headers.set(name, value);
    }
  };
  status = (status) => {
    this.#status = status;
  };
  /**
   * `.set()` can set the value specified by the key.
   *
   * @see {@link https://hono.dev/docs/api/context#set-get}
   *
   * @example
   * ```ts
   * app.use('*', async (c, next) => {
   *   c.set('message', 'Hono is hot!!')
   *   await next()
   * })
   * ```
   */
  set = (key, value) => {
    this.#var ??= /* @__PURE__ */ new Map();
    this.#var.set(key, value);
  };
  /**
   * `.get()` can use the value specified by the key.
   *
   * @see {@link https://hono.dev/docs/api/context#set-get}
   *
   * @example
   * ```ts
   * app.get('/', (c) => {
   *   const message = c.get('message')
   *   return c.text(`The message is "${message}"`)
   * })
   * ```
   */
  get = (key) => {
    return this.#var ? this.#var.get(key) : void 0;
  };
  /**
   * `.var` can access the value of a variable.
   *
   * @see {@link https://hono.dev/docs/api/context#var}
   *
   * @example
   * ```ts
   * const result = c.var.client.oneMethod()
   * ```
   */
  // c.var.propName is a read-only
  get var() {
    if (!this.#var) {
      return {};
    }
    return Object.fromEntries(this.#var);
  }
  #newResponse(data, arg, headers) {
    let responseHeaders = this.#res ? new Headers(this.#res.headers) : this.#preparedHeaders;
    if (typeof arg === "object" && arg.headers) {
      responseHeaders ??= new Headers();
      for (const [key, value] of new Headers(arg.headers)) {
        if (key === "set-cookie") {
          responseHeaders.append(key, value);
        } else {
          responseHeaders.set(key, value);
        }
      }
    }
    if (headers) {
      if (!responseHeaders) {
        let count = 0;
        for (const k in headers) {
          if (++count > 1 || typeof headers[k] !== "string") {
            responseHeaders = new Headers();
            break;
          }
        }
      }
      if (responseHeaders) {
        for (const k in headers) {
          const v = headers[k];
          if (typeof v === "string") {
            responseHeaders.set(k, v);
          } else {
            responseHeaders.delete(k);
            for (const v2 of v) {
              responseHeaders.append(k, v2);
            }
          }
        }
      }
    }
    const status = typeof arg === "number" ? arg : arg?.status ?? this.#status;
    return createResponseInstance(data, {
      status,
      headers: responseHeaders ?? headers
    });
  }
  newResponse = (...args) => this.#newResponse(...args);
  /**
   * `.body()` can return the HTTP response.
   * You can set headers with `.header()` and set HTTP status code with `.status`.
   * This can also be set in `.text()`, `.json()` and so on.
   *
   * @see {@link https://hono.dev/docs/api/context#body}
   *
   * @example
   * ```ts
   * app.get('/welcome', (c) => {
   *   // Set headers
   *   c.header('X-Message', 'Hello!')
   *   c.header('Content-Type', 'text/plain')
   *   // Set HTTP status code
   *   c.status(201)
   *
   *   // Return the response body
   *   return c.body('Thank you for coming')
   * })
   * ```
   */
  body = (data, arg, headers) => this.#newResponse(data, arg, headers);
  /**
   * `.text()` can render text as `Content-Type:text/plain`.
   *
   * @see {@link https://hono.dev/docs/api/context#text}
   *
   * @example
   * ```ts
   * app.get('/say', (c) => {
   *   return c.text('Hello!')
   * })
   * ```
   */
  text = (text, arg, headers) => {
    return !this.#preparedHeaders && !this.#status && !arg && !headers && !this.finalized ? new Response(text) : this.#newResponse(
      text,
      arg,
      setDefaultContentType(TEXT_PLAIN, headers)
    );
  };
  /**
   * `.json()` can render JSON as `Content-Type:application/json`.
   *
   * @see {@link https://hono.dev/docs/api/context#json}
   *
   * @example
   * ```ts
   * app.get('/api', (c) => {
   *   return c.json({ message: 'Hello!' })
   * })
   * ```
   */
  json = (object, arg, headers) => {
    return this.#newResponse(
      JSON.stringify(object),
      arg,
      setDefaultContentType("application/json", headers)
    );
  };
  html = (html, arg, headers) => {
    const res = (html2) => this.#newResponse(html2, arg, setDefaultContentType("text/html; charset=UTF-8", headers));
    return typeof html === "object" ? resolveCallback(html, HtmlEscapedCallbackPhase.Stringify, false, {}).then(res) : res(html);
  };
  /**
   * `.redirect()` can Redirect, default status code is 302.
   *
   * @see {@link https://hono.dev/docs/api/context#redirect}
   *
   * @example
   * ```ts
   * app.get('/redirect', (c) => {
   *   return c.redirect('/')
   * })
   * app.get('/redirect-permanently', (c) => {
   *   return c.redirect('/', 301)
   * })
   * ```
   */
  redirect = (location, status) => {
    const locationString = String(location);
    this.header(
      "Location",
      // Multibytes should be encoded
      // eslint-disable-next-line no-control-regex
      !/[^\x00-\xFF]/.test(locationString) ? locationString : encodeURI(locationString)
    );
    return this.newResponse(null, status ?? 302);
  };
  /**
   * `.notFound()` can return the Not Found Response.
   *
   * @see {@link https://hono.dev/docs/api/context#notfound}
   *
   * @example
   * ```ts
   * app.get('/notfound', (c) => {
   *   return c.notFound()
   * })
   * ```
   */
  notFound = () => {
    this.#notFoundHandler ??= () => createResponseInstance();
    return this.#notFoundHandler(this);
  };
};

// ../node_modules/hono/dist/router.js
var METHOD_NAME_ALL = "ALL";
var METHOD_NAME_ALL_LOWERCASE = "all";
var METHODS = ["get", "post", "put", "delete", "options", "patch", "query"];
var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
var UnsupportedPathError = class extends Error {
};

// ../node_modules/hono/dist/utils/constants.js
var COMPOSED_HANDLER = "__COMPOSED_HANDLER";

// ../node_modules/hono/dist/hono-base.js
var notFoundHandler = (c) => {
  return c.text("404 Not Found", 404);
};
var errorHandler = (err, c) => {
  if ("getResponse" in err) {
    const res = err.getResponse();
    return c.newResponse(res.body, res);
  }
  console.error(err);
  return c.text("Internal Server Error", 500);
};
var Hono = class _Hono {
  get;
  post;
  put;
  delete;
  options;
  patch;
  query;
  all;
  on;
  use;
  /*
    This class is like an abstract class and does not have a router.
    To use it, inherit the class and implement router in the constructor.
  */
  router;
  getPath;
  // Cannot use `#` because it requires visibility at JavaScript runtime.
  _basePath = "/";
  #path = "/";
  routes = [];
  constructor(options = {}) {
    const allMethods = [...METHODS, METHOD_NAME_ALL_LOWERCASE];
    allMethods.forEach((method) => {
      this[method] = (args1, ...args) => {
        const methodName = method.toUpperCase();
        if (typeof args1 === "string") {
          this.#path = args1;
        } else {
          this.#addRoute(methodName, this.#path, args1);
        }
        args.forEach((handler) => {
          this.#addRoute(methodName, this.#path, handler);
        });
        return this;
      };
    });
    this.on = (method, path2, ...handlers) => {
      for (const p of [path2].flat()) {
        this.#path = p;
        for (const m of [method].flat()) {
          const methodName = m.toUpperCase();
          for (const handler of handlers) {
            this.#addRoute(methodName, this.#path, handler);
          }
        }
      }
      return this;
    };
    this.use = (arg1, ...handlers) => {
      if (typeof arg1 === "string") {
        this.#path = arg1;
      } else {
        this.#path = "*";
        handlers.unshift(arg1);
      }
      handlers.forEach((handler) => {
        this.#addRoute(METHOD_NAME_ALL, this.#path, handler);
      });
      return this;
    };
    const { strict, ...optionsWithoutStrict } = options;
    Object.assign(this, optionsWithoutStrict);
    this.getPath = strict ?? true ? options.getPath ?? getPath : getPathNoStrict;
  }
  #clone() {
    const clone = new _Hono({
      router: this.router,
      getPath: this.getPath
    });
    clone.errorHandler = this.errorHandler;
    clone.#notFoundHandler = this.#notFoundHandler;
    clone.routes = this.routes;
    return clone;
  }
  #notFoundHandler = notFoundHandler;
  // Cannot use `#` because it requires visibility at JavaScript runtime.
  errorHandler = errorHandler;
  /**
   * `.route()` allows grouping other Hono instance in routes.
   *
   * @see {@link https://hono.dev/docs/api/routing#grouping}
   *
   * @param {string} path - base Path
   * @param {Hono} app - other Hono instance
   * @returns {Hono} routed Hono instance
   *
   * @example
   * ```ts
   * const app = new Hono()
   * const app2 = new Hono()
   *
   * app2.get("/user", (c) => c.text("user"))
   * app.route("/api", app2) // GET /api/user
   * ```
   */
  route(path2, app) {
    const subApp = this.basePath(path2);
    app.routes.map((r) => {
      let handler;
      if (app.errorHandler === errorHandler) {
        handler = r.handler;
      } else {
        handler = async (c, next) => (await compose([], app.errorHandler)(c, () => r.handler(c, next))).res;
        handler[COMPOSED_HANDLER] = r.handler;
      }
      subApp.#addRoute(r.method, r.path, handler, r.basePath);
    });
    return this;
  }
  /**
   * `.basePath()` allows base paths to be specified.
   *
   * @see {@link https://hono.dev/docs/api/routing#base-path}
   *
   * @param {string} path - base Path
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * const api = new Hono().basePath('/api')
   * ```
   */
  basePath(path2) {
    const subApp = this.#clone();
    subApp._basePath = mergePath(this._basePath, path2);
    return subApp;
  }
  /**
   * `.onError()` handles an error and returns a customized Response.
   *
   * @see {@link https://hono.dev/docs/api/hono#error-handling}
   *
   * @param {ErrorHandler} handler - request Handler for error
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * app.onError((err, c) => {
   *   console.error(`${err}`)
   *   return c.text('Custom Error Message', 500)
   * })
   * ```
   */
  onError = (handler) => {
    this.errorHandler = handler;
    return this;
  };
  /**
   * `.notFound()` allows you to customize a Not Found Response.
   *
   * @see {@link https://hono.dev/docs/api/hono#not-found}
   *
   * @param {NotFoundHandler} handler - request handler for not-found
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * app.notFound((c) => {
   *   return c.text('Custom 404 Message', 404)
   * })
   * ```
   */
  notFound = (handler) => {
    this.#notFoundHandler = handler;
    return this;
  };
  /**
   * `.mount()` allows you to mount applications built with other frameworks into your Hono application.
   *
   * @see {@link https://hono.dev/docs/api/hono#mount}
   *
   * @param {string} path - base Path
   * @param {Function} applicationHandler - other Request Handler
   * @param {MountOptions} [options] - options of `.mount()`
   * @returns {Hono} mounted Hono instance
   *
   * @example
   * ```ts
   * import { Router as IttyRouter } from 'itty-router'
   * import { Hono } from 'hono'
   * // Create itty-router application
   * const ittyRouter = IttyRouter()
   * // GET /itty-router/hello
   * ittyRouter.get('/hello', () => new Response('Hello from itty-router'))
   *
   * const app = new Hono()
   * app.mount('/itty-router', ittyRouter.handle)
   * ```
   *
   * @example
   * ```ts
   * const app = new Hono()
   * // Send the request to another application without modification.
   * app.mount('/app', anotherApp, {
   *   replaceRequest: (req) => req,
   * })
   * ```
   */
  mount(path2, applicationHandler, options) {
    let replaceRequest;
    let optionHandler;
    if (options) {
      if (typeof options === "function") {
        optionHandler = options;
      } else {
        optionHandler = options.optionHandler;
        if (options.replaceRequest === false) {
          replaceRequest = (request) => request;
        } else {
          replaceRequest = options.replaceRequest;
        }
      }
    }
    const getOptions = optionHandler ? (c) => {
      const options2 = optionHandler(c);
      return Array.isArray(options2) ? options2 : [options2];
    } : (c) => {
      let executionContext = void 0;
      try {
        executionContext = c.executionCtx;
      } catch {
      }
      return [c.env, executionContext];
    };
    replaceRequest ||= (() => {
      const mergedPath = mergePath(this._basePath, path2);
      const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
      return (request) => {
        const url = new URL(request.url);
        url.pathname = this.getPath(request).slice(pathPrefixLength) || "/";
        return new Request(url, request);
      };
    })();
    const handler = async (c, next) => {
      const res = await applicationHandler(replaceRequest(c.req.raw), ...getOptions(c));
      if (res) {
        return res;
      }
      await next();
    };
    this.#addRoute(METHOD_NAME_ALL, mergePath(path2, "*"), handler);
    return this;
  }
  #addRoute(method, path2, handler, baseRoutePath) {
    path2 = mergePath(this._basePath, path2);
    const r = {
      basePath: baseRoutePath !== void 0 ? mergePath(this._basePath, baseRoutePath) : this._basePath,
      path: path2,
      method,
      handler
    };
    this.router.add(method, path2, [handler, r]);
    this.routes.push(r);
  }
  #handleError(err, c) {
    if (err instanceof Error) {
      return this.errorHandler(err, c);
    }
    throw err;
  }
  #dispatch(request, executionCtx, env, method) {
    if (method === "HEAD") {
      return (async () => new Response(null, await this.#dispatch(request, executionCtx, env, "GET")))();
    }
    const path2 = this.getPath(request, { env });
    const matchResult = this.router.match(method, path2);
    const c = new Context(request, {
      path: path2,
      matchResult,
      env,
      executionCtx,
      notFoundHandler: this.#notFoundHandler
    });
    if (matchResult[0].length === 1) {
      let res;
      try {
        res = matchResult[0][0][0][0](c, async () => {
          c.res = await this.#notFoundHandler(c);
        });
      } catch (err) {
        return this.#handleError(err, c);
      }
      return res instanceof Promise ? res.then(
        (resolved) => resolved || (c.finalized ? c.res : this.#notFoundHandler(c))
      ).catch((err) => this.#handleError(err, c)) : res ?? this.#notFoundHandler(c);
    }
    const composed = compose(matchResult[0], this.errorHandler, this.#notFoundHandler);
    return (async () => {
      try {
        const context = await composed(c);
        if (!context.finalized) {
          throw new Error(
            "Context is not finalized. Did you forget to return a Response object or `await next()`?"
          );
        }
        return context.res;
      } catch (err) {
        return this.#handleError(err, c);
      }
    })();
  }
  /**
   * `.fetch()` will be entry point of your app.
   *
   * @see {@link https://hono.dev/docs/api/hono#fetch}
   *
   * @param {Request} request - request Object of request
   * @param {Env} env - env Object
   * @param {ExecutionContext} executionCtx - context of execution
   * @returns {Response | Promise<Response>} response of request
   *
   */
  fetch = (request, ...rest) => {
    return this.#dispatch(request, rest[1], rest[0], request.method);
  };
  /**
   * `.request()` is a useful method for testing.
   * You can pass a URL or pathname to send a GET request.
   * app will return a Response object.
   * ```ts
   * test('GET /hello is ok', async () => {
   *   const res = await app.request('/hello')
   *   expect(res.status).toBe(200)
   * })
   * ```
   * @see https://hono.dev/docs/api/hono#request
   */
  request = (input, requestInit, Env, executionCtx) => {
    if (input instanceof Request) {
      return this.fetch(requestInit ? new Request(input, requestInit) : input, Env, executionCtx);
    }
    input = input.toString();
    return this.fetch(
      new Request(
        /^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`,
        requestInit
      ),
      Env,
      executionCtx
    );
  };
  /**
   * `.fire()` automatically adds a global fetch event listener.
   * This can be useful for environments that adhere to the Service Worker API, such as non-ES module Cloudflare Workers.
   * @deprecated
   * Use `fire` from `hono/service-worker` instead.
   * ```ts
   * import { Hono } from 'hono'
   * import { fire } from 'hono/service-worker'
   *
   * const app = new Hono()
   * // ...
   * fire(app)
   * ```
   * @see https://hono.dev/docs/api/hono#fire
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
   * @see https://developers.cloudflare.com/workers/reference/migrate-to-module-workers/
   */
  fire = () => {
    addEventListener("fetch", (event) => {
      event.respondWith(this.#dispatch(event.request, event, void 0, event.request.method));
    });
  };
};

// ../node_modules/hono/dist/router/utils.js
var createNullObject = () => /* @__PURE__ */ Object.create(null);

// ../node_modules/hono/dist/router/reg-exp-router/matcher.js
var emptyParam = [];
function match(method, path2) {
  const matchers = this.buildAllMatchers();
  const match2 = ((method2, path22) => {
    const matcher = matchers[method2] || matchers[METHOD_NAME_ALL];
    const staticMatch = matcher[2][path22];
    if (staticMatch) {
      return staticMatch;
    }
    const match3 = path22.match(matcher[0]);
    if (!match3) {
      return [[], emptyParam];
    }
    const index = match3.indexOf("", 1);
    return [matcher[1][index], match3];
  });
  this.match = match2;
  return match2(method, path2);
}

// ../node_modules/hono/dist/router/reg-exp-router/node.js
var LABEL_REG_EXP_STR = "[^/]+";
var ONLY_WILDCARD_REG_EXP_STR = ".*";
var TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
var PATH_ERROR = /* @__PURE__ */ Symbol();
var regExpMetaChars = new Set(".\\+*[^]$()");
function compareKey(a, b) {
  if (a.length === 1) {
    return b.length === 1 ? a < b ? -1 : 1 : -1;
  }
  if (b.length === 1) {
    return 1;
  }
  if (a === ONLY_WILDCARD_REG_EXP_STR || a === TAIL_WILDCARD_REG_EXP_STR) {
    return b === TAIL_WILDCARD_REG_EXP_STR ? -1 : 1;
  } else if (b === ONLY_WILDCARD_REG_EXP_STR || b === TAIL_WILDCARD_REG_EXP_STR) {
    return -1;
  }
  if (a === LABEL_REG_EXP_STR) {
    return 1;
  } else if (b === LABEL_REG_EXP_STR) {
    return -1;
  }
  return a.length === b.length ? a < b ? -1 : 1 : b.length - a.length;
}
var Node = class _Node {
  // handler index of a dynamic path, or -1 for a static path terminal
  #index;
  #varIndex;
  #children = createNullObject();
  insert(tokens, index, paramMap, context, isStatic) {
    let node = this;
    for (let i = 0, len = tokens.length; i < len; i++) {
      const token = tokens[i];
      const pattern = token.length === 1 ? token === "*" ? i === len - 1 ? ["", "", ONLY_WILDCARD_REG_EXP_STR] : ["", "", LABEL_REG_EXP_STR] : null : token === "/*" ? ["", "", TAIL_WILDCARD_REG_EXP_STR] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
      let nextNode;
      if (pattern) {
        const name = pattern[1];
        let regexpStr = pattern[2] || LABEL_REG_EXP_STR;
        if (name && pattern[2]) {
          if (regexpStr === ".*") {
            throw PATH_ERROR;
          }
          regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
          if (/\((?!\?:)/.test(regexpStr)) {
            throw PATH_ERROR;
          }
          if (regexpStr.length === 1 && regExpMetaChars.has(regexpStr)) {
            throw PATH_ERROR;
          }
        }
        nextNode = node.#children[regexpStr];
        if (!nextNode) {
          if (regexpStr !== ONLY_WILDCARD_REG_EXP_STR && regexpStr !== TAIL_WILDCARD_REG_EXP_STR) {
            for (const k in node.#children) {
              if (
                // a single-char pattern coexists with single-char literals as a literal does
                (regexpStr.length > 1 || k.length > 1) && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
              ) {
                throw PATH_ERROR;
              }
            }
          }
          nextNode = node.#children[regexpStr] = new _Node();
        }
        if (name !== "") {
          nextNode.#varIndex ??= context.varIndex++;
          paramMap.push([name, nextNode.#varIndex]);
        }
      } else {
        nextNode = node.#children[token];
        if (!nextNode) {
          for (const k in node.#children) {
            if (k.length > 1 && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR) {
              throw PATH_ERROR;
            }
          }
          nextNode = node.#children[token] = new _Node();
        }
      }
      node = nextNode;
    }
    if (node.#index !== void 0) {
      throw PATH_ERROR;
    }
    node.#index = isStatic ? -1 : index;
  }
  buildRegExpStr() {
    const childKeys = Object.keys(this.#children).sort(compareKey);
    const strList = childKeys.map((k) => {
      const c = this.#children[k];
      const childStr = c.buildRegExpStr();
      return childStr === "" ? "" : (typeof c.#varIndex === "number" ? `(${k})@${c.#varIndex}` : regExpMetaChars.has(k) ? `\\${k}` : k) + childStr;
    }).filter(Boolean);
    if (typeof this.#index === "number" && this.#index !== -1) {
      strList.unshift(`#${this.#index}`);
    }
    if (strList.length === 0) {
      return "";
    }
    if (strList.length === 1) {
      return strList[0];
    }
    return "(?:" + strList.join("|") + ")";
  }
};

// ../node_modules/hono/dist/router/reg-exp-router/trie.js
var Trie = class {
  #context = { varIndex: 0 };
  #root = new Node();
  #index = 0;
  // dynamic path -> [handler index, param assoc]; static paths are not registered
  paths = createNullObject();
  insert(path2, isStatic) {
    if (isStatic) {
      this.#root.insert(path2.split(""), 0, [], this.#context, true);
      return;
    }
    const paramAssoc = [];
    const groups = [];
    let markedPath = path2;
    for (let i = 0; ; ) {
      let replaced = false;
      markedPath = markedPath.replace(/\{[^}]+\}/g, (m) => {
        const mark = `@\\${i}`;
        groups[i] = [mark, m];
        i++;
        replaced = true;
        return mark;
      });
      if (!replaced) {
        break;
      }
    }
    const tokens = markedPath.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let i = groups.length - 1; i >= 0; i--) {
      const [mark] = groups[i];
      for (let j = tokens.length - 1; j >= 0; j--) {
        if (tokens[j].indexOf(mark) !== -1) {
          tokens[j] = tokens[j].replace(mark, groups[i][1]);
          break;
        }
      }
    }
    this.#root.insert(tokens, this.#index, paramAssoc, this.#context, false);
    this.paths[path2] = [this.#index++, paramAssoc];
  }
  buildRegExp() {
    let regexp = this.#root.buildRegExpStr();
    if (regexp === "") {
      return [/^$/, [], []];
    }
    let captureIndex = 0;
    const indexReplacementMap = [];
    const paramReplacementMap = [];
    regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
      if (handlerIndex !== void 0) {
        indexReplacementMap[++captureIndex] = Number(handlerIndex);
        return "$()";
      }
      if (paramIndex !== void 0) {
        paramReplacementMap[Number(paramIndex)] = ++captureIndex;
        return "";
      }
      return "";
    });
    return [new RegExp(`^${regexp}`), indexReplacementMap, paramReplacementMap];
  }
};

// ../node_modules/hono/dist/router/reg-exp-router/router.js
var wildcardRegExpCache = createNullObject();
function buildWildcardRegExp(path2) {
  return wildcardRegExpCache[path2] ??= new RegExp(
    `^${path2.replace(
      /\/:[^/{}]+(?:\{\[\^\/]\+})?(?=[/{]|$)|\/?\*$|([.\\+*[^\]$()?{}|])/g,
      (match2, metaChar) => metaChar ? `\\${metaChar}` : match2 === "/*" ? TAIL_WILDCARD_REG_EXP_STR : match2 === "*" ? ONLY_WILDCARD_REG_EXP_STR : `/:${LABEL_REG_EXP_STR}`
    )}$`
  );
}
function findMiddleware(middleware, path2) {
  for (const k of Object.keys(middleware).sort((a, b) => b.length - a.length)) {
    if (buildWildcardRegExp(k).test(path2)) {
      return [...middleware[k]];
    }
  }
  return void 0;
}
var RegExpRouter = class {
  name = "RegExpRouter";
  #middleware;
  #routes;
  #tries;
  constructor() {
    this.#middleware = { [METHOD_NAME_ALL]: createNullObject() };
    this.#routes = { [METHOD_NAME_ALL]: createNullObject() };
    this.#tries = { [METHOD_NAME_ALL]: new Trie() };
  }
  #insertPath(method, path2) {
    try {
      this.#tries[method].insert(path2, !/\*|\/:/.test(path2));
    } catch (e) {
      throw e === PATH_ERROR ? new UnsupportedPathError(path2) : e;
    }
  }
  add(method, path2, handler) {
    const middleware = this.#middleware;
    const routes = this.#routes;
    if (!middleware) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    if (!middleware[method]) {
      this.#tries[method] = new Trie();
      for (const handlerMap of [middleware, routes]) {
        handlerMap[method] = createNullObject();
        for (const p in handlerMap[METHOD_NAME_ALL]) {
          handlerMap[method][p] = [...handlerMap[METHOD_NAME_ALL][p]];
          this.#insertPath(method, p);
        }
      }
    }
    if (path2 === "/*") {
      path2 = "*";
    }
    const methods = method === METHOD_NAME_ALL ? Object.keys(middleware) : [method];
    if (/\*$/.test(path2)) {
      const re = buildWildcardRegExp(path2);
      for (const m of methods) {
        if (!middleware[m][path2]) {
          this.#insertPath(m, path2);
          middleware[m][path2] = findMiddleware(middleware[m], path2) || findMiddleware(middleware[METHOD_NAME_ALL], path2) || [];
        }
      }
      for (const handlerMap of [middleware, routes]) {
        for (const m of methods) {
          for (const p in handlerMap[m]) {
            re.test(p) && handlerMap[m][p].push([handler, path2]);
          }
        }
      }
      return;
    }
    const paths = checkOptionalParameter(path2) || [path2];
    for (const path22 of paths) {
      for (const m of methods) {
        if (!routes[m][path22]) {
          this.#insertPath(m, path22);
          routes[m][path22] = findMiddleware(middleware[m], path22) || findMiddleware(middleware[METHOD_NAME_ALL], path22) || [];
        }
        routes[m][path22].push([handler, path22]);
      }
    }
  }
  match = match;
  buildAllMatchers() {
    const matchers = createNullObject();
    for (const method of Object.keys(this.#routes)) {
      matchers[method] = this.#buildMatcher(method);
    }
    this.#middleware = this.#routes = this.#tries = void 0;
    wildcardRegExpCache = createNullObject();
    return matchers;
  }
  #buildMatcher(method) {
    const middleware = this.#middleware[method];
    const routes = this.#routes[method];
    const trie = this.#tries[method];
    const staticMap = createNullObject();
    const handlerData = [];
    const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
    for (const r of [middleware, routes]) {
      for (const path2 in r) {
        const handlers = r[path2];
        const pathData = trie.paths[path2];
        if (!pathData) {
          staticMap[path2] = [handlers.map(([h]) => [h, createNullObject()]), emptyParam];
          continue;
        }
        handlerData[pathData[0]] = handlers.map(([h, handlerPath]) => [
          h,
          trie.paths[handlerPath][1].reduceRight((map, [key], i) => {
            map[key] = paramReplacementMap[pathData[1][i][1]];
            return map;
          }, createNullObject())
        ]);
      }
    }
    return [regexp, indexReplacementMap.map((i) => handlerData[i]), staticMap];
  }
};

// ../node_modules/hono/dist/router/smart-router/router.js
var SmartRouter = class {
  name = "SmartRouter";
  #routers = [];
  #routes = [];
  constructor(init) {
    this.#routers = init.routers;
  }
  add(method, path2, handler) {
    if (!this.#routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    this.#routes.push([method, path2, handler]);
  }
  match(method, path2) {
    if (!this.#routes) {
      throw new Error("Fatal error");
    }
    const routers = this.#routers;
    const routes = this.#routes;
    const len = routers.length;
    let i = 0;
    let res;
    for (; i < len; i++) {
      const router = routers[i];
      try {
        for (let i2 = 0, len2 = routes.length; i2 < len2; i2++) {
          router.add(...routes[i2]);
        }
        res = router.match(method, path2);
      } catch (e) {
        if (e instanceof UnsupportedPathError) {
          continue;
        }
        throw e;
      }
      this.match = router.match.bind(router);
      this.#routers = [router];
      this.#routes = void 0;
      break;
    }
    if (i === len) {
      throw new Error("Fatal error");
    }
    this.name = `SmartRouter + ${this.activeRouter.name}`;
    return res;
  }
  get activeRouter() {
    if (this.#routes || this.#routers.length !== 1) {
      throw new Error("No active router has been determined yet.");
    }
    return this.#routers[0];
  }
};

// ../node_modules/hono/dist/router/trie-router/node.js
var emptyParams = createNullObject();
var order = 0;
var Node2 = class _Node2 {
  #methods = [];
  #children = createNullObject();
  #patterns = [];
  #pattern;
  #params = emptyParams;
  insert(method, path2, handler) {
    let curNode = this;
    const parts = splitRoutingPath(path2);
    const possibleKeys = /* @__PURE__ */ new Set();
    let i = 0;
    for (const p of parts) {
      const nextP = parts[++i];
      const pattern = getPattern(p, nextP) || (nextP === void 0 && p && p.indexOf("*") === p.length - 1 ? p : null);
      const isParam = Array.isArray(pattern);
      const key = isParam ? pattern[0] : pattern || p;
      const child = curNode.#children[key] ||= new _Node2();
      if (pattern && !child.#pattern) {
        child.#pattern = pattern;
        curNode.#patterns.push(child);
      }
      curNode = child;
      if (isParam) {
        possibleKeys.add(pattern[1]);
      }
    }
    curNode.#methods.push({
      [method]: {
        handler,
        possibleKeys: [...possibleKeys],
        score: ++order
      }
    });
  }
  #pushHandlerSets(handlerSets, node, method, nodeParams, params) {
    for (let i = 0, len = node.#methods.length; i < len; i++) {
      const m = node.#methods[i];
      const handlerSet = m[method] || m[METHOD_NAME_ALL];
      if (handlerSet) {
        handlerSet.params = createNullObject();
        handlerSets.push(handlerSet);
        for (let i2 = 0, len2 = handlerSet.possibleKeys.length; i2 < len2; i2++) {
          const key = handlerSet.possibleKeys[i2];
          handlerSet.params[key] = params?.[key] && !i2 ? params[key] : nodeParams[key] ?? params?.[key];
        }
      }
    }
  }
  search(method, path2) {
    const handlerSets = [];
    this.#params = emptyParams;
    const curNode = this;
    let curNodes = [curNode];
    const parts = splitPath(path2);
    const curNodesQueue = [];
    const len = parts.length;
    let partOffsets = null;
    for (let i = 0; i < len; i++) {
      const part = parts[i];
      const isLast = i === len - 1;
      const tempNodes = [];
      for (let j = 0, len2 = curNodes.length; j < len2; j++) {
        const node = curNodes[j];
        const nextNode = node.#children[part];
        if (nextNode) {
          nextNode.#params = node.#params;
          if (isLast) {
            if (nextNode.#children["*"]) {
              this.#pushHandlerSets(handlerSets, nextNode.#children["*"], method, node.#params);
            }
            this.#pushHandlerSets(handlerSets, nextNode, method, node.#params);
          } else {
            tempNodes.push(nextNode);
          }
        }
        for (const child of node.#patterns) {
          const pattern = child.#pattern;
          const params = node.#params === emptyParams ? {} : { ...node.#params };
          if (typeof pattern === "string") {
            if (pattern === "*" || part.startsWith(pattern.slice(0, -1))) {
              this.#pushHandlerSets(handlerSets, child, method, node.#params);
              if (pattern === "*") {
                child.#params = params;
                tempNodes.push(child);
              }
            }
            continue;
          }
          const [, name, matcher] = pattern;
          if (!part && matcher === true) {
            continue;
          }
          if (matcher !== true) {
            if (!partOffsets) {
              partOffsets = [];
              let offset = path2[0] === "/" ? 1 : 0;
              for (let p = 0; p < len; p++) {
                partOffsets[p] = offset;
                offset += parts[p].length + 1;
              }
            }
            const restPathString = path2.slice(partOffsets[i]);
            const m = matcher.exec(restPathString);
            if (m) {
              params[name] = m[0];
              this.#pushHandlerSets(handlerSets, child, method, node.#params, params);
              if (m[0].length === restPathString.length && child.#children["*"]) {
                this.#pushHandlerSets(
                  handlerSets,
                  child.#children["*"],
                  method,
                  node.#params,
                  params
                );
              }
              for (const _ in child.#children) {
                child.#params = params;
                const componentCount = m[0].match(/\//g)?.length ?? 0;
                const targetCurNodes = curNodesQueue[componentCount] ||= [];
                targetCurNodes.push(child);
                break;
              }
              continue;
            }
          }
          if (matcher === true || matcher.test(part)) {
            params[name] = part;
            if (isLast) {
              this.#pushHandlerSets(handlerSets, child, method, params, node.#params);
              if (child.#children["*"]) {
                this.#pushHandlerSets(
                  handlerSets,
                  child.#children["*"],
                  method,
                  params,
                  node.#params
                );
              }
            } else {
              child.#params = params;
              tempNodes.push(child);
            }
          }
        }
      }
      const shifted = curNodesQueue.shift();
      curNodes = shifted ? tempNodes.concat(shifted) : tempNodes;
    }
    if (handlerSets[1]) {
      handlerSets.sort((a, b) => {
        return a.score - b.score;
      });
    }
    return [handlerSets.map(({ handler, params }) => [handler, params])];
  }
};

// ../node_modules/hono/dist/router/trie-router/router.js
var TrieRouter = class {
  name = "TrieRouter";
  #node = new Node2();
  add(method, path2, handler) {
    for (const result of checkOptionalParameter(path2) || [path2]) {
      this.#node.insert(method, result, handler);
    }
  }
  match(method, path2) {
    return this.#node.search(method, path2);
  }
};

// ../node_modules/hono/dist/hono.js
var Hono2 = class extends Hono {
  /**
   * Creates an instance of the Hono class.
   *
   * @param options - Optional configuration options for the Hono instance.
   */
  constructor(options = {}) {
    super(options);
    this.router = options.router ?? new SmartRouter({
      routers: [new RegExpRouter(), new TrieRouter()]
    });
  }
};

// src/shim.ts
import { realpathSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

// src/runtime.ts
import { inspect } from "node:util";

// src/types.ts
var HTTP_HANDLER = /* @__PURE__ */ Symbol.for("funcd.http");
function http(app) {
  const handler = (request, context) => app.fetch(request, { funcd: context });
  return Object.assign(handler, { [HTTP_HANDLER]: true });
}

// src/runtime.ts
function protocolFrom(env) {
  const value = env.FUNCD_PROTOCOL ?? "";
  if (value === "" || value === "cloudevent") return "cloudevent";
  if (value === "http") return "http";
  throw new Error(`FUNCD_PROTOCOL "${value}" is neither cloudevent nor http`);
}
function isHttpHandler(value) {
  return typeof value === "function" && value[HTTP_HANDLER] === true;
}
function exportOf(mod, name) {
  const candidate = mod?.[name] ?? mod?.default?.[name] ?? mod?.default;
  if (typeof candidate !== "function") {
    throw new Error(`export "${name}" is not a function`);
  }
  return candidate;
}
function resolveHandler(mod, name) {
  const candidate = exportOf(mod, name);
  if (isHttpHandler(candidate)) {
    throw new Error(`export "${name}" is an http(app) handler, which needs spec.protocol: http`);
  }
  return candidate;
}
function resolveHttpHandler(mod, name) {
  const candidate = exportOf(mod, name);
  if (!isHttpHandler(candidate)) {
    throw new Error(`export "${name}" is not an http(app) handler, which spec.protocol: http needs`);
  }
  return candidate;
}
function toWire(result) {
  const text = JSON.stringify(result);
  return text === void 0 ? null : JSON.parse(text);
}
function dropBrokenPipes() {
  for (const stream of [process.stdout, process.stderr]) {
    stream.on("error", (err) => {
      if (err.code !== "EPIPE") throw err;
    });
  }
}
function exitOnSigterm() {
  if (process.pid !== 1) return;
  process.on("SIGTERM", () => process.exit(143));
}
function containStrayFaults(prefix) {
  const log = (kind) => (err) => process.stderr.write(`${prefix}: ${kind}: ${inspect(err)}
`);
  process.on("unhandledRejection", log("unhandled rejection"));
  process.on("uncaughtException", log("uncaught exception"));
}

// src/httpapp.ts
var BODILESS = /* @__PURE__ */ new Set(["GET", "HEAD"]);
async function appRequest(raw2) {
  const headers = new Headers();
  raw2.headers.forEach((value, key) => {
    if (!key.startsWith("x-funcd-") && key !== "content-length") headers.append(key, value);
  });
  let body = null;
  if (!BODILESS.has(raw2.method)) {
    const bytes = new Uint8Array(await raw2.arrayBuffer());
    body = bytes.length === 0 ? null : unwrap(bytes);
  }
  if (body) headers.set("content-length", String(body.byteLength));
  return new Request(raw2.url, { method: raw2.method, headers, body });
}
function unwrap(bytes) {
  let value;
  try {
    value = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  } catch {
    return bytes;
  }
  if (typeof value !== "object" || value === null || Array.isArray(value) || !("specversion" in value)) {
    return bytes;
  }
  const data = value.data;
  return data === void 0 || data === null ? null : new TextEncoder().encode(JSON.stringify(data));
}
function streamed(res, span) {
  const outcome = res.status >= 500 ? "ERROR" : "OK";
  if (!res.body) {
    span.end(outcome);
    return res;
  }
  const reader = res.body.getReader();
  const body = new ReadableStream({
    async pull(controller) {
      try {
        const { done, value } = await reader.read();
        if (done) {
          span.end(outcome);
          controller.close();
          return;
        }
        controller.enqueue(value);
      } catch (err) {
        span.end("ERROR", String(err instanceof Error ? err.message : err));
        controller.error(err);
      }
    },
    cancel(reason) {
      span.end("ERROR", "the client went away");
      return reader.cancel(reason);
    }
  });
  return new Response(body, { status: res.status, statusText: res.statusText, headers: res.headers });
}

// src/invoke.ts
import http2 from "node:http";

// src/tracespan.ts
import { randomBytes } from "node:crypto";

// src/invcontext.ts
import { AsyncLocalStorage } from "node:async_hooks";
var invStore = new AsyncLocalStorage();
function currentInv() {
  return invStore.getStore();
}
var maxTimeoutMs = 2147482647;
function parseTimeoutMs(value) {
  if (value === void 0 || !/^[0-9]+$/.test(value)) return void 0;
  const ms = Number(value);
  return ms >= 1 && ms <= maxTimeoutMs ? ms : void 0;
}
function nowMs() {
  return Number(process.hrtime.bigint()) / 1e6;
}
function deadlineFrom(header) {
  const ms = parseTimeoutMs(header);
  return ms === void 0 ? void 0 : nowMs() + ms;
}
function remainingMs() {
  const deadline = currentInv()?.deadline;
  return deadline === void 0 ? null : Math.max(0, Math.floor(deadline - nowMs()));
}

// src/funclog.ts
import { writeSync } from "node:fs";
import { connect } from "node:net";
import { inspect as inspect2 } from "node:util";
import { threadId } from "node:worker_threads";
var SEVERITY = {
  debug: "DEBUG",
  log: "INFO",
  info: "INFO",
  warn: "WARN",
  error: "ERROR"
};
var DEFAULT_MAX_RECORD_BYTES = 65536;
function recordBound(env) {
  const raw2 = env.FUNCD_FUNCLOG_MAX_RECORD_BYTES;
  if (raw2 === void 0 || !/^[0-9]+$/.test(raw2)) return DEFAULT_MAX_RECORD_BYTES;
  const n = Number(raw2);
  return Number.isSafeInteger(n) && n > 0 ? n : DEFAULT_MAX_RECORD_BYTES;
}
var MARKER_RESERVE = 41;
var RESERVED_KEYS = /* @__PURE__ */ new Set(["args", "truncated", "keptBytes"]);
function fitText(b, s) {
  if (b.cut) return "";
  const limit = Math.min(s.length, b.left + 1);
  let i = 0;
  let left = b.left;
  let kept = 0;
  while (i < limit) {
    const c = s.charCodeAt(i);
    let esc;
    let raw2;
    let units = 1;
    if (c === 34 || c === 92) {
      esc = 2;
      raw2 = 1;
    } else if (c < 32) {
      esc = c === 8 || c === 9 || c === 10 || c === 12 || c === 13 ? 2 : 6;
      raw2 = 1;
    } else if (c < 128) {
      esc = raw2 = 1;
    } else if (c < 2048) {
      esc = raw2 = 2;
    } else if (c >= 55296 && c <= 56319 && i + 1 < s.length && (s.charCodeAt(i + 1) & 64512) === 56320) {
      esc = raw2 = 4;
      units = 2;
    } else if (c >= 55296 && c <= 57343) {
      esc = 6;
      raw2 = 3;
    } else {
      esc = raw2 = 3;
    }
    if (esc > left) break;
    left -= esc;
    kept += raw2;
    i += units;
  }
  b.left = left;
  b.kept += kept;
  if (i < s.length) {
    b.cut = true;
    return s.slice(0, i);
  }
  return s;
}
function charge(b, n) {
  if (b.cut) return false;
  if (n > b.left) {
    b.cut = true;
    return false;
  }
  b.left -= n;
  return true;
}
function jsonString(b, s) {
  let end = Math.min(s.length, b.left + 1);
  if (end < s.length && (s.charCodeAt(end - 1) & 64512) === 55296) end++;
  return JSON.stringify(end < s.length ? s.slice(0, end) : s);
}
function boundedStringify(value, budget) {
  const out = [];
  const { left, kept, cut } = budget;
  try {
    walk(value, "", [], budget, out);
  } catch {
    budget.left = left;
    budget.kept = kept;
    budget.cut = cut;
    let text;
    try {
      text = String(value);
    } catch {
      text = "[Unserializable]";
    }
    return fitText(budget, text);
  }
  return out.join("");
}
function walk(value, key, path2, b, out) {
  if (b.cut) return;
  let v = value;
  if (typeof v === "object" && v !== null && !Buffer.isBuffer(v)) {
    const toJSON = v.toJSON;
    if (typeof toJSON === "function") v = toJSON.call(v, key);
  }
  switch (typeof v) {
    case "string":
      out.push(fitText(b, jsonString(b, v)));
      return;
    case "number":
      out.push(fitText(b, Number.isFinite(v) && !Object.is(v, -0) ? String(v) : JSON.stringify(inspect2(v))));
      return;
    case "bigint":
      out.push(fitText(b, JSON.stringify(v.toString())));
      return;
    case "boolean":
      out.push(fitText(b, String(v)));
      return;
    case "undefined":
    case "function":
    case "symbol":
      out.push(fitText(b, JSON.stringify(inspect2(v))));
      return;
  }
  if (v === null) {
    out.push(fitText(b, "null"));
    return;
  }
  const o = v;
  if (path2.includes(o)) {
    out.push(fitText(b, '"[Circular]"'));
    return;
  }
  if (o instanceof RegExp) {
    out.push(fitText(b, JSON.stringify(inspect2(o))));
    return;
  }
  if (o instanceof Number || o instanceof Boolean || o instanceof String) {
    const p = o.valueOf();
    if (typeof p === "string") walk(p, key, path2, b, out);
    else out.push(fitText(b, typeof p === "number" && !Number.isFinite(p) ? "null" : String(p)));
    return;
  }
  path2.push(o);
  try {
    if (Buffer.isBuffer(o)) {
      out.push(fitText(b, '{"type":"Buffer","data":'));
      elements(o.length, (i) => out.push(fitText(b, String(o[i]))), b, out);
      out.push(fitText(b, "}"));
    } else if (o instanceof DataView || o instanceof ArrayBuffer || o instanceof SharedArrayBuffer) {
      const buf = o instanceof DataView ? o.buffer : o;
      const bytes = buf.byteLength === 0 ? new Uint8Array(0) : o instanceof DataView ? new Uint8Array(buf, o.byteOffset, o.byteLength) : new Uint8Array(buf);
      elements(bytes.length, (i) => out.push(fitText(b, String(bytes[i]))), b, out);
    } else if (ArrayBuffer.isView(o)) {
      const view = o;
      elements(view.length, (i) => walk(view[i], String(i), path2, b, out), b, out);
    } else if (Array.isArray(o)) {
      elements(o.length, (i) => walk(o[i], String(i), path2, b, out), b, out);
    } else if (o instanceof Map) {
      iterate(
        o,
        ([k, val]) => {
          out.push(fitText(b, "["));
          walk(k, "0", path2, b, out);
          out.push(fitText(b, ","));
          walk(val, "1", path2, b, out);
          out.push(fitText(b, "]"));
        },
        b,
        out
      );
    } else if (o instanceof Set) {
      let i = 0;
      iterate(o, (x) => walk(x, String(i++), path2, b, out), b, out);
    } else {
      const keys = Object.keys(o);
      if (o instanceof Error) {
        for (const k of ["name", "message", "stack"]) if (!keys.includes(k)) keys.push(k);
        if ("cause" in o && !keys.includes("cause")) keys.push("cause");
      }
      out.push(fitText(b, "{"));
      for (let i = 0; i < keys.length && !b.cut; i++) {
        out.push(fitText(b, `${i > 0 ? "," : ""}${JSON.stringify(keys[i])}:`));
        walk(o[keys[i]], keys[i], path2, b, out);
      }
      out.push(fitText(b, "}"));
    }
  } finally {
    path2.pop();
  }
}
function elements(n, each, b, out) {
  out.push(fitText(b, "["));
  for (let i = 0; i < n && !b.cut; i++) {
    if (i > 0) out.push(fitText(b, ","));
    each(i);
  }
  out.push(fitText(b, "]"));
}
function iterate(it, each, b, out) {
  out.push(fitText(b, "["));
  let first = true;
  for (const x of it) {
    if (b.cut) break;
    if (!first) out.push(fitText(b, ","));
    first = false;
    each(x);
  }
  out.push(fitText(b, "]"));
}
function isPlainObject(v) {
  if (typeof v !== "object" || v === null) return false;
  const proto = Object.getPrototypeOf(v);
  return proto === Object.prototype || proto === null;
}
function buildLine(method, args, bound, member) {
  const inv = currentInv();
  const rec = {
    ts: Date.now() * 1e6,
    sev: SEVERITY[method],
    body: "",
    attrs: {},
    inv: inv?.inv ?? "",
    trace_id: inv?.traceId ?? "",
    span_id: inv?.spanId ?? "",
    "funcd.source": "console"
  };
  if (member) rec["funcd.member"] = member;
  const b = {
    left: Math.max(0, bound - Buffer.byteLength(JSON.stringify(rec)) - MARKER_RESERVE),
    kept: 0,
    cut: false
  };
  if (typeof args[0] === "string") rec.body = fitText(b, args[0]);
  const attrs = { args: "" };
  let entries = 0;
  const entry2 = (k) => charge(b, Buffer.byteLength(JSON.stringify(k)) + 3 + (entries++ > 0 ? 1 : 0));
  const merged = /* @__PURE__ */ new Map();
  for (const arg of args) {
    if (!isPlainObject(arg)) continue;
    for (const k of Object.keys(arg)) if (!RESERVED_KEYS.has(k)) merged.set(k, arg);
  }
  for (const [k, owner] of merged) {
    if (!entry2(k)) break;
    const v = owner[k];
    attrs[k] = typeof v === "string" ? fitText(b, v) : boundedStringify(v, b);
    if (b.cut) break;
  }
  if (entry2("args")) attrs.args = boundedStringify(args, b);
  else delete attrs.args;
  if (b.cut) {
    attrs.truncated = "true";
    attrs.keptBytes = String(b.kept);
  }
  rec.attrs = attrs;
  return JSON.stringify(rec);
}
function acquire(lock) {
  for (; ; ) {
    const holder = Atomics.compareExchange(lock, 0, 0, threadId + 1);
    if (holder === 0) return;
    Atomics.wait(lock, 0, holder);
  }
}
function releaseChannelLock(lock, holderThreadId = threadId) {
  if (Atomics.compareExchange(lock, 0, holderThreadId + 1, 0) === holderThreadId + 1) Atomics.notify(lock, 0, 1);
}
function openChannel(env, lock) {
  const fdRaw = env.FUNCD_LOG_FD;
  if (fdRaw !== void 0 && fdRaw !== "") {
    const fd = Number(fdRaw);
    if (!Number.isInteger(fd) || fd < 0) return null;
    return (line) => {
      if (lock) acquire(lock);
      try {
        writeSync(fd, line);
      } catch {
      } finally {
        if (lock) releaseChannelLock(lock);
      }
    };
  }
  const sockPath = env.FUNCD_LOG_SOCK;
  if (sockPath !== void 0 && sockPath !== "") {
    let sock = connect(sockPath);
    sock.on("error", () => {
      sock = null;
    });
    sock.unref();
    return (line) => {
      try {
        sock?.write(line);
      } catch {
      }
    };
  }
  return null;
}
function installConsoleCapture(env = process.env, sink = openChannel(env), member) {
  if (!sink) return false;
  const bound = recordBound(env);
  const methods = ["debug", "log", "info", "warn", "error"];
  for (const method of methods) {
    console[method] = (...args) => {
      try {
        sink(buildLine(method, args, bound, member) + "\n");
      } catch {
      }
    };
  }
  return true;
}

// src/tracespan.ts
var ZERO_TRACE = "0".repeat(32);
var ZERO_SPAN = "0".repeat(16);
function parseTraceparent(tp) {
  if (!tp) return null;
  const parts = tp.trim().split("-");
  if (parts.length < 4) return null;
  const [version, traceId, parentId] = parts;
  if (!/^[0-9a-f]{2}$/.test(version) || version === "ff") return null;
  if (!/^[0-9a-f]{32}$/.test(traceId) || traceId === ZERO_TRACE) return null;
  if (!/^[0-9a-f]{16}$/.test(parentId) || parentId === ZERO_SPAN) return null;
  return { traceId, parentId };
}
function newInvContext(tp, providedSpanId, deadline) {
  const adopted = parseTraceparent(tp);
  const spanId = providedSpanId && /^[0-9a-f]{16}$/.test(providedSpanId) ? providedSpanId : randomBytes(8).toString("hex");
  return {
    inv: randomBytes(8).toString("hex"),
    traceId: adopted ? adopted.traceId : randomBytes(16).toString("hex"),
    spanId,
    parentId: adopted ? adopted.parentId : "",
    deadline
  };
}
function emitSpan(sink, ids, name, kind, start, end, status, statusMsg, attrs, links, member, bound) {
  const rec = {
    "funcd.signal": "traces",
    trace_id: ids.traceId,
    span_id: ids.spanId,
    parent_id: ids.parentId,
    name,
    kind,
    start,
    end,
    status,
    status_msg: statusMsg,
    attrs,
    inv: ids.inv,
    links
  };
  if (member) rec["funcd.member"] = member;
  try {
    sink(boundSpan(rec, bound) + "\n");
  } catch {
  }
}
function boundSpan(rec, bound) {
  const line = JSON.stringify(rec);
  if (Buffer.byteLength(line) <= bound) return line;
  const statusMsg = rec.status_msg;
  rec.status_msg = "";
  rec.attrs = { ...rec.attrs, truncated: "true", keptBytes: "" };
  const b = { left: Math.max(0, bound - Buffer.byteLength(JSON.stringify(rec)) - 7), kept: 0, cut: false };
  rec.status_msg = fitText(b, statusMsg);
  rec.attrs.keptBytes = String(b.kept);
  return JSON.stringify(rec);
}
function startSpan(sink, name, tp, spanId, links = [], member, bound = DEFAULT_MAX_RECORD_BYTES, deadline) {
  const inv = newInvContext(tp, spanId, deadline);
  const startNs = Date.now() * 1e6;
  const t0 = process.hrtime.bigint();
  const validLinks = links.filter((l) => /^[0-9a-f]{16}$/.test(l));
  let ended = false;
  return {
    inv,
    run(fn) {
      return invStore.run(inv, async () => fn());
    },
    end(status, statusMsg = "") {
      if (ended) return;
      ended = true;
      if (!sink) return;
      const endNs = startNs + Number(process.hrtime.bigint() - t0);
      emitSpan(sink, inv, name, "SERVER", startNs, endNs, status, statusMsg, {}, validLinks, member, bound);
    }
  };
}
function startClientSpan(sink, alias, member, bound = DEFAULT_MAX_RECORD_BYTES) {
  const caller = currentInv();
  if (!caller) return null;
  const ids = {
    inv: caller.inv,
    traceId: caller.traceId,
    spanId: randomBytes(8).toString("hex"),
    parentId: caller.spanId
  };
  const startNs = Date.now() * 1e6;
  const t0 = process.hrtime.bigint();
  let ended = false;
  return {
    traceparent: `00-${ids.traceId}-${ids.spanId}-01`,
    end(status, statusMsg = "", httpStatus) {
      if (ended) return;
      ended = true;
      if (!sink) return;
      const endNs = startNs + Number(process.hrtime.bigint() - t0);
      const attrs = httpStatus === void 0 ? {} : { "http.status_code": String(httpStatus) };
      emitSpan(sink, ids, `call ${alias}`, "CLIENT", startNs, endNs, status, statusMsg, attrs, [], member, bound);
    }
  };
}
function parseLinks(header) {
  if (!header) return [];
  return header.split(",").map((s) => s.trim()).filter((s) => s.length > 0);
}

// src/invoke.ts
var MEMBER_HEADER = "X-Funcd-Member";
function makeInvoke(opts = {}) {
  return (alias, input) => new Promise((resolve, reject) => {
    const span = startClientSpan(opts.sink ?? null, alias, opts.member, opts.bound);
    const fail4 = (err, httpStatus) => {
      span?.end("ERROR", err.message, httpStatus);
      reject(err);
    };
    const socketPath = process.env.FUNCD_INVOKE_SOCKET;
    if (!socketPath) {
      fail4(new Error("context.invoke: worker-node local API socket unavailable (FUNCD_INVOKE_SOCKET unset)"));
      return;
    }
    const body = JSON.stringify(input ?? null);
    const headers = {
      "content-type": "application/json",
      "content-length": Buffer.byteLength(body)
    };
    if (opts.member) headers[MEMBER_HEADER] = opts.member;
    if (span) headers.traceparent = span.traceparent;
    const req = http2.request(
      {
        socketPath,
        path: `/invoke/${encodeURIComponent(alias)}`,
        method: "POST",
        headers
      },
      (res) => {
        const chunks = [];
        const status = res.statusCode ?? 0;
        res.on(
          "error",
          (err) => fail4(
            new Error(`context.invoke("${alias}") failed: connection closed before the reply ended`, { cause: err }),
            status
          )
        );
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          const text = Buffer.concat(chunks).toString("utf8");
          if (status >= 200 && status < 300) {
            let out;
            try {
              out = text ? JSON.parse(text) : null;
            } catch (err) {
              fail4(
                new Error(`context.invoke("${alias}") failed: ${status} reply is not JSON: ${text}`, { cause: err }),
                status
              );
              return;
            }
            span?.end("OK", "", status);
            resolve(out);
          } else {
            fail4(new Error(`context.invoke("${alias}") failed: ${status} ${text}`), status);
          }
        });
      }
    );
    req.on("error", (err) => fail4(new Error(`context.invoke("${alias}") failed: ${err.message}`, { cause: err })));
    req.end(body);
  });
}
var NULL_BODY = /* @__PURE__ */ new Set([101, 204, 205, 304]);
var FETCH_REPLY_HEADER = "x-funcd-fetch-reply";
function makeFetch(opts = {}) {
  return async (alias, path2, init) => {
    const span = startClientSpan(opts.sink ?? null, alias, opts.member, opts.bound);
    const fail4 = (err, httpStatus) => {
      span?.end("ERROR", err.message, httpStatus);
      throw err;
    };
    const socketPath = process.env.FUNCD_INVOKE_SOCKET;
    if (!socketPath) {
      return fail4(new Error("context.fetch: worker-node local API socket unavailable (FUNCD_INVOKE_SOCKET unset)"));
    }
    if (!path2.startsWith("/")) {
      return fail4(new Error(`context.fetch("${alias}"): path "${path2}" must start with "/"`));
    }
    const request = new Request(new URL(path2, "http://funcd.local"), init);
    const body = request.body ? Buffer.from(await request.arrayBuffer()) : void 0;
    const headers = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });
    if (body) headers["content-length"] = String(body.length);
    if (opts.member) headers[MEMBER_HEADER] = opts.member;
    if (span) headers.traceparent = span.traceparent;
    const target = new URL(request.url);
    const reply = await new Promise((resolve, reject) => {
      const req = http2.request(
        {
          socketPath,
          path: `/fetch/${encodeURIComponent(alias)}${target.pathname}${target.search}`,
          method: request.method,
          headers
        },
        (res) => {
          const chunks = [];
          res.on(
            "error",
            (err) => reject(
              new Error(`context.fetch("${alias}") failed: connection closed before the reply ended`, { cause: err })
            )
          );
          res.on("data", (c) => chunks.push(c));
          res.on("end", () => {
            const replyHeaders = new Headers();
            for (const [key, value] of Object.entries(res.headers)) {
              for (const v of Array.isArray(value) ? value : [value]) {
                if (v !== void 0) replyHeaders.append(key, v);
              }
            }
            resolve({ status: res.statusCode ?? 0, headers: replyHeaders, body: Buffer.concat(chunks) });
          });
        }
      );
      req.on("error", (err) => reject(new Error(`context.fetch("${alias}") failed: ${err.message}`, { cause: err })));
      req.end(body);
    }).catch((err) => fail4(err));
    if (!reply.headers.has(FETCH_REPLY_HEADER)) {
      return fail4(
        new Error(`context.fetch("${alias}") failed: ${reply.status} ${reply.body.toString("utf8")}`),
        reply.status
      );
    }
    reply.headers.delete(FETCH_REPLY_HEADER);
    span?.end(reply.status >= 500 ? "ERROR" : "OK", "", reply.status);
    return new Response(NULL_BODY.has(reply.status) ? null : new Uint8Array(reply.body), {
      status: reply.status,
      headers: reply.headers
    });
  };
}

// src/socket.ts
import http3 from "node:http";
function send(client, method, path2, body, member, contentType2) {
  return new Promise((resolve, reject) => {
    const socketPath = process.env.FUNCD_INVOKE_SOCKET;
    if (!socketPath) {
      reject(new Error(`${client}: worker-node local API socket unavailable (FUNCD_INVOKE_SOCKET unset)`));
      return;
    }
    const headers = {};
    if (body) headers["content-length"] = body.byteLength;
    if (contentType2) headers["content-type"] = contentType2;
    if (member) headers[MEMBER_HEADER] = member;
    const req = http3.request({ socketPath, path: path2, method, headers }, (res) => {
      const chunks = [];
      res.on(
        "error",
        (err) => reject(
          new Error(`${client} ${method} ${path2} failed: connection closed before the reply ended`, { cause: err })
        )
      );
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve({ status: res.statusCode ?? 0, body: Buffer.concat(chunks) }));
    });
    req.on("error", (err) => reject(new Error(`${client} ${method} ${path2} failed: ${err.message}`, { cause: err })));
    if (body) req.end(body);
    else req.end();
  });
}

// src/kv.ts
var send2 = (method, path2, body, member) => send("context.kv", method, path2, body, member);
var enc = encodeURIComponent;
var keyPath = (binding, key) => `/kv/${enc(binding)}/${key.split("/").map(enc).join("/")}`;
var fail = (verb, r) => new Error(`context.kv.${verb} failed: ${r.status} ${r.body.toString("utf8")}`);
var ok = (r) => r.status >= 200 && r.status < 300;
var json2 = (verb, r, text) => {
  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error(`context.kv.${verb} failed: ${r.status} reply is not JSON: ${err.message}`, {
      cause: err
    });
  }
};
function makeKV(member) {
  const request = (method, path2, body) => send2(method, path2, body, member);
  return {
    async get(binding, key) {
      const r = await request("GET", keyPath(binding, key));
      if (r.status === 404) return null;
      if (!ok(r)) throw fail("get", r);
      return new Uint8Array(r.body);
    },
    async getText(binding, key) {
      const r = await request("GET", keyPath(binding, key));
      if (r.status === 404) return null;
      if (!ok(r)) throw fail("get", r);
      return r.body.toString("utf8");
    },
    async getJSON(binding, key) {
      const r = await request("GET", keyPath(binding, key));
      if (r.status === 404) return null;
      if (!ok(r)) throw fail("get", r);
      return json2("getJSON", r, r.body.toString("utf8"));
    },
    async put(binding, key, value) {
      const buf = typeof value === "string" ? Buffer.from(value, "utf8") : Buffer.from(value);
      const r = await request("PUT", keyPath(binding, key), buf);
      if (!ok(r)) throw fail("put", r);
    },
    async del(binding, key) {
      const r = await request("DELETE", keyPath(binding, key));
      if (!ok(r)) throw fail("del", r);
    },
    async list(binding, prefix) {
      const q = prefix ? `?prefix=${enc(prefix)}` : "";
      const r = await request("GET", `/kv/${enc(binding)}${q}`);
      if (!ok(r)) throw fail("list", r);
      return json2("list", r, r.body.toString("utf8") || "[]");
    }
  };
}

// src/sql.ts
function wire(sql, params) {
  if (params === void 0) return [sql];
  return Array.isArray(params) ? [sql, ...params] : [sql, params];
}
function toWire2(s) {
  return typeof s === "string" ? [s] : wire(s[0], s[1]);
}
function makeSQL(member) {
  async function call(verb, alias, statements) {
    const path2 = `/sql/${encodeURIComponent(alias)}/${verb}`;
    const body = Buffer.from(JSON.stringify({ statements }), "utf8");
    const r = await send("context.sql", "POST", path2, body, member, "application/json");
    const text = r.body.toString("utf8");
    if (r.status < 200 || r.status >= 300) throw new Error(`context.sql.${verb} failed: ${r.status} ${text}`);
    try {
      return JSON.parse(text).results;
    } catch (err) {
      throw new Error(`context.sql.${verb} failed: ${r.status} reply is not JSON: ${err.message}`, {
        cause: err
      });
    }
  }
  async function queryValues(alias, sql, params) {
    const [res] = await call("query", alias, [wire(sql, params)]);
    return res;
  }
  async function execute(alias, sqlOrStatements, params) {
    if (typeof sqlOrStatements === "string") {
      const [res] = await call("execute", alias, [wire(sqlOrStatements, params)]);
      return res;
    }
    return call("execute", alias, sqlOrStatements.map(toWire2));
  }
  return {
    async query(alias, sql, params) {
      const { columns, values } = await queryValues(alias, sql, params);
      return values.map((row) => Object.fromEntries(columns.map((c, i) => [c, row[i]])));
    },
    queryValues,
    execute
  };
}

// src/blob.ts
var send3 = (method, path2, body, member) => send("context.blob", method, path2, body, member);
var enc2 = encodeURIComponent;
var keyPath2 = (binding, key) => `/blob/${enc2(binding)}/${key.split("/").map(enc2).join("/")}`;
var fail2 = (verb, r) => new Error(`context.blob.${verb} failed: ${r.status} ${r.body.toString("utf8")}`);
var ok2 = (r) => r.status >= 200 && r.status < 300;
var json3 = (verb, r, text) => {
  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error(`context.blob.${verb} failed: ${r.status} reply is not JSON: ${err.message}`, {
      cause: err
    });
  }
};
function makeBlob(member) {
  const request = (method, path2, body) => send3(method, path2, body, member);
  return {
    async get(binding, key) {
      const r = await request("GET", keyPath2(binding, key));
      if (r.status === 404) return null;
      if (!ok2(r)) throw fail2("get", r);
      return new Uint8Array(r.body);
    },
    async put(binding, key, value) {
      const r = await request("PUT", keyPath2(binding, key), Buffer.from(value));
      if (!ok2(r)) throw fail2("put", r);
    },
    async del(binding, key) {
      const r = await request("DELETE", keyPath2(binding, key));
      if (!ok2(r)) throw fail2("del", r);
    },
    async list(binding, prefix) {
      const q = prefix ? `?prefix=${enc2(prefix)}` : "";
      const r = await request("GET", `/blob/${enc2(binding)}${q}`);
      if (!ok2(r)) throw fail2("list", r);
      return json3("list", r, r.body.toString("utf8") || "[]");
    },
    async signedUrl(binding, key, opts) {
      let path2 = `${keyPath2(binding, key)}?sign=1&method=${enc2(opts?.method ?? "GET")}`;
      if (opts?.expiry != null) path2 += `&expiry=${enc2(opts.expiry)}`;
      const r = await request("GET", path2);
      if (!ok2(r)) throw fail2("signedUrl", r);
      return r.body.toString("utf8");
    }
  };
}

// src/config.ts
function listedKeys(env, list) {
  const v = env[list];
  return v ? v.split(",") : [];
}
function listedValue(env, list, key) {
  return listedKeys(env, list).includes(key) ? env[key] : void 0;
}
function makeConfig(env = process.env) {
  return {
    get: (key) => listedValue(env, "FUNCD_CONFIG_KEYS", key),
    list: () => listedKeys(env, "FUNCD_CONFIG_KEYS")
  };
}

// src/secret.ts
var fail3 = (verb, r) => new Error(`context.secret.${verb} failed: ${r.status} ${r.body.toString("utf8")}`);
var json4 = (verb, r) => {
  try {
    return JSON.parse(r.body.toString("utf8"));
  } catch (err) {
    throw new Error(`context.secret.${verb} failed: ${r.status} reply is not JSON: ${err.message}`, {
      cause: err
    });
  }
};
function makeSecret(member) {
  return {
    async get(key) {
      const r = await send("context.secret", "GET", `/secret/${encodeURIComponent(key)}`, void 0, member);
      if (r.status === 404) return void 0;
      if (r.status !== 200) throw fail3("get", r);
      return json4("get", r).value;
    },
    async list() {
      const r = await send("context.secret", "GET", "/secret", void 0, member);
      if (r.status !== 200) throw fail3("list", r);
      return json4("list", r).keys;
    }
  };
}

// src/lake.ts
function makeLake(env = process.env) {
  return {
    get(alias) {
      const prefix = `FUNCD_LAKE_${alias.toUpperCase()}_`;
      const url = env[`${prefix}URL`];
      const token = env[`${prefix}TOKEN`];
      if (!url || !token) throw new Error(`context.lake.get: lake "${alias}" is not bound`);
      return { url, token };
    }
  };
}

// src/dependencies.ts
import http4 from "node:http";
var dependencyCheckBudgetMs = 50;
var path = "/health/dependencies";
var socketReport = (reason, message) => ({
  kind: "socket",
  binding: "",
  reason,
  message
});
function judge(status, text) {
  if (status === 200 || status === 404) return void 0;
  if (status === 503) {
    try {
      const report = JSON.parse(text);
      if (typeof report?.kind === "string" && report.kind !== "") return report;
    } catch {
    }
    return socketReport("Unreachable", `GET ${path} answered 503 without a dependency report: ${text}`);
  }
  return socketReport("Unreachable", `GET ${path} answered ${status}: ${text}`);
}
function checkDependencies(member, signal) {
  return new Promise((resolve) => {
    const socketPath = process.env.FUNCD_INVOKE_SOCKET;
    if (!socketPath) {
      resolve(void 0);
      return;
    }
    let settled = false;
    const settle = (report) => {
      if (settled) return;
      settled = true;
      signal.removeEventListener("abort", onAbort);
      resolve(report);
    };
    const unreachable = (err) => settle(socketReport("Unreachable", `GET ${path} failed: ${err.message}`));
    const req = http4.request(
      { socketPath, path, method: "GET", headers: member ? { [MEMBER_HEADER]: member } : {} },
      (res) => {
        const chunks = [];
        res.on("error", unreachable);
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => settle(judge(res.statusCode ?? 0, Buffer.concat(chunks).toString("utf8"))));
      }
    );
    const onAbort = () => {
      settle(socketReport("Timeout", `GET ${path} did not answer within ${dependencyCheckBudgetMs} ms`));
      req.destroy();
    };
    req.on("error", unreachable);
    if (signal.aborted) onAbort();
    else signal.addEventListener("abort", onAbort);
    req.end();
  });
}

// src/shim.ts
function contextFor(sink, bound) {
  return {
    log: (...args) => console.log(...args),
    invoke: makeInvoke({ sink, bound }),
    fetch: makeFetch({ sink, bound }),
    kv: makeKV(),
    blob: makeBlob(),
    sql: makeSQL(),
    config: makeConfig(),
    secret: makeSecret(),
    lake: makeLake(),
    remainingMs
  };
}
function addHealth(app, health) {
  app.get("/health/liveness", (c) => c.text("ok"));
  app.get("/health/readiness", async (c) => {
    const report = await checkDependencies(
      void 0,
      AbortSignal.timeout(health.dependencyBudgetMs ?? dependencyCheckBudgetMs)
    );
    return report ? c.json(report, 503) : c.text("ready");
  });
}
function createApp(handler, trace = {}, health = {}) {
  const app = new Hono2();
  const traceSink = trace.sink ?? null;
  const ctx = contextFor(traceSink, trace.bound);
  const fnName = trace.fnName ?? "invoke";
  addHealth(app, health);
  app.post("/", async (c) => {
    const deadline = deadlineFrom(c.req.header("x-funcd-timeout-ms"));
    let event;
    try {
      const text = await c.req.text();
      event = text ? JSON.parse(text) : {};
    } catch {
      return c.text("invalid CloudEvent JSON", 400);
    }
    if (typeof event !== "object" || event === null || Array.isArray(event)) {
      return c.text("request body must be a JSON object (CloudEvent envelope)", 400);
    }
    const span = startSpan(
      traceSink,
      fnName,
      c.req.header("traceparent"),
      c.req.header("x-funcd-span-id"),
      parseLinks(c.req.header("x-funcd-span-links")),
      void 0,
      trace.bound,
      deadline
    );
    try {
      const result = toWire(await span.run(() => handler(ctx, event)));
      span.end("OK");
      if (result === null) return c.body(null, 204);
      return c.json(result);
    } catch (err) {
      span.end("ERROR", String(err instanceof Error ? err.message : err));
      return c.json({ error: String(err instanceof Error ? err.message : err) }, 500);
    }
  });
  return app;
}
function createHttpApp(handler, trace = {}, health = {}) {
  const app = new Hono2();
  const traceSink = trace.sink ?? null;
  const ctx = contextFor(traceSink, trace.bound);
  const fnName = trace.fnName ?? "invoke";
  addHealth(app, health);
  app.all("*", async (c) => {
    const span = startSpan(
      traceSink,
      fnName,
      c.req.header("traceparent"),
      c.req.header("x-funcd-span-id"),
      parseLinks(c.req.header("x-funcd-span-links")),
      void 0,
      trace.bound,
      deadlineFrom(c.req.header("x-funcd-timeout-ms"))
    );
    try {
      const res = await span.run(async () => handler(await appRequest(c.req.raw), ctx));
      return streamed(res, span);
    } catch (err) {
      const message = String(err instanceof Error ? err.message : err);
      span.end("ERROR", message);
      return c.json({ error: message }, 500);
    }
  });
  return app;
}
async function main() {
  dropBrokenPipes();
  exitOnSigterm();
  const channel = openChannel(process.env);
  installConsoleCapture(process.env, channel);
  const artifact = process.env.FUNCD_ARTIFACT;
  const handlerName = process.env.FUNCD_HANDLER ?? "handle";
  const fixedPort = process.env.FUNCD_PORT ? Number(process.env.FUNCD_PORT) : 0;
  const portFile = process.env.FUNCD_PORTFILE;
  if (!artifact) {
    process.stderr.write("funcd-shim: FUNCD_ARTIFACT is required\n");
    process.exit(2);
  }
  let protocol;
  try {
    protocol = protocolFrom(process.env);
  } catch (err) {
    process.stderr.write(`funcd-shim: ${err instanceof Error ? err.message : err}
`);
    process.exit(2);
  }
  if (protocol === "http" && process.env.FUNCD_CONTRACT_PATH) {
    process.stderr.write("funcd-shim: contract error: a Function with spec.protocol: http has no I/O contract\n");
    process.exit(3);
  }
  const fnName = process.env.FUNCD_FUNCTION ?? "invoke";
  const appTrace = { sink: channel, fnName, bound: recordBound(process.env) };
  let app;
  try {
    const mod = await import(pathToFileURL(artifact).href);
    app = protocol === "http" ? createHttpApp(resolveHttpHandler(mod, handlerName), appTrace) : createApp(resolveHandler(mod, handlerName), appTrace);
  } catch (err) {
    process.stderr.write(`funcd-shim: shape error: ${err instanceof Error ? err.message : err}
`);
    process.exit(3);
  }
  const hostname = fixedPort > 0 ? "0.0.0.0" : "127.0.0.1";
  serve({ fetch: app.fetch, hostname, port: fixedPort }, (info) => {
    containStrayFaults("funcd-shim");
    if (portFile) writeFileSync(portFile, String(info.port));
    process.stdout.write(`funcd-shim: listening on ${hostname}:${info.port}
`);
  });
}
var entry = process.argv[1] ? pathToFileURL(realpathSync(process.argv[1])).href : "";
if (import.meta.url === entry) {
  void main();
}
export {
  createApp,
  createHttpApp,
  http,
  resolveHandler,
  resolveHttpHandler
};
