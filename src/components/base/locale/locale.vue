<template>
  <SfDropdown>
    <SfIcon
      icon="ion:language"
      size="8"
      :class="color"
      class="transition-all duration-300 hover:scale-120"
    />
    <template #dropdown>
      <el-dropdown-menu>
        <SfList
          class="w-30"
          :list="LANG_LIST.filter((item) => item.name)"
          activeKey="key"
          :activeValue="currentLocale"
          @onClick="handleClick"
        >
        </SfList>
      </el-dropdown-menu>
    </template>
  </SfDropdown>
</template>

<script setup>
import { LANG_LIST, loadPageLang } from '@/locales'
import { useRouter } from 'vue-router'

const color = inject('color', 'text-sf-base')
defineOptions({ name: 'SfLocale' })

const router = useRouter()
const currentPageName = computed(() => router.currentRoute.value.name)

import { language } from '@/utils'
const currentLocale = computed(() => language.value)
const handleClick = async (item) => {
  await loadPageLang(currentPageName.value, item.key)
}
</script>

<style scoped></style>
