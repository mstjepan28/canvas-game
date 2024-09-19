export const roundNumber = (num: number, decimals = 2): number => {
  if (decimals < 0 || decimals > 14) {
    const errorMessage = `roundNumber: invalid decimal places(${decimals}) must be between 0 and 14`;

    console.trace(errorMessage);
    throw new Error(errorMessage);
  }
  if (typeof num !== "number" || Number.isNaN(num)) {
    const errorMessage = `roundNumber: passed value "${num}" is not a number`;

    console.trace(errorMessage);
    throw new Error(errorMessage);
  }

  // @ts-ignore
  num = Math.round(num.toFixed(14) + "e" + decimals);
  return Number(num + "e" + -decimals);
};
