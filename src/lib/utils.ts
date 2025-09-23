export const trimData = (data: any): any => {
  if (!data || typeof data === "string") return data;

  if (Array.isArray(data)) {
    return data.map(item => trimData(item));
  }

  if (typeof data === "object") {
    const trimmedObj: Record<string, any> = {};
    Object.keys(data).forEach(key => {
      const val = data[key];
      if (typeof val === "string") trimmedObj[key] = val.trim();
      else if (typeof val === "object") trimmedObj[key] = trimData(val);
      else trimmedObj[key] = val;
    });
    return trimmedObj;
  }

  return data;
};
