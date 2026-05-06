<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
function handleCreate() {
  router.push(`/resumeMain?type=template&t=${Date.now()}`)
}
</script>

<template>
  <div class="relative flex w-full flex-1 flex-col items-center justify-center">
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
        class="relative h-full w-full overflow-hidden rounded-[34px_34px_34px_34px] bg-[#c2c966] shadow-[0_30px_80px_rgba(0,0,0,0.2)]"
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
        <i class="absolute top-12 right-6 left-6 h-2 rounded-full bg-[rgba(235,234,203,0.64)]"></i>
        <i
          class="absolute top-[76px] right-6 left-6 h-2 rounded-full bg-[rgba(235,234,203,0.64)]"
        ></i>
      </div>
      <div
        class="absolute top-[50px] right-12 z-1 h-[122px] w-[122px] rotate-12 rounded-xl bg-[#7775b8]"
      >
        <i class="absolute top-12 right-6 left-6 h-2 rounded-full bg-[rgba(235,234,203,0.64)]"></i>
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
        class="absolute right-[-142px] bottom-[126px] z-4 -rotate-12 bg-[#1886a3] p-3 px-[30px] py-4 text-[34px] font-black"
      >
        RESUME DELIVERY
      </div>
      <div class="absolute -top-6 right-[-64px] h-20 w-6 rotate-38 rounded-full bg-[#008bb2]"></div>
      <div class="absolute top-0 right-[-100px] h-24 w-6 rotate-66 rounded-full bg-[#008bb2]"></div>
      <div
        class="absolute top-[48px] right-[-110px] h-24 w-6 rotate-90 rounded-full bg-[#008bb2]"
      ></div>
      <div
        class="absolute top-[98px] right-[-100px] h-22 w-6 rotate-116 rounded-full bg-[#008bb2]"
      ></div>
      <div
        class="absolute top-[136px] right-[-74px] h-20 w-6 rotate-138 rounded-full bg-[#008bb2]"
      ></div>
    </div>

    <div class="relative z-4 flex flex-col items-center gap-2 text-[78px] font-black">
      <div class="text-sf-theme drop-shadow-[0_10px_28px_rgba(0,0,0,0.22)]">找工作</div>
      <div class="text-sf-theme not-italic">从一份好简历开始</div>
      <div class="text-xl font-extrabold text-white">打动HR的专业简历，抓住每一个高薪机会</div>
      <div
        class="mt-3 flex h-[58px] w-[168px] cursor-pointer items-center justify-center rounded-full border-0 bg-sf-theme text-[22px] font-black text-sf-theme-text shadow-lg shadow-sf-theme/25 transition-all duration-200 hover:-translate-y-0.5"
        @click="handleCreate"
      >
        立即制作
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
