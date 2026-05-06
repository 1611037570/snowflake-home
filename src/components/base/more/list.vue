<script setup>
const router = useRouter()

defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
})
function handleClick(item) {
  router.push(item.url)
}

const route = useRoute()

const filterMenuItems = (item) => {
  return route.path == item.url
}
</script>

<template>
  <div>
    <div class="mb-2 flex items-center px-2 text-sm font-bold text-sf-base">
      {{ data.name }}
      <SfTooltip v-if="data.tip" :content="data.tip" class="ml-2" />
    </div>
    <div class="grid w-full grid-cols-2">
      <template v-for="item in data.routers" :key="item.url">
        <div
          v-if="!item.hidden"
          class="cursor-pointer rounded-lg p-2 transition hover:bg-sf-bg-hover"
          @click="handleClick(item)"
        >
          <div class="mb-1 flex items-center font-medium text-sf-base">
            <SfMixImg
              v-if="item.icon"
              :type="item.iconType"
              :value="item.icon"
              :size="5"
              class="mr-2 shrink-0"
            />
            <div class="truncate" :class="{ 'text-sf-theme': filterMenuItems(item) }">
              {{ item.name }}
            </div>
          </div>
          <div class="text-sm text-sf-text-2" v-if="item.desc">{{ item.desc }}</div>
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
