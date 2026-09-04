<script setup>
import { useResumeStore } from "@/stores";
import dayjs from "dayjs";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { useProgress } from "../../resumeEditor/hooks/useProgress";
import { getResumeTitle } from "../../resumeEditor/resumeName";
import ResumeCardContainer from "./components/resumeCardContainer.vue";
import RevealGrid from "../components/revealGrid.vue";
import ImportResume from "./components/importResume.vue";
import SendResume from "@/views/resume/components/sendResume/index.vue";

const router = useRouter();

const resumeStore = useResumeStore();
const { list, currentIndex } = storeToRefs(resumeStore);
const { maxCount, maxTrashCount } = resumeStore;
const { proxy } = getCurrentInstance();

// 每次进入简历页：清理回收站中超过保留天数的简历
onMounted(() => {
  resumeStore.cleanExpiredTrash();
});

const sortedList = computed(() => {
  return [...list.value].sort(
    (a, b) => (b?.usage?.lastUseTime || 0) - (a?.usage?.lastUseTime || 0),
  );
});
const displayList = computed(() => {
  // id → 真实下标映射：列表按 lastUseTime 排序后仍能定位真实下标
  const indexMap = new Map(list.value.map((item, index) => [item.id, index]));
  const cards = sortedList.value.map((item) => ({
    id: item.id,
    type: "resume",
    item,
    index: indexMap.get(item.id) ?? -1,
    progress: useProgress([...item.fixedConfig.fields, ...item.config.fields], item.data).progress,
  }));
  // 未满员时新建入口作首项，与简历项一同逐个揭示
  return list.value.length < maxCount ? [{ id: "__create", type: "create" }, ...cards] : cards;
});
const getLastUseTime = (item) => {
  return item?.usage?.lastUseTime ? dayjs(item.usage.lastUseTime).format("YYYY.MM.DD HH:mm") : "--";
};
const getResumePosition = (item) => {
  return item?.data?.user?.data?.position || "未填写求职岗位";
};
const getProgressClass = (progress) => {
  if (progress < 40) return "bg-sf-error";
  if (progress < 60) return "bg-sf-warning";
  return "bg-sf-theme";
};

// 当前标签：draft | trash
const activeTab = ref("draft");

// 按真实下标定位简历（displayList 中已携带 index）
const handleEdit = (index) => {
  if (index === -1) return;
  currentIndex.value = index;
  router.push({ path: "/resumeEditor", query: { id: list.value[index].id } });
};

const handleDelete = (index) => {
  proxy.$confirm("确定要删除当前简历吗？", "删除确认").then(() => {
    if (index === -1) return;
    currentIndex.value = index;
    resumeStore.deleteResume();
  });
};

// 新建引导弹窗状态
const createDialogVisible = ref(false);
// 引导表单：仅收集简单信息（姓名、电话、求职岗位）
const createForm = ref({
  name: "",
  phone: "",
  position: "",
});

const handleCreate = () => {
  // 提前判断：简历数量已达上限时提示并阻止
  if (list.value.length >= maxCount) {
    ElMessage.warning(`简历数量已达上限（${maxCount}个），请先删除后再新建`);
    return;
  }
  createDialogVisible.value = true;
};

// 重置引导弹窗
const resetCreateDialog = () => {
  createDialogVisible.value = false;
  createForm.value = { name: "", phone: "", position: "" };
};

// 确认创建：携带已填写的简单信息进入编辑器
const handleCreateConfirm = () => {
  const { name, phone, position } = createForm.value;
  resumeStore.addResume({
    data: {
      user: {
        data: {
          name: name.trim(),
          phone: phone.trim(),
          position: position.trim(),
        },
      },
    },
  });
  resetCreateDialog();
};

// 跳过引导：直接创建空白简历
const handleCreateSkip = () => {
  resumeStore.addResume();
  resetCreateDialog();
};

const handleUseTemplate = () => {
  router.push("/resume/template");
};
</script>

