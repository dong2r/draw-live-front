<template>
  <div class="dashboard">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6" v-for="stat in stats" :key="stat.title">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" :style="{ backgroundColor: stat.color }">
              <el-icon :size="24">
                <component :is="stat.icon" />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stat.value }}</div>
              <div class="stat-title">{{ stat.title }}</div>
              <div class="stat-trend" :class="stat.trend > 0 ? 'positive' : 'negative'">
                <el-icon :size="12">
                  <ArrowUp v-if="stat.trend > 0" />
                  <ArrowDown v-else />
                </el-icon>
                {{ Math.abs(stat.trend) }}%
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="charts-row">
      <!-- 绘画趋势图 -->
      <el-col :xs="24" :lg="16">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>绘画趋势</span>
              <el-radio-group v-model="trendPeriod" size="small">
                <el-radio-button label="7d">最近7天</el-radio-button>
                <el-radio-button label="30d">最近30天</el-radio-button>
                <el-radio-button label="90d">最近90天</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="trendChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 形状类型分布 -->
      <el-col :xs="24" :lg="8">
        <el-card class="chart-card">
          <template #header>
            <span>形状类型分布</span>
          </template>
          <div ref="shapeChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据表格区域 -->
    <el-row :gutter="20" class="table-row">
      <!-- 最近绘画 -->
      <el-col :xs="24" :lg="12">
        <el-card class="table-card">
          <template #header>
            <div class="card-header">
              <span>最近绘画</span>
              <el-button type="primary" size="small" @click="$router.push('/drawings')">
                查看全部
              </el-button>
            </div>
          </template>
          <el-table 
            :data="recentDrawings" 
            style="width: 100%" 
            size="small" 
            stripe
          >
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="shapeType" label="形状类型" width="100">
              <template #default="{ row }">
                <el-tag :type="getShapeTypeColor(row.shapeType)" size="small">
                  {{ getShapeTypeName(row.shapeType) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="confidence" label="置信度" width="80">
              <template #default="{ row }">
                {{ (row.confidence * 100).toFixed(1) }}%
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="创建时间">
              <template #default="{ row }">
                {{ formatTime(row.createdAt) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 系统状态 -->
      <el-col :xs="24" :lg="12">
        <el-card class="table-card">
          <template #header>
            <span>系统状态</span>
          </template>
          <div class="system-status">
            <div class="status-item" v-for="item in systemStatus" :key="item.name">
              <div class="status-label">{{ item.name }}</div>
              <div class="status-value">
                <el-progress 
                  :percentage="item.value" 
                  :color="item.color"
                  :show-text="false"
                  :stroke-width="8"
                />
                <span class="percentage">{{ item.value }}%</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { 
  Brush, 
  VideoPlay, 
  User, 
  MagicStick, 
  ArrowUp, 
  ArrowDown 
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import type { ShapeType } from '@/types'

// 统计数据
const stats = ref([
  {
    title: '总绘画数',
    value: '1,234',
    icon: 'Brush',
    color: '#1890ff',
    trend: 12.5
  },
  {
    title: '总动画数',
    value: '856',
    icon: 'VideoPlay', 
    color: '#52c41a',
    trend: 8.2
  },
  {
    title: '活跃用户',
    value: '342',
    icon: 'User',
    color: '#faad14',
    trend: -2.1
  },
  {
    title: 'AI精度',
    value: '92.5%',
    icon: 'MagicStick',
    color: '#722ed1',
    trend: 5.3
  }
])

// 趋势图时间范围
const trendPeriod = ref('7d')

// 最近绘画数据
const recentDrawings = ref([
  {
    id: 'D001',
    shapeType: 'FISH' as ShapeType,
    confidence: 0.925,
    createdAt: '2025-09-10 14:30:00'
  },
  {
    id: 'D002', 
    shapeType: 'BIRD' as ShapeType,
    confidence: 0.876,
    createdAt: '2025-09-10 14:25:00'
  },
  {
    id: 'D003',
    shapeType: 'GEOMETRIC' as ShapeType,
    confidence: 0.934,
    createdAt: '2025-09-10 14:20:00'
  },
  {
    id: 'D004',
    shapeType: 'PLANT' as ShapeType,
    confidence: 0.812,
    createdAt: '2025-09-10 14:15:00'
  }
])

// 系统状态
const systemStatus = ref([
  { name: 'CPU使用率', value: 45, color: '#1890ff' },
  { name: '内存使用率', value: 67, color: '#52c41a' },
  { name: '磁盘使用率', value: 23, color: '#faad14' },
  { name: 'AI模型负载', value: 78, color: '#722ed1' }
])

// 图表引用
const trendChartRef = ref<HTMLElement>()
const shapeChartRef = ref<HTMLElement>()

// 初始化趋势图
const initTrendChart = () => {
  if (!trendChartRef.value) return
  
  const chart = echarts.init(trendChartRef.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['绘画数量', '动画数量']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '绘画数量',
        type: 'line',
        stack: 'Total',
        smooth: true,
        areaStyle: {
          opacity: 0.3
        },
        data: [120, 132, 101, 134, 90, 230, 210],
        itemStyle: {
          color: '#1890ff'
        }
      },
      {
        name: '动画数量',
        type: 'line',
        stack: 'Total', 
        smooth: true,
        areaStyle: {
          opacity: 0.3
        },
        data: [80, 95, 75, 98, 65, 180, 165],
        itemStyle: {
          color: '#52c41a'
        }
      }
    ]
  }
  chart.setOption(option)
  
  // 响应式调整
  window.addEventListener('resize', () => {
    chart.resize()
  })
}

// 初始化形状分布图
const initShapeChart = () => {
  if (!shapeChartRef.value) return
  
  const chart = echarts.init(shapeChartRef.value)
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '形状分布',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['60%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 335, name: '鱼类', itemStyle: { color: '#1890ff' } },
          { value: 310, name: '鸟类', itemStyle: { color: '#52c41a' } },
          { value: 234, name: '几何图形', itemStyle: { color: '#faad14' } },
          { value: 135, name: '植物', itemStyle: { color: '#722ed1' } },
          { value: 88, name: '动物', itemStyle: { color: '#eb2f96' } }
        ]
      }
    ]
  }
  chart.setOption(option)
  
  // 响应式调整
  window.addEventListener('resize', () => {
    chart.resize()
  })
}

