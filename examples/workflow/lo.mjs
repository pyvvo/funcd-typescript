// src/lo.ts
var handle = (context, event) => {
  const { amount, score } = event.data;
  return { amount, score, tier: "lo" };
};

// .lo.validator.mjs
var _funcdInput = validate10;
function validate10(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) {
  ;
  let vErrors = null;
  let errors = 0;
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.amount === void 0) {
      const err0 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "amount" }, message: "must have required property 'amount'" };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.score === void 0) {
      const err1 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "score" }, message: "must have required property 'score'" };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(key0 === "amount" || key0 === "score")) {
        const err2 = { instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.amount !== void 0) {
      let data0 = data.amount;
      if (!(typeof data0 == "number" && isFinite(data0))) {
        const err3 = { instancePath: instancePath + "/amount", schemaPath: "#/properties/amount/type", keyword: "type", params: { type: "number" }, message: "must be number" };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.score !== void 0) {
      let data1 = data.score;
      if (!(typeof data1 == "number" && isFinite(data1))) {
        const err4 = { instancePath: instancePath + "/score", schemaPath: "#/properties/score/type", keyword: "type", params: { type: "number" }, message: "must be number" };
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
  validate10.errors = vErrors;
  return errors === 0;
}
var _funcdOutput = validate11;
function validate11(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) {
  ;
  let vErrors = null;
  let errors = 0;
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.amount === void 0) {
      const err0 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "amount" }, message: "must have required property 'amount'" };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.score === void 0) {
      const err1 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "score" }, message: "must have required property 'score'" };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.tier === void 0) {
      const err2 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "tier" }, message: "must have required property 'tier'" };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(key0 === "amount" || key0 === "score" || key0 === "tier")) {
        const err3 = { instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.amount !== void 0) {
      let data0 = data.amount;
      if (!(typeof data0 == "number" && isFinite(data0))) {
        const err4 = { instancePath: instancePath + "/amount", schemaPath: "#/properties/amount/type", keyword: "type", params: { type: "number" }, message: "must be number" };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.score !== void 0) {
      let data1 = data.score;
      if (!(typeof data1 == "number" && isFinite(data1))) {
        const err5 = { instancePath: instancePath + "/score", schemaPath: "#/properties/score/type", keyword: "type", params: { type: "number" }, message: "must be number" };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.tier !== void 0) {
      if (typeof data.tier !== "string") {
        const err6 = { instancePath: instancePath + "/tier", schemaPath: "#/properties/tier/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
  } else {
    const err7 = { instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    if (vErrors === null) {
      vErrors = [err7];
    } else {
      vErrors.push(err7);
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
