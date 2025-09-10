<template>
  <el-dialog
    v-model="visible"
    title="绘画详情"
    width="80%"
    :before-close="handleClose"
    class="drawing-detail-dialog"
  >
    <div v-if="drawing" class="dialog-content">
      <!-- 基本信息 -->
      <el-row :gutter="20">
        <el-col :md="12">
          <el-card class="info-card">
            <template #header>
              <span>基本信息</span>
            </template>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="绘画ID">
                {{ drawing.id }}
              </el-descriptions-item>
              <el-descriptions-item label="用户ID">
                {{ drawing.userId }}
              </el-descriptions-item>
              <el-descriptions-item label="画布尺寸">
                {{ drawing.canvasWidth }} × {{ drawing.canvasHeight }}
              </el-descriptions-item>
              <el-descriptions-item label="绘制点数">
                {{ drawing.points.length }}
              </el-descriptions-item>
              <el-descriptions-item label="创建时间">
                {{ formatDateTime(drawing.createdAt) }}
              </el-descriptions-item>
              <el-descriptions-item label="更新时间">
                {{ formatDateTime(drawing.updatedAt) }}
              </el-descriptions-item>
            </el-descriptions>
          </el-card>
        </el-col>
        
        <el-col :md="12">
          <el-card class="info-card" v-if="drawing.analysisResult">
            <template #header>
              <span>AI分析结果</span>
            </template>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="识别类型">
                <el-tag :type="getShapeTypeColor(drawing.analysisResult.shapeType)">
                  {{ getShapeTypeName(drawing.analysisResult.shapeType) }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="置信度">
                <div class="confidence-display">
                  <el-progress 
                    :percentage="Math.round(drawing.analysisResult.confidence * 100)"
                    :color="getConfidenceColor(drawing.analysisResult.confidence)"
                    :show-text="false"
                    :stroke-width="6"
                  />
                  <span class="confidence-text">
                    {{ (drawing.analysisResult.confidence * 100).toFixed(1) }}%
                  </span>
                </div>
              </el-descriptions-item>
              <el-descriptions-item label="面积">
                {{ drawing.analysisResult.features.area.toFixed(0) }} px²
              </el-descriptions-item>
              <el-descriptions-item label="周长">
                {{ drawing.analysisResult.features.perimeter.toFixed(0) }} px
              </el-descriptions-item>
              <el-descriptions-item label="圆形度">
                {{ drawing.analysisResult.features.circularity.toFixed(3) }}
              </el-descriptions-item>
              <el-descriptions-item label="长宽比">
                {{ drawing.analysisResult.features.aspectRatio.toFixed(2) }}
              </el-descriptions-item>
            </el-descriptions>
          </el-card>
          
          <el-card v-else class="info-card">
            <template #header>
              <span>AI分析结果</span>
            </template>
            <el-empty description="暂无分析结果">
              <el-button type="primary" @click="reanalyze">
                重新分析
              </el-button>
            </el-empty>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- 绘画画布 -->
      <el-row :gutter="20" class="canvas-row">
        <el-col :span="24">
          <el-card class="canvas-card">
            <template #header>
              <div class="canvas-header">
                <span>绘画内容</span>
                <div class="canvas-controls">
                  <el-button size="small" @click="zoomIn">
                    <el-icon><ZoomIn /></el-icon>
                    放大
                  </el-button>
                  <el-button size="small" @click="zoomOut">
                    <el-icon><ZoomOut /></el-icon>
                    缩小
                  </el-button>
                  <el-button size="small" @click="resetZoom">
                    <el-icon><Refresh /></el-icon>
                    重置
                  </el-button>
                  <el-button size="small" @click="downloadImage">
                    <el-icon><Download /></el-icon>
                    下载
                  </el-button>
                </div>
              </div>
            </template>
            
            <div class="canvas-container" ref="canvasContainer">
              <canvas 
                ref="canvasRef"
                :width="canvasWidth"
                :height="canvasHeight"
                class="drawing-canvas"
                :style="canvasStyle"
              ></canvas>
              
              <!-- 特征点标注 -->
              <div 
                v-if="drawing.analysisResult && showFeatures"
                class="feature-overlay"
                :style="canvasStyle"
              >
                <!-- 质心 -->
                <div 
                  class="feature-point centroid"
                  :style="getCentroidStyle()"
                  title="质心"
                ></div>
                
                <!-- 边界框 -->
                <div 
                  class="bounding-box"
                  :style="getBoundingBoxStyle()"
                  title="边界框"
                ></div>
              </div>
            </div>
            
            <div class="canvas-footer">
              <el-checkbox v-model="showFeatures">显示特征标注</el-checkbox>
              <span class="zoom-info">缩放: {{ Math.round(zoomLevel * 100) }}%</span>
            </div>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- 绘制过程数据 -->
      <el-row :gutter="20" class="data-row">
        <el-col :span="24">
          <el-card class="data-card">
            <template #header>
              <div class="data-header">
                <span>绘制过程数据</span>
                <el-button size="small" @click="playDrawing">
                  <el-icon><VideoPlay /></el-icon>
                  回放绘制过程
                </el-button>
              </div>
            </template>
            
            <el-table :data="pointsData" max-height="300" size="small">
              <el-table-column prop="index" label="序号" width="80" />
              <el-table-column prop="x" label="X坐标" width="100">
                <template #default="{ row }">
                  {{ row.x.toFixed(2) }}
                </template>
              </el-table-column>
              <el-table-column prop="y" label="Y坐标" width="100">
                <template #default="{ row }">
                  {{ row.y.toFixed(2) }}
                </template>
              </el-table-column>
              <el-table-column prop="pressure" label="压力值" width="100">
                <template #default="{ row }">
                  {{ row.pressure.toFixed(3) }}
                </template>
              </el-table-column>
              <el-table-column prop="timestamp" label="时间戳" width="180">
                <template #default="{ row }">
                  {{ formatTimestamp(row.timestamp) }}
                </template>
              </el-table-column>
              <el-table-column label="速度" width="100">
                <template #default="{ row }">
                  {{ row.speed ? row.speed.toFixed(2) + ' px/ms' : '-' }}
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
        <el-button 
          v-if="!drawing?.hasAnimation"
          type="success" 
          @click="generateAnimation"
        >
          生成动画
        </el-button>
        <el-button type="primary" @click="reanalyze">
          重新分析
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  ZoomIn, 
  ZoomOut, 
  Refresh, 
  Download, 
  VideoPlay 
} from '@element-plus/icons-vue'
import type { Drawing, ShapeType } from '@/types'

