import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import type { App } from 'vue'
import { Layout, getParentLayout } from '@/utils/routerHelper'
import { useI18n } from '@/hooks/web/useI18n'

const { t } = useI18n()

export const constantRouterMap: AppRouteRecordRaw[] = [
  {
    path: '/',
    component: Layout,
    redirect: '/file-encode/index',
    name: 'Root',
    meta: {
      hidden: true
    }
  },
  {
    path: '/file-encode',
    component: Layout,
    redirect: '/file-encode/index',
    name: 'Rootdir',
    meta: {
      hidden: true
    }
  },
  {
    path: '/redirect',
    component: Layout,
    name: 'Redirect',
    children: [
      {
        path: '/redirect/:path(.*)',
        name: 'Redirect',
        component: () => import('@/views/Redirect/Redirect.vue'),
        meta: {}
      }
    ],
    meta: {
      hidden: true,
      noTagsView: true
    }
  },
  {
    path: '/login',
    component: () => import('@/views/Login/Login.vue'),
    name: 'Login',
    meta: {
      hidden: true,
      title: t('router.login'),
      noTagsView: true
    }
  },
  {
    path: '/404',
    component: () => import('@/views/Error/404.vue'),
    name: 'NoFind',
    meta: {
      hidden: true,
      title: '404',
      noTagsView: true
    }
  }
]

export const asyncRouterMap: AppRouteRecordRaw[] = [
  {
    path: '/file-encode',
    component: Layout,
    redirect: '/file-encode/index',
    name: 'FileEncode',
    meta: {
      alwaysShow: true
    },
    children: [
      {
        path: 'index',
        component: () => import('@/views/Components/File/FileEncode.vue'),
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
    component: Layout,
    redirect: '/file-decode/index',
    name: 'FileDecode',
    meta: {},
    children: [
      {
        path: 'index',
        component: () => import('@/views/Components/File/FileDecode.vue'),
        name: 'File-decode',
        meta: {
          title: 'router.decode',
          icon: 'bx:bxs-file-export'
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  strict: true,
  routes: constantRouterMap as RouteRecordRaw[],
  scrollBehavior: () => ({ left: 0, top: 0 })
})

export const resetRouter = (): void => {
  const resetWhiteNameList = ['Redirect', 'Login', 'NoFind', 'Root']
  router.getRoutes().forEach((route) => {
    const { name } = route
    if (name && !resetWhiteNameList.includes(name as string)) {
      router.hasRoute(name) && router.removeRoute(name)
    }
  })
}

export const setupRouter = (app: App<Element>) => {
  app.use(router)
}

export default router
