<script setup>
import { ref } from 'vue'
const musicList = [
  {
    name: '主角',
    singer: '马里奥',
    songName: 'protagonist.mp3',
    url: import('@/assets/audios/protagonist.mp3'),
  },
  {
    name: '送你一朵小红花(Live)',
    singer: '易烊千玺',
    songName: 'ALittleRedFlower.m4a',
    url: import('@/assets/audios/ALittleRedFlower.m4a'),
  },
]
const currentIndex = ref(0)
const loadAudio = (index) => {
  currentIndex.value = index
  const audio = musicList[index]
  audio.url.then((module) => {
    console.log('音频资源加载成功:', module.default)
    audioUrl.value = module.default
  })
}
// 更换当前歌曲
const changeCurrentMusic = () => {
  const index = currentIndex.value ? 0 : 1
  loadAudio(index)
}
const currentMusic = computed(() => musicList[currentIndex.value])
loadAudio(currentIndex.value)
// 音乐播放状态管理
const isPlaying = ref(false)
const audioPlayer = ref(null)
const audioUrl = ref('')
// 加载音频文件
const togglePlay = () => {
  if (isPlaying.value) {
    try {
      audioPlayer.value.pause()
    } catch (err) {
      console.warn('音频暂停失败:', err)
    }
  } else {
    console.log('尝试播放音频', audioPlayer.value)
    audioPlayer.value
      .play()
      .then(() => {
        console.log('音频开始播放')
      })
      .catch((err) => {
        console.warn('音频播放失败:', err)
      })
  }
}
async function downloadMusic() {
  const audio = document.createElement('a')
  audio.href = audioUrl.value
  audio.download = currentMusic.value.songName
  document.body.appendChild(audio)
  audio.click()
  document.body.removeChild(audio)
}
const list = computed(() => {
  const res = [
    {
      name: currentMusic.value.name + ' - ' + currentMusic.value.singer,
      hover: false,
      active: true,
    },
    {
      name: isPlaying.value ? '暂停播放' : '开始播放',
      fn: togglePlay,
    },
    {
      name: '换一首',
      fn: changeCurrentMusic,
    },
    {
      name: '下载',
      fn: downloadMusic,
    },
  ]
  return res
})
</script>
<!-- https://kaifa.baidu.com/ -->
<template>
  <audio
    ref="audioPlayer"
    :src="audioUrl"
    preload="auto"
    autoplay
    @playing="isPlaying = true"
    @pause="isPlaying = false"
    @ended="changeCurrentMusic"
    @loadeddata="onAudioLoaded"
  ></audio>
  <ElDropdown trigger="hover">
    <SfIcon
      @click="togglePlay"
      size="6"
      boxSize="8"
      :icon="isPlaying ? 'lucide:pause' : 'lucide:play'"
      class="rounded-full bg-sf-base text-sf-primary transition-colors duration-300 hover:bg-sf-theme"
      :class="isPlaying ? 'animate-spin' : ''"
    />
    <template #dropdown>
      <el-dropdown-menu>
        <SfList class="w-[200px]" :list="list"> </SfList>
      </el-dropdown-menu>
    </template>
  </ElDropdown>
</template>

<style scoped></style>
