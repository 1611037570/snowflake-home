import XyRequest from '../request'
const request = new XyRequest({
  baseURL: 'https://www.mxnzp.com',
  fixedData: {
    app_id: 'kgghnnptopjnqcpt',
    app_secret: 'SRs0hxUth5Ow6R4h16A1pqNOZ0fsZD21',
  },
})
export const getIP = async () => {
  return request.get({
    url: '/api/ip/self',
  })
}
export const getWeather = async (city: string) => {
  return request.get({
    url: `/api/weather/current/${city}`,
  })
}
