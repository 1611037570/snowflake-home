<template>
  <footer class="flex-c relative flex-col overflow-hidden px-3 py-1 text-sf-text">
    <div class="flex items-center gap-3">
      <div class="flex items-center">
        {{ $t('copyright') }} © 2019-{{ currentYear }}
        <span @click="userNavigation" class="mx-1 cursor-pointer font-medium hover:text-sf-theme">
          {{ $t('user.name') }}
        </span>
        {{ $t('allRightsReserved') }}
      </div>

      <SfAbout>
        <div class="cursor-pointer font-medium hover:text-sf-theme">关于网站</div>
      </SfAbout>
      <SfCopyright>
        <div class="cursor-pointer font-medium hover:text-sf-theme">版权声明</div>
      </SfCopyright>
    </div>
    <Banner v-if="banner" />
  </footer>
</template>

<script setup lang="ts">
import { userNavigation } from '@/utils'
import dayjs from 'dayjs'
import { computed } from 'vue'
import Banner from './banner.vue'

defineOptions({ name: 'SfFooter' })

defineProps({
  banner: {
    type: Boolean,
    default: true,
  },
})

const currentYear = computed(() => {
  return dayjs().year()
})
</script>

<style lang="scss" scoped></style>
