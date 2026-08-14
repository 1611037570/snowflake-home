<template>
  <SfModal v-if="loginVisible" v-model="loginVisible">
    <PrivacyAuthorization />
  </SfModal>
</template>

<script setup>
import { useUserStore } from "@/stores";
import { storeToRefs } from "pinia";
import PrivacyAuthorization from "./privacyAuthorization.vue";

defineOptions({ name: "SfLogin" });

const userStore = useUserStore();
const { loginVisible } = storeToRefs(userStore);
</script>

<style lang="scss" scoped></style>
