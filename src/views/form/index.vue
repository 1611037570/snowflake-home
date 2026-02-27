<script setup>
import dayjs from 'dayjs'

const form = [
  {
    type: 'object',
    label: '姓名',
    component: 'input',
    data: {
      path: ['user', 'name'],
      key: 'modelValue',
    },
    props: {
      placeholder: '请输入姓名',
    },
  },
  {
    type: 'object',
    label: '生日',
    component: 'datePicker',
    data: {
      path: ['user', 'birthday'],
      key: 'modelValue',
    },
    props: {
      placeholder: '请输入生日',
      type: 'month',
    },
  },
  {
    type: 'object',
    label: '电话',
    component: 'input',
    data: {
      path: ['user', 'phone'],
      key: 'modelValue',
    },
    props: {
      placeholder: '请输入电话',
    },
  },
  {
    type: 'object',
    label: '邮箱',
    component: 'input',
    data: {
      path: ['user', 'email'],
      key: 'modelValue',
    },
    props: {
      placeholder: '请输入邮箱',
    },
  },
  {
    type: 'object',
    label: '参加工作时间',
    component: 'datePicker',
    data: {
      path: ['user', 'workTime'],
      key: 'modelValue',
    },
    props: {
      placeholder: '请输入参加工作时间',
      type: 'month',
    },
  },
  {
    type: 'object',
    label: '性别',
    component: 'select',
    data: {
      path: ['user', 'sex'],
      key: 'modelValue',
    },
    props: {
      placeholder: '请输入性别',
      clearable: true,
      list: [
        {
          name: '男',
          value: '男',
        },
        {
          name: '女',
          value: '女',
        },
      ],
    },
  },
  // 专业技能
  {
    component: 'collapse',
    props: {
      modelValue: ['1'],
      accordion: true,
      title: '123dddd',
    },
    children: [
      // 这里的内容会被放入 collapse 的默认插槽中
      {
        component: 'collapseItem',
        props: {
          title: '基础信息',
          name: '1',
        },
        children: [
          {
            type: 'object',
            component: 'wangEdit',
            data: {
              path: ['nested', 'field2'],
              key: 'modelValue',
            },
          },
        ],
      },
    ],
  },
]
const data = ref({})

// 计算年龄
const age = computed(() => {
  const birthday = data.value.user?.birthday
  if (!birthday) return
  return dayjs().diff(dayjs(birthday), 'year')
})

// 计算工作年限（规则：不足1年按0年算，满5个月不满1年按1年算，以此类推）
const workYears = computed(() => {
  // 2. 解构并校验核心数据：获取用户入职时间，无则返回0（避免返回undefined导致后续渲染问题）
  const workTime = data.value.user?.workTime
  if (!workTime) return 0

  // 3. 校验日期有效性：避免无效日期（如格式错误、空字符串）导致dayjs计算异常
  const startDate = dayjs(workTime)
  if (!startDate.isValid()) return 0

  // 4. 获取当前日期（统一时间基准，避免重复调用dayjs()）
  const currentDate = dayjs()

  // 5. 计算入职时间与当前时间的月份差（处理未来日期：若入职时间在未来，月份差为负，返回0）
  const diffInMonths = currentDate.diff(startDate, 'month')
  if (diffInMonths < 0) return 0

  // 6. 计算完整年数和剩余月份
  const fullYears = Math.floor(diffInMonths / 12) // 完整的年数（向下取整）
  const remainingMonths = diffInMonths % 12 // 剩余不足1年的月份

  // 7. 业务规则：剩余月份≥5个月则进1年，否则取完整年数
  return remainingMonths >= 5 ? fullYears + 1 : fullYears
})
</script>

<template>
  <SfViewContainer>
    <SfDynamicForm :form="form" :data="data" class="w-100"></SfDynamicForm>

    <div class="mt-6 rounded-lg border border-gray-100 bg-gray-50 p-4 shadow-sm">
      <div class="mb-3 border-b pb-2 text-base font-bold text-gray-700">计算结果</div>
      <div class="grid grid-cols-2 gap-4">
        <div class="flex items-center space-x-2">
          <span class="text-gray-500">当前年龄:</span>
          <span class="text-lg font-bold text-blue-600">{{ age }}</span>
          <span class="text-sm text-gray-400">岁</span>
        </div>
        <div class="flex items-center space-x-2">
          <span class="text-gray-500">工作年限:</span>
          <span class="text-lg font-bold text-green-600">{{ workYears }}</span>
          <span class="text-sm text-gray-400">年</span>
        </div>
      </div>
    </div>
  </SfViewContainer>
</template>

<style lang="scss" scoped></style>
