<script setup>
import { useFileDialog } from "@/hooks";
import { useHomeStore } from "@/stores";
import { storeToRefs } from "pinia";
import { VueDraggable } from "vue-draggable-plus";
import SfMixImg from "@/components/business/mixImg/mixImg.vue";
import AddShortcut from "./addShortcut.vue";
import { ElMessage } from "element-plus";
const { click } = useFileDialog();
const shortcutStore = useHomeStore();
const { shortcutList } = storeToRefs(shortcutStore);
const searchStore = useHomeStore();
const { openMode } = storeToRefs(searchStore);

// 拖拽状态
const isDrag = ref(false);
// 缩放比例
const zoom = ref(1);
const onStart = (e) => {
  isDrag.value = true;
  console.log("start", e);
};

const onEnd = (e) => {
  isDrag.value = false;
  console.log("onEnd", e);
};

const onUpdate = () => {
  console.log("update");
};

const handleAdd = () => {
  addVisible.value = true;
  return;
};
const addVisible = ref(false);

const menuList = computed(() => [
  {
    name: "添加",
    fn: () => {},
  },
  {
    name: "导入",

    fn: () => {
      click({
        accept: ".json",
        maxCount: 1,
        duplicate: true,
      }).then((res) => {
        console.log(res);
      });
    },
  },
]);

// SfApp 组件逻辑迁移
const handleAppClick = (value: string) => {
  window.open(value, openMode.value);
};

const getAppMenuList = (type: string, index: number, item: any) => {
  if (type === "custom") return [];
  return [
    {
      name: "重新获取图标",
      fn: () => {},
    },
    {
      name: "分享",
      fn: () => {
        const data: any = {
          ...shortcutList.value[index],
        };
        // 需要过滤掉id
        delete data.id;
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], {
          type: "application/json; charset=utf-8",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = data.name + "——快捷方式分享.json";
        a.click();
        // 清理资源
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      },
    },
    {
      name: item.top ? "取消固定" : "固定到搜索栏",
      fn: () => {
        console.log("固定");
        if (index === -1) return;
        shortcutList.value[index].top = !item.top;
        ElMessage.success(item.top ? "取消固定成功" : "固定成功");
      },
    },
    {
      name: "删除",
      fn: () => {
        console.log("删除");
        if (index === -1) return;
        shortcutList.value.splice(index, 1);
        ElMessage.success("删除成功");
      },
    },
  ];
};

// SfApp 组件默认参数
const sfAppDefaults = {
  size: 80,
  iconSize: 40,
  name: "",
  type: "default",
  index: -1,
  value: "",
};
</script>

<template>
  <div>
    <SfModal v-model="addVisible">
      <AddShortcut />
    </SfModal>
    <VueDraggable
      :style="{
        zoom: zoom,
      }"
      class="fixed top-41 left-1/2 z-10 mx-auto grid w-[680px] -translate-x-1/2 transform grid-cols-5 gap-5"
      v-model="shortcutList"
      ghostClass="bg-amber-500"
      @start="onStart"
      @update="onUpdate"
      @end="onEnd"
    >
      <SfMenu
        v-for="(item, index) in shortcutList"
        :key="item.id"
        :list="getAppMenuList('default', index, item)"
        class="flex cursor-pointer flex-col items-center justify-center"
        @click="handleAppClick(item.url)"
      >
        <div
          class="flex-c rounded-xl bg-sf-primary"
          :class="{ 'shake-element': isDrag }"
          :style="{
            width: sfAppDefaults.size + 'px',
            height: sfAppDefaults.size + 'px',
          }"
        >
          <SfMixImg :type="item.imgType" :value="item.imgValue" :size="sfAppDefaults.iconSize" />
        </div>
        <div class="flex h-6 items-center justify-center truncate text-sm text-sf-primary">
          {{ item.name }}
        </div>
      </SfMenu>
      <SfMenu :list="menuList">
        <div
          class="flex-c cursor-pointer flex-col items-center justify-center"
          :class="{ 'shake-element': isDrag }"
          @click="handleAdd"
        >
          <div
            class="flex-c rounded-xl bg-sf-primary"
            :style="{
              width: sfAppDefaults.size + 'px',
              height: sfAppDefaults.size + 'px',
            }"
          >
            <SfMixImg type="custom" value="ic:round-add" :size="sfAppDefaults.iconSize" />
          </div>
          <div class="flex h-6 items-center justify-center truncate text-sm text-sf-primary">
            添加
          </div>
        </div>
      </SfMenu>
    </VueDraggable>
  </div>
</template>
<style scoped>
@keyframes tiltShake {
  0%,
  100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-3deg);
  }
  75% {
    transform: rotate(3deg);
  }
}

.shake-element {
  animation: tiltShake 0.4s linear infinite;
  transform-origin: center;
}
</style>
