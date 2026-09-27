// src/counter.ts
async function handle(ctx, event) {
  const name = event.data?.name ?? "world";
  const cur = await ctx.kv.getText("counters", name);
  const count = Number(cur ?? 0) + 1;
  await ctx.kv.put("counters", name, String(count));
  ctx.log(`kv-counter: ${name} \u2192 ${count}`);
  return { name, count };
}

// .counter.validator.mjs
var _funcdInput = validate10;
function validate10(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) {
  ;
  let vErrors = null;
  let errors = 0;
  if (data && typeof data == "object" && !Array.isArray(data)) {
    for (const key0 in data) {
      if (!(key0 === "name")) {
        const err0 = { instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" };
        if (vErrors === null) {
          vErrors = [err0];
        } else {
          vErrors.push(err0);
        }
        errors++;
      }
    }
    if (data.name !== void 0) {
      if (typeof data.name !== "string") {
        const err1 = { instancePath: instancePath + "/name", schemaPath: "#/properties/name/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
    }
  } else {
    const err2 = { instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    if (vErrors === null) {
      vErrors = [err2];
    } else {
      vErrors.push(err2);
    }
    errors++;
  }
  validate10.errors = vErrors;
  return errors === 0;
}
var _funcdOutput = validate11;
function validate11(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) {
  ;
  let vErrors = null;
  let errors = 0;
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.name === void 0) {
      const err0 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "name" }, message: "must have required property 'name'" };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.count === void 0) {
      const err1 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "count" }, message: "must have required property 'count'" };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(key0 === "name" || key0 === "count")) {
        const err2 = { instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.name !== void 0) {
      if (typeof data.name !== "string") {
        const err3 = { instancePath: instancePath + "/name", schemaPath: "#/properties/name/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.count !== void 0) {
      let data1 = data.count;
      if (!(typeof data1 == "number" && isFinite(data1))) {
        const err4 = { instancePath: instancePath + "/count", schemaPath: "#/properties/count/type", keyword: "type", params: { type: "number" }, message: "must be number" };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
  } else {
    const err5 = { instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    if (vErrors === null) {
      vErrors = [err5];
    } else {
      vErrors.push(err5);
    }
    errors++;
  }
  validate11.errors = vErrors;
  return errors === 0;
}
function __funcdValidateInput(d) {
  return _funcdInput(d) ? [] : _funcdInput.errors ?? [];
}
function __funcdValidateOutput(d) {
  return _funcdOutput(d) ? [] : _funcdOutput.errors ?? [];
}
export {
  __funcdValidateInput,
  __funcdValidateOutput,
  _funcdInput,
  _funcdOutput,
  handle
};
