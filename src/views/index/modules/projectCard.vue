<template>
  <div class="cursor-pointer rounded-xl bg-sf-bg p-2 transition hover:bg-sf-bg-hover" @click="open">
    <div class="mb-1 flex items-center font-medium text-sf-base">
      <SfLogo v-if="data.icon" :name="data.icon" :size="5" class="mr-2 shrink-0" />
      <div class="truncate">
        {{ data.name }}
      </div>
    </div>
    <div class="text-sm text-sf-text-2" v-if="data.desc">{{ data.desc }}</div>
  </div>
</template>

<script setup>
import { routerNavigation } from '@/utils'

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
})
const open = () => {
  if (props.data.type && props.data.type === 'project') {
    routerNavigation(props.data.url)
  }
}
</script>
