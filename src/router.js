import { createRouter, createWebHistory } from 'vue-router';
import AuthCallback from './views/AuthCallback.vue';
import App from './App.vue';

// 定义路由规则
const routes = [
    {
    path: '/',
    name: 'Home',
    component: App // 设置首页组件
  },
  {
    path: '/auth-callback',
    name: 'AuthCallback',
    component: AuthCallback
  }
  // 可以添加其他路由规则
];

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;