import request from '@/utils/request'

// 添加活动--后台
export function add(data) {
  return request({
    url: '/activity/add',
    method: 'post',
    data
  })
}

// 获取活动列表
export function getAllActivityByParam(data) {
  return request({
    url: '/activity/getListByParam',
    method: 'post',
    data
  })
}

// 获取活动列表
export function delActivity(data) {
  return request({
    url: '/activity/delete',
    method: 'post',
    data
  })
}

// 加入活动
export function addActivity(data) {
  return request({
    url: '/activity/addActivity',
    method: 'post',
    data
  })
}

// 退出活动
export function exitActivity(data) {
  return request({
    url: '/activity/exitActivity',
    method: 'post',
    data
  })
}

// 查询参会者
export function join(data) {
  return request({
    url: '/activity/join',
    method: 'post',
    data
  })
}
