<script setup>
defineProps({
  data: {
    type: Object,
    default: () => ({
      name: '',
      sex: '',
      age: '',
      exp: '',
      phone: '',
      email: '',
      link: [],
    }),
  },
})
</script>

<template>
  <div class="mr-3 mb-3 flex items-center gap-4">
    <span class="text-2xl font-bold"> {{ data.name }} </span>
    <span> {{ data.sex }} </span> <span> {{ data.age }}岁 </span><span> {{ data.exp }}年经验 </span>
  </div>
  <div class="mb-3 flex flex-col gap-3">
    <div class="flex gap-3">
      <span>电话：{{ data.phone }} </span> <span>邮箱：{{ data.email }}</span>
    </div>
    <template v-if="data.link && data.link.length">
      <div class="flex items-center text-sm" v-for="(item, index) in data.link" :key="index">
        <div>{{ item.name }}：</div>
        <div>{{ item.url }}</div>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped></style>
