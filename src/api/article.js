import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/article/list',
    method: 'get',
    params: query
  })
}

export function fetchArticle(id) {
  return request({
    url: '/article/detail',
    method: 'get',
    params: { id }
  })
}

export function fetchPv(pv) {
  return request({
    url: '/article/pv',
    method: 'get',
    params: { pv }
  })
}

export function createArticle(data) {
  return request({
    url: '/article/create',
    method: 'post',
    data
  })
}

export function updateArticle(data) {
  return request({
    url: '/article/update',
    method: 'post',
    data
  })
}
// 获取所有文章--后台
export function getArticle(data) {
  return request({
    url: '/article/getAllArticle',
    method: 'post',
    data
  })
}
// 添加文章--后台
export function add(data) {
  return request({
    url: '/article/add',
    method: 'post',
    data
  })
}
// 删除文章--后台
export function delArticle(data) {
  return request({
    url: '/article/delete',
    method: 'delete',
    data
  })
}

