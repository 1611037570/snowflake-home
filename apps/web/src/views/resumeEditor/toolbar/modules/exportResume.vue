<script setup>
import Icon from "../components/icon.vue";
import { ref } from "vue";

const visible = ref(false);

// 菜单配置
const list = [
  {
    name: "PDF文件",
    desc: "将简历导出为高清PDF格式，适合打印、邮件发送或存档，排版清晰不变形",
  },
  {
    name: "图片",
    desc: "将简历一键导出为PNG图片，方便在社交媒体、作品集或PPT中直接展示",
  },
  {
    name: "JSON配置",

    desc: "导出当前的简历配置，支持完整无损导入，方便随时恢复进度或跨设备使用",
  },
];
</script>

<template>
  <Icon icon="fa6-solid:file-export" size="4" content="导出简历" @click="visible = true" />

  <SfModal v-model="visible" title="导出简历">
    <div class="flex w-[400px] flex-col gap-3">
      <div class="text-lg">选择您希望导出简历的格式</div>
      <template v-for="item in list" :key="item.name">
        <div class="rounded-3xl border border-sf-b p-3">
          <div class="text-xl">
            {{ item.name }}
          </div>
          <div class="text-sm">{{ item.desc }}</div>
        </div>
      </template>
    </div>
  </SfModal>
</template>

<style lang="scss" scoped></style>
