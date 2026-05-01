<script setup>
const props = defineProps({
  tip: {
    type: String,
    default: '起始页',
  },
  url: {
    type: String,
    default: DEFAULT_ROUTE,
  },
})
const getContent = computed(() => {
  return '返回' + props.tip || '起始页'
})
import { DEFAULT_ROUTE } from '@/constants'
import { useRouter } from 'vue-router'
const router = useRouter()
const back = () => {
  router.push(props.url)
}
</script>

<template>
  <SfTooltip :content="getContent">
    <SfIcon
      size="5"
      icon="famicons:chevron-back"
      class="cursor-pointer transition-colors hover:text-sf-theme"
      @click="back"
    />
  </SfTooltip>
</template>

<style lang="scss" scoped></style>
