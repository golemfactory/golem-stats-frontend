export const RoundingFunction = (
  figure: number,
  decimals: number = 2
): number => {
  const d = Math.pow(10, decimals);
  return Math.round(figure * d) / d;
};
