import request from '@/utils/request'

export function add(data) {
  return request({
    url: '/checkup/add',
    method: 'post',
    data
  })
}

export function getAll(data) {
  return request({
    url: '/checkup/getAll',
    method: 'post',
    data
  })
}

export function update(data) {
  return request({
    url: '/checkup/update',
    method: 'post',
    data
  })
}

export function del(data) {
  return request({
    url: '/checkup/delete',
    method: 'post',
    data
  })
}

export function getValidCorBySchool() {
  return request({
    url: '/checkup/getValidCorBySchool',
    method: 'post'
  })
}

// 退团--我的社团列表
export function loadMyCorporation(data) {
  return request({
    url: '/checkup/loadMyCorporation',
    method: 'post',
    data
  })
}

export function application(data) {
  return request({
    url: '/logoutCorp/add',
    method: 'post',
    data
  })
}

export function getReason(data) {
  return request({
    url: '/logoutCorp/getReason',
    method: 'post',
    data
  })
}

export function loadLogoutCorporation(data) {
  return request({
    url: '/logoutCorp/manage',
    method: 'post',
    data
  })
}

// 首页-- 加载我的社团
export function loadMyCorporationCard(data) {
  return request({
    url: '/checkup/loadMyCorporationCard',
    method: 'post',
    data
  })
}

export function agreeLogout(data) {
  return request({
    url: '/logoutCorp/agreeLogout',
    method: 'post',
    data
  })
}