interface Props {
  modelValue: boolean
  drawing: Drawing | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'refresh': []
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Canvas相关
const canvasRef = ref<HTMLCanvasElement>()
const canvasContainer = ref<HTMLElement>()
const zoomLevel = ref(1)
const showFeatures = ref(true)

// 画布尺寸
const canvasWidth = computed(() => {
  return props.drawing ? props.drawing.canvasWidth : 800
})

const canvasHeight = computed(() => {
  return props.drawing ? props.drawing.canvasHeight : 600
})

// 画布样式
const canvasStyle = computed(() => ({
  transform: `scale(${zoomLevel.value})`,
  transformOrigin: 'top left'
}))

// 绘制点数据
const pointsData = computed(() => {
  if (!props.drawing) return []
  
  return props.drawing.points.map((point, index) => {
    let speed = undefined
    if (index > 0) {
      const prevPoint = props.drawing!.points[index - 1]
      const distance = Math.sqrt(
        Math.pow(point.x - prevPoint.x, 2) + 
        Math.pow(point.y - prevPoint.y, 2)
      )
      const timeSpan = point.timestamp - prevPoint.timestamp
      speed = timeSpan > 0 ? distance / timeSpan : 0
    }
    
    return {
      index: index + 1,
      ...point,
      speed
    }
  })
})

// 绘制画布内容
const drawCanvas = () => {
  if (!canvasRef.value || !props.drawing) return
  
  const ctx = canvasRef.value.getContext('2d')
  if (!ctx) return
  
  // 清空画布
  ctx.clearRect(0, 0, canvasWidth.value, canvasHeight.value)
  
  // 设置画布背景
  ctx.fillStyle = '#fafafa'
  ctx.fillRect(0, 0, canvasWidth.value, canvasHeight.value)
  
  // 绘制路径
  if (props.drawing.points.length > 0) {
    ctx.strokeStyle = '#1890ff'
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    
    ctx.beginPath()
    props.drawing.points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y)
      } else {
        ctx.lineTo(point.x, point.y)
      }
    })
    ctx.stroke()
    
    // 绘制起点和终点
    const startPoint = props.drawing.points[0]
    const endPoint = props.drawing.points[props.drawing.points.length - 1]
    
    // 起点
    ctx.fillStyle = '#52c41a'
    ctx.beginPath()
    ctx.arc(startPoint.x, startPoint.y, 6, 0, 2 * Math.PI)
    ctx.fill()
    
    // 终点
    ctx.fillStyle = '#ff4d4f'
    ctx.beginPath()
    ctx.arc(endPoint.x, endPoint.y, 6, 0, 2 * Math.PI)
    ctx.fill()
  }
}

