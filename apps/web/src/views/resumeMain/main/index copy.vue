<template>
  <div class="min-h-screen bg-slate-50 font-sans text-slate-800">
    <!-- 导航栏 -->
    <nav
      class="fixed top-0 right-0 left-0 z-50 border-b border-slate-200/50 bg-white/70 backdrop-blur-md"
    >
      <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div class="flex items-center gap-2">
          <div
            class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-cyan-500 text-sm font-bold text-white"
          >
            舟
          </div>
          <span class="text-xl font-bold text-slate-900">轻舟简历</span>
        </div>
        <div class="hidden items-center gap-8 text-sm md:flex">
          <a href="#hero" class="text-slate-600 transition-colors hover:text-slate-900">首页</a>
          <a href="#features" class="text-slate-600 transition-colors hover:text-slate-900"
            >产品功能</a
          >
          <a href="#editor" class="text-slate-600 transition-colors hover:text-slate-900"
            >云帆编辑器</a
          >
          <a href="#ai" class="text-slate-600 transition-colors hover:text-slate-900">北斗AI助手</a>
        </div>
        <div class="flex items-center gap-3">
          <button
            class="rounded-lg px-4 py-2 text-sm text-slate-600 transition-colors hover:text-slate-900"
          >
            登录
          </button>
          <button
            class="rounded-lg bg-gradient-to-r from-sky-500 to-cyan-500 px-4 py-2 text-sm font-medium text-white transition-all hover:shadow-lg hover:shadow-sky-500/25"
          >
            免费注册
          </button>
        </div>
      </div>
    </nav>

    <!-- 第一屏：轻舟简历 - 首页主视觉 -->
    <section id="hero" class="relative flex min-h-screen flex-col overflow-hidden pt-16">
      <!-- 背景渐变 -->
      <div class="absolute inset-0 bg-gradient-to-b from-sky-50 via-white to-white"></div>

      <!-- 装饰光晕 -->
      <div
        class="absolute top-32 -right-20 h-[500px] w-[500px] rounded-full bg-sky-300/20 blur-3xl"
      ></div>
      <div
        class="absolute top-60 -left-20 h-[400px] w-[400px] rounded-full bg-cyan-300/20 blur-3xl"
      ></div>
      <div
        class="absolute bottom-0 left-1/2 h-[300px] w-[800px] -translate-x-1/2 rounded-full bg-sky-200/30 blur-3xl"
      ></div>

      <!-- 远山装饰 - SVG -->
      <div class="absolute right-0 bottom-0 left-0 opacity-20">
        <svg viewBox="0 0 1440 320" class="w-full">
          <path
            fill="#0ea5e9"
            fill-opacity="0.3"
            d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,218.7C672,235,768,245,864,229.3C960,213,1056,171,1152,165.3C1248,160,1344,192,1392,208L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
        <svg viewBox="0 0 1440 320" class="-mt-1 w-full">
          <path
            fill="#0284c7"
            fill-opacity="0.4"
            d="M0,256L48,261.3C96,267,192,277,288,266.7C384,256,480,224,576,218.7C672,213,768,235,864,245.3C960,256,1056,256,1152,234.7C1248,213,1344,171,1392,149.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>

      <!-- 主内容区 -->
      <div class="relative z-10 flex flex-1 items-center">
        <div class="mx-auto grid w-full max-w-7xl items-center gap-12 px-6 lg:grid-cols-2">
          <!-- 左侧文案 -->
          <div class="text-center lg:text-left">
            <div class="mb-6 border-l-4 border-sf-theme pl-4">
              <div class="text-4xl font-medium text-slate-900">轻舟</div>
              <div class="pl-6 text-4xl font-medium text-sf-theme">简历</div>
            </div>
            <h1
              class="mb-6 text-5xl leading-[1.1] font-bold tracking-tight text-slate-900 md:text-6xl lg:text-7xl"
            >
              以此简历
              <br />
              <span class="relative inline-block">
                <span
                  class="bg-gradient-to-r from-sky-500 via-cyan-500 to-teal-500 bg-clip-text text-transparent"
                >
                  渡你过万重山
                </span>
                <svg class="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                  <path
                    d="M2 8C50 2 150 2 298 8"
                    stroke="#38bdf8"
                    stroke-width="3"
                    stroke-linecap="round"
                    opacity="0.5"
                  />
                </svg>
              </span>
            </h1>

            <p
              class="mx-auto mb-8 max-w-xl text-lg leading-relaxed text-slate-600 md:text-xl lg:mx-0"
            >
              轻舟简历，专为求职者打造的智能简历平台。AI 智能润色、拖拽式编辑、百款精品模板，
              助你跨越求职路上的重重阻碍，轻舟已过万重山。
            </p>

            <!-- 主按钮 -->
            <div class="mb-10 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
              <button
                class="group flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 px-8 py-4 font-medium text-white transition-all hover:shadow-xl hover:shadow-sky-500/30"
              >
                免费创建简历
                <svg
                  class="h-4 w-4 transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </button>
              <button
                class="rounded-xl border border-slate-200 bg-white px-8 py-4 font-medium text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50"
              >
                观看演示视频
              </button>
            </div>

            <!-- 信任数据 -->
            <div class="mx-auto grid max-w-md grid-cols-3 gap-6 lg:mx-0">
              <div>
                <div class="text-2xl font-bold text-slate-900 md:text-3xl">100万+</div>
                <div class="text-sm text-slate-500">用户信赖之选</div>
              </div>
              <div>
                <div class="text-2xl font-bold text-slate-900 md:text-3xl">98%</div>
                <div class="text-sm text-slate-500">面试通过率提升</div>
              </div>
              <div>
                <div class="text-2xl font-bold text-slate-900 md:text-3xl">500+</div>
                <div class="text-sm text-slate-500">精品简历模板</div>
              </div>
            </div>
          </div>

          <!-- 右侧产品预览卡片 -->
          <div class="relative hidden lg:block">
            <!-- 浮动装饰卡片 -->
            <div
              class="absolute -top-4 -left-4 z-20 flex animate-bounce items-center gap-3 rounded-xl bg-white p-4 shadow-xl shadow-slate-200/50"
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
                <div class="text-sm font-medium text-slate-900">AI 优化完成</div>
                <div class="text-xs text-slate-500">简历匹配度 +35%</div>
              </div>
            </div>

            <div
              class="absolute -right-2 -bottom-6 z-20 flex items-center gap-3 rounded-xl bg-white p-4 shadow-xl shadow-slate-200/50"
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
                <div class="text-sm font-medium text-slate-900">一键导出 PDF</div>
                <div class="text-xs text-slate-500">完美排版无错位</div>
              </div>
            </div>

            <!-- 主预览图 -->
            <div
              class="relative overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl shadow-sky-200/50"
            >
              <!-- 浏览器顶栏 -->
              <div class="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
                <span class="h-3 w-3 rounded-full bg-red-400"></span>
                <span class="h-3 w-3 rounded-full bg-yellow-400"></span>
                <span class="h-3 w-3 rounded-full bg-green-400"></span>
                <div
                  class="mx-4 flex h-6 flex-1 items-center rounded-md border border-slate-200 bg-white px-2"
                >
                  <div class="text-xs text-slate-400">轻舟简历 · 在线编辑</div>
                </div>
              </div>

              <!-- 简历预览内容 -->
              <div class="bg-white p-6">
                <!-- 简历头部 -->
                <div class="mb-5 flex items-start gap-4">
                  <div
                    class="h-16 w-16 flex-shrink-0 rounded-full bg-gradient-to-br from-sky-400 to-cyan-400"
                  ></div>
                  <div class="flex-1">
                    <div class="mb-2 h-5 w-24 rounded bg-slate-800"></div>
                    <div class="mb-1.5 h-3 w-32 rounded bg-slate-300"></div>
                    <div class="h-3 w-40 rounded bg-slate-200"></div>
                  </div>
                </div>

                <!-- 个人简介 -->
                <div class="mb-5">
                  <div class="mb-2 h-3 w-16 rounded bg-slate-700"></div>
                  <div class="space-y-1.5">
                    <div class="h-2.5 w-full rounded bg-slate-200"></div>
                    <div class="h-2.5 w-11/12 rounded bg-slate-200"></div>
                    <div class="h-2.5 w-10/12 rounded bg-slate-200"></div>
                  </div>
                </div>

                <!-- 工作经历 -->
                <div class="mb-5">
                  <div class="mb-2 h-3 w-16 rounded bg-slate-700"></div>
                  <div class="space-y-3">
                    <div class="flex gap-3">
                      <div class="w-1.5 flex-shrink-0 rounded-full bg-sky-400"></div>
                      <div class="flex-1 space-y-1.5">
                        <div class="flex justify-between">
                          <div class="h-2.5 w-24 rounded bg-slate-300"></div>
                          <div class="h-2 w-16 rounded bg-slate-200"></div>
                        </div>
                        <div class="h-2 w-20 rounded bg-slate-200"></div>
                        <div class="h-2 w-full rounded bg-slate-100"></div>
                        <div class="h-2 w-5/6 rounded bg-slate-100"></div>
                      </div>
                    </div>
                    <div class="flex gap-3">
                      <div class="w-1.5 flex-shrink-0 rounded-full bg-sky-400"></div>
                      <div class="flex-1 space-y-1.5">
                        <div class="flex justify-between">
                          <div class="h-2.5 w-28 rounded bg-slate-300"></div>
                          <div class="h-2 w-16 rounded bg-slate-200"></div>
                        </div>
                        <div class="h-2 w-20 rounded bg-slate-200"></div>
                        <div class="h-2 w-full rounded bg-slate-100"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 技能标签 -->
                <div class="flex flex-wrap gap-2">
                  <span class="rounded-md bg-sky-100 px-2.5 py-1 text-xs text-sky-700">Vue.js</span>
                  <span class="rounded-md bg-cyan-100 px-2.5 py-1 text-xs text-cyan-700"
                    >React</span
                  >
                  <span class="rounded-md bg-teal-100 px-2.5 py-1 text-xs text-teal-700"
                    >TypeScript</span
                  >
                  <span class="rounded-md bg-slate-100 px-2.5 py-1 text-xs text-slate-600"
                    >Node.js</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 向下滚动提示 -->
      <div class="relative z-10 flex justify-center pb-8">
        <div class="flex flex-col items-center gap-2 text-slate-400">
          <span class="text-xs">向下滚动</span>
          <div class="flex h-10 w-6 justify-center rounded-full border-2 border-slate-300 pt-2">
            <div class="h-3 w-1.5 animate-bounce rounded-full bg-slate-400"></div>
          </div>
        </div>
      </div>
    </section>
    <!-- 第二屏：云帆编辑器 -->
    <section
      id="editor"
      class="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 py-24"
    >
      <div class="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-blue-50"></div>
      <div class="absolute top-32 left-20 h-72 w-72 rounded-full bg-indigo-200/30 blur-3xl"></div>
      <div class="absolute right-20 bottom-32 h-96 w-96 rounded-full bg-blue-200/30 blur-3xl"></div>

      <div class="relative z-10 mx-auto grid max-w-7xl items-center gap-16 px-6 md:grid-cols-2">
        <div>
          <div class="mb-6 border-l-4 border-sf-theme pl-4">
            <div class="text-4xl font-medium text-slate-900">云帆</div>
            <div class="pl-6 text-4xl font-medium text-sf-theme">编辑器</div>
          </div>
          <h2
            class="mb-6 text-4xl leading-tight font-bold tracking-tight text-slate-900 md:text-5xl"
          >
            借势而行
            <br />
            <span
              class="bg-gradient-to-r from-indigo-500 to-blue-500 bg-clip-text text-transparent"
            >
              直济沧海
            </span>
          </h2>
          <p class="mb-8 text-lg leading-relaxed text-slate-600">
            云帆济海，强大的可视化编辑能力，拖拽式排版、实时预览、多格式导出，
            让你乘风破浪，高效打造专业简历。
          </p>
          <ul class="mb-8 space-y-4 text-slate-700">
            <li class="flex items-center gap-3">
              <span
                class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100"
              >
                <svg
                  class="h-3.5 w-3.5 text-indigo-600"
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
              </span>
              所见即所得，拖拽排版轻松上手
            </li>
            <li class="flex items-center gap-3">
              <span
                class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100"
              >
                <svg
                  class="h-3.5 w-3.5 text-indigo-600"
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
              </span>
              百款精品模板，一键切换风格
            </li>
            <li class="flex items-center gap-3">
              <span
                class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100"
              >
                <svg
                  class="h-3.5 w-3.5 text-indigo-600"
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
              </span>
              支持 PDF / Word 多格式导出
            </li>
            <li class="flex items-center gap-3">
              <span
                class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100"
              >
                <svg
                  class="h-3.5 w-3.5 text-indigo-600"
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
              </span>
              云端自动保存，多端同步编辑
            </li>
          </ul>
          <button
            class="rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 px-8 py-3.5 font-medium text-white transition-all hover:shadow-lg hover:shadow-indigo-500/30"
          >
            体验编辑器
          </button>
        </div>

        <!-- 编辑器示意卡片 -->
        <div class="relative">
          <div
            class="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl shadow-indigo-500/10"
          >
            <div class="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
              <span class="h-3 w-3 rounded-full bg-red-400"></span>
              <span class="h-3 w-3 rounded-full bg-yellow-400"></span>
              <span class="h-3 w-3 rounded-full bg-green-400"></span>
            </div>
            <div class="flex">
              <!-- 左侧工具栏 -->
              <div class="w-16 space-y-3 border-r border-slate-100 bg-slate-50 p-3">
                <div class="mx-auto h-10 w-10 rounded-lg bg-indigo-100"></div>
                <div class="mx-auto h-10 w-10 rounded-lg bg-slate-100"></div>
                <div class="mx-auto h-10 w-10 rounded-lg bg-slate-100"></div>
                <div class="mx-auto h-10 w-10 rounded-lg bg-slate-100"></div>
              </div>
              <!-- 编辑区 -->
              <div class="flex-1 space-y-4 p-6">
                <div class="h-5 w-1/3 rounded bg-slate-800"></div>
                <div class="h-3 w-2/3 rounded bg-slate-200"></div>
                <div class="h-3 w-1/2 rounded bg-slate-200"></div>
                <div class="mt-6 h-4 w-1/4 rounded bg-indigo-200"></div>
                <div class="h-3 w-3/4 rounded bg-slate-100"></div>
                <div class="h-3 w-2/3 rounded bg-slate-100"></div>
                <div class="h-3 w-1/2 rounded bg-slate-100"></div>
                <div class="mt-4 h-3 w-1/5 rounded bg-indigo-200"></div>
                <div class="h-3 w-4/5 rounded bg-slate-100"></div>
                <div class="h-3 w-3/5 rounded bg-slate-100"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 第三屏：北斗AI助手 -->
    <section
      id="ai"
      class="relative flex min-h-screen items-center justify-center overflow-hidden py-24 text-white"
    >
      <div
        class="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950"
      ></div>
      <div class="absolute top-20 left-1/4 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl"></div>
      <div
        class="absolute right-1/4 bottom-20 h-80 w-80 rounded-full bg-purple-500/20 blur-3xl"
      ></div>

      <!-- 星点装饰 -->
      <div class="absolute inset-0 opacity-40">
        <div class="absolute top-1/4 left-1/4 h-1 w-1 rounded-full bg-white"></div>
        <div class="absolute top-1/3 right-1/3 h-1.5 w-1.5 rounded-full bg-white"></div>
        <div class="absolute top-1/2 left-1/5 h-1 w-1 rounded-full bg-white"></div>
        <div class="absolute right-1/4 bottom-1/3 h-1 w-1 rounded-full bg-white"></div>
        <div class="absolute bottom-1/4 left-1/3 h-1.5 w-1.5 rounded-full bg-white"></div>
        <div class="absolute top-1/5 right-1/4 h-1 w-1 rounded-full bg-white"></div>
        <div class="absolute top-2/3 left-1/4 h-1 w-1 rounded-full bg-white"></div>
        <div class="absolute right-1/3 bottom-1/5 h-1.5 w-1.5 rounded-full bg-white"></div>
      </div>

      <div class="relative z-10 mx-auto max-w-7xl px-6">
        <div class="grid items-center gap-16 md:grid-cols-2">
          <div>
            <div class="mb-6 border-l-4 border-sf-theme pl-4">
              <div class="text-4xl font-medium text-white">北斗</div>
              <div class="pl-6 text-4xl font-medium text-sf-theme">AI助手</div>
            </div>
            <h2 class="mb-6 text-4xl leading-tight font-bold tracking-tight md:text-5xl">
              北斗引航
              <br />
              <span
                class="bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent"
              >
                终抵群星
              </span>
            </h2>
            <p class="mb-8 text-xl leading-relaxed text-slate-300">
              北斗引航，AI 智能润色、岗位匹配、经历优化，为你的求职之路指引方向， 直达理想彼岸。
            </p>
            <div class="space-y-4">
              <div class="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <div class="mb-1 font-medium text-indigo-300">AI 智能润色</div>
                <p class="text-sm text-slate-400">
                  一键优化表达，让经历更专业亮眼，STAR 法则自动优化
                </p>
              </div>
              <div class="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <div class="mb-1 font-medium text-indigo-300">岗位精准匹配</div>
                <p class="text-sm text-slate-400">
                  对标 JD 关键词智能改写，大幅提高 ATS 系统通过率
                </p>
              </div>
              <div class="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <div class="mb-1 font-medium text-indigo-300">全程求职指引</div>
                <p class="text-sm text-slate-400">从撰写到投递、面试准备，AI 伴你走好每一步</p>
              </div>
            </div>
          </div>

          <!-- AI 对话示意 -->
          <div class="relative">
            <div
              class="overflow-hidden rounded-2xl border border-white/10 bg-slate-800/50 shadow-2xl backdrop-blur"
            >
              <div class="flex items-center gap-3 border-b border-white/10 px-5 py-4">
                <div
                  class="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-400"
                >
                  <svg
                    class="h-4 w-4 text-white"
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
                <span class="text-sm font-medium text-white">北斗 AI 助手</span>
                <span class="ml-auto text-xs text-green-400">在线</span>
              </div>

              <div class="h-80 space-y-4 overflow-hidden p-5">
                <!-- 用户消息 -->
                <div class="flex justify-end">
                  <div
                    class="max-w-[80%] rounded-2xl rounded-br-md bg-indigo-500/30 px-4 py-2.5 text-sm text-white"
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
                    class="max-w-[85%] space-y-2 rounded-2xl rounded-bl-md bg-white/10 px-4 py-3 text-sm text-slate-200"
                  >
                    <p>已为你优化，采用 STAR 法则重构：</p>
                    <div class="space-y-1 rounded-lg bg-slate-900/50 p-3 text-xs text-slate-400">
                      <p>• 主导用户增长项目（S）</p>
                      <p>• 制定拉新策略与落地执行（T）</p>
                      <p>• 搭建裂变体系并优化转化（A）</p>
                      <p>• 3个月新增用户12万，ROI达1:4.2（R）</p>
                    </div>
                    <p class="text-xs text-indigo-300">匹配度提升 42%，是否应用到简历？</p>
                  </div>
                </div>

                <!-- 用户消息 -->
                <div class="flex justify-end">
                  <div
                    class="max-w-[80%] rounded-2xl rounded-br-md bg-indigo-500/30 px-4 py-2.5 text-sm text-white"
                  >
                    应用，再帮我加个量化成果
                  </div>
                </div>
              </div>

              <!-- 输入框 -->
              <div class="border-t border-white/10 px-5 py-4">
                <div
                  class="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5"
                >
                  <span class="text-sm text-slate-500">输入你的问题...</span>
                  <button
                    class="ml-auto flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500"
                  >
                    <svg
                      class="h-4 w-4 text-white"
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
    </section>

    <!-- CTA 区域 -->
    <section
      class="relative overflow-hidden bg-gradient-to-br from-sky-500 via-cyan-500 to-teal-500 py-24"
    >
      <div class="absolute inset-0 opacity-20">
        <div
          class="absolute top-0 left-0 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white blur-3xl"
        ></div>
        <div
          class="absolute right-0 bottom-0 h-96 w-96 translate-x-1/2 translate-y-1/2 rounded-full bg-white blur-3xl"
        ></div>
      </div>

      <div class="relative z-10 mx-auto max-w-4xl px-6 text-center text-white">
        <h2 class="mb-6 text-4xl font-bold md:text-5xl">准备好开启你的求职之旅了吗？</h2>
        <p class="mx-auto mb-10 max-w-2xl text-xl text-white/80">
          加入百万用户，用一份专业简历，轻舟已过万重山
        </p>
        <div class="flex flex-col justify-center gap-4 sm:flex-row">
          <button
            class="rounded-xl bg-white px-10 py-4 font-medium text-sky-600 transition-all hover:shadow-xl hover:shadow-white/20"
          >
            免费开始使用
          </button>
          <button
            class="rounded-xl border border-white/40 bg-transparent px-10 py-4 font-medium text-white transition-all hover:bg-white/10"
          >
            了解会员权益
          </button>
        </div>
      </div>
    </section>

    <!-- 页脚 -->
    <footer class="border-t border-white/5 bg-slate-900 py-12 text-slate-400">
      <div class="mx-auto max-w-7xl px-6">
        <div class="mb-8 grid gap-8 md:grid-cols-4">
          <div>
            <div class="mb-4 flex items-center gap-2">
              <div
                class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-cyan-500 text-sm font-bold text-white"
              >
                舟
              </div>
              <span class="text-lg font-bold text-white">轻舟简历</span>
            </div>
            <p class="text-sm leading-relaxed">
              以此简历，渡你过万重山。<br />
              专业的智能简历制作平台。
            </p>
          </div>
          <div>
            <h4 class="mb-4 font-medium text-white">产品</h4>
            <ul class="space-y-2 text-sm">
              <li><a href="#" class="transition-colors hover:text-white">轻舟简历</a></li>
              <li><a href="#" class="transition-colors hover:text-white">云帆编辑器</a></li>
              <li><a href="#" class="transition-colors hover:text-white">北斗AI助手</a></li>
              <li><a href="#" class="transition-colors hover:text-white">模板中心</a></li>
            </ul>
          </div>
          <div>
            <h4 class="mb-4 font-medium text-white">资源</h4>
            <ul class="space-y-2 text-sm">
              <li><a href="#" class="transition-colors hover:text-white">求职指南</a></li>
              <li><a href="#" class="transition-colors hover:text-white">简历技巧</a></li>
              <li><a href="#" class="transition-colors hover:text-white">面试攻略</a></li>
              <li><a href="#" class="transition-colors hover:text-white">帮助中心</a></li>
            </ul>
          </div>
          <div>
            <h4 class="mb-4 font-medium text-white">关于</h4>
            <ul class="space-y-2 text-sm">
              <li><a href="#" class="transition-colors hover:text-white">关于我们</a></li>
              <li><a href="#" class="transition-colors hover:text-white">用户协议</a></li>
              <li><a href="#" class="transition-colors hover:text-white">隐私政策</a></li>
              <li><a href="#" class="transition-colors hover:text-white">联系我们</a></li>
            </ul>
          </div>
        </div>
        <div class="border-t border-white/5 pt-8 text-center text-sm">
          <p>© 2025 轻舟简历 · 以此简历，渡你过万重山</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
// 平滑滚动
if (typeof window !== "undefined") {
  document.documentElement.style.scrollBehavior = "smooth";
}
</script>

<style scoped>
/* 自定义动画可在此扩展 */
</style>
