<script setup lang="ts">
// ApplicationScenes.vue
</script>

<template>
  <div class="sf-color-section space-y-8">
    <div class="flex items-center gap-3 border-b border-sf-border pb-4">
      <div class="flex-c h-10 w-10 rounded-xl bg-sf-theme/10 text-sf-theme shadow-sm">
        <SfIcon icon="mdi:widgets" size="6" />
      </div>
      <h2 class="text-2xl font-bold tracking-tight text-sf-text">综合应用场景示例</h2>
      <span class="ml-2 rounded-full bg-sf-bg-2 px-3 py-1 text-xs font-medium text-sf-text-3"
        >Use Cases</span
      >
    </div>

    <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      <!-- 示例 1: 复杂表单与状态 -->
      <div
        class="group flex flex-col justify-between rounded-xl border border-sf-border bg-sf-base p-1.5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-sf-theme/30 hover:shadow-xl"
      >
        <div class="flex h-full flex-col justify-between rounded-lg bg-sf-primary p-5">
          <div>
            <div class="mb-5 flex items-center justify-between border-b border-sf-border pb-4">
              <span class="flex items-center gap-2 text-base font-semibold text-sf-text">
                <SfIcon
                  icon="mdi:monitor-dashboard"
                  class="text-sf-theme transition-transform group-hover:scale-110"
                />
                系统状态面板
              </span>
              <span
                class="relative flex items-center gap-1.5 overflow-hidden rounded-full px-2.5 py-1 text-xs font-medium text-sf-success shadow-sm"
              >
                <div class="absolute inset-0 bg-sf-success opacity-15"></div>
                <SfIcon icon="mdi:check-circle" size="4" class="animate-pulse" />
                <span class="relative z-10">运行中</span>
              </span>
            </div>
            <div class="space-y-3">
              <div
                class="group/item flex cursor-pointer items-center justify-between rounded-xl bg-sf-bg-2 p-3.5 transition-all duration-300 hover:scale-[1.02] hover:bg-sf-bg-2-hover hover:shadow-md"
              >
                <div class="flex items-center gap-3.5">
                  <div
                    class="flex-c h-9 w-9 rounded-lg bg-sf-theme text-sf-theme-text shadow-sm transition-transform group-hover/item:rotate-12"
                  >
                    <SfIcon icon="mdi:server-network" size="5" />
                  </div>
                  <div class="flex flex-col gap-0.5">
                    <span
                      class="text-sm font-semibold text-sf-text transition-colors group-hover/item:text-sf-theme"
                      >主服务器</span
                    >
                    <span class="text-xs text-sf-text-3">CPU: 45% | RAM: 60%</span>
                  </div>
                </div>
                <SfIcon
                  icon="mdi:chevron-right"
                  class="text-sf-text-3 transition-transform group-hover/item:translate-x-1 group-hover/item:text-sf-theme"
                />
              </div>

              <div
                class="group/item flex cursor-pointer items-center justify-between rounded-xl bg-sf-bg-3 p-3.5 transition-all duration-300 hover:scale-[1.02] hover:bg-sf-bg-3-hover hover:shadow-md"
              >
                <div class="flex items-center gap-3.5">
                  <div
                    class="flex-c h-9 w-9 rounded-lg bg-sf-warning text-sf-bg shadow-sm transition-transform group-hover/item:-rotate-12"
                  >
                    <SfIcon icon="mdi:database-alert" size="5" />
                  </div>
                  <div class="flex flex-col gap-0.5">
                    <span class="text-sm font-semibold text-sf-text">备用数据库</span>
                    <span class="text-xs font-medium text-sf-error">空间不足 (剩余 5%)</span>
                  </div>
                </div>
                <SfIcon
                  icon="mdi:chevron-right"
                  class="text-sf-text-3 transition-transform group-hover/item:translate-x-1"
                />
              </div>
            </div>
          </div>

          <div class="mt-6 flex gap-3">
            <button
              class="flex-1 rounded-lg bg-sf-theme py-2.5 text-sm font-semibold text-sf-theme-text shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-sf-theme-hover hover:shadow-lg focus:ring-2 focus:ring-sf-theme/50 focus:outline-none"
            >
              系统巡检
            </button>
            <button
              class="flex-1 rounded-lg border border-sf-border bg-sf-primary py-2.5 text-sm font-semibold text-sf-text transition-all duration-300 hover:-translate-y-0.5 hover:bg-sf-bg-2 hover:shadow-md focus:ring-2 focus:ring-sf-border focus:outline-none"
            >
              重启服务
            </button>
          </div>
        </div>
      </div>

      <!-- 示例 2: 弹窗与层级 -->
      <div
        class="group flex-c relative overflow-hidden rounded-xl border border-sf-border bg-sf-bg p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      >
        <div
          class="absolute inset-0 bg-sf-bg-2 transition-opacity duration-500 group-hover:opacity-80"
        >
          <div
            class="absolute top-4 left-4 h-32 w-32 rounded-full bg-sf-theme opacity-20 blur-2xl transition-all duration-700 group-hover:scale-150 group-hover:opacity-30"
          ></div>
          <div
            class="absolute right-4 bottom-4 h-32 w-32 rounded-full bg-sf-error opacity-20 blur-2xl transition-all duration-700 group-hover:scale-150 group-hover:opacity-30"
          ></div>
        </div>

        <div
          class="relative z-10 w-full rounded-2xl border border-sf-border/50 bg-sf-modal p-6 shadow-2xl backdrop-blur-xl transition-transform duration-300 group-hover:scale-[1.02]"
        >
          <div class="flex items-start gap-4">
            <div
              class="flex-c relative mt-0.5 h-10 w-10 shrink-0 overflow-hidden rounded-full text-sf-info shadow-inner"
            >
              <div class="absolute inset-0 bg-sf-info opacity-15"></div>
              <SfIcon icon="mdi:information-variant" class="relative z-10 text-2xl" />
            </div>
            <div class="flex-1">
              <h3 class="text-base font-bold text-sf-text">数据同步提示</h3>
              <p class="mt-1.5 text-sm leading-relaxed text-sf-text-2">
                正在同步云端数据，期间请勿关闭页面或断开网络连接。
              </p>
              <div class="mt-4 space-y-2.5 rounded-lg bg-sf-bg/50 p-3">
                <div class="flex items-center gap-2.5 text-xs font-medium text-sf-text-2">
                  <SfIcon icon="mdi:check-circle" size="4" class="text-sf-success" />
                  基础配置数据完成
                </div>
                <div class="flex items-center gap-2.5 text-xs font-medium text-sf-text-disabled">
                  <SfIcon icon="mdi:clock-outline" size="4" class="animate-spin text-sf-theme" />
                  多媒体资源同步中...
                </div>
              </div>

              <div class="mt-5 flex gap-2.5">
                <button
                  class="flex-1 rounded-lg bg-sf-transparent py-2 text-sm font-semibold text-sf-text transition-all duration-300 hover:bg-sf-transparent-2 hover:shadow-sm"
                >
                  透明底按钮
                </button>
                <button
                  class="flex-1 rounded-lg bg-sf-transparent-3 py-2 text-sm font-semibold text-sf-text shadow-sm transition-all duration-300 hover:bg-sf-transparent-4 hover:shadow-md"
                >
                  深透明底
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 示例 3: 数据与禁用态 -->
      <div
        class="group flex flex-col justify-between rounded-xl border border-sf-border bg-sf-bg-hover p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      >
        <div>
          <div class="mb-5 flex items-center justify-between">
            <h3 class="flex items-center gap-2 text-sm font-semibold text-sf-text">
              <div class="flex-c h-7 w-7 rounded-md bg-sf-primary shadow-sm">
                <SfIcon icon="mdi:chart-pie" class="text-sf-theme" size="4" />
              </div>
              存储配额概览
            </h3>
            <div
              class="flex-c h-7 w-7 cursor-pointer rounded-md transition-colors hover:bg-sf-bg-3"
            >
              <SfIcon
                icon="mdi:dots-horizontal"
                class="text-sf-text-3 transition-colors hover:text-sf-text"
              />
            </div>
          </div>

          <div class="flex gap-3">
            <div
              class="relative flex-1 overflow-hidden rounded-xl border border-sf-border bg-sf-primary p-4 shadow-sm transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-md"
            >
              <div
                class="absolute -top-2 -right-2 p-2 text-sf-theme opacity-5 transition-transform duration-500 group-hover:scale-125 group-hover:opacity-10"
              >
                <SfIcon icon="mdi:database" size="16" />
              </div>
              <div class="relative z-10 mb-1.5 text-xs font-medium text-sf-text-3">已用空间</div>
              <div class="relative z-10 flex items-baseline gap-1">
                <span class="text-3xl font-bold tracking-tight text-sf-text">845</span>
                <span class="text-xs font-medium text-sf-text-2">GB</span>
              </div>
            </div>
            <div
              class="relative flex-1 overflow-hidden rounded-xl border border-sf-border bg-sf-bg p-4 transition-all duration-300 group-hover:bg-sf-bg-2"
            >
              <div
                class="absolute -top-2 -right-2 p-2 text-sf-text opacity-5 transition-transform duration-500 group-hover:scale-125"
              >
                <SfIcon icon="mdi:database-outline" size="16" />
              </div>
              <div class="relative z-10 mb-1.5 text-xs font-medium text-sf-text-disabled">
                剩余空间
              </div>
              <div class="relative z-10 flex items-baseline gap-1">
                <span class="text-3xl font-bold tracking-tight text-sf-text-disabled">155</span>
                <span class="text-xs font-medium text-sf-text-disabled">GB</span>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-6 space-y-4">
          <div
            class="rounded-xl border border-sf-border bg-sf-primary p-4 shadow-sm transition-shadow group-hover:shadow-md"
          >
            <div class="mb-2.5 flex justify-between text-xs">
              <span class="font-medium text-sf-text-2">主节点健康度</span>
              <span class="font-bold text-sf-theme">84.5%</span>
            </div>
            <div class="h-2.5 w-full overflow-hidden rounded-full bg-sf-bg-3 shadow-inner">
              <div
                class="relative h-full rounded-full bg-gradient-to-r from-sf-theme to-sf-success transition-all duration-1000"
                style="width: 84.5%"
              >
                <div class="absolute inset-0 w-1/2 bg-white opacity-20"></div>
              </div>
            </div>
          </div>

          <div
            class="cursor-not-allowed rounded-xl border border-dashed border-sf-border bg-sf-bg-2 p-4 opacity-70 transition-opacity hover:opacity-80"
          >
            <div class="mb-3 flex items-center gap-2">
              <div class="flex-c h-6 w-6 rounded bg-sf-bg-3">
                <SfIcon icon="mdi:lock" size="4" class="text-sf-text-disabled" />
              </div>
              <span class="text-sm font-semibold text-sf-text-disabled">高级设置 (未解锁)</span>
            </div>
            <div
              class="flex h-9 w-full items-center rounded-lg border border-sf-border bg-sf-bg-3 px-3.5 shadow-inner"
            >
              <span class="text-xs font-medium text-sf-text-disabled">需要管理员权限</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 示例 4: AI 聊天与交互态 -->
      <div
        class="group flex flex-col justify-between rounded-xl border border-sf-border bg-sf-base p-1.5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-sf-theme/30 hover:shadow-xl"
      >
        <div class="flex h-full flex-col justify-between rounded-lg bg-sf-primary p-4">
          <div class="mb-4 flex items-center justify-between border-b border-sf-border pb-3">
            <h3 class="flex items-center gap-2 text-sm font-semibold text-sf-text">
              <div class="flex-c h-7 w-7 rounded-md bg-sf-theme/10 text-sf-theme">
                <SfIcon icon="mdi:robot-outline" size="4.5" />
              </div>
              AI 助手对话
            </h3>
            <span class="flex items-center gap-1.5 text-xs font-medium text-sf-text-3">
              <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-sf-success"></span> 在线
            </span>
          </div>

          <div class="flex-1 space-y-5 overflow-hidden py-1">
            <!-- User Message -->
            <div class="flex flex-row-reverse items-start gap-3">
              <div
                class="flex-c h-8 w-8 shrink-0 rounded-full bg-sf-theme text-sf-theme-text shadow-md transition-transform hover:scale-110"
              >
                <SfIcon icon="mdi:account" size="5" />
              </div>
              <div
                class="rounded-2xl rounded-tr-sm bg-sf-theme px-3.5 py-2.5 text-sm font-medium text-sf-theme-text shadow-md"
              >
                如何使用这些主题色？
              </div>
            </div>
            <!-- AI Message -->
            <div class="flex items-start gap-3">
              <div
                class="flex-c h-8 w-8 shrink-0 rounded-full border border-sf-border bg-sf-bg text-sf-text shadow-sm transition-transform hover:scale-110"
              >
                <SfIcon icon="mdi:robot-excited-outline" size="5" />
              </div>
              <div
                class="rounded-2xl rounded-tl-sm border border-sf-border bg-sf-bg-2 px-3.5 py-2.5 text-sm text-sf-text-2 shadow-sm"
              >
                <p class="leading-relaxed">直接通过 Tailwind 类名使用即可：</p>
                <div
                  class="mt-2.5 rounded-lg border border-sf-border bg-sf-primary p-2.5 font-mono text-[11px] text-sf-text-3 shadow-inner selection:bg-sf-theme selection:text-sf-theme-text"
                >
                  class="bg-sf-theme text-sf-theme-text"
                </div>
              </div>
            </div>
          </div>

          <div
            class="mt-5 flex items-center gap-2.5 rounded-xl border border-sf-border bg-sf-bg-2 px-4 py-2.5 shadow-sm transition-all duration-300 group-hover:border-sf-border/80 focus-within:border-sf-theme focus-within:bg-sf-primary focus-within:shadow-md"
          >
            <SfIcon
              icon="mdi:microphone"
              size="5"
              class="cursor-pointer text-sf-text-3 transition-colors hover:text-sf-theme"
            />
            <span
              class="flex-1 text-xs font-medium text-sf-text-disabled transition-colors select-none focus-within:text-sf-text-2"
              >输入消息或指令...</span
            >
            <div
              class="flex-c h-7 w-7 cursor-pointer rounded-lg bg-sf-theme text-sf-theme-text shadow-sm transition-all duration-300 hover:scale-105 hover:bg-sf-theme-hover hover:shadow-md active:scale-95"
            >
              <SfIcon icon="mdi:arrow-up" size="5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
