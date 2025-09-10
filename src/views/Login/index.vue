<template>
  <div class="login-container">
    <!-- 动态背景 -->
    <div class="background">
      <div class="floating-shapes">
        <div v-for="i in 15" :key="i" class="shape" :style="getShapeStyle(i)"></div>
      </div>
    </div>
    
    <!-- 登录表单 -->
    <div class="login-form-container">
      <div class="glass-card">
        <!-- Logo区域 -->
        <div class="logo-section">
          <div class="logo-icon">
            <el-icon :size="48" class="icon">
              <Brush />
            </el-icon>
          </div>
          <h1 class="logo-title">Draw Live Admin</h1>
          <p class="logo-subtitle">AI画笔游戏管理系统</p>
        </div>
        
        <!-- 登录表单 -->
        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          class="login-form"
          size="large"
        >
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              prefix-icon="User"
              class="form-input"
            />
          </el-form-item>
          
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              prefix-icon="Lock"
              show-password
              class="form-input"
              @keyup.enter="handleLogin"
            />
          </el-form-item>
          
          <el-form-item>
            <div class="remember-section">
              <el-checkbox v-model="loginForm.rememberMe">记住我</el-checkbox>
              <el-link type="primary" :underline="false" class="forgot-link">
                忘记密码？
              </el-link>
            </div>
          </el-form-item>
          
          <el-form-item>
            <el-button
              type="primary"
              class="login-button"
              :loading="loading"
              @click="handleLogin"
            >
              <span v-if="!loading">立即登录</span>
              <span v-else>登录中...</span>
            </el-button>
          </el-form-item>
        </el-form>
        
        <!-- 其他登录方式部分已删除 -->
      </div>
    </div>
    
    <!-- 装饰元素 -->
    <div class="decorations">
      <div class="decoration-1"></div>
      <div class="decoration-2"></div>
      <div class="decoration-3"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  Brush, 
  User, 
  Lock
} from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const loginFormRef = ref<FormInstance>()
const loading = ref(false)

// 登录表单数据
const loginForm = reactive({
  username: 'admin',
  password: '123456',
  rememberMe: false
})

// 表单验证规则
const loginRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    const valid = await loginFormRef.value.validate()
    if (!valid) return
    
    loading.value = true
    
    // 模拟登录API调用
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 存储登录状态
    localStorage.setItem('isLoggedIn', 'true')
    localStorage.setItem('username', loginForm.username)
    
    ElMessage.success('登录成功！')
    
    // 跳转到管理后台
    router.push('/dashboard')
    
  } catch (error) {
    ElMessage.error('登录失败，请检查用户名和密码')
  } finally {
    loading.value = false
  }
}

// 生成随机形状样式
const getShapeStyle = (index: number) => {
  const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe']
  const size = Math.random() * 120 + 40
  const duration = Math.random() * 20 + 10
  const delay = Math.random() * -20
  
  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    background: `linear-gradient(45deg, ${colors[index % colors.length]}, ${colors[(index + 1) % colors.length]})`,
    animationDuration: `${duration}s`,
    animationDelay: `${delay}s`
  }
}

onMounted(() => {
  // 检查是否已登录
  const isLoggedIn = localStorage.getItem('isLoggedIn')
  if (isLoggedIn === 'true') {
    router.push('/dashboard')
  }
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

/* 动态背景 */
.background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.floating-shapes {
  position: absolute;
  width: 100%;
  height: 100%;
}

.shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
  animation: float infinite ease-in-out;
  filter: blur(1px);
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  33% {
    transform: translateY(-30px) rotate(120deg);
  }
  66% {
    transform: translateY(30px) rotate(240deg);
  }
}

/* 毛玻璃卡片 */
.login-form-container {
  position: relative;
  z-index: 10;
  perspective: 1000px;
}

.glass-card {
  width: 420px;
  padding: 48px 40px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  animation: cardIn 0.8s ease-out;
  transform-style: preserve-3d;
}

@keyframes cardIn {
  from {
    opacity: 0;
    transform: translateY(50px) rotateX(10deg);
  }
  to {
    opacity: 1;
    transform: translateY(0) rotateX(0);
  }
}

/* Logo区域 */
.logo-section {
  text-align: center;
  margin-bottom: 40px;
}

.logo-icon {
  margin-bottom: 16px;
}

.icon {
  color: #4a90e2;
  filter: drop-shadow(0 4px 8px rgba(74, 144, 226, 0.3));
}

.logo-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #4a90e2, #357abd);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.logo-subtitle {
  color: #666;
  font-size: 16px;
  margin: 0;
  font-weight: 300;
}

/* 表单样式 */
.login-form {
  :deep(.el-form-item) {
    margin-bottom: 24px;
  }
  
  :deep(.form-input) {
    .el-input__wrapper {
      background: rgba(255, 255, 255, 0.7);
      border: 1px solid rgba(0, 0, 0, 0.1);
      border-radius: 12px;
      backdrop-filter: blur(10px);
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
      transition: all 0.3s ease;
      
      &:hover, &.is-focus {
        background: rgba(255, 255, 255, 0.9);
        border-color: rgba(74, 144, 226, 0.5);
        transform: translateY(-2px);
        box-shadow: 
          inset 0 2px 4px rgba(0, 0, 0, 0.05),
          0 8px 16px rgba(74, 144, 226, 0.2);
      }
    }
    
    .el-input__inner {
      color: #333;
      font-weight: 500;
      
      &::placeholder {
        color: #999;
      }
    }
    
    .el-input__prefix, .el-input__suffix {
      color: #666;
    }
  }
}

.remember-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  
  :deep(.el-checkbox) {
    .el-checkbox__label {
      color: #666;
      font-weight: 400;
    }
    
    .el-checkbox__input.is-checked .el-checkbox__inner {
      background-color: #4a90e2;
      border-color: #4a90e2;
    }
  }
}

.forgot-link {
  color: #4a90e2 !important;
  font-weight: 400;
  
  &:hover {
    color: #357abd !important;
  }
}

.login-button {
  width: 100%;
  height: 50px;
  background: linear-gradient(135deg, #4a90e2, #357abd);
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  box-shadow: 0 8px 16px rgba(74, 144, 226, 0.3);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 24px rgba(74, 144, 226, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
}

/* 删除了其他登录方式的样式 */

/* 装饰元素 */
.decorations {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.decoration-1 {
  position: absolute;
  top: 10%;
  left: 10%;
  width: 200px;
  height: 200px;
  background: linear-gradient(45deg, rgba(255, 255, 255, 0.3), transparent);
  border-radius: 50%;
  filter: blur(40px);
  animation: pulse 4s ease-in-out infinite;
}

.decoration-2 {
  position: absolute;
  bottom: 20%;
  right: 15%;
  width: 300px;
  height: 300px;
  background: linear-gradient(45deg, rgba(74, 144, 226, 0.2), transparent);
  border-radius: 50%;
  filter: blur(60px);
  animation: pulse 6s ease-in-out infinite reverse;
}

.decoration-3 {
  position: absolute;
  top: 50%;
  left: -10%;
  width: 150px;
  height: 150px;
  background: linear-gradient(45deg, rgba(53, 122, 189, 0.15), transparent);
  border-radius: 50%;
  filter: blur(30px);
  animation: pulse 5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
}

/* 响应式设计 */
@media (max-width: 480px) {
  .glass-card {
    width: 90%;
    padding: 32px 24px;
    margin: 20px;
  }
  
  .logo-title {
    font-size: 28px;
  }
  
  .logo-subtitle {
    font-size: 14px;
  }
}
</style>