<template>
  <SfScrollbar class="h-full">
    <div class="relative z-4 mx-auto flex w-full max-w-[1164px] flex-col gap-3 py-3">
      <!-- 标签切换栏 -->
      <div class="flex items-center justify-between border-b border-sf-b">
        <div class="flex gap-6">
          <button
            type="button"
            class="relative cursor-pointer border-0 bg-transparent pb-2 text-[15px] font-extrabold transition-colors"
            :class="
              activeTab === 'draft'
                ? 'text-sf-theme after:absolute after:right-0 after:bottom-[-1px] after:left-0 after:h-[3px] after:rounded-full after:bg-sf-theme after:content-[\'\']'
                : 'text-sf-text-2 hover:text-sf-text'
            "
            @click="activeTab = 'draft'"
          >
            简历草稿（{{ list.length }}/{{ maxCount }}）
          </button>
          <button
            type="button"
            class="relative cursor-pointer border-0 bg-transparent pb-2 text-[15px] font-extrabold transition-colors"
            :class="
              activeTab === 'trash'
                ? 'text-sf-theme after:absolute after:right-0 after:bottom-[-1px] after:left-0 after:h-[3px] after:rounded-full after:bg-sf-theme after:content-[\'\']'
                : 'text-sf-text-2 hover:text-sf-text'
            "
            @click="activeTab = 'trash'"
          >
            回收站（{{ resumeStore.trashList.length }}/{{ maxTrashCount }}）
          </button>
        </div>
        <!-- 导入简历入口：仅在草稿标签下显示 -->
        <div class="flex gap-3">
          <ImportResume />
          <SendResume />
        </div>
      </div>

      <!-- 简历草稿列表：布局与入场动画交给 RevealGrid，新建入口与简历项同走 #default 参与揭示 -->
      <RevealGrid v-if="activeTab === 'draft'" :items="displayList" key-field="id">
        <template #default="{ item: card }">
          <!-- 新建简历入口项 -->
          <ResumeCardContainer v-if="card.type === 'create'" @click="handleCreate">
            <div
              class="group flex h-full w-full flex-col items-center justify-center gap-3 overflow-hidden"
            >
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
          <!-- 简历项 -->
          <ResumeCardContainer v-else :item="card.item" @click="handleEdit(card.index)">
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
                  @click.stop="handleEdit(card.index)"
                >
                  <SfIcon icon="lucide:pencil" size="4" />
                </span>
                <button
                  type="button"
                  class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-sf-text-2 transition-colors duration-200 hover:bg-sf-error-2 hover:text-sf-error"
                  @click.stop="handleDelete(card.index)"
                >
                  <SfIcon icon="lucide:trash-2" size="4" />
                </button>
              </div>
            </div>
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
        </template>
      </RevealGrid>

      <!-- 回收站列表：布局与入场动画交给 RevealGrid，空状态由 #empty 提供 -->
      <RevealGrid v-if="activeTab === 'trash'" :items="resumeStore.trashList" key-field="id">
        <template #default="{ item, index }">
          <ResumeCardContainer :item="item" action-text="已删除">
            <div class="truncate text-base font-black text-sf-text">
              {{ getResumeTitle(item.data) }}
            </div>
            <div class="mt-1 flex items-center justify-between gap-3">
              <div class="truncate text-sm text-sf-text-2">
                {{ getResumePosition(item) }}
              </div>
              <span class="shrink-0 text-xs text-sf-text-3">
                {{ resumeStore.getTrashRemainingDays(item) }}天后自动清理
              </span>
            </div>
            <div class="mt-2 flex items-center gap-3">
              <SfButton
                :round="false"
                plain
                class="flex-1"
                @click="resumeStore.restoreResume(index)"
                icon="lucide:rotate-ccw"
              >
                恢复
              </SfButton>
              <SfButton
                :round="false"
                plain
                type="error"
                class="flex-1"
                @click="resumeStore.permanentlyDeleteResume(index)"
                icon="lucide:trash-2"
              >
                永久删除
              </SfButton>
            </div>
          </ResumeCardContainer>
        </template>
        <!-- 回收站为空：col-span-full 由组件包裹提供 -->
        <template #empty>
          <div class="flex flex-col items-center justify-center py-20 text-sf-text-2">
            <SfIcon icon="lucide:trash-2" size="12" class="mb-4 text-sf-text-3" />
            <span class="text-base">回收站为空</span>
          </div>
        </template>
      </RevealGrid>

      <!-- 新建简历引导弹窗：收集简单信息 -->
      <SfModal v-model="createDialogVisible" title="完善基本信息">
        <form class="flex w-96 flex-col gap-4 p-5" @submit.prevent="handleCreateConfirm">
          <SfInput v-model="createForm.name" placeholder="请输入姓名" />
          <SfInput v-model="createForm.phone" placeholder="请输入电话" />
          <SfInput v-model="createForm.position" placeholder="请输入求职岗位" />
          <footer class="flex justify-end gap-3">
            <el-button @click="handleCreateSkip">跳过</el-button>
            <el-button type="primary" @click="handleCreateConfirm">创建简历</el-button>
          </footer>
        </form>
      </SfModal>
    </div>
  </SfScrollbar>
</template>

<style lang="scss" scoped></style>