// 获取质心样式
const getCentroidStyle = () => {
  if (!props.drawing?.analysisResult) return {}
  
  const centroid = props.drawing.analysisResult.features.centroid
  return {
    left: centroid.x * zoomLevel.value - 5 + 'px',
    top: centroid.y * zoomLevel.value - 5 + 'px'
  }
}

// 获取边界框样式
const getBoundingBoxStyle = () => {
  if (!props.drawing?.analysisResult) return {}
  
  const bbox = props.drawing.analysisResult.features.boundingBox
  return {
    left: bbox.x * zoomLevel.value + 'px',
    top: bbox.y * zoomLevel.value + 'px',
    width: bbox.width * zoomLevel.value + 'px',
    height: bbox.height * zoomLevel.value + 'px'
  }
}

// 缩放操作
const zoomIn = () => {
  if (zoomLevel.value < 3) {
    zoomLevel.value += 0.2
  }
}

const zoomOut = () => {
  if (zoomLevel.value > 0.2) {
    zoomLevel.value -= 0.2
  }
}

const resetZoom = () => {
  zoomLevel.value = 1
}

// 下载图片
const downloadImage = () => {
  if (!canvasRef.value) return
  
  const link = document.createElement('a')
  link.download = `drawing-${props.drawing?.id}.png`
  link.href = canvasRef.value.toDataURL()
  link.click()
  
  ElMessage.success('图片下载成功')
}

// 回放绘制过程
const playDrawing = async () => {
  if (!canvasRef.value || !props.drawing) return
  
  const ctx = canvasRef.value.getContext('2d')
  if (!ctx) return
  
  // 清空画布
  ctx.clearRect(0, 0, canvasWidth.value, canvasHeight.value)
  ctx.fillStyle = '#fafafa'
  ctx.fillRect(0, 0, canvasWidth.value, canvasHeight.value)
  
  // 设置绘制样式
  ctx.strokeStyle = '#1890ff'
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  
  ctx.beginPath()
  
  // 逐点绘制
  for (let i = 0; i < props.drawing.points.length; i++) {
    const point = props.drawing.points[i]
    
    if (i === 0) {
      ctx.moveTo(point.x, point.y)
    } else {
      ctx.lineTo(point.x, point.y)
      ctx.stroke()
    }
    
    // 延迟
    await new Promise(resolve => setTimeout(resolve, 50))
  }
  
  ElMessage.success('绘制过程回放完成')
}

