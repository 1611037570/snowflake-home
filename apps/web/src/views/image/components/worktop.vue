<template>
  <Title name="操作栏" />
  <div class="flex items-center" @click="crop">
    <span class="text-sm font-medium">去裁切</span>
  </div>
  <div class="mb-3 flex items-center justify-between">
    <div class="flex items-center">
      <span class="text-sm font-medium">原图预览</span>
      <ElSwitch v-model="show" />
    </div>
    <div class="flex items-center">
      <span class="text-sm font-medium">{{ $t("image.realtimePreview") }}</span>
      <ElSwitch v-model="live" />
    </div>
  </div>
  <div class="flex">
    <ElButton
      class="bg-sf-theme py-2.5 font-medium text-sf-primary transition-all duration-200 hover:bg-sf-theme-hover hover:shadow-lg active:scale-[0.99]"
      @click="save"
      >{{ $t("image.saveImage") }}</ElButton
    >
    <!-- <ElButton
      class="bg-sf-theme py-2.5 font-medium text-sf-primary transition-all duration-200 hover:bg-sf-theme-hover hover:shadow-lg active:scale-[0.99]"
      @click="save"
      >保存为svg</ElButton
    > -->
    <ElButton
      class="bg-sf-theme py-2.5 font-medium text-sf-primary transition-all duration-200 hover:bg-sf-theme-hover hover:shadow-lg active:scale-[0.99]"
      @click="save('base64')"
      >保存为base64</ElButton
    >
  </div>
</template>

<script setup>
import Title from "./title.vue";
const show = defineModel("show", {
  type: Boolean,
  default: false,
});
const live = defineModel("live", {
  type: Boolean,
  default: false,
});
const emit = defineEmits(["save", "update:crop"]);
function save(type = "blob") {
  emit("save", type);
}
function crop() {
  emit("update:crop", true);
}
</script>

<style lang="scss" scoped></style>
