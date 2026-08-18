import { quotations } from "@/configs";
import { getRandomItem } from "@/utils";
const getRandomQuote = () => {
  return getRandomItem(quotations);
};

export { getRandomQuote };
