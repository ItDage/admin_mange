import request from '@/utils/request'

export function getToken(data) {
  return request({
    url: '/upload/qiniu/token',
    method: 'post',
    data
  })
}

export function upload(id, name, type, secondType) {
  const data = {
    'id': id,
    'name': name,
    'type': type,
    'secondType': secondType
  }
  return request({
    url: '/upload/add',
    method: 'post',
    data
  })
}

export function getFileList(data) {
  return request({
    url: '/upload/getAll',
    method: 'post',
    data
  })
}

export function delFile(data) {
  return request({
    url: '/upload/del',
    method: 'post',
    data
  })
}

export function download(data) {
  return request({
    url: '/upload/download',
    method: 'post',
    data
  })
}
