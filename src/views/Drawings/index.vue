<template>
  <div class="drawings-page">
    <!-- 搜索和筛选区域 -->
    <el-card class="search-card">
      <el-form :model="searchForm" :inline="true" class="search-form">
        <el-form-item label="用户ID">
          <el-input 
            v-model="searchForm.userId" 
            placeholder="请输入用户ID"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        
        <el-form-item label="形状类型">
          <el-select 
            v-model="searchForm.shapeType" 
            placeholder="请选择形状类型"
            clearable
            style="width: 150px"
          >
            <el-option label="全部" value="" />
            <el-option label="鱼类" value="FISH" />
            <el-option label="鸟类" value="BIRD" />
            <el-option label="动物" value="ANIMAL" />
            <el-option label="几何图形" value="GEOMETRIC" />
            <el-option label="植物" value="PLANT" />
            <el-option label="未知" value="UNKNOWN" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="置信度范围">
          <el-slider
            v-model="searchForm.confidenceRange"
            range
            :min="0"
            :max="100"
            :format-tooltip="formatTooltip"
            style="width: 200px"
          />
        </el-form-item>
        
        <el-form-item label="创建时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <template #header>
        <div class="table-header">
          <span>绘画记录 ({{ total }})</span>
          <div class="table-actions">
            <el-button size="small" @click="handleBatchDelete" :disabled="!selectedRows.length">
              <el-icon><Delete /></el-icon>
              批量删除
            </el-button>
            <el-button size="small" @click="handleExport">
              <el-icon><Download /></el-icon>
              导出数据
            </el-button>
            <el-button size="small" @click="refreshData">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>
      
      <el-table
        :data="tableData"
        v-loading="loading"
        @selection-change="handleSelectionChange"
        @row-click="handleRowClick"
        style="width: 100%"
        stripe
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column prop="id" label="绘画ID" width="120" fixed="left">
          <template #default="{ row }">
            <el-button type="primary" link @click="viewDrawing(row)">
              {{ row.id }}
            </el-button>
          </template>
        </el-table-column>
        
        <el-table-column prop="userId" label="用户ID" width="120" />
        
        <el-table-column label="绘画预览" width="100">
          <template #default="{ row }">
            <div class="drawing-preview" @click="viewDrawing(row)">
              <canvas 
                :ref="el => setCanvasRef(el, row.id)"
                width="60" 
                height="60"
                class="preview-canvas"
              ></canvas>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="shapeType" label="识别结果" width="120">
          <template #default="{ row }">
            <el-tag 
              v-if="row.analysisResult"
              :type="getShapeTypeColor(row.analysisResult.shapeType)" 
              size="small"
            >
              {{ getShapeTypeName(row.analysisResult.shapeType) }}
            </el-tag>
            <span v-else class="text-placeholder">未分析</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="confidence" label="置信度" width="100">
          <template #default="{ row }">
            <div v-if="row.analysisResult" class="confidence-display">
              <el-progress 
                :percentage="Math.round(row.analysisResult.confidence * 100)"
                :color="getConfidenceColor(row.analysisResult.confidence)"
                :show-text="false"
                :stroke-width="8"
              />
              <span class="confidence-text">
                {{ (row.analysisResult.confidence * 100).toFixed(1) }}%
              </span>
            </div>
            <span v-else class="text-placeholder">-</span>
          </template>
        </el-table-column>
        
        <el-table-column label="特征信息" width="200">
          <template #default="{ row }">
            <div v-if="row.analysisResult" class="features-info">
              <div class="feature-item">
                <span class="feature-label">面积:</span>
                <span class="feature-value">{{ row.analysisResult.features.area.toFixed(0) }}</span>
              </div>
              <div class="feature-item">
                <span class="feature-label">周长:</span>
                <span class="feature-value">{{ row.analysisResult.features.perimeter.toFixed(0) }}</span>
              </div>
              <div class="feature-item">
                <span class="feature-label">圆形度:</span>
                <span class="feature-value">{{ row.analysisResult.features.circularity.toFixed(3) }}</span>
              </div>
            </div>
            <span v-else class="text-placeholder">无特征数据</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="createdAt" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        
        <el-table-column label="动画状态" width="100">
          <template #default="{ row }">
            <el-tag 
              v-if="row.hasAnimation"
              type="success" 
              size="small"
            >
              已生成
            </el-tag>
            <el-tag 
              v-else
              type="info" 
              size="small"
            >
              未生成
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="viewDrawing(row)">
              <el-icon><View /></el-icon>
              查看
            </el-button>
            <el-button 
              type="success" 
              size="small" 
              @click="generateAnimation(row)"
              :disabled="row.hasAnimation"
            >
              <el-icon><VideoPlay /></el-icon>
              生成动画
            </el-button>
            <el-button type="danger" size="small" @click="deleteDrawing(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
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

    <!-- 绘画详情弹窗 -->
    <DrawingDetailDialog 
      v-model="detailDialogVisible"
      :drawing="selectedDrawing"
      @refresh="refreshData"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Search, 
  Refresh, 
  Delete, 
  Download, 
  View, 
  VideoPlay 
} from '@element-plus/icons-vue'
import type { Drawing, ShapeType } from '@/types'
import DrawingDetailDialog from './components/DrawingDetailDialog.vue'