// 格式化时间
const formatTime = (time: string) => {
  return time.substring(11, 16)
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

onMounted(async () => {
  await nextTick()
  initTrendChart()
  initShapeChart()
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  height: 120px;
}

.stat-card :deep(.el-card__body) {
  height: 100%;
  padding: 20px;
}

.stat-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-right: 16px;
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.stat-trend {
  font-size: 12px;
  display: flex;
  align-items: center;
}

.stat-trend.positive {
  color: #52c41a;
}

.stat-trend.negative {
  color: #ff4d4f;
}

.charts-row {
  margin-bottom: 20px;
}

.chart-card {
  height: 400px;
}

.chart-card :deep(.el-card__body) {
  height: calc(100% - 60px);
  padding: 20px;
}

.chart-container {
  width: 100%;
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-row {
  margin-bottom: 20px;
}

.table-card {
  height: 400px;
}

.table-card :deep(.el-card__body) {
  height: calc(100% - 60px);
  padding: 20px;
}

.system-status {
  height: 100%;
}

.status-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.status-item:last-child {
  margin-bottom: 0;
}

.status-label {
  font-size: 14px;
  color: #666;
  margin-right: 20px;
}

.status-value {
  display: flex;
  align-items: center;
  flex: 1;
}

.percentage {
  margin-left: 10px;
  font-size: 12px;
  color: #666;
  min-width: 40px;
}

@media (max-width: 768px) {
  .dashboard {
    padding: 10px;
  }
  
  .chart-card,
  .table-card {
    height: 300px;
  }
  
  .stat-card {
    height: 100px;
  }
  
  .stat-content {
    flex-direction: column;
    text-align: center;
  }
  
  .stat-icon {
    margin-right: 0;
    margin-bottom: 8px;
    width: 40px;
    height: 40px;
  }
}
</style>