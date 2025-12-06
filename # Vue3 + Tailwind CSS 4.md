# Vite7 + Tailwind CSS 4.1 + SCSS 实战：封装全局 $s 函数实现智能响应式尺寸适配

## 前言

在开发响应式网页时，我们经常面临一个痛点：设计稿通常是按 1920px 或 1440px 给出的，但在笔记本、平板或手机上，字体大小、间距、元素宽度都需要相应缩小。

传统做法是手写大量的 `media query` 或者在 Tailwind 中写一长串 `w-10 md:w-12 lg:w-16`。这不仅代码冗余，而且维护困难。

本文将分享一种基于 **Vue3 + Tailwind CSS 4.0 + SCSS** 的解决方案，通过封装一个全局 `$s` 函数，实现尺寸的智能动态转换。

## 核心思路

我们的目标是：**输入一个设计稿的基础尺寸（如 16px），函数自动计算出在不同屏幕断点（sm, md, lg, base）下的最佳尺寸，并生成对应的 Tailwind 类名字符串。**

策略如下：

1.  **大屏还原**：在 `lg` (大屏) 下保持设计稿原始尺寸。
2.  **小屏递减**：屏幕越小，尺寸自动减小（通过减去固定偏移量或按比例缩放）。
3.  **动态类名**：利用 Tailwind CSS 4.0 的 `@source` 特性支持动态拼接的类名。

## 1. 核心函数封装 (`sizeConvert.ts`)

这个函数是整个方案的大脑。它根据传入的数值，结合预设的阈值和断点规则，计算出响应式的类名。

```typescript
// src/utils/modules/sizeConvert.ts

// 尺寸配置：定义不同断点下的缩减规则
// offset: 相比原始值的减少量
// min: 保证缩减后的最小值
interface SizeConfig {
  offset: number
  min: number
}

const SIZES: Record<'base' | 'sm' | 'md' | 'lg', SizeConfig> = {
  base: { offset: 3, min: 1 }, // 移动端/默认：减3
  sm: { offset: 2, min: 2 }, // 平板竖屏：减2
  md: { offset: 1, min: 3 }, // 平板横屏/小笔记本：减1
  lg: { offset: 0, min: 0 }, // 桌面大屏：不减（还原设计稿）
}

function calculatePercentage(total: number, percent: number): number {
  const result = total * (percent / 100)
  return Math.floor(result)
}

/**
 * 响应式尺寸转换函数
 * @param size 基础尺寸值（通常对应设计稿 px 值）
 * @param type 类名前缀，默认为 'text'，也可以是 'w', 'h', 'p', 'm' 等
 * @returns 生成的 Tailwind 类名字符串
 */
export function $s(size: string | number, type = 'text'): string {
  // 转换基础尺寸值
  const baseValue = Number(size)

  // 阈值设定：大尺寸使用百分比缩放，小尺寸使用固定差值
  const THRESHOLD_1 = 10
  const THRESHOLD_2 = 15

  // 封装核心尺寸计算逻辑
  const calculateSize = (key: keyof typeof SIZES): number => {
    const { offset, min } = SIZES[key]
    return Math.max(baseValue - offset, min)
  }

  // 提取重复的条件计算逻辑，减少冗余
  const getSizeValue = (
    key: 'base' | 'sm' | 'md',
    percentAboveThreshold2: number,
    percentBetweenThreshold1And2: number,
  ): number => {
    // 如果尺寸很大（如容器宽度），按百分比缩放更自然
    if (baseValue > THRESHOLD_2) {
      return calculatePercentage(baseValue, percentAboveThreshold2)
    }
    if (baseValue > THRESHOLD_1) {
      return calculatePercentage(baseValue, percentBetweenThreshold1And2)
    }
    // 小尺寸（如字体、小间距）按固定偏移量计算
    return calculateSize(key)
  }

  // 计算各断点数值
  const baseSize = getSizeValue('base', 40, 45)
  const smSize = getSizeValue('sm', 60, 65)
  const mdSize = getSizeValue('md', 80, 85)
  const lgSize = calculateSize('lg') // lg 始终保持原值

  // 生成 Tailwind 类名组合，并自带过渡效果
  // 例：text-13 sm:text-14 md:text-15 lg:text-16 transition-text duration-300
  return `${type}-${baseSize} sm:${type}-${smSize} md:${type}-${mdSize} lg:${type}-${lgSize} transition-${type} duration-300`
}
```

