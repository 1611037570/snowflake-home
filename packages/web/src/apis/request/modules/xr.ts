import XyRequest from '../request'
const request = new XyRequest({
  baseURL: 'https://v.api.aa1.cn',
})

export const getBaiduSearch = async (msg: string) => {
  return request.get({
    url: `/api/baidu-search/?msg=${msg}`,
  })
}
