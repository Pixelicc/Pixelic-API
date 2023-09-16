export const getRatio = (x: number, y: number) => {
  if (x === 0) {
    return 0;
  }
  if (y === 0) {
    return x;
  }
  return Number(x / y);
};
