import { quotations } from '@/datas'
import { getRandomItem } from '@/utils'
const getRandomQuote = () => {
  return getRandomItem(quotations)
}

export { getRandomQuote }
