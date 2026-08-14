import { defineStore } from "pinia";
import { ref } from "vue";

export const usePasswordStore = defineStore(
  "password",
  () => {
    // 是否在home页显示密码弹窗
    const homeModalVisible = ref(false);
    // 密码列表
    const passwordList = ref([]);
    // 是否明文显示密码
    const showPassword = ref(false);

    return { homeModalVisible, passwordList, showPassword };
  },
  {
    persist: {
      storage: localStorage,
    },
  },
);
