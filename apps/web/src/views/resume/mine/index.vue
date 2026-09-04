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
  <div class="relative mx-auto flex h-full w-full max-w-7xl flex-col gap-3">
    <!-- 标签切换栏 -->
    <div class="mt-2 flex w-full min-w-full items-center justify-between px-6">
      <div class="flex gap-6">
        <SfSpan
          :active="activeTab === 'draft'"
          class="flex-c h-10 text-[15px] font-extrabold"
          @click="activeTab = 'draft'"
        >
          简历草稿({{ list.length }}/{{ maxCount }})
        </SfSpan>
        <SfSpan
          :active="activeTab === 'trash'"
          class="flex-c h-10 text-[15px] font-extrabold"
          @click="activeTab = 'trash'"
        >
          回收站({{ resumeStore.trashList.length }}/{{ maxTrashCount }})
        </SfSpan>
      </div>
      <!-- 导入简历入口：仅在草稿标签下显示 -->
      <div class="flex gap-3">
        <ImportResume />
        <SendResume />
      </div>
    </div>
    <SfScrollbar class="flex-1">
      <div class="flex h-full flex-col py-1">
        <!-- 简历草稿列表 -->
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
              <div class="truncate text-base font-black text-sf-text">
                {{ getResumeTitle(card.item.data) }}
              </div>
              <div class="mt-1 flex items-center justify-between gap-2">
                <div class="truncate text-sm text-sf-text-2">
                  {{ getResumePosition(card.item) }}
                </div>
                <span class="shrink-0 text-xs text-sf-text-3">{{ getLastUseTime(card.item) }}</span>
              </div>
              <div class="mt-2 flex items-center gap-3">
                <SfButton
                  :round="false"
                  plain
                  class="flex-1"
                  @click.stop="handleEdit(card.index)"
                  icon="lucide:pencil"
                >
                  编辑
                </SfButton>
                <SfButton
                  :round="false"
                  plain
                  type="error"
                  class="flex-1"
                  @click.stop="handleDelete(card.index)"
                  icon="lucide:trash-2"
                >
                  删除
                </SfButton>
              </div>
            </ResumeCardContainer>
          </template>
        </RevealGrid>

        <!-- 回收站列表 -->
        <RevealGrid
          v-else-if="activeTab === 'trash' && resumeStore.trashList.length > 0"
          :items="resumeStore.trashList"
          key-field="id"
        >
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
        </RevealGrid>
        <!-- 回收站为空 -->
        <div v-else class="flex flex-col items-center justify-center py-20 text-sf-text-2">
          <SfIcon icon="lucide:trash-2" size="12" class="mb-4 text-sf-text-3" />
          <span class="text-base">回收站为空</span>
        </div>
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
        <div class="flex flex-1 flex-col items-center justify-end">
          <SfFooter />
        </div>
      </div>
    </SfScrollbar>
  </div>
</template>

<style lang="scss" scoped></style>
