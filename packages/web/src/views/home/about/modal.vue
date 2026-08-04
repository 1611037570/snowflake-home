<template>
  <SfModal v-if="aboutVisible" v-model="aboutVisible" title="关于">
    <SfSetContainer :list="list" v-model="activeTab" class="h-[600px]">
      <ModalProject v-if="activeTab === 'project'" />
      <ModalApi v-else-if="activeTab === 'api'" />
      <ModalTech v-else-if="activeTab === 'tech'" />
      <ModalDonation v-else-if="activeTab === 'donation'" />
    </SfSetContainer>
  </SfModal>
</template>

<script setup>
import { useHomeStore } from '@/stores'
import ModalApi from './modalApi.vue'
import ModalDonation from './modalDonation.vue'
import ModalProject from './modalProject.vue'
import ModalTech from './modalTech.vue'
const homeStore = useHomeStore()
const { aboutVisible } = storeToRefs(homeStore)

const list = [
  { name: '关于项目', value: 'project' },
  { name: '接口文档', value: 'api' },
  { name: '技术栈', value: 'tech' },
  { name: '捐助我', value: 'donation' },
]
const activeTab = ref('project')
</script>

<style lang="scss" scoped></style>
