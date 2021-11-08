import Errors from './errors.mjs';

const { Result, AppError, AppErrors } = Errors;

export default function validate(val, spec) {
  return checkObject(val, spec);
}


function checkObject(obj, spec) {
  let errors = new AppErrors();
  const { fields } =  spec;
  if (!fields) {
    const msg = 'missing "fields" property in spec';
    return errors.add(msg, { code: 'INTERNAL' });
  }
  const defaultPairs =
    Object.keys(fields).filter(f => fields[f].default !== undefined).
    map(f => [f, fields[f].default]);
  if (spec.required) {
    for (const id of spec.required) {
      const val = valStr(obj[id]);
      if (val.length === 0) {
	errors = errors.add(valueError(val, fields.id?.name ?? id, id))
      }
    }
  }
  const fieldChecks =
    Object.entries(obj)
    .map(([k, v]) => checkField(valStr(v), fields[k], k, obj));
  const fieldsResult = Result.all(fieldChecks);
  if (errors.errors.length > 0 || !fieldsResult.isOk) {
    if (!fieldsResult.isOk) errors = errors.add(fieldsResult.val);
    return new Result(errors);
  }
  else {
    const vals = fieldsResult.val;
    const objPairs = Object.keys(obj).map((k, i) => [k, vals[i]]);
    return Result.ok(Object.fromEntries([...defaultPairs, ...objPairs]));
  }			
}

function checkField(fieldVal, fieldSpec, id, topVal) {
  if (fieldSpec?.chk) {
    if (typeof fieldSpec.chk === 'function') {
      const msg = fieldSpec.chk.call(topVal, fieldVal, fieldSpec, id);
      if (msg) {
	return Result.error(msg, { code: 'BAD_VAL', widget: id });
      }
    }
    else if (fieldSpec.chk.constructor === RegExp) {
      if (!fieldSpec.chk.test(fieldVal)) {
	return Result.error(valueError(fieldVal, fieldSpec.name ?? id, id));
      }
    }
    else if (Array.isArray(fieldSpec.chk)) { 
      if (fieldSpec.chk.indexOf(fieldVal) < 0) {
	return Result.error(valueError(fieldVal, fieldSpec.name ?? id, id));
      }
    }
    else {
      const msg = `bad field chk for field "${id}"`;
      return Result.error(msg, { code: 'INTERNAL' });
    }
  }
  else if (!SAFE_CHARS_REGEX.test(fieldVal)) {
    return Result.error(valueError(fieldVal, fieldSpec?.name ?? id, id));
  }
  const val = (fieldSpec?.valFn)
	      ? fieldSpec.valFn.call(topVal, fieldVal, fieldSpec, id)
              : fieldVal;
  return Result.ok(val);
}


function valueError(val, name, id) {
  const msg = (val.length > 0)
	      ? `bad value "${val}" for ${name}`
      	      : `missing value for ${name}`;
  return new AppError(msg, { code: 'BAD_VAL', widget: id });
}

function valStr(val) { return (val ?? '').toString().trim(); }
    
const SAFE_CHARS_REGEX = /^[\w\s\-\.\@\#\%\$\^\*\(\)\{\}\[\]\:\,\/\'\"]*$/;



