<script setup>
import { useResumeStore } from '@/stores'

const resumeStore = useResumeStore()

function handleCreate() {
  resumeStore.addResume()
}
</script>

<template>
  <main
    class="relative flex min-h-screen flex-col overflow-hidden bg-[linear-gradient(90deg,rgba(15,37,60,0.42),rgba(15,37,60,0.18)),linear-gradient(118deg,#194f72_0%,#29377e_48%,#435c80_100%)] text-white before:absolute before:inset-0 before:z-1 before:bg-[rgba(10,28,45,0.46)] before:content-[''] after:absolute after:right-0 after:bottom-0 after:left-0 after:z-1 after:h-[34%] after:bg-[linear-gradient(180deg,transparent,rgba(9,24,40,0.22))] after:content-['']"
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
        <span>直聘简历</span>
      </div>

      <nav class="flex items-center gap-[30px] max-[1180px]:gap-5 max-[900px]:hidden">
        <button
          type="button"
          class="relative border-0 bg-transparent p-0 text-[15px] font-extrabold text-white after:absolute after:right-0 after:bottom-[-10px] after:left-0 after:h-[5px] after:rounded-full after:bg-[#9ef153] after:shadow-[0_0_12px_rgba(158,241,83,0.68)] after:content-['']"
        >
          首页
        </button>
        <button
          type="button"
          class="border-0 bg-transparent p-0 text-[15px] font-extrabold text-white/88"
        >
          简历模板
        </button>
        <button
          type="button"
          class="border-0 bg-transparent p-0 text-[15px] font-extrabold text-white/88"
        >
          简历分析
        </button>
        <button
          type="button"
          class="border-0 bg-transparent p-0 text-[15px] font-extrabold text-white/88"
        >
          我的简历
        </button>
        <button
          type="button"
          class="border-0 bg-transparent p-0 text-[15px] font-extrabold text-white/88"
        >
          发现
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
        class="pointer-events-none absolute top-[14%] left-1/2 z-2 h-[min(650px,47vw)] -translate-x-[36%] opacity-[0.58] max-[900px]:top-[19%] max-[900px]:h-[520px] max-[900px]:w-[650px] max-[900px]:-translate-x-1/2"
      >
        <div
          class="absolute inset-[118px_24px_0_34px] rounded-[34px_34px_8px_8px] bg-[#c2c966] shadow-[0_30px_80px_rgba(0,0,0,0.2)]"
        >
          <div
            class="absolute top-0 right-0 left-0 h-[56%] rounded-[34px_34px_0_0] bg-[#b6bf60] [clip-path:polygon(0_0,50%_72%,100%_0,100%_100%,0_100%)]"
          ></div>
          <div
            class="absolute top-[182px] left-[124px] h-[146px] w-[270px] rounded-2xl bg-[#00a9a4]"
          ></div>
          <div
            class="absolute right-0 bottom-0 left-0 h-[56%] bg-[rgba(222,226,129,0.75)] [clip-path:polygon(0_0,50%_58%,100%_0,100%_100%,0_100%)]"
          ></div>
        </div>

        <div
          class="absolute top-24 left-[45px] z-4 h-[122px] w-[122px] rotate-[-30deg] rounded-xl bg-[#7775b8]"
        >
          <i
            class="absolute top-12 left-8 h-2 w-[70px] rounded-full bg-[rgba(235,234,203,0.64)]"
          ></i>
          <i
            class="absolute top-[76px] left-8 h-2 w-[70px] rounded-full bg-[rgba(235,234,203,0.64)]"
          ></i>
        </div>
        <div
          class="absolute top-[190px] right-1 z-4 h-[122px] w-[122px] rotate-12 rounded-xl bg-[#7775b8]"
        >
          <i
            class="absolute top-12 left-8 h-2 w-[70px] rounded-full bg-[rgba(235,234,203,0.64)]"
          ></i>
          <i
            class="absolute top-[76px] left-8 h-2 w-[70px] rounded-full bg-[rgba(235,234,203,0.64)]"
          ></i>
        </div>

        <div
          class="absolute top-[116px] left-[305px] z-3 flex h-[92px] w-[360px] rotate-[-5deg] items-center gap-[18px] rounded-[18px] bg-[#e9ecef] px-7 text-[38px] font-black text-[#4d5968]"
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
          class="absolute top-[218px] right-[-64px] h-24 w-[22px] rotate-[42deg] rounded-full bg-[#008bb2]"
        ></div>
        <div
          class="absolute top-[252px] right-[-100px] h-[82px] w-5 rotate-[74deg] rounded-full bg-[#008bb2]"
        ></div>
      </div>

      <div class="relative z-4 flex w-[min(1080px,100%)] flex-col items-center text-center">
        <h1
          class="m-0 flex flex-col gap-[clamp(22px,2.7vw,34px)] text-[clamp(64px,7.2vw,128px)] leading-[0.92] font-black max-[900px]:text-[clamp(48px,13vw,72px)]"
        >
          <span class="text-white drop-shadow-[0_10px_28px_rgba(0,0,0,0.22)]">找工作</span>
          <strong
            class="bg-[linear-gradient(90deg,#ffe5f0_0%,#fff7b7_47%,#dfff63_100%)] bg-clip-text text-transparent not-italic"
          >
            从一份好简历开始
          </strong>
        </h1>
        <p
          class="mt-11 text-[clamp(17px,1.25vw,23px)] font-extrabold text-white/86 max-[900px]:mt-[30px]"
        >
          打动HR的专业简历，抓住每一个高薪机会
        </p>
        <div
          class="mt-[68px] flex items-center gap-8 max-[900px]:mt-11 max-[900px]:flex-col max-[900px]:gap-[18px]"
        >
          <button
            type="button"
            class="h-[68px] min-w-[168px] cursor-pointer rounded-full border-0 bg-[linear-gradient(90deg,#bdff62,#27dccb)] px-[34px] text-[22px] font-black text-[#081716] shadow-[0_18px_42px_rgba(50,219,185,0.22)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 max-[900px]:w-[188px]"
            @click="handleCreate"
          >
            立即制作
          </button>
        </div>
      </div>
    </section>
  </main>
</template>

<style lang="scss" scoped></style>
