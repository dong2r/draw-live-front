<template>
  <div class="header-container">
    <!-- 左侧区域 -->
    <div class="header-left">
      <el-button 
        text 
        @click="$emit('toggle-sidebar')"
        class="sidebar-toggle"
      >
        <el-icon :size="18">
          <Fold v-if="!collapse" />
          <Expand v-else />
        </el-icon>
      </el-button>
      
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>{{ currentPageTitle }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    
    <!-- 右侧区域 -->
    <div class="header-right">
      <!-- 全屏 -->
      <el-button text @click="toggleFullscreen" class="header-button">
        <el-icon :size="18">
          <FullScreen />
        </el-icon>
      </el-button>
      
      <!-- 用户信息 -->
      <el-dropdown @command="handleUserCommand">
        <div class="user-info">
          <el-avatar :size="32" :src="userInfo.avatar" class="user-avatar">
            <el-icon><User /></el-icon>
          </el-avatar>
          <span class="username">{{ userInfo.username }}</span>
          <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">
              <el-icon><User /></el-icon>
              个人中心
            </el-dropdown-item>
            <el-dropdown-item command="settings">
              <el-icon><Setting /></el-icon>
              设置
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { 
  Fold, 
  Expand, 
  FullScreen, 
  User, 
  ArrowDown, 
  Setting, 
  SwitchButton 
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

interface Props {
  collapse: boolean
}

defineProps<Props>()
defineEmits<{
  'toggle-sidebar': []
}>()

const route = useRoute()

// 用户信息
const userInfo = ref({
  username: '管理员',
  avatar: ''
})

// 当前页面标题
const currentPageTitle = computed(() => {
  const titleMap: Record<string, string> = {
    '/dashboard': '仪表盘',
    '/drawings': '绘画管理',
    '/animations': '动画管理',
    '/users': '用户管理',
    '/ai-models': 'AI模型',
    '/settings': '系统设置'
  }
  return titleMap[route.path] || '未知页面'
})

// 全屏切换
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

// 用户下拉菜单操作
const handleUserCommand = (command: string) => {
  switch (command) {
    case 'profile':
      ElMessage.info('个人中心')
      break
    case 'settings':
      ElMessage.info('设置')
      break
    case 'logout':
      // 清除登录状态
      localStorage.removeItem('isLoggedIn')
      localStorage.removeItem('username')
      ElMessage.success('退出登录成功')
      // 跳转到登录页
      window.location.href = '/login'
      break
  }
}
</script>

<style scoped>
.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
}

.sidebar-toggle {
  margin-right: 20px;
  color: #666;
}

.breadcrumb {
  font-size: 14px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-button {
  color: #666;
  padding: 8px;
  border-radius: 4px;
}

.header-button:hover {
  background: #f0f0f0;
  color: #1890ff;
}

.notification-badge {
  margin-right: 8px;
}

/* 删除了notification-badge样式 */

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background: #f0f0f0;
}

.user-avatar {
  margin-right: 8px;
}

.username {
  font-size: 14px;
  color: #333;
  margin-right: 4px;
}

.dropdown-icon {
  font-size: 12px;
  color: #999;
}
</style>