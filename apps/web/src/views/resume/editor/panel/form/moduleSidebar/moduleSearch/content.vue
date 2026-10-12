<script setup>
import { computed, nextTick } from "vue";
import { storeToRefs } from "pinia";
import { useResumeStore } from "@/stores";
import { useModuleNav } from "../../../../hooks/useModuleNav";
import { $t } from "@/locales";

defineOptions({ name: "ModuleSearchContent" });

const resumeStore = useResumeStore();
const { runtimeConfig } = storeToRefs(resumeStore);
// 搜索结果直接用于展示与定位，不再维护拖拽排序状态。
const { keyword, searchResults, jumpAll, jumpToHit, jumpPreview } = useModuleNav();
const moduleFields = computed(() => runtimeConfig.value?.fields || []);

// 查找模块时先恢复归档状态，再同步定位编辑区与预览区
const handleFind = async (module) => {
  if (module.archived) resumeStore.setModuleArchived(module.key, false);
  await nextTick();
  jumpAll(module.key);
};

// 查找内容命中项：恢复归档后定位到命中的记录或字段行，并同步预览区模块
const handleFindHit = async (module, hit) => {
  if (module.archived) resumeStore.setModuleArchived(module.key, false);
  await nextTick();
  jumpToHit(module.key, hit);
  jumpPreview(module.key);
};

// 命中项标题：记录命中显示「记录标题 · 字段标签」，对象模块字段命中只显示字段标签
const hitTitle = (hit) => {
  const record =
    hit.recordTitle || (hit.itemIndex != null ? $t("recordNumber", { number: hit.itemIndex + 1 }) : "");
  return record ? `${record} · ${hit.label}` : hit.label;
};

</script>

<template>
  <div class="w-84 rounded-3xl border border-sf-b bg-sf-primary py-3">
    <header class="px-3">
      <div class="mb-3 flex items-center justify-between">
        <div class="flex items-center gap-3 font-bold text-sf-text">
          <SfIcon icon="lucide:search" size="4" />
          <span>{{ $t("moduleManager") }}</span>
        </div>
        <span class="text-xs text-sf-text-2">{{ $t("moduleCount", { count: moduleFields.length }) }}</span>
      </div>
      <SfInput v-model="keyword" :placeholder="$t('searchModuleOrContent')" clearable />
    </header>
    <SfScrollbar class="mt-3" max-height="388px">
      <div class="flex flex-col gap-3">
        <template v-for="module in searchResults" :key="module.key">
          <div class="flex flex-col gap-3">
            <div
              class="group flex h-10 items-center gap-3 rounded-3xl bg-sf-bg px-3"
              :class="module.hidden || module.archived ? 'opacity-60' : ''"
            >
              <div class="flex min-w-0 flex-1 items-center gap-3">
                <span class="truncate text-sm text-sf-text">{{ module.name }}</span>
                <span v-if="module.hidden" class="text-xs text-sf-text-2">{{ $t("hidden") }}</span>
                <span v-if="module.archived" class="text-xs text-sf-text-2">{{ $t("archived") }}</span>
              </div>
              <!-- 搜索结果仅保留定位操作，模块管理操作由编辑区提供。 -->
              <div class="flex shrink-0 items-center gap-3 text-sf-text-2">
                <SfTooltip :content="$t('syncSearch')">
                  <SfIcon
                    icon="mdi:map-search-outline"
                    size="4"
                    class="cursor-pointer hover:text-sf-theme"
                    @click.stop="handleFind(module)"
                  />
                </SfTooltip>
              </div>
            </div>
            <!-- 内容命中：按记录或字段列出命中项，点击定位到对应行 -->
            <div
              v-if="module.hits.length"
              class="ml-3 flex flex-col gap-3 border-l border-sf-border pl-3"
            >
              <div
                v-for="(hit, index) in module.hits"
                :key="`${hit.itemIndex ?? 'field'}-${hit.fieldKey}-${index}`"
                class="flex cursor-pointer flex-col rounded-xl bg-sf-bg px-3 py-1 hover:text-sf-theme"
                @click.stop="handleFindHit(module, hit)"
              >
                <span class="truncate text-xs text-sf-text-2">{{ hitTitle(hit) }}</span>
                <span class="truncate text-xs text-sf-text-3">{{ hit.text }}</span>
              </div>
            </div>
          </div>
        </template>
        <div v-if="!searchResults.length" class="py-3 text-center text-sm text-sf-text-2">
          {{ $t("notFound") }}
        </div>
      </div>
    </SfScrollbar>
  </div>
</template>

<style scoped></style>
