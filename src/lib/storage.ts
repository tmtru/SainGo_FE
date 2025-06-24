import { decode_data, encode_data } from "./encoder"

const STORAGE = {
  TOKEN: "token",
  REFRESH_TOKEN: "refresh",
  USER_INFO: "user-info-dvc_hd",
  REMEMBER_LOGIN: "remember-login",
  KEY_MENU_ACTIVE: "key-active",
  TABS_PAGE_ACTIVE: "tabs-page-active",
  ERROR_EXTENSION: "error-extension",
  DEV_MODE: "dev-mode",
}

export const getStorage = (name: string) => {
  const remember = true;
  let data
  if (remember) {
    data =
      typeof window !== "undefined" && name !== undefined
        ? localStorage.getItem(name)
        : ""
  } else {
    data =
      typeof window !== "undefined" && name !== undefined
        ? sessionStorage.getItem(name)
        : ""
  }
  try {
    // if (data) return JSON.parse(data)
    if (data) return decode_data(data)
  } catch (err) {
    return data
  }
}

export const setStorage = (name: string, value: string) => {
  const remember = true;
  // const stringify = typeof value !== "string" ? JSON.stringify(value) : value
  const data_hash = encode_data(value)
  if (remember) {
    return localStorage.setItem(name, data_hash)
  } else {
    return sessionStorage.setItem(name, data_hash)
  }
}

export const deleteStorage = (name: string) => {
  const remember = true;
  if (remember) {
    return localStorage.removeItem(name)
  } else {
    return sessionStorage.removeItem(name)
  }
}

export const clearStorage = () => {
  const remember = true;
  if (remember) {
    return localStorage.clear()
  } else {
    return sessionStorage.clear()
  }
}

export default STORAGE
