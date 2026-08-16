<script setup>
import { ref } from "vue";
const musicList = [
  {
    name: "送你一朵小红花(Live)",
    singer: "易烊千玺",
    songName: "送你一朵小红花(Live)-易烊千玺.m4a",
    url: import("@/assets/audios/送你一朵小红花(Live)-易烊千玺.m4a"),
    lrc: import("@/assets/audios/送你一朵小红花(Live)-易烊千玺.lrc?raw"),
    img: import("@/assets/images/audios/送你一朵小红花(Live)-易烊千玺.webp"),
  },
  {
    name: "主角",
    singer: "马里奥",
    songName: "主角-马里奥.aac",
    url: import("@/assets/audios/主角-马里奥.aac"),
    lrc: import("@/assets/audios/主角-马里奥.lrc?raw"),
    img: import("@/assets/images/audios/主角-马里奥.webp"),
  },
  {
    name: "夜空最亮的星",
    singer: "邓紫棋",
    songName: "夜空最亮的星-邓紫棋.m4a",
    url: import("@/assets/audios/夜空最亮的星-邓紫棋.m4a"),
    lrc: import("@/assets/audios/夜空最亮的星-邓紫棋.lrc?raw"),
    img: import("@/assets/images/audios/夜空最亮的星-邓紫棋.webp"),
  },
  {
    name: "骄傲(Live)",
    singer: "王源&陈芃瑄",
    songName: "骄傲(Live)-王源&陈芃瑄.m4a",
    url: import("@/assets/audios/骄傲(Live)-王源&陈芃瑄.m4a"),
    lrc: import("@/assets/audios/骄傲(Live)-王源&陈芃瑄.lrc?raw"),
    img: import("@/assets/images/audios/骄傲(Live)-王源&陈芃瑄.webp"),
  },
];
const currentIndex = ref(0);
const loadAudio = async (index) => {
  currentIndex.value = index;
  const audio = musicList[index];
  audio.url.then((module) => {
    console.log("音频资源加载成功:", module.default);
    audioUrl.value = module.default;
  });
  audio.lrc.then((module) => {
    console.log("歌词资源加载成功:", module.default);
    audioLrc.value = module.default;
  });
  audio.img.then((module) => {
    console.log("图片资源加载成功:", module.default);
    audioImg.value = module.default;
  });
};
// 更换当前歌曲
const changeCurrentMusic = () => {
  const index = currentIndex.value === musicList.length - 1 ? 0 : currentIndex.value + 1;
  loadAudio(index);
};
const currentMusic = computed(() => musicList[currentIndex.value]);
loadAudio(currentIndex.value);
// 音乐播放状态管理
const isPlaying = ref(false);
const audioPlayer = ref(null);
const audioUrl = ref("");
const audioLrc = ref("");
const audioImg = ref("");
// 加载音频文件
const togglePlay = () => {
  if (isPlaying.value) {
    try {
      audioPlayer.value.pause();
    } catch (err) {
      console.warn("音频暂停失败:", err);
    }
  } else {
    console.log("尝试播放音频", audioPlayer.value);
    audioPlayer.value
      .play()
      .then(() => {
        console.log("音频开始播放");
      })
      .catch((err) => {
        console.warn("音频播放失败:", err);
      });
  }
};
async function downloadMusic() {
  const audio = document.createElement("a");
  audio.href = audioUrl.value;
  audio.download = currentMusic.value.songName;
  document.body.appendChild(audio);
  audio.click();
  document.body.removeChild(audio);
}
const list = computed(() => {
  const res = [
    {
      name: currentMusic.value.name + " - " + currentMusic.value.singer,
      hover: false,
      active: true,
    },
    {
      name: isPlaying.value ? "暂停播放" : "开始播放",
      icon: isPlaying.value ? "lucide:pause" : "lucide:play",
      fn: togglePlay,
    },
    {
      name: "换一首",
      icon: "tabler:switch-3",
      fn: changeCurrentMusic,
    },
    {
      name: "下载",
      icon: "material-symbols:download",
      fn: downloadMusic,
    },
  ];
  return res;
});
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
  <SfDropdown>
    <SfIcon size="8" icon="majesticons:music" class="rounded-full text-sf-base" />
    <template #dropdown>
      <div class="w-[230px] p-3">
        <div
          class="mb-2 h-[200px] w-[200px] overflow-hidden rounded-full border-24 border-sf-theme-2"
        >
          <SfImg
            :src="audioImg"
            class="h-full w-full object-cover"
            :style="{
              animation: isPlaying ? 'spin 5s linear infinite' : 'none',
            }"
          />
        </div>
        <SfList class="w-[200px]" :list="list"> </SfList>
      </div>
    </template>
  </SfDropdown>
</template>

<style scoped></style>
