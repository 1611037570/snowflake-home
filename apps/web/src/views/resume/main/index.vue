<template>
  <!-- 第一屏：轻舟简历 - 首页主视觉 -->
  <section id="hero" class="relative flex min-h-screen flex-col overflow-hidden">
    <!-- 主内容区 -->
    <div class="relative z-10 flex flex-1 items-center">
      <div class="mx-auto grid w-full max-w-7xl items-center gap-12 px-6 lg:grid-cols-2">
        <!-- 左侧文案 -->
        <div class="relative text-center lg:text-left">
          <HeroTitle
            title1="轻舟"
            title2="简历"
            subtitle="以此简历 渡万重山"
            gradient="from-sky-500 via-cyan-500 to-teal-500"
          />

          <!-- 主按钮 -->
          <div class="mb-10 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
            <button
              @click="go"
              class="group flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 px-8 py-4 font-medium text-sf-theme-text transition-all hover:shadow-xl"
            >
              免费创建简历
            </button>
          </div>
        </div>

        <!-- 右侧产品预览卡片 -->
        <div class="relative hidden lg:block">
          <!-- 浮动装饰卡片 -->
          <div
            class="absolute -top-4 -left-4 z-20 flex animate-bounce items-center gap-3 rounded-xl bg-sf-primary p-4"
            style="animation-duration: 3s"
          >
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <svg
                class="h-5 w-5 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <div class="text-sm font-medium text-sf-text">AI 优化完成</div>
              <div class="text-xs text-sf-text-3">简历匹配度 +35%</div>
            </div>
          </div>

          <div
            class="absolute -right-2 -bottom-6 z-20 flex items-center gap-3 rounded-xl bg-sf-primary p-4 shadow-xl"
            style="animation: bounce 3.5s infinite 1s"
          >
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100">
              <svg
                class="h-5 w-5 text-sky-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <div class="text-sm font-medium text-sf-text">一键导出 PDF</div>
              <div class="text-xs text-sf-text-3">完美排版无错位</div>
            </div>
          </div>

          <!-- 主预览图 -->
          <div class="border-sf-b relative overflow-hidden rounded-2xl border bg-sf-primary">
            <!-- 浏览器顶栏 -->
            <div class="border-sf-b flex items-center gap-2 border-b bg-sf-bg px-4 py-3">
              <span class="h-3 w-3 rounded-full bg-red-400"></span>
              <span class="h-3 w-3 rounded-full bg-yellow-400"></span>
              <span class="h-3 w-3 rounded-full bg-green-400"></span>
              <div
                class="border-sf-b mx-4 flex h-6 flex-1 items-center rounded-md border bg-sf-primary px-2"
              >
                <div class="text-xs text-sf-text-3">轻舟简历 · 在线编辑</div>
              </div>
            </div>

            <!-- 简历预览内容 -->
            <div class="bg-sf-primary p-6">
              <!-- 简历头部 -->
              <div class="mb-5 flex items-start gap-4">
                <div
                  class="h-16 w-16 flex-shrink-0 rounded-full bg-gradient-to-br from-sky-400 to-cyan-400"
                ></div>
                <div class="flex-1">
                  <div class="mb-2 h-5 w-24 rounded bg-sf-text"></div>
                  <div class="mb-1.5 h-3 w-32 rounded bg-sf-bg-3"></div>
                  <div class="h-3 w-40 rounded bg-sf-bg-2"></div>
                </div>
              </div>

              <!-- 个人简介 -->
              <div class="mb-5">
                <div class="mb-2 h-3 w-16 rounded bg-sf-text"></div>
                <div class="space-y-1.5">
                  <div class="h-2.5 w-full rounded bg-sf-bg-2"></div>
                  <div class="h-2.5 w-11/12 rounded bg-sf-bg-2"></div>
                  <div class="h-2.5 w-10/12 rounded bg-sf-bg-2"></div>
                </div>
              </div>

              <!-- 工作经历 -->
              <div class="mb-5">
                <div class="mb-2 h-3 w-16 rounded bg-sf-text"></div>
                <div class="space-y-3">
                  <div class="flex gap-3">
                    <div class="w-1.5 flex-shrink-0 rounded-full bg-sky-400"></div>
                    <div class="flex-1 space-y-1.5">
                      <div class="flex justify-between">
                        <div class="h-2.5 w-24 rounded bg-sf-bg-3"></div>
                        <div class="h-2 w-16 rounded bg-sf-bg-2"></div>
                      </div>
                      <div class="h-2 w-20 rounded bg-sf-bg-2"></div>
                      <div class="h-2 w-full rounded bg-sf-bg-2"></div>
                      <div class="h-2 w-5/6 rounded bg-sf-bg-2"></div>
                    </div>
                  </div>
                  <div class="flex gap-3">
                    <div class="w-1.5 flex-shrink-0 rounded-full bg-sky-400"></div>
                    <div class="flex-1 space-y-1.5">
                      <div class="flex justify-between">
                        <div class="h-2.5 w-28 rounded bg-sf-bg-3"></div>
                        <div class="h-2 w-16 rounded bg-sf-bg-2"></div>
                      </div>
                      <div class="h-2 w-20 rounded bg-sf-bg-2"></div>
                      <div class="h-2 w-full rounded bg-sf-bg-2"></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 技能标签 -->
              <div class="flex flex-wrap gap-2">
                <span class="rounded-md bg-sky-100 px-2.5 py-1 text-xs text-sky-700">Vue.js</span>
                <span class="rounded-md bg-cyan-100 px-2.5 py-1 text-xs text-cyan-700">React</span>
                <span class="rounded-md bg-teal-100 px-2.5 py-1 text-xs text-teal-700"
                  >TypeScript</span
                >
                <span class="rounded-md bg-sf-bg-2 px-2.5 py-1 text-xs text-sf-text-2"
                  >Node.js</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Guide />
  </section>
  <!-- 第二屏：云帆编辑器 -->
  <section
    id="editor"
    class="relative flex min-h-screen items-center justify-center overflow-hidden py-24"
  >
    <div
      class="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-16 px-6 md:grid-cols-2"
    >
      <div class="text-center lg:text-left">
        <HeroTitle
          title1="云帆"
          title2="编辑器"
          subtitle="借势而行 直济沧海"
          gradient="from-blue-500 to-indigo-500"
        />
      </div>

      <!-- 编辑器示意卡片 -->
      <div class="relative">
        <div
          class="border-sf-b overflow-hidden rounded-2xl border bg-sf-primary shadow-2xl shadow-indigo-500/10"
        >
          <div class="border-sf-b flex items-center gap-2 border-b bg-sf-bg px-4 py-3">
            <span class="h-3 w-3 rounded-full bg-red-400"></span>
            <span class="h-3 w-3 rounded-full bg-yellow-400"></span>
            <span class="h-3 w-3 rounded-full bg-green-400"></span>
          </div>
          <div class="flex">
            <!-- 左侧工具栏 -->
            <div class="border-sf-b w-16 space-y-3 border-r bg-sf-bg p-3">
              <div class="mx-auto h-10 w-10 rounded-lg bg-indigo-100"></div>
              <div class="mx-auto h-10 w-10 rounded-lg bg-sf-bg-2"></div>
              <div class="mx-auto h-10 w-10 rounded-lg bg-sf-bg-2"></div>
              <div class="mx-auto h-10 w-10 rounded-lg bg-sf-bg-2"></div>
            </div>
            <!-- 编辑区 -->
            <div class="flex-1 space-y-4 p-6">
              <div class="h-5 w-1/3 rounded bg-sf-text"></div>
              <div class="h-3 w-2/3 rounded bg-sf-bg-2"></div>
              <div class="h-3 w-1/2 rounded bg-sf-bg-2"></div>
              <div class="mt-6 h-4 w-1/4 rounded bg-indigo-200"></div>
              <div class="h-3 w-3/4 rounded bg-sf-bg-2"></div>
              <div class="h-3 w-2/3 rounded bg-sf-bg-2"></div>
              <div class="h-3 w-1/2 rounded bg-sf-bg-2"></div>
              <div class="mt-4 h-3 w-1/5 rounded bg-indigo-200"></div>
              <div class="h-3 w-4/5 rounded bg-sf-bg-2"></div>
              <div class="h-3 w-3/5 rounded bg-sf-bg-2"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Guide />
  </section>
  <!-- 北斗AI助手 -->
  <section
    id="ai"
    class="relative flex min-h-screen items-center justify-center overflow-hidden py-24"
  >
    <div class="relative z-10 mx-auto w-full max-w-7xl px-6">
      <div class="grid w-full items-center gap-16 md:grid-cols-2">
        <div class="text-center lg:text-left">
          <HeroTitle
            title1="北斗"
            title2="AI助手"
            subtitle="北斗引航 终抵群星"
            gradient="from-violet-500 to-fuchsia-500"
          />
        </div>

        <!-- AI 对话示意 -->
        <div class="relative">
          <div
            class="border-sf-b overflow-hidden rounded-2xl border bg-sf-primary shadow-2xl shadow-indigo-500/10"
          >
            <div class="border-sf-b flex items-center gap-3 border-b px-5 py-4">
              <div
                class="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-400"
              >
                <svg
                  class="h-4 w-4 text-sf-theme-text"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <span class="text-sm font-medium text-sf-text">北斗 AI 助手</span>
              <span class="ml-auto text-xs text-green-500">在线</span>
            </div>

            <div class="h-80 space-y-4 overflow-hidden p-5">
              <!-- 用户消息 -->
              <div class="flex justify-end">
                <div
                  class="max-w-[80%] rounded-2xl rounded-br-md bg-indigo-100 px-4 py-2.5 text-sm text-indigo-800"
                >
                  帮我优化一下这段项目经历
                </div>
              </div>

              <!-- AI 回复 -->
              <div class="flex gap-3">
                <div
                  class="h-8 w-8 flex-shrink-0 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400"
                ></div>
                <div
                  class="max-w-[85%] space-y-2 rounded-2xl rounded-bl-md bg-sf-bg-2 px-4 py-3 text-sm text-sf-text"
                >
                  <p>已为你优化，采用 STAR 法则重构：</p>
                  <div class="space-y-1 rounded-lg bg-sf-primary p-3 text-xs text-sf-text-3">
                    <p>• 主导用户增长项目（S）</p>
                    <p>• 制定拉新策略与落地执行（T）</p>
                    <p>• 搭建裂变体系并优化转化（A）</p>
                    <p>• 3个月新增用户12万，ROI达1:4.2（R）</p>
                  </div>
                  <p class="text-xs text-indigo-600">匹配度提升 42%，是否应用到简历？</p>
                </div>
              </div>

              <!-- 用户消息 -->
              <div class="flex justify-end">
                <div
                  class="max-w-[80%] rounded-2xl rounded-br-md bg-indigo-100 px-4 py-2.5 text-sm text-indigo-800"
                >
                  应用，再帮我加个量化成果
                </div>
              </div>
            </div>

            <!-- 输入框 -->
            <div class="border-sf-b border-t px-5 py-4">
              <div
                class="border-sf-b flex items-center gap-3 rounded-xl border bg-sf-bg px-4 py-2.5"
              >
                <span class="text-sm text-sf-text-3">输入你的问题...</span>
                <button
                  class="ml-auto flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500"
                >
                  <svg
                    class="h-4 w-4 text-sf-theme-text"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Guide />
  </section>
  <section
    id="stats"
    class="relative flex min-h-screen items-center justify-center overflow-hidden py-24"
  >
    <div
      class="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-16 px-6 md:grid-cols-2"
    >
      <div class="text-center lg:text-left">
        <HeroTitle
          title1="星轨"
          title2="统计"
          subtitle="星轨为证 功不唐捐"
          gradient="from-amber-400 to-orange-500"
        />
      </div>

      <!-- 统计示意卡片 -->
      <div class="relative">
        <div
          class="border-sf-b overflow-hidden rounded-2xl border bg-sf-primary shadow-2xl shadow-violet-500/10"
        >
          <div class="border-sf-b flex items-center gap-2 border-b bg-sf-bg px-4 py-3">
            <span class="h-3 w-3 rounded-full bg-red-400"></span>
            <span class="h-3 w-3 rounded-full bg-yellow-400"></span>
            <span class="h-3 w-3 rounded-full bg-green-400"></span>
          </div>
          <div class="p-6">
            <!-- 求职概览 -->
            <div class="mb-6 grid grid-cols-3 gap-4">
              <div class="rounded-xl bg-sf-bg p-4 text-center">
                <div class="text-2xl font-bold text-sf-text">128</div>
                <div class="mt-1 text-xs text-sf-text-3">累计投递</div>
              </div>
              <div class="rounded-xl bg-sf-bg p-4 text-center">
                <div class="text-2xl font-bold text-sf-text">26</div>
                <div class="mt-1 text-xs text-sf-text-3">面试邀请</div>
              </div>
              <div class="rounded-xl bg-sf-bg p-4 text-center">
                <div class="text-2xl font-bold text-violet-600">5</div>
                <div class="mt-1 text-xs text-sf-text-3">Offer 收入</div>
              </div>
            </div>
            <!-- 投递趋势 -->
            <div>
              <div class="mb-3 flex items-center justify-between">
                <div class="text-sm font-medium text-sf-text">近 6 周投递趋势</div>
                <div class="text-xs text-sf-text-3">单位：次</div>
              </div>
              <div class="flex h-32 items-end gap-3">
                <div class="flex-1 rounded-t-md bg-violet-200" style="height: 40%"></div>
                <div class="flex-1 rounded-t-md bg-violet-300" style="height: 60%"></div>
                <div class="flex-1 rounded-t-md bg-violet-300" style="height: 55%"></div>
                <div class="flex-1 rounded-t-md bg-violet-400" style="height: 80%"></div>
                <div class="flex-1 rounded-t-md bg-violet-400" style="height: 70%"></div>
                <div
                  class="flex-1 rounded-t-md bg-gradient-to-t from-violet-500 to-purple-400"
                  style="height: 100%"
                ></div>
              </div>
              <div class="mt-2 flex justify-between text-xs text-sf-text-3">
                <span>第1周</span>
                <span>第2周</span>
                <span>第3周</span>
                <span>第4周</span>
                <span>第5周</span>
                <span>第6周</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import HeroTitle from "./heroTitle.vue";
import Guide from "./guide.vue";
import { useRouter } from "vue-router";

const router = useRouter();

function go() {
  router.push("/resume/template");
}
</script>

<style scoped>
/* 自定义动画可在此扩展 */
</style>
