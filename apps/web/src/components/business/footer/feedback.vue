<script setup lang="ts">
import { createFeedback } from "@/apis";
import { ElMessage } from "element-plus";
import { reactive, ref, watch } from "vue";

const visible = ref(false);
const submitting = ref(false);
const form = reactive({ content: "", contact: "" });

const reset = () => {
  form.content = "";
  form.contact = "";
};

watch(visible, (value) => {
  if (!value) reset();
});

const submit = async () => {
  const content = form.content.trim();
  if (!content) {
    ElMessage.warning("请输入反馈内容");
    return;
  }

  submitting.value = true;
  try {
    await createFeedback({
      content,
      contact: form.contact.trim() || undefined,
      pageUrl: window.location.href,
    });
    ElMessage.success("反馈提交成功，感谢你的建议");
    visible.value = false;
  } catch {
    ElMessage.error("反馈提交失败，请稍后重试");
  } finally {
    submitting.value = false;
  }
};

// 反馈入口暂时统一跳转至 GitHub Issues
const goToFeedback = () => {
  window.open(
    "https://github.com/1611037570/snowflake-home/issues",
    "_blank",
    "noopener,noreferrer",
  );
};
</script>

<template>
  <button
    class="cursor-pointer font-medium hover:text-sf-theme"
    type="button"
    @click="goToFeedback"
  >
    意见反馈
  </button>

  <SfModal v-model="visible" title="意见反馈" width="432px">
    <form class="flex flex-col gap-3 p-3" @submit.prevent="submit">
      <p class="text-sm text-sf-text-2">告诉我们你的建议或遇到的问题。</p>
      <ElInput
        v-model="form.content"
        :maxlength="1000"
        :rows="6"
        placeholder="请输入反馈内容"
        resize="none"
        show-word-limit
        type="textarea"
      />
      <SfInput v-model="form.contact" :maxlength="100" placeholder="联系方式（选填）" />
      <footer class="flex justify-end gap-3">
        <SfButton plain @click="visible = false">取消</SfButton>
        <SfButton :class="{ 'pointer-events-none opacity-60': submitting }" @click="submit">
          {{ submitting ? "提交中" : "提交反馈" }}
        </SfButton>
      </footer>
    </form>
  </SfModal>
</template>
