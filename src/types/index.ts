// 形状类型
export type ShapeType = 'FISH' | 'BIRD' | 'ANIMAL' | 'GEOMETRIC' | 'PLANT' | 'UNKNOWN'

// 动画类型
export type AnimationType = 'BOUNCE' | 'FLOAT' | 'SPIN' | 'SCALE' | 'WAVE'

// 动画状态
export type AnimationStatus = 'IDLE' | 'RUNNING' | 'PAUSED' | 'STOPPED' | 'COMPLETED'

// 绘画数据接口
export interface Drawing {
  id: string
  userId: string
  strokes: Point[][]
  analysisResult?: AnalysisResult
  createdAt: string
  hasAnimation: boolean
}

// 点坐标
export interface Point {
  x: number
  y: number
  pressure?: number
  timestamp?: number
}

// 分析结果
export interface AnalysisResult {
  shapeType: ShapeType
  confidence: number
  features: {
    area: number
    perimeter: number
    circularity: number
    complexity: number
  }
  boundingBox: {
    x: number
    y: number
    width: number
    height: number
  }
}

// 动画数据接口
export interface Animation {
  id: string
  drawingId: string
  animationType: AnimationType
  status: AnimationStatus
  parameters: AnimationParameters
  createdAt: string
  startedAt?: string
  completedAt?: string
}

// 动画参数
export interface AnimationParameters {
  duration: number
  mass: number
  damping: number
  stiffness: number
  maxSpeed: number
  gravity: number
  friction: number
}

// 用户接口
export interface User {
  id: string
  username: string
  email: string
  avatar?: string
  createdAt: string
  lastLoginAt?: string
  drawingCount: number
  animationCount: number
}

// API 响应接口
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp: number
}

// 分页接口
export interface Pagination {
  page: number
  size: number
  total: number
}

// 搜索表单接口
export interface SearchForm {
  keyword: string
  shapeType: ShapeType | ''
  confidenceRange: [number, number]
  dateRange: [string, string] | null
}