// 搜索表单
const searchForm = reactive({
  userId: '',
  shapeType: '',
  confidenceRange: [0, 100],
  dateRange: [] as string[]
})

// 表格数据
const tableData = ref<Drawing[]>([])
const loading = ref(false)
const selectedRows = ref<Drawing[]>([])
const selectedDrawing = ref<Drawing | null>(null)
const detailDialogVisible = ref(false)

// 分页
const pagination = reactive({
  page: 1,
  size: 20
})
const total = ref(0)

// Canvas引用
const canvasRefs = ref<Record<string, HTMLCanvasElement>>({})

// 设置Canvas引用
const setCanvasRef = (el: HTMLCanvasElement | null, drawingId: string) => {
  if (el) {
    canvasRefs.value[drawingId] = el
    // 绘制预览
    drawPreview(el, drawingId)
  }
}

// 绘制预览图
const drawPreview = (canvas: HTMLCanvasElement, drawingId: string) => {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  // 清空画布
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  // 找到对应的绘画数据
  const drawing = tableData.value.find(d => d.id === drawingId)
  if (!drawing || !drawing.points.length) return
  
  // 计算缩放比例
  const scaleX = canvas.width / drawing.canvasWidth
  const scaleY = canvas.height / drawing.canvasHeight
  const scale = Math.min(scaleX, scaleY)
  
  // 绘制路径
  ctx.strokeStyle = '#1890ff'
  ctx.lineWidth = 2
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  
  ctx.beginPath()
  drawing.points.forEach((point, index) => {
    const x = point.x * scale
    const y = point.y * scale
    
    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })
  ctx.stroke()
}

// 模拟数据
const generateMockData = () => {
  const mockData: Drawing[] = []
  const shapeTypes: ShapeType[] = ['FISH', 'BIRD', 'ANIMAL', 'GEOMETRIC', 'PLANT']
  
  for (let i = 1; i <= 50; i++) {
    const shapeType = shapeTypes[Math.floor(Math.random() * shapeTypes.length)]
    const confidence = 0.7 + Math.random() * 0.3
    
    mockData.push({
      id: `D${i.toString().padStart(3, '0')}`,
      userId: `user${Math.floor(Math.random() * 100) + 1}`,
      points: generateMockPoints(),
      canvasWidth: 800,
      canvasHeight: 600,
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      hasAnimation: Math.random() > 0.3,
      analysisResult: {
        id: `A${i.toString().padStart(3, '0')}`,
        drawingId: `D${i.toString().padStart(3, '0')}`,
        shapeType,
        confidence,
        features: {
          area: 1000 + Math.random() * 5000,
          perimeter: 200 + Math.random() * 500,
          circularity: Math.random(),
          aspectRatio: 0.5 + Math.random() * 2,
          centroid: { x: 400, y: 300 },
          boundingBox: { x: 100, y: 100, width: 600, height: 400 }
        },
        createdAt: new Date().toISOString()
      }
    })
  }
  
  return mockData
}

