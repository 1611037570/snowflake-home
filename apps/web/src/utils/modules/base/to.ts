/**
 * 首字母大写
 */
export const toCapitalize = (str: string): string => {
  if (str.length === 0) {
    return str
  }
  return str.charAt(0).toUpperCase() + str.slice(1)
}
