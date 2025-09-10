<template>
  <div class="layout-container">
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'" class="sidebar">
        <Sidebar :collapse="isCollapse" />
      </el-aside>
      
      <!-- 主内容区 -->
      <el-container>
        <!-- 顶部栏 -->
        <el-header class="header">
          <Header @toggle-sidebar="toggleSidebar" :collapse="isCollapse" />
        </el-header>
        
        <!-- 内容区域 -->
        <el-main class="main-content">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from './Sidebar.vue'
import Header from './Header.vue'

const isCollapse = ref(false)

const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
  overflow: hidden;
  transition: all 0.3s ease;
}

.sidebar {
  background: linear-gradient(180deg, #001529 0%, #002140 100%);
  transition: width 0.3s ease;
  border-right: none;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
}

.header {
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  padding: 0;
  height: 60px !important;
  line-height: 60px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.main-content {
  background: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
  height: calc(100vh - 60px);
  overflow-x: hidden;
  transition: background 0.3s ease;
}

/* 暗色主题样式 */
.layout-container.dark-theme {
  .header {
    background: #1f1f1f;
    border-bottom: 1px solid #333;
    color: #fff;
  }
  
  .main-content {
    background: #141414;
    color: #fff;
  }
  
  .sidebar {
    background: linear-gradient(180deg, #000 0%, #1a1a1a 100%);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>