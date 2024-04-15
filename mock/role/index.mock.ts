import { MockMethod } from 'vite-plugin-mock'
import { SUCCESS_CODE } from '@/constants'

const timeout = 1000

const adminList = [
  {
    path: '/file-encode',
    component: '#',
    name: 'FileEncode',
    meta: {},
    children: [
      {
        path: 'index',
        component: 'views/Components/File/FileEncode',
        name: 'File-encode',
        meta: {
          title: 'router.encode',
          icon: 'bx:bxs-file-import'
        }
      }
    ]
  },
  {
    path: '/file-decode',
    component: '#',
    name: 'FileDecode',
    meta: {},
    children: [
      {
        path: 'index',
        component: 'views/Components/File/FileDecode',
        name: 'File-decode',
        meta: {
          title: 'router.decode',
          icon: 'bx:bxs-file-export'
        }
      }
    ]
  }
]

const testList: string[] = [
  '/file-encode',
  '/file-encode/index',
  '/file-decode',
  '/file-decode/index'
]

export default [
  // 列表接口
  {
    url: '/mock/role/list',
    method: 'get',
    timeout,
    response: ({ query }) => {
      const { roleName } = query
      return {
        code: SUCCESS_CODE,
        data: roleName === 'admin' ? adminList : testList
      }
    }
  }
] as MockMethod[]
