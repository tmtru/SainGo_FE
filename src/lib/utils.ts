import { forEach, isArray } from "lodash"

export const trimData = (data: any) => {
  if (!data) return data
  const tempData: any = isArray(data) ? [] : {}
  forEach(data, (val: string, keyName: string) => {
    if (typeof val === "string") tempData[keyName] = val.trim()
    else if (typeof val === "object") tempData[keyName] = trimData(val)
    else tempData[keyName] = val
  })
  return tempData
}