// 重新分析
const reanalyze = async () => {
  try {
    ElMessage.loading('正在重新分析...')
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    ElMessage.success('重新分析完成')
    emit('refresh')
  } catch (error) {
    ElMessage.error('重新分析失败')
  }
}

// 生成动画
const generateAnimation = async () => {
  try {
    ElMessage.loading('正在生成动画...')
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    ElMessage.success('动画生成成功')
    emit('refresh')
  } catch (error) {
    ElMessage.error('动画生成失败')
  }
}

// 关闭弹窗
const handleClose = () => {
  visible.value = false
}

// 格式化时间
const formatDateTime = (time: string) => {
  return new Date(time).toLocaleString()
}

// 格式化时间戳
const formatTimestamp = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString()
}

// 获取形状类型颜色
const getShapeTypeColor = (type: ShapeType) => {
  const colorMap = {
    FISH: 'primary',
    BIRD: 'success',
    ANIMAL: 'warning', 
    GEOMETRIC: 'info',
    PLANT: 'success',
    UNKNOWN: 'info'
  }
  return colorMap[type] || 'info'
}

// 获取形状类型名称
const getShapeTypeName = (type: ShapeType) => {
  const nameMap = {
    FISH: '鱼类',
    BIRD: '鸟类',
    ANIMAL: '动物',
    GEOMETRIC: '几何',
    PLANT: '植物', 
    UNKNOWN: '未知'
  }
  return nameMap[type] || '未知'
}

// 获取置信度颜色
const getConfidenceColor = (confidence: number) => {
  if (confidence >= 0.9) return '#52c41a'
  if (confidence >= 0.7) return '#faad14'
  return '#ff4d4f'
}

// 监听绘画数据变化，重新绘制
watch(() => props.drawing, async () => {
  if (props.drawing) {
    await nextTick()
    drawCanvas()
  }
}, { immediate: true })

// 监听缩放级别变化
watch(zoomLevel, () => {
  if (canvasContainer.value) {
    const container = canvasContainer.value
    container.scrollLeft = 0
    container.scrollTop = 0
  }
})
</script>

<style scoped>
.drawing-detail-dialog {
  :deep(.el-dialog__body) {
    padding: 20px;
  }
}

.dialog-content {
  max-height: 80vh;
  overflow-y: auto;
}

.info-card {
  margin-bottom: 20px;
  height: 100%;
}

.confidence-display {
  display: flex;
  align-items: center;
  gap: 8px;
}

.confidence-text {
  font-size: 12px;
  color: #666;
}

.canvas-row {
  margin-top: 20px;
}

.canvas-card {
  :deep(.el-card__body) {
    padding: 0;
  }
}

.canvas-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e8e8e8;
}

.canvas-controls {
  display: flex;
  gap: 8px;
}

.canvas-container {
  position: relative;
  max-height: 600px;
  overflow: auto;
  padding: 20px;
  background: #f8f9fa;
}

.drawing-canvas {
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.feature-overlay {
  position: absolute;
  top: 20px;
  left: 20px;
  pointer-events: none;
  transition: transform 0.3s ease;
}

.feature-point {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.centroid {
  background: #ff4d4f;
  border: 2px solid white;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
}

.bounding-box {
  position: absolute;
  border: 2px dashed #faad14;
  background: rgba(250, 173, 20, 0.1);
}

.canvas-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-top: 1px solid #e8e8e8;
  background: #fafafa;
}

.zoom-info {
  font-size: 12px;
  color: #666;
}

.data-row {
  margin-top: 20px;
}

.data-card {
  :deep(.el-card__body) {
    padding: 0;
  }
}

.data-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e8e8e8;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

@media (max-width: 768px) {
  .dialog-content {
    max-height: 70vh;
  }
  
  .canvas-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .canvas-controls {
    width: 100%;
    justify-content: flex-end;
  }
  
  .canvas-container {
    max-height: 400px;
  }
  
  .data-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>