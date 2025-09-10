<template>
  <div class="animations-page">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="6" v-for="stat in animationStats" :key="stat.title">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" :style="{ backgroundColor: stat.color }">
              <el-icon :size="20">
                <component :is="stat.icon" />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stat.value }}</div>
              <div class="stat-title">{{ stat.title }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 筛选和控制区域 -->
    <el-card class="filter-card">
      <el-form :model="filterForm" :inline="true" class="filter-form">
        <el-form-item label="动画类型">
          <el-select v-model="filterForm.animationType" placeholder="全部类型" clearable>
            <el-option label="全部" value="" />
            <el-option label="游泳" value="SWIMMING" />
            <el-option label="飞行" value="FLYING" />
            <el-option label="漂浮" value="FLOATING" />
            <el-option label="弹跳" value="BOUNCING" />
            <el-option label="旋转" value="ROTATING" />
            <el-option label="脉动" value="PULSING" />
            <el-option label="静态" value="STATIC" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="全部状态" clearable>
            <el-option label="全部" value="" />
            <el-option label="已创建" value="CREATED" />
            <el-option label="运行中" value="RUNNING" />
            <el-option label="已暂停" value="PAUSED" />
            <el-option label="已停止" value="STOPPED" />
            <el-option label="已完成" value="COMPLETED" />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleFilter">
            <el-icon><Search /></el-icon>
            筛选
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="batch-controls">
        <el-button 
          type="success" 
          :disabled="!selectedAnimations.length"
          @click="batchStart"
        >
          <el-icon><VideoPlay /></el-icon>
          批量启动
        </el-button>
        <el-button 
          type="warning" 
          :disabled="!selectedAnimations.length"
          @click="batchPause"
        >
          <el-icon><VideoPause /></el-icon>
          批量暂停
        </el-button>
        <el-button 
          type="danger" 
          :disabled="!selectedAnimations.length"
          @click="batchStop"
        >
          <el-icon><VideoCamera /></el-icon>
          批量停止
        </el-button>
      </div>
    </el-card>

    <!-- 动画列表 -->
    <el-card class="table-card">
      <template #header>
        <div class="table-header">
          <span>动画列表 ({{ total }})</span>
          <el-button size="small" @click="refreshData">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>
      
      <el-table
        :data="tableData"
        v-loading="loading"
        @selection-change="handleSelectionChange"
        stripe
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column prop="id" label="动画ID" width="120" />
        
        <el-table-column prop="drawingId" label="绘画ID" width="120">
          <template #default="{ row }">
            <el-button type="primary" link @click="viewDrawing(row.drawingId)">
              {{ row.drawingId }}
            </el-button>
          </template>
        </el-table-column>
        
        <el-table-column label="预览" width="120">
          <template #default="{ row }">
            <div class="animation-preview" @click="previewAnimation(row)">
              <canvas 
                :ref="el => setCanvasRef(el, row.id)"
                width="80" 
                height="60"
                class="preview-canvas"
              ></canvas>
              <div class="preview-overlay">
                <el-icon class="play-icon"><VideoPlay /></el-icon>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="animationType" label="动画类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getAnimationTypeColor(row.animationType)">
              {{ getAnimationTypeName(row.animationType) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusColor(row.status)" :effect="row.status === 'RUNNING' ? 'dark' : 'plain'">
              <el-icon v-if="row.status === 'RUNNING'" class="loading-icon"><Loading /></el-icon>
              {{ getStatusName(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="参数" width="200">
          <template #default="{ row }">
            <div class="parameters-display">
              <div class="param-item">
                <span class="param-label">质量:</span>
                <span class="param-value">{{ row.parameters.mass }}</span>
              </div>
              <div class="param-item">
                <span class="param-label">速度:</span>
                <span class="param-value">{{ row.parameters.maxSpeed }}</span>
              </div>
              <div class="param-item">
                <span class="param-label">重力:</span>
                <span class="param-value">{{ row.parameters.gravity }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="createdAt" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        
        <el-table-column label="持续时间" width="120">
          <template #default="{ row }">
            {{ getDuration(row) }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button-group size="small">
              <el-button 
                type="success" 
                @click="startAnimation(row)"
                :disabled="row.status === 'RUNNING'"
              >
                <el-icon><VideoPlay /></el-icon>
              </el-button>
              <el-button 
                type="warning" 
                @click="pauseAnimation(row)"
                :disabled="row.status !== 'RUNNING'"
              >
                <el-icon><VideoPause /></el-icon>
              </el-button>
              <el-button 
                type="info" 
                @click="stopAnimation(row)"
                :disabled="row.status === 'STOPPED' || row.status === 'COMPLETED'"
              >
                <el-icon><VideoCamera /></el-icon>
              </el-button>
              <el-button type="primary" @click="editAnimation(row)">
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button type="danger" @click="deleteAnimation(row)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 动画编辑弹窗 -->
    <AnimationEditDialog 
      v-model="editDialogVisible"
      :animation="selectedAnimation"
      @saved="refreshData"
    />

    <!-- 动画预览弹窗 -->
    <AnimationPreviewDialog 
      v-model="previewDialogVisible"
      :animation="previewAnimation"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Search, 
  Refresh, 
  VideoPlay, 
  VideoPause, 
  VideoCamera,
  Loading,
  Edit,
  Delete
} from '@element-plus/icons-vue'
import type { Animation, AnimationType, AnimationStatus } from '@/types'
import AnimationEditDialog from './components/AnimationEditDialog.vue'
import AnimationPreviewDialog from './components/AnimationPreviewDialog.vue'

// 统计数据
const animationStats = ref([
  { title: '总动画数', value: '856', icon: 'VideoPlay', color: '#1890ff' },
  { title: '运行中', value: '23', icon: 'Loading', color: '#52c41a' },
  { title: '已完成', value: '645', icon: 'Check', color: '#722ed1' },
  { title: '平均时长', value: '2.3分钟', icon: 'Clock', color: '#faad14' }
])

// 筛选表单
const filterForm = reactive({
  animationType: '',
  status: ''
})

// 表格数据
const tableData = ref<Animation[]>([])
const loading = ref(false)
const selectedAnimations = ref<Animation[]>([])
const selectedAnimation = ref<Animation | null>(null)
const previewAnimation = ref<Animation | null>(null)

// 弹窗控制
const editDialogVisible = ref(false)
const previewDialogVisible = ref(false)

// 分页
const pagination = reactive({
  page: 1,
  size: 20
})
const total = ref(0)

// Canvas引用
const canvasRefs = ref<Record<string, HTMLCanvasElement>>({})

// 生成模拟数据
const generateMockData = () => {
  const mockData: Animation[] = []
  const animationTypes: AnimationType[] = ['SWIMMING', 'FLYING', 'FLOATING', 'BOUNCING', 'ROTATING', 'PULSING', 'STATIC']
  const statuses: AnimationStatus[] = ['CREATED', 'RUNNING', 'PAUSED', 'STOPPED', 'COMPLETED']
  
  for (let i = 1; i <= 100; i++) {
    const animationType = animationTypes[Math.floor(Math.random() * animationTypes.length)]
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
    
    mockData.push({
      id: `A${i.toString().padStart(3, '0')}`,
      drawingId: `D${i.toString().padStart(3, '0')}`,
      animationType,
      status,
      parameters: {
        mass: Math.random() * 10 + 1,
        drag: Math.random() * 0.1,
        elasticity: Math.random() * 0.5 + 0.5,
        gravity: Math.random() * 0.5,
        maxSpeed: Math.random() * 100 + 50,
        acceleration: Math.random() * 10 + 1,
        showTrail: Math.random() > 0.5,
        showShadow: Math.random() > 0.5,
        opacity: Math.random() * 0.5 + 0.5
      },
      createdAt: createdAt.toISOString(),
      startedAt: status !== 'CREATED' ? new Date(createdAt.getTime() + 60000).toISOString() : undefined,
      endedAt: status === 'COMPLETED' ? new Date(createdAt.getTime() + Math.random() * 300000 + 60000).toISOString() : undefined
    })
  }
  
  return mockData
}

// 设置Canvas引用
const setCanvasRef = (el: HTMLCanvasElement | null, animationId: string) => {
  if (el) {
    canvasRefs.value[animationId] = el
    drawAnimationPreview(el, animationId)
  }
}

// 绘制动画预览
const drawAnimationPreview = (canvas: HTMLCanvasElement, animationId: string) => {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  // 清空画布
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  // 绘制简单的动画预览
  const animation = tableData.value.find(a => a.id === animationId)
  if (!animation) return
  
  // 根据动画类型绘制不同的图案
  ctx.fillStyle = getAnimationColor(animation.animationType)
  
  switch (animation.animationType) {
    case 'SWIMMING':
      // 绘制鱼形
      drawFishShape(ctx, canvas.width / 2, canvas.height / 2)
      break
    case 'FLYING':
      // 绘制鸟形
      drawBirdShape(ctx, canvas.width / 2, canvas.height / 2)
      break
    case 'FLOATING':
      // 绘制气球
      drawCircle(ctx, canvas.width / 2, canvas.height / 2, 15)
      break
    case 'BOUNCING':
      // 绘制球
      drawCircle(ctx, canvas.width / 2, canvas.height / 2, 12)
      break
    case 'ROTATING':
      // 绘制方形
      drawSquare(ctx, canvas.width / 2, canvas.height / 2, 20)
      break
    case 'PULSING':
      // 绘制心形
      drawHeart(ctx, canvas.width / 2, canvas.height / 2)
      break
    default:
      // 绘制默认图形
      drawCircle(ctx, canvas.width / 2, canvas.height / 2, 10)
  }
}

// 绘制各种形状的辅助函数
const drawFishShape = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
  ctx.beginPath()
  ctx.ellipse(x, y, 20, 12, 0, 0, 2 * Math.PI)
  ctx.fill()
  // 尾巴
  ctx.beginPath()
  ctx.moveTo(x + 20, y)
  ctx.lineTo(x + 30, y - 8)
  ctx.lineTo(x + 30, y + 8)
  ctx.closePath()
  ctx.fill()
}

const drawBirdShape = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
  ctx.beginPath()
  ctx.ellipse(x, y, 15, 8, 0, 0, 2 * Math.PI)
  ctx.fill()
  // 翅膀
  ctx.beginPath()
  ctx.arc(x - 8, y - 5, 8, 0, Math.PI)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(x + 8, y - 5, 8, 0, Math.PI)
  ctx.fill()
}

const drawCircle = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) => {
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, 2 * Math.PI)
  ctx.fill()
}

const drawSquare = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  ctx.fillRect(x - size / 2, y - size / 2, size, size)
}

const drawHeart = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
  const size = 10
  ctx.beginPath()
  ctx.moveTo(x, y + size / 2)
  ctx.bezierCurveTo(x - size, y - size / 2, x - size * 2, y + size / 3, x, y + size * 1.5)
  ctx.bezierCurveTo(x + size * 2, y + size / 3, x + size, y - size / 2, x, y + size / 2)
  ctx.fill()
}

// 获取动画类型颜色
const getAnimationColor = (type: AnimationType) => {
  const colorMap = {
    SWIMMING: '#1890ff',
    FLYING: '#52c41a',
    FLOATING: '#722ed1',
    BOUNCING: '#faad14',
    ROTATING: '#eb2f96',
    PULSING: '#f5222d',
    STATIC: '#8c8c8c'
  }
  return colorMap[type] || '#666'
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const allData = generateMockData()
    
    // 筛选数据
    let filteredData = allData
    
    if (filterForm.animationType) {
      filteredData = filteredData.filter(item => 
        item.animationType === filterForm.animationType
      )
    }
    
    if (filterForm.status) {
      filteredData = filteredData.filter(item => 
        item.status === filterForm.status
      )
    }
    
    // 分页
    total.value = filteredData.length
    const start = (pagination.page - 1) * pagination.size
    const end = start + pagination.size
    tableData.value = filteredData.slice(start, end)
    
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 筛选
const handleFilter = () => {
  pagination.page = 1
  loadData()
}

// 重置
const handleReset = () => {
  Object.assign(filterForm, {
    animationType: '',
    status: ''
  })
  pagination.page = 1
  loadData()
}

// 刷新数据
const refreshData = () => {
  loadData()
}

// 选择变化
const handleSelectionChange = (selection: Animation[]) => {
  selectedAnimations.value = selection
}

// 查看绘画
const viewDrawing = (drawingId: string) => {
  // 跳转到绘画详情页面
  ElMessage.info(`查看绘画: ${drawingId}`)
}

// 预览动画
const previewAnimationFn = (animation: Animation) => {
  previewAnimation.value = animation
  previewDialogVisible.value = true
}

// 动画控制操作
const startAnimation = async (animation: Animation) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    animation.status = 'RUNNING'
    animation.startedAt = new Date().toISOString()
    ElMessage.success('动画启动成功')
  } catch (error) {
    ElMessage.error('动画启动失败')
  }
}

