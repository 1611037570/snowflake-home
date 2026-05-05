<script setup>
import { useResumeStore } from '@/stores'

const resumeStore = useResumeStore()
const navList = ['首页', '简历模板', '简历分析', '我的简历', '发现']
const activeNavIndex = ref(0)

function handleCreate() {
  resumeStore.addResume()
}
</script>

<template>
  <main
    class="relative flex min-h-screen w-full flex-col bg-[linear-gradient(90deg,rgba(15,37,60,0.42),rgba(15,37,60,0.18)),linear-gradient(118deg,#194f72_0%,#29377e_48%,#435c80_100%)] text-white before:absolute before:inset-0 before:z-1 before:bg-[rgba(10,28,45,0.46)]"
  >
    <header
      class="relative z-5 mx-auto flex h-16 w-full max-w-[1280px] items-center gap-6 font-extrabold"
    >
      <div class="flex shrink-0 items-center gap-2.5 text-[17px] whitespace-nowrap">
        <div class="relative h-[22px] w-[34px]">
          <div
            class="absolute top-0.5 left-0 h-[18px] w-[22px] rounded-[8px_2px_8px_2px] bg-[linear-gradient(135deg,#39f6a2,#16cfd0)]"
          ></div>
          <div
            class="absolute top-0.5 right-0 h-[18px] w-[22px] skew-x-[-18deg] rounded-[8px_2px_8px_2px] bg-[linear-gradient(135deg,#15d1dc,#8059ff)]"
          ></div>
        </div>
        <span>小羊简历</span>
      </div>

      <nav class="flex items-center gap-[30px] max-[1180px]:gap-5 max-[900px]:hidden">
        <button
          v-for="(item, index) in navList"
          :key="item"
          type="button"
          @click="activeNavIndex = index"
          class="cursor-pointer border-0 bg-transparent p-0 text-[15px] font-extrabold"
          :class="
            index === activeNavIndex
              ? `relative text-white after:absolute after:right-0 after:bottom-[-10px] after:left-0 after:h-[5px] after:rounded-full after:bg-[#9ef153] after:shadow-[0_0_12px_rgba(158,241,83,0.68)] after:content-['']`
              : 'text-white/88'
          "
        >
          {{ item }}
        </button>
      </nav>

      <div class="ml-auto flex items-center gap-[18px] max-[900px]:hidden">
        <button
          type="button"
          class="h-8 rounded-full border-2 border-[rgba(166,242,83,0.88)] bg-[rgba(30,83,91,0.22)] px-[18px] text-sm font-black text-[#b8ff65]"
        >
          AI简历助手
        </button>
        <button
          type="button"
          class="border-0 bg-transparent p-0 text-[15px] font-extrabold text-white/88 max-[1180px]:hidden"
        >
          关于我们
        </button>
      </div>
    </header>

    <section class="relative flex w-full flex-1 items-center justify-center">
      <div class="absolute bottom-0 left-0 z-2 h-[600px]">
        <div
          class="absolute top-15 bottom-2 left-[100px] w-[140px] rounded-[0_18px_18px_0] bg-[rgba(47,60,70,1)] shadow-[22px_28px_52px_rgba(0,0,0,0.22)]"
        ></div>
        <div class="absolute top-20 bottom-6 left-20 w-[130px] rounded-xl bg-sf-theme-hover"></div>
        <div
          class="absolute bottom-0 left-0 flex h-[550px] w-[180px] items-end justify-center rounded-[0_18px_18px_0] bg-[#75878a] pb-[120px] shadow-[22px_28px_52px_rgba(0,0,0,0.22)]"
        ></div>
        <div
          class="absolute right-0 bottom-[150px] left-0 z-1 flex h-[78px] w-[210px] items-center justify-end bg-[linear-gradient(90deg,#24324b,#00c5b8)] p-3 text-[34px] font-black"
        >
          RESUME
        </div>
      </div>

      <div
        aria-hidden="true"
        class="absolute top-1/2 left-1/2 z-2 h-[526px] w-[736px] -translate-x-1/2 -translate-y-1/2 transform opacity-[0.58]"
      >
        <div
          class="relative h-full w-full overflow-hidden rounded-[34px_34px_8px_8px] bg-[#c2c966] shadow-[0_30px_80px_rgba(0,0,0,0.2)]"
        >
          <div
            class="absolute top-[182px] left-[124px] h-[146px] w-[270px] rounded-2xl bg-[#00a9a4]"
          ></div>

          <div
            class="absolute right-8 bottom-0 left-8 z-3 h-[420px] bg-[rgba(222,226,129,1)] [clip-path:polygon(0_0,50%_58%,100%_0,100%_100%,0_100%)]"
          ></div>
          <div class="absolute right-0 bottom-0 h-[420px] w-[33px] bg-[rgba(222,226,129,1)]"></div>
          <div class="absolute bottom-0 left-0 h-[420px] w-[33px] bg-[rgba(222,226,129,1)]"></div>
        </div>

        <div
          class="absolute -top-16 left-[45px] z-4 h-[122px] w-[122px] rotate-[-30deg] rounded-xl bg-[#7775b8]"
        >
          <i
            class="absolute top-12 right-6 left-6 h-2 rounded-full bg-[rgba(235,234,203,0.64)]"
          ></i>
          <i
            class="absolute top-[76px] right-6 left-6 h-2 rounded-full bg-[rgba(235,234,203,0.64)]"
          ></i>
        </div>
        <div
          class="absolute top-[120px] right-22 z-1 h-[122px] w-[122px] rotate-12 rounded-xl bg-[#7775b8]"
        >
          <i
            class="absolute top-12 right-6 left-6 h-2 rounded-full bg-[rgba(235,234,203,0.64)]"
          ></i>
          <i
            class="absolute top-[76px] right-6 left-6 h-2 rounded-full bg-[rgba(235,234,203,0.64)]"
          ></i>
        </div>

        <div
          class="absolute top-[16px] left-1/2 z-3 flex h-[92px] -translate-x-1/2 rotate-[-5deg] items-center gap-[18px] rounded-[18px] bg-[#e9ecef] px-7 text-[38px] font-black text-[#4d5968]"
        >
          <span>MESSAGE</span>
          <SfIcon icon="lucide:check" size="7" class="text-[#119aa5]" />
        </div>
        <div
          class="absolute right-[-142px] bottom-[126px] z-4 w-[370px] rotate-[-12deg] bg-[#1886a3] px-[30px] py-4 text-[34px] font-black"
        >
          JIANLI TOUDI
        </div>
        <div
          class="absolute -top-10 right-[-64px] h-22 w-6 rotate-38 rounded-full bg-[#008bb2]"
        ></div>
        <div
          class="absolute top-[0px] right-[-100px] h-24 w-6 rotate-72 rounded-full bg-[#008bb2]"
        ></div>
        <div
          class="absolute top-[48px] right-[-110px] h-24 w-6 rotate-90 rounded-full bg-[#008bb2]"
        ></div>
        <div
          class="absolute top-[100px] right-[-100px] h-24 w-6 rotate-116 rounded-full bg-[#008bb2]"
        ></div>
        <div
          class="absolute top-[140px] right-[-74px] h-22 w-6 rotate-128 rounded-full bg-[#008bb2]"
        ></div>
      </div>

      <div class="relative z-4 flex flex-col items-center gap-2 text-[78px] font-black">
        <div class="text-white drop-shadow-[0_10px_28px_rgba(0,0,0,0.22)]">找工作</div>
        <div
          class="bg-[linear-gradient(90deg,#ffe5f0_0%,#fff7b7_47%,#dfff63_100%)] bg-clip-text text-transparent not-italic"
        >
          从一份好简历开始
        </div>
        <div class="text-xl font-extrabold text-white/86">打动HR的专业简历，抓住每一个高薪机会</div>
        <div
          class="flex h-[58px] w-[168px] cursor-pointer items-center justify-center rounded-full border-0 bg-[linear-gradient(90deg,#bdff62,#27dccb)] text-[22px] font-black text-[#081716] shadow-[0_18px_42px_rgba(50,219,185,0.22)] transition-all duration-200 hover:-translate-y-0.5 max-[900px]:w-[188px]"
          @click="handleCreate"
        >
          立即制作
        </div>
      </div>
    </section>
  </main>
</template>

<style lang="scss" scoped></style>
