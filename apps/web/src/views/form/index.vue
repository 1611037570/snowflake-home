<script setup>
const form = [
  {
    component: "education",
    type: "array",
    data: [
      {
        data: [
          {
            path: ["education", "?", "school"],
            key: "school",
          },
          {
            path: ["education", "?", "major"],
            key: "major",
          },
          {
            path: ["education", "?", "degree"],
            key: "degree",
          },
          {
            path: ["education", "?", "time"],
            key: "time",
          },
          {
            path: ["education", "?", "experience"],
            key: "experience",
          },
        ],
      },
    ],
  },
  {
    disable: true,
    type: "object",
    label: "姓名",
    component: "input",
    data: {
      path: ["user", "name"],
      key: "modelValue",
    },
    props: {
      placeholder: "请输入姓名",
    },
  },
  {
    type: "object",
    disable: false,
    label: "生日",
    component: "datePicker",
    data: [
      {
        path: ["user", "birthday"],
        key: "modelValue",
      },
    ],
  },
  {
    disable: true,
    type: "object",
    label: "参加工作时间",
    component: "datePicker",
    data: {
      path: ["user", "workTime"],
      key: "modelValue",
    },
    props: {
      placeholder: "请输入参加工作时间",
      type: "month",
    },
  },
  {
    disable: true,
    type: "object",
    label: "性别",
    component: "select",
    data: {
      path: ["user", "sex"],
      key: "modelValue",
    },
    props: {
      placeholder: "请输入性别",
      clearable: true,
      list: [
        {
          name: "男",
          value: "男",
        },
        {
          name: "女",
          value: "女",
        },
      ],
    },
  },
  // 专业技能
  {
    component: "collapse",
    disable: true,
    props: {
      modelValue: ["1"],
      accordion: true,
      title: "123dddd",
    },
    children: [
      // 这里的内容会被放入 collapse 的默认插槽中
      {
        component: "collapseItem",
        props: {
          title: "基础信息",
          name: "1",
        },
        children: [
          {
            type: "object",
            component: "wangEditor",
            data: {
              path: ["nested", "field2"],
              key: "modelValue",
            },
          },
        ],
      },
    ],
  },
];
const data = ref({});
</script>

<template>
  <SfViewContainer>
    <SfDynamicForm :form="form" :data="data" class="w-100"></SfDynamicForm>
    {{ data }}
  </SfViewContainer>
</template>

<style lang="scss" scoped></style>
