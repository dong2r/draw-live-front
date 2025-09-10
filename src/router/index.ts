import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/components/Layout/index.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login/index.vue'),
      meta: { title: '登录' }
    },
    {
      path: '/',
      component: Layout,
      redirect: '/dashboard',
      meta: { requiresAuth: true },
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('@/views/Dashboard/index.vue'),
          meta: { title: '仪表盘', icon: 'Odometer', requiresAuth: true }
        },
        {
          path: 'drawings',
          name: 'Drawings',
          component: () => import('@/views/Drawings/index.vue'),
          meta: { title: '绘画管理', icon: 'Brush', requiresAuth: true }
        },
        {
          path: 'animations',
          name: 'Animations',
          component: () => import('@/views/Animations/index.vue'),
          meta: { title: '动画管理', icon: 'VideoPlay', requiresAuth: true }
        },
        {
          path: 'users',
          name: 'Users',
          component: () => import('@/views/Users/index.vue'),
          meta: { title: '用户管理', icon: 'User', requiresAuth: true }
        },
        {
          path: 'ai-models',
          name: 'AIModels',
          component: () => import('@/views/AIModels/index.vue'),
          meta: { title: 'AI模型', icon: 'MagicStick', requiresAuth: true }
        },
        {
          path: 'settings',
          name: 'Settings',
          component: () => import('@/views/Settings/index.vue'),
          meta: { title: '系统设置', icon: 'Setting', requiresAuth: true }
        }
      ]
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  
  // 如果访问登录页面且已登录，重定向到仪表盘
  if (to.path === '/login' && isLoggedIn) {
    next('/dashboard')
    return
  }
  
  // 如果访问需要认证的页面但未登录，重定向到登录页
  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/login')
    return
  }
  
  next()
})

export default router