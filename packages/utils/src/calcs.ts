export const getRatio = (x: number, y: number) => {
  if (x === 0) {
    return 0;
  }
  if (y === 0) {
    return x;
  }
  return Number(x / y);
};

/**
 * Compares two objects at full depth and only returns keys that have changed with its current value
 * @param obj1 Old Object
 * @param obj2 New Object
 */
export const deepCompare = (obj1: any, obj2: any) => {
  return Object.keys(obj2).reduce((result, key: any) => {
    if (obj1[key] !== obj2[key]) {
      if (typeof obj1[key] === "object" && typeof obj2[key] === "object") {
        if (Array.isArray(obj1) && Array.isArray(obj2)) {
          if (JSON.stringify(obj1.sort()) !== JSON.stringify(obj2.sort())) {
            result[key] = obj2[key];
          }
        } else {
          const compared = deepCompare(obj1[key], obj2[key]);
          if (Object.keys(compared).length !== 0) result[key] = compared;
        }
      } else {
        result[key] = obj2[key];
      }
    }
    return result;
  }, {} as any);
};
