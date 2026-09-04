<script setup>
import { ref } from "vue";
import { jobPlatformList } from "./data";
import Tip from "./tip.vue";

const visible = ref(false);

// 暴露 open 方法，供外部通过 ref 调用
const open = () => {
  visible.value = true;
};
defineExpose({ open });

const oepn = (data) => {
  window.open(data.url, "_blank");
};
</script>

<template>
  <div>
    <div @click="visible = true">
      <slot>
        <!-- 投递按钮：增加发送图标并美化样式 -->
        <SfButton>
          <SfIcon icon="ph:paper-plane-right-fill" class="mr-2 rotate-180" size="4" />
          投递简历
        </SfButton>
      </slot>
    </div>
    <SfModal v-model="visible" title="投递简历">
      <SfScrollbar height="750px" class="overflow-hidden">
        <Tip />
        <div class="w-[420px]">
          <div v-for="item in jobPlatformList" :key="item.type" class="mb-3">
            <div class="mb-2 flex items-center text-base font-bold text-sf-text">
              <span class="mr-2 inline-block h-4 w-1 rounded-full bg-sf-theme" />
              {{ item.type }}
            </div>
            <div class="flex flex-wrap gap-3 pl-1">
              <div v-for="platform in item.array" :key="platform.name">
                <SfApp boxSize="18" :data="platform" @onClick="oepn" size="15" />
              </div>
            </div>
          </div>
        </div>
      </SfScrollbar>
    </SfModal>
  </div>
</template>

<style lang="scss" scoped>
// 折叠面板内容区去默认边框，与美化后的卡片内容融合
:deep(.deliver-collapse .el-collapse-item__wrap) {
  background: transparent;
}
:deep(.deliver-collapse .el-collapse-item__content) {
  padding-bottom: 12px;
}
</style>
