<template>
  <el-dialog v-model="visible" title="动画预览" width="60%">
    <div v-if="animation" class="preview-content">
      <canvas ref="previewCanvas" width="400" height="300" class="preview-canvas"></canvas>
      <div class="controls">
        <el-button type="primary" @click="playPreview">播放预览</el-button>
      </div>
    </div>
    
    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { Animation } from '@/types'

interface Props {
  modelValue: boolean
  animation: Animation | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const previewCanvas = ref<HTMLCanvasElement>()

const playPreview = () => {
  if (!previewCanvas.value) return
  
  const ctx = previewCanvas.value.getContext('2d')
  if (!ctx) return
  
  // 简单的动画预览
  ctx.clearRect(0, 0, 400, 300)
  ctx.fillStyle = '#1890ff'
  ctx.beginPath()
  ctx.arc(200, 150, 20, 0, 2 * Math.PI)
  ctx.fill()
  
  ElMessage.success('动画预览播放中...')
}
</script>

<style scoped>
.preview-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.preview-canvas {
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  background: #fafafa;
}
</style>