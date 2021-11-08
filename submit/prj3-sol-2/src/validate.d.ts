//a function to convert val; will be called after validation successful
//with this set to top-level object being validated.
type ValFn = (val?:string, spec?: FieldSpec) => any;

//a function to check val; will be called with this set to top-level
//object being validated.  Not called if val not provided,
//returns null if ok, else error message
type FieldChkFn = (val: string, spec?: FieldSpec, id?: string) => string|null;

type FieldChk =
    FieldChkFn    //validate by function
    | RegExp      //validate by regex
    | [string];   //value must be one of these fields

type FieldSpec = {
    name?: string,      //external end-user  name for field; defaults to id
    chk?: FieldChk,     //validate field; defaults to check for safe chars only
    valFn?: ValFn,      //produce cleaned up value; defaults to val
    default?: string,   //default value when not specified
};

type ObjSpec = {
    required?: [string], //id's of fields which are required.
    fields: {            //checks for individual fields
	[id: string]: FieldSpec
    },
};

type Spec =  ObjSpec        //validate an object
;

//returns errors object if validation fails, otherwise returns
//converted val.
declare function validate(val: object, spec: Spec): object;

//returns true iff val only contains safe HTML chars like alphanumerics,
//space -, etc.
declare function isSafeCharsOnly(val: string): boolean;
