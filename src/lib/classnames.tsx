import isEmpty from "lodash/isEmpty"
import get from "lodash/get"

export default function cn(base: any, params: any) {
  let className = base

  for (const paramKey in params) {
    if (params[paramKey] === true) {
      className += ` ${paramKey}`
    }
  }

  return className
}

export const getWithDefault = (obj: any, name: string, defaultValue = "") => {
  if (isEmpty(get(obj, name))) return defaultValue
  return get(obj, name)
}
