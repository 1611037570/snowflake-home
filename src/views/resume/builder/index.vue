<script setup>
import { useResumeStore } from '@/stores'
import { ref } from 'vue'
import Sidebar from './sidebar.vue'
import Title from './title.vue'
const resumeStore = useResumeStore()
const { currentData } = storeToRefs(resumeStore)

import TitleEditor from '../components/TitleEditor.vue'

const title = ref('小羊-本科-前端开发-3年经验')
const titleEditorRef = ref(null)
function handleEditTitle() {
  titleEditorRef.value?.openModal()
}
</script>

<template>
  <div class="flex h-full w-full text-sf-base">
    <!-- 左侧栏 -->
    <Sidebar />
    <!-- 右侧内容 -->
    <div class="flex flex-1 flex-col p-4">
      <TitleEditor v-model="title" ref="titleEditorRef" />
      <div
        class="flex cursor-pointer items-center hover:text-sf-theme-hover"
        @click="handleEditTitle"
      >
        {{ title }}
        <SfIcon name="arrow-right" class="ml-2" size="5" />
      </div>
      <ElScrollbar class="flex-1">
        <Title title="个人信息" />
        <SfDynamicForm :form="userForm" :data="currentData"></SfDynamicForm>
        <SfCollapse>
          <el-collapse-item name="1">
            <template #title>
              <Title title="专业技能" />
            </template>
            <SfWangEdit />
          </el-collapse-item>
        </SfCollapse>
      </ElScrollbar>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
