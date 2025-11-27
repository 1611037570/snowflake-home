<template>
  <SfModal v-if="systemVisible" v-model="systemVisible" title="系统设置">
    <SfSetContainer :list="list" v-model="currentTab" width="500px" height="600px">
      <template v-if="currentTab === 'default'">
        <SfSetBox>
          <SfSetItem title="自动隐藏程序坞" type="switch" v-model="autoHideDock" />
        </SfSetBox>
        <SfSetTitle title="数据管理" />
        <SfSetBox>
          <SfSetItem
            title="配置导出"
            info="会导出当前所有配置"
            model-value="导出"
            type="button"
            @onClick="exportDataList"
          />
          <SfSetItem
            title="配置导入"
            info="会覆盖当前所有配置"
            model-value="导入"
            type="button"
            @onClick="importDataList"
          />
          <SfSetItem
            title="快捷方式导出"
            info="仅导出所有快捷方式"
            model-value="导出"
            type="button"
            @onClick="exportDataList"
          />
          <SfSetItem
            title="快捷方式导入"
            info="仅导入所有快捷方式"
            model-value="导入"
            type="button"
            @onClick="importDataList"
          />
          <SfSetItem title="重置" info="会重置所有配置" model-value="重置" type="button" />
        </SfSetBox>
      </template>
      <template v-if="currentTab === 'shortcut'">
        <SfSetBox>
          <SfSetItem
            title="打开方式"
            :config="{
              width: '122px',
              list: [
                {
                  label: '新标签页',
                  value: '_blank',
                },
                {
                  label: '当前标签页',
                  value: '_self',
                },
              ],
            }"
            v-model="openMode"
            type="select"
          />
        </SfSetBox>
      </template>
      <template v-else-if="currentTab === 'search'">
        <SfSetTitle title="搜索设置" />
        <ModalSearch />
      </template>
      <template v-else-if="currentTab === 'game'">
        <SfSetBox>
          <SfSetItem title="下班倒计时" type="switch" v-model="countDown" />
          <SfSetItem title="下班时间" model-value="09:00" type="time" v-model="startTime" />
        </SfSetBox>
      </template>
    </SfSetContainer>
  </SfModal>
</template>

<script setup>
import { useHomeStore, useSearchStore, useShortcutStore } from '@/stores'
import { storeToRefs } from 'pinia'
import ModalSearch from './modalSearch.vue'

const homeStore = useHomeStore()
const searchStore = useSearchStore()
const shortcutStore = useShortcutStore()
const { shortcutList } = storeToRefs(shortcutStore)

const { systemVisible, autoHideDock } = storeToRefs(homeStore)
const { openMode } = storeToRefs(searchStore)
// 导入数据列表
const importDataList = () => {}
// 把dataList导出为json文件
const exportDataList = () => {
  const json = JSON.stringify(shortcutList.value)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'shortcutList.json'
  a.click()
  URL.revokeObjectURL(url)
}

const list = [
  {
    name: '常规',
    value: 'default',
  },
  {
    name: '搜索栏',
    value: 'search',
  },
  {
    name: '快捷键',
    value: 'shortcut',
  },
  {
    name: '游戏',
    value: 'game',
  },
]

const currentTab = ref('default')
</script>

<style lang="scss" scoped></style>
