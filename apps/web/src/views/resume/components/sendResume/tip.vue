<script setup>
import Money from "@/components/base/donation/money.vue";
</script>

<template>
  <!-- 提示折叠面板：每个标题增加对应图标、色块与描述美化 -->
  <SfCollapse class="deliver-collapse mb-4">
    <SfCollapseItem name="author">
      <template #title>
        <div class="flex items-center">
          <span class="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-md bg-pink-100">
            <SfIcon icon="solar:heart-bold" class="text-pink-500" size="4" />
          </span>
          <span class="text-sm font-medium text-sf-text">作者留言</span>
        </div>
      </template>
      <div
        class="rounded-lg border border-pink-100/50 bg-pink-50/40 py-2 pr-3 pl-8 text-[13px] leading-6 break-words text-sf-text/80"
      >
        到这里，我想你的专属简历已经完成啦～很开心能陪你走完这一程。祝你求职顺利，斩获心仪
        offer。感谢使用轻舟简历。
      </div>
    </SfCollapseItem>
    <SfCollapseItem name="money">
      <template #title>
        <div class="flex items-center">
          <span class="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-md bg-pink-100">
            <SfIcon icon="solar:heart-bold" class="text-pink-500" size="4" />
          </span>
          <span class="text-sm font-medium text-sf-text">支持项目</span>
        </div>
      </template>
      <div
        class="rounded-lg border border-pink-100/50 bg-pink-50/40 px-3 py-2 text-[13px] leading-6 break-words text-sf-text/80"
      >
        <Money />
      </div>
    </SfCollapseItem>
    <SfCollapseItem name="safe">
      <template #title>
        <div class="flex items-center">
          <span
            class="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-md bg-amber-100"
          >
            <SfIcon icon="bi:shield-exclamation" size="4" class="text-amber-500" />
          </span>
          <span class="text-sm font-medium text-sf-text">安全提醒</span>
        </div>
      </template>
      <div
        class="rounded-lg border border-amber-100/60 bg-amber-50/50 py-2 pr-3 pl-8 text-[13px] leading-6 break-words text-sf-text/80"
      >
        本平台仅作信息展示，不参与招聘。内容均来自互联网，仅供参考!!!
      </div>
    </SfCollapseItem>
    <SfCollapseItem name="fraud">
      <template #title>
        <div class="flex items-center">
          <span
            class="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-md bg-emerald-100"
          >
            <SfIcon icon="stash:lock-closed" size="4" class="text-emerald-500" />
          </span>
          <span class="text-sm font-medium text-sf-text">防骗指南</span>
        </div>
      </template>
      <div
        class="rounded-lg border border-emerald-100/60 bg-emerald-50/50 py-2 pr-3 pl-8 text-[13px] leading-6 break-words text-sf-text/80"
      >
        任何收费均为诈骗，勿泄露密码/验证码，认准官方域名，面试前核实企业资质。遇骗请立即报警。
      </div>
    </SfCollapseItem>
  </SfCollapse>
</template>

<style lang="scss" scoped></style>
