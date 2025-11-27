import XyRequest from '../request'
const request = new XyRequest({
  baseURL: 'https://api.logoi.cn',
})
export const getIP = async () => {
  return request.get({
    url: '/api/ip/self',
  })
}
export const getHotList = async (title: string) => {
  return request.get({
    url: `/doc/hotlist/${title}`,
  })
}
