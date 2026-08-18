import { getRandomItem } from "@/utils";
import { lightThemeColors } from "@/configs";
export const getRandomColor = () => {
  const color = getRandomItem(lightThemeColors).value;
  return color;
};
