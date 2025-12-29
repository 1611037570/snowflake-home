<template>
  <div class="flex w-full items-center justify-between">
    <div class="flex flex-1 items-center">
      <span class="text-base font-bold">{{ name }}</span>
      <SfIcon
        icon="material-symbols:restart-alt"
        size="5"
        class="hover:text-sf-theme"
        @click.stop="reset"
      />
    </div>

    <!-- <div class="flex items-center gap-1 text-xs">
        <span class="text-xs">{{ $t('image.keepAspect') }}</span>
        <ElSwitch v-model="keepAspectRatio" />
      </div> -->
  </div>
</template>

<script setup>
defineProps({ name: { type: String, default: '' } })
function reset() {}
</script>
