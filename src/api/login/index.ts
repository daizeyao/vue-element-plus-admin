import request from '@/axios'
import type { UserLoginType } from './types'

interface RoleParams {
  roleName: string
}

//传入的数据格式为UserLoginType，返回的数据为IResponse
export const loginApi = (data: UserLoginType): Promise<IResponse> => {
  return request.post({ url: 'http://localhost:3006/api/login', data })
}

export const registerApi = (data: UserLoginType): Promise<IResponse> => {
  return request.post({ url: 'http://localhost:3006/api/register', data })
}

export const loginOutApi = (): Promise<IResponse> => {
  return request.get({ url: '/mock/user/loginOut' })
}

export const sendCodeApi = (email: string): Promise<IResponse> => {
  return request.post({ url: 'http://localhost:3006/api/sendCode', data: { email } })
}

export const getAdminRoleApi = (
  params: RoleParams
): Promise<IResponse<AppCustomRouteRecordRaw[]>> => {
  return request.get({ url: '/mock/role/list', params })
}

export const getTestRoleApi = (params: RoleParams): Promise<IResponse<string[]>> => {
  return request.get({ url: '/mock/role/list2', params })
}
