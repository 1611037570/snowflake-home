<template>
  <ElDropdown trigger="hover">
    <SfIcon icon="ion:language" size="8" class="text-sf-primary" />
    <template #dropdown>
      <el-dropdown-menu>
        <div
          v-for="(item, index) in langList"
          :key="item.key"
          :divided="index > 0 && index !== langList.length"
          @click="handleClick(item)"
          :class="[item.key == currentLocale ? 'text-sf-theme' : 'text-sf-text']"
          class="flex-c relative mx-1 h-8 cursor-pointer rounded-xl px-6 hover:bg-sf-theme-hover"
        >
          <div
            v-if="item.key == currentLocale"
            class="absolute top-1/2 left-2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-sf-theme"
          ></div>
          {{ item.name }}
        </div>
      </el-dropdown-menu>
    </template>
  </ElDropdown>
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
