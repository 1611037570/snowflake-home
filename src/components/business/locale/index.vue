<template>
  <SfDropdown>
    <SfIcon icon="ion:language" size="8" class="text-sf-base" />
    <template #dropdown>
      <el-dropdown-menu>
        <SfList
          class="w-30"
          :list="langList"
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
import { changeLanguage, langList } from '@/locales'
import { getCurrentLocale } from '@/utils'
const currentLocale = getCurrentLocale()
const handleClick = async (item) => {
  await changeLanguage(item.key)
}
</script>

<style scoped></style>
