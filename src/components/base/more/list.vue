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
  <div class="mb-4">
    <div class="mb-2 flex items-center justify-center text-xs font-black text-sf-text-2">
      {{ data.name }}
      <SfTooltip v-if="data.tip" :content="data.tip" class="ml-2" />
    </div>
    <div class="grid w-full grid-cols-2 gap-2">
      <template v-for="item in data.routers" :key="item.url">
        <button
          v-if="!item.hidden"
          type="button"
          class="flex cursor-pointer items-center rounded-xl border p-2 text-left transition hover:bg-sf-bg-hover"
          :class="
            filterMenuItems(item)
              ? 'border-sf-theme bg-sf-theme/10'
              : 'border-sf-border bg-sf-primary'
          "
          @click="handleClick(item)"
        >
          <div v-if="item.icon" class="mr-2 flex h-7 w-7 shrink-0 items-center justify-center">
            <SfLogo :name="item.icon" :size="6" />
          </div>
          <div class="min-w-0 flex-1">
            <div
              class="truncate text-sm font-bold text-sf-base"
              :class="{ 'text-sf-theme': filterMenuItems(item) }"
            >
              {{ item.name }}
            </div>
            <div class="mt-0.5 line-clamp-2 text-xs text-sf-text-2" v-if="item.desc">
              {{ item.desc }}
            </div>
          </div>
        </button>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
