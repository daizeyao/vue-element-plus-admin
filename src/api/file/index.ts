import request from '@/axios'
import type { KeyType } from './types'

export const uploadApiRul = '/api/upload'

export const encodeApi = (data: KeyType): Promise<IResponse> => {
  return request.post({
    url: '/api/encode',
    data,
    responseType: 'blob',
    headers: { 'Access-Control-Expose-Headers': 'Content-Disposition' }
  })
}

export const decodeApi = (data: KeyType): Promise<IResponse> => {
  return request.post({
    url: '/api/decode',
    data,
    responseType: 'blob',
    headers: { 'Access-Control-Expose-Headers': 'Content-Disposition' }
  })
}