const pauseAnimation = async (animation: Animation) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 300))
    animation.status = 'PAUSED'
    ElMessage.success('动画暂停成功')
  } catch (error) {
    ElMessage.error('动画暂停失败')
  }
}

const stopAnimation = async (animation: Animation) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 300))
    animation.status = 'STOPPED'
    animation.endedAt = new Date().toISOString()
    ElMessage.success('动画停止成功')
  } catch (error) {
    ElMessage.error('动画停止失败')
  }
}

// 编辑动画
const editAnimation = (animation: Animation) => {
  selectedAnimation.value = animation
  editDialogVisible.value = true
}

// 删除动画
const deleteAnimation = async (animation: Animation) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这个动画吗？',
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    await new Promise(resolve => setTimeout(resolve, 500))
    ElMessage.success('删除成功')
    refreshData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 批量操作
const batchStart = async () => {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    selectedAnimations.value.forEach(animation => {
      if (animation.status !== 'RUNNING') {
        animation.status = 'RUNNING'
        animation.startedAt = new Date().toISOString()
      }
    })
    ElMessage.success('批量启动成功')
  } catch (error) {
    ElMessage.error('批量启动失败')
  }
}

const batchPause = async () => {
  try {
    await new Promise(resolve => setTimeout(resolve, 800))
    selectedAnimations.value.forEach(animation => {
      if (animation.status === 'RUNNING') {
        animation.status = 'PAUSED'
      }
    })
    ElMessage.success('批量暂停成功')
  } catch (error) {
    ElMessage.error('批量暂停失败')
  }
}

