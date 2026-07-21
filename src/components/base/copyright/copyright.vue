<script setup>
import { ref } from 'vue'

const visible = ref(false)
const handleClick = () => {
  visible.value = true
}
const currentYear = new Date().getFullYear()
</script>

<template>
  <div @click="handleClick">
    <slot>
      <button type="button" class="border-0 bg-transparent p-0 text-[15px] font-extrabold">
        版权声明
      </button>
    </slot>
    <SfModal v-if="visible" v-model="visible" title="版权声明" width="500px">
      <SfScrollbar height="400px">
        <div class="w-[500px] space-y-4 p-6 text-sm leading-relaxed text-sf-text-2">
          <h3 class="text-sf-text-1 text-center text-base font-medium">MIT License</h3>
          <p class="text-center">Copyright &copy; 2020-{{ currentYear }} 小羊</p>
          <p>
            特此免费授予任何获得本软件及相关文档文件（“软件”）副本的人，不受限制地处理本软件的权利，包括但不限于使用、复制、修改、合并、发布、分发、再许可和/或出售本软件的副本，并允许向其提供本软件的人这样做，但须符合以下条件：
          </p>
          <p>上述版权声明和本许可声明应包含在本软件的所有副本或主要部分中。</p>
          <p>
            本软件按“原样”提供，没有任何形式的明示或暗示的保证，包括但不限于对适销性、特定用途的适用性和非侵权性的保证。在任何情况下，作者或版权持有人均不对因本软件或本软件的使用或其他交易而产生、引起或与之相关的任何索赔、损害或其他责任负责，无论是合同诉讼、侵权行为还是其他诉讼。
          </p>
        </div>
      </SfScrollbar>
    </SfModal>
  </div>
</template>

<style lang="scss" scoped></style>
