// src/report.ts
var handle = (context, event) => {
  const branch = event.data.hi ?? event.data.lo;
  context.log("report", branch?.tier);
  return { done: true, tier: branch.tier };
};

// .report.validator.mjs
var _funcdInput = validate10;
function validate10(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) {
  ;
  let vErrors = null;
  let errors = 0;
  if (data && typeof data == "object" && !Array.isArray(data)) {
    for (const key0 in data) {
      if (!(key0 === "hi" || key0 === "lo")) {
        const err0 = { instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" };
        if (vErrors === null) {
          vErrors = [err0];
        } else {
          vErrors.push(err0);
        }
        errors++;
      }
    }
    if (data.hi !== void 0) {
      let data0 = data.hi;
      if (data0 && typeof data0 == "object" && !Array.isArray(data0)) {
        if (data0.amount === void 0) {
          const err1 = { instancePath: instancePath + "/hi", schemaPath: "#/properties/hi/required", keyword: "required", params: { missingProperty: "amount" }, message: "must have required property 'amount'" };
          if (vErrors === null) {
            vErrors = [err1];
          } else {
            vErrors.push(err1);
          }
          errors++;
        }
        if (data0.score === void 0) {
          const err2 = { instancePath: instancePath + "/hi", schemaPath: "#/properties/hi/required", keyword: "required", params: { missingProperty: "score" }, message: "must have required property 'score'" };
          if (vErrors === null) {
            vErrors = [err2];
          } else {
            vErrors.push(err2);
          }
          errors++;
        }
        if (data0.tier === void 0) {
          const err3 = { instancePath: instancePath + "/hi", schemaPath: "#/properties/hi/required", keyword: "required", params: { missingProperty: "tier" }, message: "must have required property 'tier'" };
          if (vErrors === null) {
            vErrors = [err3];
          } else {
            vErrors.push(err3);
          }
          errors++;
        }
        for (const key1 in data0) {
          if (!(key1 === "amount" || key1 === "score" || key1 === "tier")) {
            const err4 = { instancePath: instancePath + "/hi", schemaPath: "#/properties/hi/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" };
            if (vErrors === null) {
              vErrors = [err4];
            } else {
              vErrors.push(err4);
            }
            errors++;
          }
        }
        if (data0.amount !== void 0) {
          let data1 = data0.amount;
          if (!(typeof data1 == "number" && isFinite(data1))) {
            const err5 = { instancePath: instancePath + "/hi/amount", schemaPath: "#/properties/hi/properties/amount/type", keyword: "type", params: { type: "number" }, message: "must be number" };
            if (vErrors === null) {
              vErrors = [err5];
            } else {
              vErrors.push(err5);
            }
            errors++;
          }
        }
        if (data0.score !== void 0) {
          let data2 = data0.score;
          if (!(typeof data2 == "number" && isFinite(data2))) {
            const err6 = { instancePath: instancePath + "/hi/score", schemaPath: "#/properties/hi/properties/score/type", keyword: "type", params: { type: "number" }, message: "must be number" };
            if (vErrors === null) {
              vErrors = [err6];
            } else {
              vErrors.push(err6);
            }
            errors++;
          }
        }
        if (data0.tier !== void 0) {
          if (typeof data0.tier !== "string") {
            const err7 = { instancePath: instancePath + "/hi/tier", schemaPath: "#/properties/hi/properties/tier/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
              vErrors = [err7];
            } else {
              vErrors.push(err7);
            }
            errors++;
          }
        }
      } else {
        const err8 = { instancePath: instancePath + "/hi", schemaPath: "#/properties/hi/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.lo !== void 0) {
      let data4 = data.lo;
      if (data4 && typeof data4 == "object" && !Array.isArray(data4)) {
        if (data4.amount === void 0) {
          const err9 = { instancePath: instancePath + "/lo", schemaPath: "#/properties/lo/required", keyword: "required", params: { missingProperty: "amount" }, message: "must have required property 'amount'" };
          if (vErrors === null) {
            vErrors = [err9];
          } else {
            vErrors.push(err9);
          }
          errors++;
        }
        if (data4.score === void 0) {
          const err10 = { instancePath: instancePath + "/lo", schemaPath: "#/properties/lo/required", keyword: "required", params: { missingProperty: "score" }, message: "must have required property 'score'" };
          if (vErrors === null) {
            vErrors = [err10];
          } else {
            vErrors.push(err10);
          }
          errors++;
        }
        if (data4.tier === void 0) {
          const err11 = { instancePath: instancePath + "/lo", schemaPath: "#/properties/lo/required", keyword: "required", params: { missingProperty: "tier" }, message: "must have required property 'tier'" };
          if (vErrors === null) {
            vErrors = [err11];
          } else {
            vErrors.push(err11);
          }
          errors++;
        }
        for (const key2 in data4) {
          if (!(key2 === "amount" || key2 === "score" || key2 === "tier")) {
            const err12 = { instancePath: instancePath + "/lo", schemaPath: "#/properties/lo/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key2 }, message: "must NOT have additional properties" };
            if (vErrors === null) {
              vErrors = [err12];
            } else {
              vErrors.push(err12);
            }
            errors++;
          }
        }
        if (data4.amount !== void 0) {
          let data5 = data4.amount;
          if (!(typeof data5 == "number" && isFinite(data5))) {
            const err13 = { instancePath: instancePath + "/lo/amount", schemaPath: "#/properties/lo/properties/amount/type", keyword: "type", params: { type: "number" }, message: "must be number" };
            if (vErrors === null) {
              vErrors = [err13];
            } else {
              vErrors.push(err13);
            }
            errors++;
          }
        }
        if (data4.score !== void 0) {
          let data6 = data4.score;
          if (!(typeof data6 == "number" && isFinite(data6))) {
            const err14 = { instancePath: instancePath + "/lo/score", schemaPath: "#/properties/lo/properties/score/type", keyword: "type", params: { type: "number" }, message: "must be number" };
            if (vErrors === null) {
              vErrors = [err14];
            } else {
              vErrors.push(err14);
            }
            errors++;
          }
        }
        if (data4.tier !== void 0) {
          if (typeof data4.tier !== "string") {
            const err15 = { instancePath: instancePath + "/lo/tier", schemaPath: "#/properties/lo/properties/tier/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
              vErrors = [err15];
            } else {
              vErrors.push(err15);
            }
            errors++;
          }
        }
      } else {
        const err16 = { instancePath: instancePath + "/lo", schemaPath: "#/properties/lo/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        if (vErrors === null) {
          vErrors = [err16];
        } else {
          vErrors.push(err16);
        }
        errors++;
      }
    }
  } else {
    const err17 = { instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    if (vErrors === null) {
      vErrors = [err17];
    } else {
      vErrors.push(err17);
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
    if (data.done === void 0) {
      const err0 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "done" }, message: "must have required property 'done'" };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.tier === void 0) {
      const err1 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "tier" }, message: "must have required property 'tier'" };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(key0 === "done" || key0 === "tier")) {
        const err2 = { instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.done !== void 0) {
      if (typeof data.done !== "boolean") {
        const err3 = { instancePath: instancePath + "/done", schemaPath: "#/properties/done/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.tier !== void 0) {
      if (typeof data.tier !== "string") {
        const err4 = { instancePath: instancePath + "/tier", schemaPath: "#/properties/tier/type", keyword: "type", params: { type: "string" }, message: "must be string" };
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
