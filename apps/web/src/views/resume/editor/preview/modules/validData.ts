// Unwrap preview field proxies before evaluating a record.
const unwrapValue = (value: any) => {
  if (value && typeof value === "object" && "value" in value) return value.value;
  return value;
};

// Rich text uses the editor's only empty value.
export const isContentEmpty = (val: any): boolean => {
  if (typeof val !== "string") return false;
  return val === "<p><br></p>";
};

// Evaluate whether one field contains data that can be rendered.
const hasValidValue = (key: string, rawValue: any): boolean => {
  const value = unwrapValue(rawValue);
  if (key === "content") return !isContentEmpty(value);
  if (Array.isArray(value)) return value.some((item) => hasValidValue("", item));
  if (typeof value === "string") return value.trim() !== "";
  return false;
};

// Hidden records must be excluded before checking renderable fields.
const isHiddenData = (data: any): boolean =>
  unwrapValue(data?.hidden) === true || unwrapValue(data?.ui?.hidden) === true;

// Keep a record only when at least one renderable field exists.
export const isValidData = (data: any): boolean => {
  if (!data || typeof data !== "object" || Array.isArray(data)) return false;
  if (isHiddenData(data)) return false;
  return Object.entries(data).some(([key, value]) => hasValidValue(key, value));
};

// Preserve original proxy records while supporting list and single-object data.
export const getValidData = (data: any) => {
  if (Array.isArray(data)) return data.filter(isValidData);
  return isValidData(data) ? data : null;
};
