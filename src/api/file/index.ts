import request from '@/axios'
import type { KeyType } from './types'

export const encodeApi = (data: KeyType): Promise<IResponse> => {
  return request.post({
    url: 'http://localhost:3006/encode',
    data,
    responseType: 'blob',
    headers: { 'Access-Control-Expose-Headers': 'Content-Disposition' }
  })
}

export const decodeApi = (data: KeyType): Promise<IResponse> => {
  return request.post({
    url: 'http://localhost:3006/decode',
    data,
    responseType: 'blob',
    headers: { 'Access-Control-Expose-Headers': 'Content-Disposition' }
  })
}
