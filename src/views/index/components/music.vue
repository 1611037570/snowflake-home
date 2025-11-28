<script setup>
import { ref } from 'vue'
const protagonist = import('@/assets/audios/protagonist.mp3')

// 音乐播放状态管理
const isPlaying = ref(false)
const audioPlayer = ref(null)
const audioUrl = ref('')
// 加载音频文件
protagonist.then((module) => {
  console.log('音频资源加载成功:', module.default)
  audioUrl.value = module.default
})

const togglePlay = () => {
  if (isPlaying.value) {
    try {
      audioPlayer.value.pause()
      // 关闭静音
      isPlaying.value = false
    } catch (err) {
      console.warn('音频暂停失败:', err)
    }
  } else {
    // play()返回Promise，需要正确处理
    audioPlayer.value
      .play()
      .then(() => {
        isPlaying.value = true
        console.log('音频开始播放')
      })
      .catch((err) => {
        console.warn('音频播放失败:', err)
        isPlaying.value = false
      })
  }
}
</script>
<!-- https://kaifa.baidu.com/ -->
<template>
  <audio
    v-if="audioUrl"
    ref="audioPlayer"
    :src="audioUrl"
    preload="auto"
    loop
    autoplay
    @loadeddata="onAudioLoaded"
  ></audio>
  <SfTooltip :content="isPlaying ? '暂停' : '播放'" placement="top">
    <div
      @click="togglePlay"
      class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-sf-base p-2 backdrop-blur-sm"
    >
      <BaseIcon
        size="7"
        :icon="isPlaying ? 'lucide:pause' : 'lucide:play'"
        class="text-sf-primary transition-colors duration-300 hover:text-sf-theme"
        :class="isPlaying ? 'animate-spin' : ''"
      />
    </div>
  </SfTooltip>
</template>

<style scoped></style>
