<script setup>
import { useFileDialog } from '@/hooks'
import { useShortcutStore } from '@/stores'
import { storeToRefs } from 'pinia'
import { VueDraggable } from 'vue-draggable-plus'
import AddShortcut from './addShortcut.vue'
const { click } = useFileDialog()
const shortcutStore = useShortcutStore()
const { shortcutList } = storeToRefs(shortcutStore)

// 拖拽状态
const isDrag = ref(false)
// 缩放比例
const zoom = ref(1)
const onStart = (e) => {
  isDrag.value = true
  console.log('start', e)
}

const onEnd = (e) => {
  isDrag.value = false
  console.log('onEnd', e)
}

const onUpdate = () => {
  console.log('update')
}

const handleAdd = () => {
  addVisible.value = true
  return
}
const addVisible = ref(false)

const menuList = computed(() => [
  {
    name: '添加',
    fn: () => {},
  },
  {
    name: '导入',

    fn: () => {
      click({
        accept: '.json',
        maxCount: 1,
        duplicate: true,
      }).then((res) => {
        console.log(res)
      })
    },
  },
])
</script>

<template>
  <div>
    <SfModal v-if="addVisible" v-model="addVisible">
      <AddShortcut />
    </SfModal>
    <VueDraggable
      :style="{
        zoom: zoom,
      }"
      class="fixed top-41 left-1/2 z-10 mx-auto grid w-[680px] -translate-x-1/2 transform grid-cols-5 gap-5"
      v-model="shortcutList"
      ghostClass="bg-amber-500"
      @start="onStart"
      @update="onUpdate"
      @end="onEnd"
    >
      <SfApp
        v-for="(item, index) in shortcutList"
        :key="item.id"
        :index="index"
        :name="item.name"
        :value="item.url"
        :item="item"
        :class="{ 'shake-element': isDrag }"
      ></SfApp>
      <SfMenu :list="menuList">
        <SfApp
          name="添加"
          type="custom"
          :item="{
            icon: 'ic:round-add',
          }"
          :class="{ 'shake-element': isDrag }"
          @click="handleAdd"
        ></SfApp>
      </SfMenu>
    </VueDraggable>
  </div>
</template>
<style scoped>
@keyframes tiltShake {
  0%,
  100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-3deg);
  }
  75% {
    transform: rotate(3deg);
  }
}

.shake-element {
  animation: tiltShake 0.4s linear infinite;
  transform-origin: center;
}
</style>
