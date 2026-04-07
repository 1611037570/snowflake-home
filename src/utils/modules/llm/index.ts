import { ark } from '@/configs/ai'
import { LLM } from './core'

const getToken = () => {
  return 'c15973e5-8397-422f-9c86-a12df469d452'
}
const arkLLM = new LLM({
  baseUrl: ark.baseUrl,
  path: ark.path,
  getToken,
  provider: ark.provider,
})
export { arkLLM, LLM }
