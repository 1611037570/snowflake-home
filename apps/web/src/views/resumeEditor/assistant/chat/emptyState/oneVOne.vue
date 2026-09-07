<!-- 1V1 优化服务入口 -->
<script setup>
import { ref } from "vue";
import Money from "@/components/base/donation/money.vue";

defineOptions({ name: "OneVOne" });

// 1V1 优化服务弹窗显隐：点击入口按钮后展示赞助二维码
const visible = ref(false);
</script>

<template>
  <div class="w-full">
    <SfButton type="theme" class="w-full" @click="visible = true">1V1优化简历</SfButton>

    <SfModal v-model="visible" title="1V1优化简历" width="560px">
      <div class="flex w-full flex-col items-center px-3 pb-3">
        <p class="text-center text-sf-text">
          赞助 50R，备注联系方式，作者为你 1V1 优化简历
        </p>
        <Money class="mt-3 w-full" />
      </div>
    </SfModal>
  </div>
</template>

<style lang="scss" scoped></style>
