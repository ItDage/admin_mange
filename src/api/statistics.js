import request from '@/utils/request'

export function getGenderStatistics() {
  return request({
    url: '/statistics/gender',
    method: 'post'
  })
}
