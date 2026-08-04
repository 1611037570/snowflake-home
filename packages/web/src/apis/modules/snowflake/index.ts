import XyRequest from '../../request'
const request = new XyRequest({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})
export const test = async () => {
  return request.get({
    url: '/',
  })
}
