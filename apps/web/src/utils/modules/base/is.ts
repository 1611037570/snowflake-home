/**
 * 判断是否为某种类型
 */
export const isTypeOf = (value: any, type: string) => {
  return Object.prototype.toString.call(value) === "[object " + type + "]";
};
/**
 * 判断是否为数组
 */
export const isArray = (value: any): value is Array<any> => {
  return isTypeOf(value, "Array");
};
/**
 * 判断是否为字符串
 */
export const isString = (value: any): value is string => {
  return isTypeOf(value, "String");
};

/**
 * 判断是否为数字
 */
export const isNumber = (value: any): value is number => {
  return isTypeOf(value, "Number");
};
/**
 * 判断是否为布尔值
 */
export const isBoolean = (value: any) => {
  return isTypeOf(value, "Boolean");
};

/**
 * 判断是否为对象
 */
export const isObject = (value: any) => {
  return isTypeOf(value, "Object");
};

/**
 * 判断是否为函数
 */
export const isFunction = (value: any) => {
  return isTypeOf(value, "Function");
};
/**
 * 判断对象是否为空
 */
export const isEmptyObject = (obj: any) => {
  return isObject(obj) && Object.keys(obj).length === 0;
};

/**
 * 判断是否是空内容
 */
export const isNull = (value: any) => {
  return value === null || value === undefined || value === "" || isEmptyObject(value);
};
