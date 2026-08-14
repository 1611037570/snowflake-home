import { quotations } from "@/constants";
import { getRandomItem } from "@/utils";
const getRandomQuote = () => {
  return getRandomItem(quotations);
};

export { getRandomQuote };
