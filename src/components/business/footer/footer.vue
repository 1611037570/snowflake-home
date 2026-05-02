<template>
  <footer
    class="flex-c relative flex-col overflow-hidden bg-sf-primary px-3 py-1 text-sf-text backdrop-blur-sm"
  >
    <div class="flex items-center gap-3">
      <div class="flex items-center">
        {{ $t('copyright') }} © 2019-{{ currentYear }}
        <span @click="userNavigation" class="mx-1 cursor-pointer font-medium hover:text-sf-theme">
          {{ $t('user.name') }}
        </span>
        {{ $t('allRightsReserved') }}
      </div>
      <div @click="aboutVisible = true" class="cursor-pointer font-medium hover:text-sf-theme">
        关于网站
      </div>
      <div class="cursor-pointer font-medium hover:text-sf-theme">版权声明</div>
    </div>
    <div class="flex items-center gap-3">
      <SfDonation>
        <div class="cursor-pointer font-medium hover:text-sf-theme">支持项目</div>
      </SfDonation>
    </div>
    <Banner v-if="banner" />
    <About v-if="aboutVisible" v-model="aboutVisible" />
  </footer>
</template>

<script setup lang="ts">
import { userNavigation } from '@/utils'
import dayjs from 'dayjs'
import { computed, ref } from 'vue'
import About from './about.vue'
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

const aboutVisible = ref(false)
</script>

<style lang="scss" scoped></style>
