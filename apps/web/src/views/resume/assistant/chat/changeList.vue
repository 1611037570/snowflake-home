<script setup lang="ts">
import { computed, ref } from "vue";
import type { ResumeChangeState, ResumeChangeType } from "../changes/types";
import { compareChangeText } from "../changes/textDiff";

const props = defineProps<{
  state: ResumeChangeState; // 当前回复实际成功的改动及详情异常状态
}>();

const labels: Record<ResumeChangeType, string> = {
  add: "新增", // 新建记录
  update: "修改", // 字段内容或格式修改
  delete: "删除", // 移除记录
  move: "排序", // 记录位置调整
};
const badgeClasses: Record<ResumeChangeType, string> = {
  add: "bg-green-100 text-green-700", // 新增使用绿色
  update: "bg-sf-theme-3 text-sf-theme", // 修改使用主题色
  delete: "bg-red-100 text-red-700", // 删除使用红色
  move: "bg-sf-bg-2 text-sf-text-2", // 排序使用中性色
};
const summary = computed(() => (Object.keys(labels) as ResumeChangeType[]).flatMap((type) => {
  const count = props.state.items.filter((item) => item.type === type).length;
  return count ? [`${labels[type]} ${count}`] : [];
}).join(" · "));
const selectedIndex = ref<number | null>(null);
const visible = ref(false);
const selected = computed(() => selectedIndex.value == null ? null : props.state.items[selectedIndex.value] ?? null);
const showChange = (index: number) => {
  selectedIndex.value = index;
  visible.value = true;
};
// 仅在弹窗打开时计算差异，详情始终读取操作时保存的快照。
const comparedFields = computed(() => {
  if (!visible.value || !selected.value) return [];
  return selected.value.fields.map((field) => {
    try {
      return { ...field, diff: compareChangeText(field.before, field.after) };
    } catch {
      // 差异计算失败时展示完整前后内容，仍能查看实际改动。
      return { ...field, diff: {
        before: [{ text: field.before, changed: true }], // 旧内容整段标记
        after: [{ text: field.after, changed: true }], // 新内容整段标记
      } };
    }
  });
});
</script>

<template>
  <section class="rounded-3xl border border-sf-b bg-sf-primary p-3">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-3 text-sm font-semibold text-sf-text">
        <SfIcon icon="lucide:sparkles" size="4" class="text-sf-theme" />
        本次修改
      </div>
      <span v-if="summary" class="text-xs text-sf-text-2">{{ summary }}</span>
    </header>
    <div v-if="state.items.length" class="mt-3 overflow-hidden rounded-2xl border border-sf-b">
      <div v-for="(change, index) in state.items" :key="index" class="flex items-center gap-3 p-3" :class="{ 'border-t border-sf-b': index > 0 }">
        <span class="shrink-0 rounded-full px-3 py-1 text-xs" :class="badgeClasses[change.type]">{{ labels[change.type] }}</span>
        <span class="min-w-0 flex-1 text-sm break-words text-sf-text">{{ change.location }}</span>
        <button type="button" class="shrink-0 cursor-pointer text-xs text-sf-theme hover:underline" @click="showChange(index)">查看更改</button>
      </div>
    </div>
    <p v-if="state.unavailable" class="mt-3 text-xs text-sf-text-2">部分改动详情未能记录，请查看当前简历确认内容。</p>
  </section>
  <SfModal v-if="visible && selected" v-model="visible" title="查看更改" width="540px">
    <div class="flex max-h-[66vh] flex-col gap-3 overflow-y-auto">
      <header class="flex flex-col gap-3 border-b border-sf-b pb-3">
        <span class="text-xs text-sf-text-3">改动位置</span>
        <div class="text-sm font-semibold break-words text-sf-text">{{ selected.location }}</div>
      </header>
      <!-- 排序使用操作发生时保存的前后列表，突出实际移动记录。 -->
      <div v-if="selected.type === 'move'" class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <section class="rounded-2xl bg-sf-bg p-3">
          <h3 class="mb-3 text-xs font-semibold text-sf-text-2">调整前</h3>
          <ol class="flex flex-col gap-3 text-sm">
            <li v-for="(name, index) in selected.beforeOrder" :key="index" class="flex items-center gap-3 rounded-xl p-3" :class="index === selected.from ? 'bg-sf-primary text-sf-text' : 'text-sf-text-3'">
              <span class="shrink-0">{{ index + 1 }}</span><span class="min-w-0 break-words">{{ name }}</span>
            </li>
          </ol>
        </section>
        <section class="rounded-2xl bg-sf-bg p-3">
          <h3 class="mb-3 text-xs font-semibold text-sf-text-2">调整后</h3>
          <ol class="flex flex-col gap-3 text-sm">
            <li v-for="(name, index) in selected.afterOrder" :key="index" class="flex items-center gap-3 rounded-xl p-3" :class="index === selected.to ? 'bg-sf-theme-3 text-sf-theme' : 'text-sf-text-3'">
              <span class="shrink-0">{{ index + 1 }}</span><span class="min-w-0 flex-1 break-words">{{ name }}</span>
              <SfIcon v-if="index === selected.to" :icon="(selected.to ?? 0) < (selected.from ?? 0) ? 'lucide:arrow-up' : 'lucide:arrow-down'" size="4" class="shrink-0" />
            </li>
          </ol>
        </section>
      </div>
      <template v-else>
        <section v-for="(field, index) in comparedFields" :key="index" class="flex flex-col gap-3">
          <h3 v-if="comparedFields.length > 1" class="text-sm font-semibold text-sf-text">{{ field.label }}</h3>
          <div v-if="selected.type === 'update'" class="rounded-2xl bg-sf-bg p-3">
            <div class="mb-3 text-xs font-semibold text-sf-text-2">修改前</div>
            <p class="text-sm leading-loose break-words whitespace-pre-wrap text-sf-text"><template v-for="(part, partIndex) in field.diff.before" :key="partIndex"><del v-if="part.changed" class="bg-red-100 text-red-800">{{ part.text }}</del><span v-else>{{ part.text }}</span></template><span v-if="!field.before" class="text-sf-text-3">未填写</span></p>
          </div>
          <div class="rounded-2xl bg-sf-bg p-3">
            <div class="mb-3 text-xs font-semibold text-sf-text-2">{{ selected.type === 'add' ? '新增内容' : selected.type === 'delete' ? '删除内容' : '修改后' }}</div>
            <p v-if="selected.type === 'delete'" class="text-sm leading-loose break-words whitespace-pre-wrap"><del class="bg-red-100 text-red-800">{{ field.before }}</del></p>
            <p v-else-if="selected.type === 'add'" class="text-sm leading-loose break-words whitespace-pre-wrap"><ins class="bg-green-100 text-green-800 no-underline">{{ field.after }}</ins></p>
            <p v-else class="text-sm leading-loose break-words whitespace-pre-wrap text-sf-text"><template v-for="(part, partIndex) in field.diff.after" :key="partIndex"><ins v-if="part.changed" class="bg-green-100 text-green-800 no-underline">{{ part.text }}</ins><span v-else>{{ part.text }}</span></template><span v-if="!field.after" class="text-sf-text-3">已清空</span></p>
            <p v-if="field.formatOnly" class="mt-3 text-xs text-sf-text-3">文字内容一致，格式已调整。</p>
          </div>
        </section>
        <p v-if="!comparedFields.length" class="text-sm text-sf-text-2">记录已{{ selected.type === 'delete' ? '删除' : '新增' }}，没有可展示的文字内容。</p>
      </template>
    </div>
  </SfModal>
</template>
