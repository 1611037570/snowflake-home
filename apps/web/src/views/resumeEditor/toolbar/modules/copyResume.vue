<script setup>
import { useResumeStore } from "@/stores";
import { ElNotification } from "element-plus";
import { h } from "vue";
import { useRouter } from "vue-router";
import Icon from "../components/icon.vue";

const router = useRouter();
const resumeStore = useResumeStore();

function copyResume() {
  const copiedId = resumeStore.duplicateResume();
  if (!copiedId) return;
  let notification;
  const switchResume = () => {
    notification?.close();
    router.push({ path: "/resumeEditor", query: { id: copiedId } });
  };
  notification = ElNotification({
    title: "复制成功",
    message: h("div", { class: "flex items-center gap-3" }, [
      h("span", "已创建一份新的简历"),
      h(
        "button",
        {
          type: "button",
          class: "cursor-pointer rounded-full bg-sf-theme px-3 py-1 text-sm text-sf-theme-text",
          onClick: switchResume,
        },
        "切换",
      ),
    ]),
    position: "top-right",
    offset: 40,
    duration: 0,
    showClose: true,
  });
}
</script>

<template>
  <Icon icon="lucide:copy" size="5" content="复制简历" @click="copyResume" />
</template>
