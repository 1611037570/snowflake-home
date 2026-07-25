<template>
  <!-- 外层容器：整合布局与分割线，减少一层嵌套 -->
  <div
    class="flex items-center justify-between rounded-xl bg-sf-primary px-3 py-2 text-sf-text"
    :class="{ 'border-b border-gray-200': divider }"
  >
    <div class="flex flex-col gap-0.5">
      <div class="text-[14px] font-medium">{{ title }}</div>
      <div class="text-[12px] text-sf-text-3" v-if="info">{{ info }}</div>
    </div>
    <el-switch v-if="type === 'switch'" v-model="modeValue" @change="handleChange" />
    <el-button v-else-if="type === 'button'" @click="handleClick" type="danger">{{
      modeValue
    }}</el-button>
    <el-select
      v-else-if="type === 'select'"
      @change="handleChange"
      v-model="modeValue"
      :placeholder="config?.placeholder || '请选择'"
      :style="{ width: config?.width || '200px' }"
    >
      <el-option
        v-for="item in config?.list || []"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>
    <el-time-picker
      v-else-if="type === 'time'"
      style="width: 120px"
      @change="handleChange"
      v-model="modeValue"
      format="HH:mm"
      value-format="HH:mm"
      placeholder="选择时间"
    ></el-time-picker>
  </div>
</template>

<script setup>
defineOptions({ name: 'SfSetItem' })

const emits = defineEmits(['onChange', 'onClick'])
const props = defineProps({
  title: {
    type: String,
    default: '标题',
  },
  info: {
    type: String,
    default: null,
  },
  type: {
    type: String,
    default: 'switch',
    validator: (val) => ['switch', 'button', 'select', 'time'].includes(val),
  },
  config: {
    type: Object,
    default: () => ({}),
  },
  divider: {
    type: Boolean,
    default: true,
  },
})
const modeValue = defineModel()

const handleChange = (val) => {
  console.log('val', val)

  emits('onChange', val, props.type)
}
const handleClick = (val) => {
  console.log('val', val)
  emits('onClick', val, props.type)
}
</script>