const batchStop = async () => {
  try {
    await new Promise(resolve => setTimeout(resolve, 800))
    selectedAnimations.value.forEach(animation => {
      if (animation.status === 'RUNNING' || animation.status === 'PAUSED') {
        animation.status = 'STOPPED'
        animation.endedAt = new Date().toISOString()
      }
    })
    ElMessage.success('批量停止成功')
  } catch (error) {
    ElMessage.error('批量停止失败')
  }
}

// 分页操作
const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.page = 1
  loadData()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  loadData()
}

// 工具函数
const formatDateTime = (time: string) => {
  return new Date(time).toLocaleString()
}

const getDuration = (animation: Animation) => {
  if (!animation.startedAt) return '-'
  
  const endTime = animation.endedAt ? new Date(animation.endedAt) : new Date()
  const startTime = new Date(animation.startedAt)
  const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000)
  
  if (duration < 60) return `${duration}秒`
  const minutes = Math.floor(duration / 60)
  const seconds = duration % 60
  return `${minutes}分${seconds}秒`
}

const getAnimationTypeColor = (type: AnimationType) => {
  const colorMap = {
    SWIMMING: 'primary',
    FLYING: 'success',
    FLOATING: '',
    BOUNCING: 'warning',
    ROTATING: 'danger',
    PULSING: 'info',
    STATIC: 'info'
  }
  return colorMap[type] || ''
}

