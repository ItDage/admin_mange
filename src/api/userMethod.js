// 用户操作的js
import request from '@/utils/request'

export function getAllUser(token) {
  const data = {
    token
  }
  return request({
    url: '/user/getAllUser',
    method: 'post',
    data
  })
}

export function sendValidCode(data) {
  return request({
    url: '/user/sendValidCode',
    method: 'post',
    data
  })
}

export function register(data) {
  return request({
    url: '/user/register',
    method: 'post',
    data
  })
}

export function update(data) {
  return request({
    url: '/user/update',
    method: 'post',
    data
  })
}

export function getUserInfo() {
  return request({
    url: '/user/getUserByEmail',
    method: 'post'
  })
}

export function getAllUserByParam(data) {
  return request({
    url: '/user/getAllUserByParam',
    method: 'post',
    data
  })
}

export function delUser(data) {
  return request({
    url: '/user/delete',
    method: 'post',
    data
  })
}

export function count() {
  return request({
    url: '/statistics/count',
    method: 'post'
  })
}
