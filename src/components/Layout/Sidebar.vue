<template>
  <div class="sidebar-container">
    <!-- Logo区域 -->
    <div class="logo-container">
      <div class="logo">
        <el-icon class="logo-icon" :size="24">
          <Brush />
        </el-icon>
        <span v-if="!collapse" class="logo-text">Draw Live</span>
      </div>
    </div>
    
    <!-- 菜单 -->
    <el-menu
      :default-active="$route.path"
      :collapse="collapse"
      :unique-opened="true"
      router
      class="sidebar-menu"
      background-color="#001529"
      text-color="#fff"
      active-text-color="#1890ff"
    >
      <el-menu-item index="/dashboard">
        <el-icon><Odometer /></el-icon>
        <template #title>仪表盘</template>
      </el-menu-item>
      
      <el-menu-item index="/drawings">
        <el-icon><Brush /></el-icon>
        <template #title>绘画管理</template>
      </el-menu-item>
      
      <el-menu-item index="/animations">
        <el-icon><VideoPlay /></el-icon>
        <template #title>动画管理</template>
      </el-menu-item>
      
      <el-menu-item index="/users">
        <el-icon><User /></el-icon>
        <template #title>用户管理</template>
      </el-menu-item>
      
      <el-menu-item index="/ai-models">
        <el-icon><MagicStick /></el-icon>
        <template #title>AI模型</template>
      </el-menu-item>
      
      <el-menu-item index="/settings">
        <el-icon><Setting /></el-icon>
        <template #title>系统设置</template>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { 
  Brush, 
  Odometer, 
  VideoPlay, 
  User, 
  MagicStick, 
  Setting 
} from '@element-plus/icons-vue'

interface Props {
  collapse: boolean
}

defineProps<Props>()
</script>

<style scoped>
.sidebar-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  border-bottom: 1px solid #002140;
}

.logo {
  display: flex;
  align-items: center;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
}

.logo-icon {
  color: #1890ff;
  margin-right: 8px;
}

.logo-text {
  transition: opacity 0.3s ease;
}

.sidebar-menu {
  flex: 1;
  border: none;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: 200px;
}

:deep(.el-menu-item) {
  color: rgba(255, 255, 255, 0.9) !important;
  
  &:hover {
    background-color: rgba(24, 144, 255, 0.2) !important;
    color: #1890ff !important;
  }
  
  &.is-active {
    background-color: #1890ff !important;
    color: #fff !important;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      right: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background: #fff;
    }
  }
  
  .el-icon {
    color: inherit !important;
  }
}
</style>