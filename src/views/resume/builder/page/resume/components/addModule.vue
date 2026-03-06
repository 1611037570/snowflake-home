<script setup>
import { useResumeStore } from '@/stores'
import { allConfig } from '@/stores/modules/resume/formConfig'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
const resumeStore = useResumeStore()
const { currentConfig } = storeToRefs(resumeStore)
defineOptions({ name: 'AddModule' })

// 预设模块列表
const presets = ref([
  {
    name: '教育经历',
    value: 'education',
  },
  { name: '专业技能', value: 'skill' },
  { name: '工作经历', value: 'work' },
  { name: '项目经历', value: 'project' },
  { name: '个人优势', value: 'advantage' },
  { name: '兴趣爱好', value: 'hobbies' },
  { name: '图片作品', value: 'images' },
  { name: '实习经历', value: 'intern' },
  { name: '志愿服务经历', value: 'volunteer' },
  { name: '社团经历', value: 'club' },
  { name: '荣誉奖项', value: 'awards' },
  { name: '视频作品', value: 'videos' },
  { name: '资格证书', value: 'certs' },
])

// 过滤后的预设模块：只显示尚未添加到当前表单中的模块
const filteredPresets = computed(() => {
  if (!currentConfig.value) return presets.value
  return presets.value.filter((item) => {
    // 检查当前表单配置中是否已存在该模块（通过比对模块名称与表单首项的 label）
    return !currentConfig.value.fields.some((form) => form.key === item.value)
  })
})

const handleAdd = (module) => {
  const type = module.value
  if (type in allConfig) {
    currentConfig.value.fields.push(allConfig[type])
  }
}
</script>

<template>
  <div class="flex flex-col">
    <div class="mb-3 text-lg font-bold text-sf-base">增加模块</div>

    <div class="grid grid-cols-2 gap-4">
      <!-- 预设模块 -->
      <div
        v-for="item in filteredPresets"
        :key="item.name"
        class="group flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-sf-primary transition-all duration-300 hover:bg-sf-theme hover:text-sf-primary hover:shadow-lg"
        @click="handleAdd(item)"
      >
        <SfIcon icon="ic:round-add" size="5" class="text-sf-text-3 group-hover:text-sf-primary" />
        <span class="text-sm font-medium text-sf-text-2 group-hover:text-sf-primary">
          {{ item.name }}
        </span>
      </div>

      <!-- 自定义添加 -->
      <div
        class="group flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-sf-primary transition-all duration-300 hover:bg-sf-theme hover:text-sf-primary hover:shadow-lg"
        @click="handleAdd({ name: '自定义模块' })"
      >
        <SfIcon icon="ic:round-add" size="5" class="text-sf-text-3 group-hover:text-sf-primary" />
        <span class="text-sm font-medium text-sf-text-2 group-hover:text-sf-primary"
          >自定义模块</span
        >
      </div>
    </div>
  </div>
</template>

<style scoped></style>