## 2. Tailwind CSS 4.0 配置 (`tailwind.css`)

因为 `$s` 函数是运行时生成类名（如 `w-15`, `w-16`），Tailwind 的静态扫描可能无法检测到这些类名。在 Tailwind CSS v4 中，我们可以使用 `@source inline` 显式声明这些动态范围，确保编译器生成对应的 CSS。

```css
/* src/styles/tailwind.css */
@import 'tailwindcss';

/* 显式声明动态类名范围，防止被 Tree-shaking */
/* 宽度、高度适配范围：w-1 到 w-120 */
@source inline('{sm:,md:,lg:,}w-{1..120}');
@source inline('{sm:,md:,lg:,}h-{1..120}');

/* Padding / Margin 适配范围 */
@source inline('{sm:,md:,lg:,}px-{1..120}');
@source inline('{sm:,md:,lg:,}py-{1..40}');
@source inline('{sm:,md:,lg:,}p-{1..40}');
@source inline('{sm:,md:,lg:,}m-{1..40}');

/* 间距 gap */
@source inline('{sm:,md:,lg:,}gap-{1..20}');

/* 声明过渡效果，让尺寸变化更丝滑 */
@source inline('transition-{gap,p,py,px,text,w,h,all}');
@source inline('duration-300');
```

## 3. SCSS 辅助生成字体类 (`base.scss`)

https://tailwindcss.com/docs/compatibility#sass-less-and-stylus

对于 `font-size`，我们结合 SCSS 循环生成精确的类名。

```scss
/* src/styles/base.scss */

// 循环生成 text-1 到 text-50 的类名
@for $i from 1 through 50 {
  $target-value: $i + 0.5;

  // 生成整数类名，如 .text-16
  .text-#{$i} {
    font-size: calc(var(--spacing) * #{$i});
  }

  // 生成 .5 小数类名，如 .text-16.5
  .text-#{$i}\002e5 {
    font-size: calc(var(--spacing) * #{$target-value});
  }

  // 配合 Tailwind 断点生成的媒体查询类
  // sm 断点：40rem (640px) ~ 48rem (768px)
  .sm\:text-#{$i} {
    @media (min-width: 40rem) and (max-width: calc(48rem - 1px)) {
      font-size: calc(var(--spacing) * #{$i});
    }
  }

  // md 断点：48rem (768px) ~ 64rem (1024px)
  .md\:text-#{$i} {
    @media (min-width: 48rem) and (max-width: calc(64rem - 1px)) {
      font-size: calc(var(--spacing) * #{$i});
    }
  }

  // lg 断点：64rem (1024px) 及以上
  .lg\:text-#{$i} {
    @media (min-width: 64rem) {
      font-size: calc(var(--spacing) * #{$i});
    }
  }
}
```

## 4. 全局注册与使用

在 `main.ts` 中注册为全局属性，方便在任意组件模板中调用。

```typescript
// main.ts
import { createApp } from 'vue'
import App from './App.vue'
import { $s } from './utils/modules/sizeConvert'

const app = createApp(App)

// 挂载到全局
app.config.globalProperties.$s = $s

app.mount('#app')
```

### 组件中使用示例

**1. 字体大小适配**

```html
<!-- 设计稿 16px 字体 -->
<!-- 渲染结果：默认 text-13, sm屏 text-14, md屏 text-15, lg屏 text-16 -->
<div :class="$s(16)">响应式标题</div>
```

**2. 宽度与间距适配**

```html
<!-- 宽度适配 (设计稿 100单位) -->
<div :class="$s(100, 'w')"></div>

<!-- Padding 适配 (设计稿 20单位) -->
<div :class="$s(20, 'p')"></div>

<!-- Margin Top 适配 (设计稿 10单位) -->
<div :class="$s(10, 'mt')"></div>
```

## 总结

通过这套方案，我们实现了：

1.  **开发极简**：只需填入设计稿数值，无需关心断点逻辑。
2.  **体验丝滑**：内置 `transition` 过渡，屏幕缩放时尺寸变化平滑。
3.  **高度可控**：通过 `sizeConvert.ts` 的配置，可以灵活调整不同设备的缩放策略。