// 生成模拟绘画点
const generateMockPoints = () => {
  const points = []
  const centerX = 400
  const centerY = 300
  const radius = 100
  
  for (let i = 0; i < 50; i++) {
    const angle = (i / 50) * 2 * Math.PI
    const x = centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * 20
    const y = centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * 20
    
    points.push({
      x,
      y,
      timestamp: Date.now() + i * 50,
      pressure: 0.8 + Math.random() * 0.2
    })
  }
  
  return points
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const allData = generateMockData()
    
    // 筛选数据
    let filteredData = allData
    
    if (searchForm.userId) {
      filteredData = filteredData.filter(item => 
        item.userId.includes(searchForm.userId)
      )
    }
    
    if (searchForm.shapeType) {
      filteredData = filteredData.filter(item => 
        item.analysisResult?.shapeType === searchForm.shapeType
      )
    }
    
    // 置信度筛选
    filteredData = filteredData.filter(item => {
      if (!item.analysisResult) return false
      const confidence = item.analysisResult.confidence * 100
      return confidence >= searchForm.confidenceRange[0] && 
             confidence <= searchForm.confidenceRange[1]
    })
    
    // 分页
    total.value = filteredData.length
    const start = (pagination.page - 1) * pagination.size
    const end = start + pagination.size
    tableData.value = filteredData.slice(start, end)
    
    // 等待DOM更新后绘制预览
    await nextTick()
    tableData.value.forEach(drawing => {
      const canvas = canvasRefs.value[drawing.id]
      if (canvas) {
        drawPreview(canvas, drawing.id)
      }
    })
    
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadData()
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    userId: '',
    shapeType: '',
    confidenceRange: [0, 100],
    dateRange: []
  })
  pagination.page = 1
  loadData()
}

// 刷新数据
const refreshData = () => {
  loadData()
}

// 选择变化
const handleSelectionChange = (selection: Drawing[]) => {
  selectedRows.value = selection
}

// 行点击
const handleRowClick = (row: Drawing) => {
  viewDrawing(row)
}

// 查看绘画详情
const viewDrawing = (drawing: Drawing) => {
  selectedDrawing.value = drawing
  detailDialogVisible.value = true
}

// 生成动画
const generateAnimation = async (drawing: Drawing) => {
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('动画生成成功')
    drawing.hasAnimation = true
  } catch (error) {
    ElMessage.error('动画生成失败')
  }
}

// 删除绘画
const deleteDrawing = async (drawing: Drawing) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这个绘画记录吗？',
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    ElMessage.success('删除成功')
    refreshData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 个绘画记录吗？`,
      '确认批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('批量删除成功')
    selectedRows.value = []
    refreshData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
    }
  }
}

// 导出数据
const handleExport = () => {
  ElMessage.info('导出功能开发中...')
}

// 分页大小变化
const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.page = 1
  loadData()
}

// 当前页变化
const handleCurrentChange = (page: number) => {
  pagination.page = page
  loadData()
}

// 格式化时间
const formatDateTime = (time: string) => {
  return new Date(time).toLocaleString()
}

// 格式化置信度提示
const formatTooltip = (value: number) => {
  return `${value}%`
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

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.drawings-page {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.search-form {
  margin-bottom: 0;
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

.table-actions {
  display: flex;
  gap: 8px;
}

.drawing-preview {
  cursor: pointer;
  
  &:hover {
    opacity: 0.8;
  }
}

.preview-canvas {
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  background: #fafafa;
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

.features-info {
  font-size: 12px;
  line-height: 1.4;
}

.feature-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.feature-label {
  color: #666;
}

.feature-value {
  font-weight: 500;
}

.text-placeholder {
  color: #999;
  font-style: italic;
}

.pagination-container {
  padding: 20px;
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .drawings-page {
    padding: 10px;
  }
  
  .search-form {
    :deep(.el-form-item) {
      display: block;
      margin-bottom: 12px;
    }
  }
  
  .table-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .table-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>