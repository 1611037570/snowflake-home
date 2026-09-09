<script setup>
import { useResumeStore } from "@/stores";
import dayjs from "dayjs";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { useProgress } from "../../resumeEditor/hooks/useProgress";
import { getResumeTitle } from "../../resumeEditor/resumeName";
import { expandConfigFields } from "@/stores/modules/resume/hooks/useConfigTemplate";
import ResumeCardContainer from "./components/resumeCardContainer.vue";
import RevealGrid from "../components/revealGrid.vue";
import ImportResume from "./components/importResume.vue";
import SendResume from "@/views/resume/components/sendResume/index.vue";
import CreateResume from "./components/createResume.vue";

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
    progress: useProgress(expandConfigFields(item.config?.fields || [], item.data), item.data)
      .progress,
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

// 清空前二次确认，避免误删回收站内容。
const handleClearTrash = () => {
  if (!resumeStore.trashList.length) return;
  proxy.$confirm("确定要永久删除回收站内的全部简历吗？", "全部删除确认").then(() => {
    resumeStore.clearTrash();
  });
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
      <!-- 草稿与回收站使用对应操作入口。 -->
      <div class="flex gap-3">
        <template v-if="activeTab === 'draft'">
          <ImportResume />
          <SendResume />
        </template>
        <SfButton
          v-else
          plain
          type="error"
          icon="lucide:trash-2"
          @click="handleClearTrash"
        >
          全部删除
        </SfButton>
      </div>
    </div>
    <SfScrollbar class="flex-1">
      <div class="flex h-full flex-col py-1">
        <!-- 简历草稿列表 -->
        <RevealGrid v-if="activeTab === 'draft'" :items="displayList" key-field="id">
          <template #default="{ item: card }">
            <!-- 新建简历入口项 -->
            <CreateResume v-if="card.type === 'create'" />
            <!-- 简历项 -->
            <ResumeCardContainer v-else :item="card.item" @click="handleEdit(card.index)">
              <div class="truncate text-base font-black text-sf-text">
                {{ getResumeTitle(card.item) }}
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
                {{ getResumeTitle(item) }}
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
        <div class="flex flex-1 flex-col items-center justify-end">
          <SfFooter />
        </div>
      </div>
    </SfScrollbar>
  </div>
</template>

<style lang="scss" scoped></style>
