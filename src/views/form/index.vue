<script setup>
const form = [
  {
    type: 'object',
    component: 'setItem',
    data: {
      key: 'title',
      name: 'modelValue',
      onClick: () => {
        console.log('点击了导入按钮')
      },
    },
    props: {
      title: '快捷方式导入',
      info: '仅导入所有快捷方式',
      modelValue: '导入',
      type: 'button',
    },
  },
  // {
  //   type: 'object',
  //   component: 'input',
  //   props: {
  //     name: '对象名称',
  //     age: '年龄',
  //   },
  // },
]
</script>

<template>
  <SfViewContainer>
    <SfDynamicForm :form="form" class="w-100"></SfDynamicForm>
  </SfViewContainer>
</template>

<style lang="scss" scoped></style>
