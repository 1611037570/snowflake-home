<script setup lang="ts">
const handleAgree = () => {
  localStorage.setItem('agree', 'true')
  window.location.reload()
}
const handleDisagree = () => {
  localStorage.setItem('agree', 'false')
  window.location.reload()
}
</script>

<template>
  <div>
    <div class="">服务条款及隐私政策提示</div>
    <div class="flex w-full flex-wrap">
      感谢使用本应用。使用前请阅读
      <template v-for="item in 2" :key="item">
        <span style="color: red; text-decoration: underline"> 《{{ item }}》 </span>
      </template>
      相关条款：点击 “同意”
      即表示您接受条款，我们将严守隐私政策保护您的个人信息；若暂不同意，将无法继续使用相关功能，敬请谅解。
    </div>
    <div>
      <el-button type="danger" @click="handleDisagree">拒绝</el-button>
      <el-button type="primary" @click="handleAgree">同意</el-button>
    </div>
  </div>
</template>
<style lang="scss" scoped></style>
