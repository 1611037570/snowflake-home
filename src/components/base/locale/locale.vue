<template>
  <SfDropdown>
    <SfIcon icon="ion:language" size="8" class="text-sf-base" />
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

defineOptions({ name: 'SfLocale' })

const router = useRouter()
const currentPageName = computed(() => router.currentRoute.value.name)

import { getCurrentLocale } from '@/utils'
const currentLocale = getCurrentLocale()
const handleClick = async (item) => {
  await loadPageLang(currentPageName.value, item.key)
}
</script>

<style scoped></style>
