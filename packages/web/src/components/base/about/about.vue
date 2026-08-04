<script setup>
import History from './history.vue'
import Info from './info.vue'

defineOptions({ name: 'SfAbout' })
const visible = ref(false)
const handleClick = () => {
  visible.value = true
}
</script>

<template>
  <div @click="handleClick">
    <slot>
      <button type="button" class="border-0 bg-transparent p-0 text-[15px] font-extrabold">
        关于我
      </button>
    </slot>
    <SfModal v-model="visible" title="关于网站" width="500px">
      <SfScrollbar height="500px">
        <Info />
        <History />
      </SfScrollbar>
    </SfModal>
  </div>
</template>

<style lang="scss" scoped></style>
