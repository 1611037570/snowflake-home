<script setup>
import { useResumeStore } from "@/stores";
import { ElNotification } from "element-plus";
import { h } from "vue";
import { useRouter } from "vue-router";
import Icon from "../components/icon.vue";
import { $t } from "@/locales";

const router = useRouter();
const resumeStore = useResumeStore();

function copyResume() {
  const copiedId = resumeStore.duplicateResume();
  if (!copiedId) return;
  let notification;
  const switchResume = () => {
    notification?.close();
    router.push({ path: "/resume/editor", query: { id: copiedId } });
  };
  notification = ElNotification({
    title: $t("copySuccess"),
    message: h("div", { class: "flex items-center gap-3" }, [
      h("span", $t("copyCreated")),
      h(
        "button",
        {
          type: "button",
          class: "cursor-pointer rounded-full bg-sf-theme px-3 py-1 text-sm text-sf-theme-text",
          onClick: switchResume,
        },
        $t("switchResume"),
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
  <Icon icon="lucide:copy" size="5" :content="$t('copyResume')" @click="copyResume" />
</template>
