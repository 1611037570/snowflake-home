<script setup>
import { computed, ref } from "vue";
import { storeToRefs } from "pinia";
import { useResumeStore } from "@/stores";
import {
  getDesensitizeSelectionName,
  normalizeDesensitizeFields,
} from "@snowflake/resume-core/privacy";
import DesensitizeConfigModal from "@/views/resume/editor/components/desensitizeConfigModal.vue";

const resumeStore = useResumeStore();
const { desensitizeMode } = storeToRefs(resumeStore);
const visible = ref(false);
const selectedFields = computed(() => normalizeDesensitizeFields(desensitizeMode.value));
const activeName = computed(() => getDesensitizeSelectionName(selectedFields.value));
</script>

<template>
  <!-- 脱敏入口只展示当前保护状态，完整选择放入弹窗。 -->
  <SfButton
    :type="selectedFields.length ? 'theme' : 'bg'"
    :plain="Boolean(selectedFields.length)"
    size="small"
    class="gap-3 whitespace-nowrap"
    @click="visible = true"
  >
    <SfIcon :icon="selectedFields.length ? 'bi:shield-check' : 'bi:shield-exclamation'" size="4" />
    {{ activeName }}
  </SfButton>
  <DesensitizeConfigModal v-model="visible" />
</template>
