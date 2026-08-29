<script setup>
import { useResumeStore } from "@/stores";
import dayjs from "dayjs";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { getAllScores } from "../../resumeEditor/utils";
import { getResumeTitle } from "../../resumeEditor/resumeName";
import ThumbPreview from "@/views/resumeEditor/preview/thumbPreview.vue";
import ResumeCardContainer from "./components/resumeCardContainer.vue";

const router = useRouter();

const resumeStore = useResumeStore();
const { list, currentIndex } = storeToRefs(resumeStore);
const { maxCount } = resumeStore;
const { proxy } = getCurrentInstance();
const sortedList = computed(() => {
  return [...list.value].sort(
    (a, b) => (b?.usage?.lastUseTime || 0) - (a?.usage?.lastUseTime || 0),
  );
});
// 列表卡片数据：预计算完成度，避免模板重复计算
const displayList = computed(() =>
  sortedList.value.map((item, index) => ({
    item,
    index,
    progress: getAllScores(item.data).progress,
  })),
);
const getResumePosition = (item) => {
  return item?.data?.user?.position || "未填写求职岗位";
};
const getLastUseTime = (item) => {
  return item?.usage?.lastUseTime ? dayjs(item.usage.lastUseTime).format("YYYY.MM.DD HH:mm") : "--";
};
const getProgressClass = (progress) => {
  if (progress < 40) return "bg-sf-error";
  if (progress < 60) return "bg-sf-warning";
  return "bg-sf-theme";
};

// 按 id 定位真实下标（displayList 按 lastUseTime 排序后 index 不可直接用）
const findIndexById = (id) => list.value.findIndex((item) => item.id === id);

// 组装缩略预览所需的简历项
const getThumbItem = (item) => ({
  data: item.data,
  config: item.config,
  fixedConfig: item.fixedConfig,
  ui: item.ui,
});

const handleEdit = (item) => {
  const index = findIndexById(item.id);
  if (index === -1) return;
  currentIndex.value = index;
  router.push({ path: "/resumeEditor", query: { id: item.id } });
};

const handleDelete = (item) => {
  proxy.$confirm("确定要删除当前简历吗？", "删除确认").then(() => {
    const index = findIndexById(item.id);
    if (index === -1) return;
    currentIndex.value = index;
    resumeStore.deleteResume();
  });
};

const handleCreate = () => {
  if (list.value.length >= maxCount) {
    return;
  }
  resumeStore.addResume();
};

const handleUseTemplate = () => {
  router.push("/resume/template");
};
</script>

<template>
  <div class="relative z-4 mx-auto flex w-[1120px] flex-col gap-4">
    <div class="flex h-8 items-center justify-between">
      <h2 class="text-[20px] font-black text-sf-theme">
        简历草稿（{{ list.length }}/{{ maxCount }}）
      </h2>
    </div>

    <div class="grid grid-cols-3 gap-4 max-[900px]:grid-cols-1">
      <!-- 新建简历卡片：固定在首位，与简历卡片共用同一容器，保持风格统一 -->
      <ResumeCardContainer v-if="list.length < maxCount" @click="handleCreate">
        <div
          class="group flex h-full w-full flex-col items-center justify-center gap-3 overflow-hidden"
        >
          <!-- 圆形加号：鼠标悬停时旋转 90 度 -->
          <div class="flex h-16 w-16 items-center justify-center rounded-full bg-sf-theme-2">
            <SfIcon
              icon="ic:round-add"
              size="8"
              class="text-sf-theme transition-transform duration-300 group-hover:rotate-90"
            />
          </div>
          <span class="text-base font-black text-sf-text">新建简历</span>
          <span class="text-sm text-sf-text-2">从空白开始，打造专属简历</span>
        </div>
      </ResumeCardContainer>
      <ResumeCardContainer
        v-for="card in displayList"
        :key="card.item.id || card.index"
        @click="handleEdit(card.item)"
      >
        <!-- 简历缩略预览：可直接查看与全屏放大 -->
        <div
          class="relative aspect-[794/1123] w-full overflow-hidden rounded-lg border border-sf-b bg-sf-bg"
        >
          <ThumbPreview
            :item="getThumbItem(card.item)"
            action-text="编辑"
            @select="handleEdit(card.item)"
          />
        </div>
        <!-- 标题与操作 -->
        <div class="mt-3 flex items-start justify-between gap-2">
          <div class="min-w-0">
            <div class="truncate text-base font-black text-sf-text">
              {{ getResumeTitle(card.item.data) }}
            </div>
            <div class="mt-1 truncate text-sm text-sf-text-2">
              {{ getResumePosition(card.item) }}
            </div>
          </div>
          <div class="flex shrink-0 items-center gap-1">
            <span
              class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-sf-text-2 transition-colors duration-200 hover:bg-sf-theme-2 hover:text-sf-theme"
              @click.stop="handleEdit(card.item)"
            >
              <SfIcon icon="lucide:pencil" size="4" />
            </span>
            <button
              type="button"
              class="flex h-8 w-8 items-center justify-center rounded-full text-sf-text-2 transition-colors duration-200 hover:bg-sf-error-2 hover:text-sf-error"
              @click.stop="handleDelete(card.item)"
            >
              <SfIcon icon="lucide:trash-2" size="4" />
            </button>
          </div>
        </div>

        <!-- 底部：进度条与最后使用时间 -->
        <div class="mt-4 flex items-center gap-3">
          <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-sf-bg-2">
            <div
              class="h-full rounded-full"
              :class="getProgressClass(card.progress)"
              :style="{ width: `${card.progress}%` }"
            ></div>
          </div>
          <span class="shrink-0 text-xs text-sf-text-3"
            >最后使用：{{ getLastUseTime(card.item) }}</span
          >
        </div>
      </ResumeCardContainer>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