const getAnimationTypeName = (type: AnimationType) => {
  const nameMap = {
    SWIMMING: '游泳',
    FLYING: '飞行',
    FLOATING: '漂浮',
    BOUNCING: '弹跳',
    ROTATING: '旋转',
    PULSING: '脉动',
    STATIC: '静态'
  }
  return nameMap[type] || type
}

const getStatusColor = (status: AnimationStatus) => {
  const colorMap = {
    CREATED: 'info',
    RUNNING: 'success',
    PAUSED: 'warning',
    STOPPED: 'danger',
    COMPLETED: ''
  }
  return colorMap[status] || 'info'
}

const getStatusName = (status: AnimationStatus) => {
  const nameMap = {
    CREATED: '已创建',
    RUNNING: '运行中',
    PAUSED: '已暂停',
    STOPPED: '已停止',
    COMPLETED: '已完成'
  }
  return nameMap[status] || status
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.animations-page {
  padding: 20px;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  height: 100px;
  
  :deep(.el-card__body) {
    height: 100%;
    padding: 20px;
  }
}

.stat-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-right: 12px;
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-title {
  font-size: 14px;
  color: #666;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-form {
  margin-bottom: 16px;
}

.batch-controls {
  display: flex;
  gap: 8px;
}

.table-card {
  :deep(.el-card__body) {
    padding: 0;
  }
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e8e8e8;
}

.animation-preview {
  position: relative;
  cursor: pointer;
  border-radius: 4px;
  overflow: hidden;
  
  &:hover .preview-overlay {
    opacity: 1;
  }
}

.preview-canvas {
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  background: #fafafa;
}

.preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.play-icon {
  color: white;
  font-size: 24px;
}

.parameters-display {
  font-size: 12px;
  line-height: 1.4;
}

.param-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.param-label {
  color: #666;
}

.param-value {
  font-weight: 500;
}

.loading-icon {
  animation: rotating 1s linear infinite;
  margin-right: 4px;
}

@keyframes rotating {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.pagination-container {
  padding: 20px;
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .animations-page {
    padding: 10px;
  }
  
  .filter-form {
    :deep(.el-form-item) {
      display: block;
      margin-bottom: 12px;
    }
  }
  
  .batch-controls {
    flex-wrap: wrap;
  }
  
  .table-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>