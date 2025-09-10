<template>
  <el-dialog v-model="visible" title="动画编辑" width="50%">
    <div v-if="animation">
      <el-form :model="animation" label-width="100px">
        <el-form-item label="动画类型">
          <el-select v-model="animation.animationType" disabled>
            <el-option label="游泳" value="SWIMMING" />
            <el-option label="飞行" value="FLYING" />
            <el-option label="漂浮" value="FLOATING" />
            <el-option label="弹跳" value="BOUNCING" />
            <el-option label="旋转" value="ROTATING" />
            <el-option label="脉动" value="PULSING" />
            <el-option label="静态" value="STATIC" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="质量">
          <el-input-number v-model="animation.parameters.mass" :min="0.1" :max="20" :step="0.1" />
        </el-form-item>
        
        <el-form-item label="阻力">
          <el-input-number v-model="animation.parameters.drag" :min="0" :max="1" :step="0.01" />
        </el-form-item>
        
        <el-form-item label="弹性">
          <el-input-number v-model="animation.parameters.elasticity" :min="0" :max="1" :step="0.01" />
        </el-form-item>
        
        <el-form-item label="重力">
          <el-input-number v-model="animation.parameters.gravity" :min="0" :max="2" :step="0.01" />
        </el-form-item>
        
        <el-form-item label="最大速度">
          <el-input-number v-model="animation.parameters.maxSpeed" :min="1" :max="500" />
        </el-form-item>
      </el-form>
    </div>
    
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleSave">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { Animation } from '@/types'

interface Props {
  modelValue: boolean
  animation: Animation | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'saved': []
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const handleSave = () => {
  ElMessage.success('保存成功')
  emit('saved')
  visible.value = false
}
</script>