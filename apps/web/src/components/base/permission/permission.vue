<script setup>
import { checkPermission } from '@/utils'

defineOptions({ name: 'SfPermission' })

defineProps({
  permission: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <slot v-if="checkPermission(permission)" />
</template>

<style lang="scss" scoped></style>
