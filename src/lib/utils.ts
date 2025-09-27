import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function trimData<T>(data: T): T {
  if (typeof data === "string") {
    return data.trim() as T;
  }
  if (Array.isArray(data)) {
    return data.map((item) =>
      typeof item === "string" ? item.trim() : item
    ) as T;
  }
  if (typeof data === "object" && data !== null) {
    const newObj: any = {};
    for (const key in data) {
      const value = (data as any)[key];
      newObj[key] =
        typeof value === "string" ? value.trim() : trimData(value);
    }
    return newObj;
  }
  return data;
}
