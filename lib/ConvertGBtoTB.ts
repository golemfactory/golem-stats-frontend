import { RoundingFunction } from "./RoundingFunction";
export const convertGBtoTB = (
  valueInGB: number | undefined,
  decimals = 2
): string => {
  if (valueInGB === undefined) {
    return "N/A";
  } else {
    const valueInTB = valueInGB / 1024;
    return RoundingFunction(valueInTB, decimals).toString();
  }
};
