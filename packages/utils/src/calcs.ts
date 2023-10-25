export const getRatio = (x: number, y: number) => {
  if (x === 0) {
    return 0;
  }
  if (y === 0) {
    return x;
  }
  return Number(x / y);
};

export const average = (array: number[]) => array.reduce((a, b) => a + b) / array.length;

export const median = (array: number[]) => {
  const sorted = Array.from(array).sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) return (sorted[middle - 1] + sorted[middle]) / 2;
  return sorted[middle];
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
        if (Array.isArray(obj1[key]) && Array.isArray(obj2[key])) {
          if (JSON.stringify(obj1[key].sort()) !== JSON.stringify(obj2[key].sort())) {
            result[key] = obj2[key];
          }
        } else {
          if (obj1[key] === null && obj2[key] !== null) {
            result[key] = null;
          } else if (obj2[key] === null && obj1[key] !== null) {
            result[key] = null;
          } else {
            const compared = deepCompare(obj1[key], obj2[key]);
            if (Object.keys(compared).length !== 0) result[key] = compared;
          }
        }
      } else {
        result[key] = obj2[key];
      }
    }
    return result;
  }, {} as any);
};
