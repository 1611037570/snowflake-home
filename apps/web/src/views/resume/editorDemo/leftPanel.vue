<script setup>
// 左栏静态视觉 Demo：加宽的模块树 + 文档流卡片
import { ref } from "vue";
import { DEMO_MODULES } from "./mockContent";

// 模块名称最多显示的字数，超出截断，保证模块树宽度稳定
const NAME_MAX = 6;
// 当前高亮模块：初始给个人信息，之后只由点击决定
const activeKey = ref("user");

// 名称超过上限时截断并补省略号，让「还有内容」看得出来
const shortName = (name) =>
  name.length > NAME_MAX ? `${name.slice(0, NAME_MAX)}…` : name;
</script>

<template>
  <section class="flex w-[640px] shrink-0 flex-col border-r border-sf-b bg-sf-primary">
    <!-- 栏头：文字标签 + 2px 下划线指示，替换原先整块蓝色胶囊 -->
    <div class="flex h-11 shrink-0 items-center justify-between border-b border-sf-b px-3">
      <div class="flex h-full items-center gap-6">
        <div class="relative flex h-full items-center text-[13px] font-medium text-sf-text">
          内容
          <span class="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-sf-theme"></span>
        </div>
        <div class="flex h-full items-center text-[13px] text-sf-text-2">外观</div>
        <div class="flex h-full items-center text-[13px] text-sf-text-2">助手</div>
      </div>
      <div class="flex items-center gap-1.5">
        <SfIcon icon="lucide:search" size="4" boxSize="8" class="rounded-xl text-sf-text-2" />
        <SfIcon icon="mdi:dots-horizontal" size="4" boxSize="8" class="rounded-xl text-sf-text-2" />
      </div>
    </div>

    <div class="flex min-h-0 flex-1">
      <!-- 模块树：图标 + 名称，默认无底色；hover 时图标换成拖拽把手 -->
      <aside class="flex w-38 shrink-0 flex-col bg-sf-primary p-1.5">
        <div class="flex flex-col gap-1.5">
          <div
            v-for="module in DEMO_MODULES"
            :key="module.key"
            class="group/rail flex h-8 items-center gap-1 rounded-3xl p-1"
            :class="
              module.key === activeKey
                ? 'bg-sf-theme-3 text-sf-theme'
                : module.hidden
                  ? 'text-sf-text-3'
                  : 'text-sf-text-2 hover:bg-sf-bg'
            "
          >
            <!-- 图标与拖拽把手叠放：hover 时互换，宽度不跳动 -->
            <span class="relative h-4 w-4 shrink-0">
              <span
                class="absolute inset-0 flex items-center justify-center transition-opacity duration-150 group-hover/rail:opacity-0"
              >
                <SfIcon :icon="module.icon" size="4" />
              </span>
              <span
                class="absolute inset-0 flex cursor-grab! items-center justify-center opacity-0 transition-opacity duration-150 group-hover/rail:opacity-100 active:cursor-grabbing!"
              >
                <SfIcon
                  icon="icon-park-outline:drag"
                  size="4"
                  class="cursor-grab! text-sf-text-3 active:cursor-grabbing!"
                />
              </span>
            </span>
            <span class="max-w-21 truncate text-[12px]">{{ shortName(module.name) }}</span>
            <!-- 右侧显示记录数量：圆形底色徽标；隐藏模块同时保留一个圆点提示 -->
            <span class="ml-auto flex shrink-0 items-center gap-1">
              <span v-if="module.hidden" class="h-1.5 w-1.5 rounded-full bg-sf-text-3"></span>
              <span
                v-if="module.kind === 'array'"
                class="flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] leading-none tabular-nums"
                :class="
                  module.key === activeKey
                    ? 'bg-sf-theme text-sf-theme-text'
                    : 'bg-sf-bg-2 text-sf-text-3'
                "
                >{{ module.records?.length ?? 0 }}</span
              >
            </span>
          </div>
        </div>

        <div class="mt-auto flex flex-col gap-1.5 pt-3">
          <div
            class="flex h-8 items-center justify-center gap-1.5 rounded-3xl p-1 text-[12px] text-sf-text-2 hover:bg-sf-bg"
          >
            <SfIcon icon="ic:round-add" size="4" />
            添加模块
          </div>
          <div
            class="flex h-8 items-center justify-center gap-1.5 rounded-3xl p-1 text-[12px] text-sf-text-2 hover:bg-sf-bg"
          >
            <SfIcon icon="mdi:dots-horizontal" size="4" />
            更多操作
          </div>
        </div>
      </aside>

      <!-- 文档流：浅灰底承托白卡片，靠阴影分层，不再满屏描边 -->
      <div class="min-h-0 min-w-0 flex-1 overflow-y-auto bg-sf-bg">
        <div class="flex flex-col gap-3 px-3 py-3">
          <div
            v-for="module in DEMO_MODULES"
            :key="module.key"
            class="group demo-card"
            :class="module.hidden ? 'opacity-60' : ''"
          >
            <!-- 卡片头 44px：标题靠左，操作与折叠箭头靠右 -->
            <div class="flex h-11 items-center justify-between gap-3 px-3">
              <div class="flex min-w-0 items-center gap-1.5">
                <SfIcon
                  icon="icon-park-outline:drag"
                  size="4"
                  class="shrink-0 text-sf-text-3 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                />
                <h3
                  class="truncate text-[15px] font-semibold text-sf-text"
                  :class="{ 'line-through': module.hidden }"
                >
                  {{ module.name }}
                </h3>
              </div>
              <div class="flex shrink-0 items-center gap-1.5">
                <div
                  class="flex items-center gap-1.5 text-sf-text-3 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                >
                  <SfIcon icon="mdi:map-search-outline" size="4" boxSize="7" class="rounded-lg" />
                  <SfIcon
                    :icon="module.hidden ? 'lucide:eye' : 'lucide:eye-off'"
                    size="4"
                    boxSize="7"
                    class="rounded-lg"
                  />
                  <SfIcon icon="ic:round-delete" size="4" boxSize="7" class="rounded-lg" />
                </div>
                <SfIcon icon="ph:caret-down-bold" size="3" class="text-sf-text-3" />
              </div>
            </div>
            <div class="h-px bg-sf-b"></div>

            <div class="px-3 pt-3 pb-3">
              <!-- 对象模块：字段两列，24 占整行 -->
              <div v-if="module.kind === 'object'" class="grid grid-cols-2 gap-3">
                <div
                  v-for="field in module.fields"
                  :key="field.key"
                  class="flex flex-col gap-1.5"
                  :class="field.span === 24 ? 'col-span-2' : ''"
                >
                  <span class="text-[12px] font-medium text-sf-text-2">{{ field.label }}</span>
                  <div
                    class="rounded-xl border border-sf-b px-3 text-[13px] text-sf-text"
                    :class="
                      field.textarea
                        ? 'flex min-h-18 items-start py-1.5 leading-6'
                        : 'flex h-9 items-center'
                    "
                  >
                    {{ field.value }}
                  </div>
                </div>
              </div>

              <!-- 数组模块：竖线时间线 + 记录块，替代嵌套折叠卡 -->
              <div v-else class="relative">
                <span class="absolute top-3 bottom-3 left-[3.5px] w-px bg-sf-b"></span>
                <div
                  v-for="record in module.records"
                  :key="record.key"
                  class="group/record relative pb-3 pl-6 last:pb-0"
                >
                  <span
                    class="absolute top-3.5 left-0 h-2 w-2 rounded-full"
                    :class="record.expanded ? 'bg-sf-theme' : 'bg-sf-bg-3'"
                  ></span>
                  <div
                    class="rounded-lg px-1.5 py-1.5 transition-colors duration-150 group-hover/record:bg-sf-bg"
                  >
                    <div class="flex items-start justify-between gap-1.5">
                      <div class="min-w-0">
                        <h4 class="truncate text-[13px] font-semibold text-sf-text">
                          {{ record.title }}
                        </h4>
                        <p class="mt-1.5 text-[11px] text-sf-text-3">{{ record.meta }}</p>
                      </div>
                      <div
                        class="flex shrink-0 items-center gap-1.5 text-sf-text-3 opacity-0 transition-opacity duration-150 group-hover/record:opacity-100"
                      >
                        <SfIcon icon="ph:copy-duotone" size="4" boxSize="7" class="rounded-lg" />
                        <SfIcon icon="lucide:eye-off" size="4" boxSize="7" class="rounded-lg" />
                        <SfIcon icon="ic:round-delete" size="4" boxSize="7" class="rounded-lg" />
                      </div>
                    </div>
                    <div v-if="record.expanded" class="mt-3 grid grid-cols-2 gap-3">
                      <div
                        v-for="field in record.fields"
                        :key="field.key"
                        class="flex flex-col gap-1.5"
                        :class="field.span === 24 ? 'col-span-2' : ''"
                      >
                        <span class="text-[12px] font-medium text-sf-text-2">{{
                          field.label
                        }}</span>
                        <div
                          class="rounded-xl border border-sf-b px-3 text-[13px] text-sf-text"
                          :class="
                            field.textarea
                              ? 'flex min-h-18 items-start py-1.5 leading-6'
                              : 'flex h-9 items-center'
                          "
                        >
                          {{ field.value }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 添加记录：实线浅底按钮，替代虚线大框 -->
              <div
                v-if="module.kind === 'array'"
                class="mt-3 flex h-9 items-center justify-center gap-1.5 rounded-xl bg-sf-bg-2 text-[12px] font-medium text-sf-text-2"
              >
                <SfIcon icon="ic:round-add" size="4" />
                添加一段{{ module.name }}
              </div>
            </div>
          </div>

          <p class="px-3 pt-3 pb-6 text-[11px] leading-5 text-sf-text-3">
            静态 Demo：模块树默认无底色，进入时高亮个人信息，之后只由点击切换；hover 模块项时图标换成拖拽把手。
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* 文档流卡片：白底、12px 圆角、不使用描边，靠两层阴影分层 */
.demo-card {
  overflow: hidden;
  border-radius: 12px;
  background: var(--sf-primary);
  box-shadow:
    0 1px 2px color-mix(in srgb, var(--sf-base) 6%, transparent),
    0 6px 16px color-mix(in srgb, var(--sf-base) 4%, transparent);
  transition: box-shadow 0.15s ease;
}

.demo-card:hover {
  box-shadow:
    0 1px 2px color-mix(in srgb, var(--sf-base) 8%, transparent),
    0 10px 24px color-mix(in srgb, var(--sf-base) 6%, transparent);
}

/* 深色模式降低阴影强度，避免白边发灰 */
:global(.dark) .demo-card {
  box-shadow:
    0 1px 2px color-mix(in srgb, var(--sf-base) 3%, transparent),
    0 6px 16px color-mix(in srgb, var(--sf-base) 2%, transparent);
}
</style>
