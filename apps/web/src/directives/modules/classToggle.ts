import type { App, Directive, DirectiveBinding } from 'vue'

/**
 * 自定义指令 v-class-toggle
 * 用于根据条件动态添加或移除类名
 *
 * 使用方式：
 * v-class-toggle="{ active: isActive, 'text-blue': isBlue }"
 * 或
 * v-class-toggle:[className]="condition"
 */
export const classToggle: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    updateClass(el, binding)
  },
  updated(el: HTMLElement, binding: DirectiveBinding) {
    updateClass(el, binding)
  },
}

/**
 * 更新元素类名的辅助函数
 */
function updateClass(el: HTMLElement, binding: DirectiveBinding): void {
  // 处理对象形式的绑定值
  if (binding.value && typeof binding.value === 'object') {
    Object.entries(binding.value).forEach(([className, condition]) => {
      if (condition) {
        el.classList.add(className)
      } else {
        el.classList.remove(className)
      }
    })
  } else if (binding.arg) {
    // 处理参数形式的绑定值 v-class-toggle:[className]="condition"
    const className = binding.arg
    if (binding.value) {
      el.classList.add(className)
    } else {
      el.classList.remove(className)
    }
  }
}

/**
 * 注册指令到应用实例
 */
export function registerClassToggle(app: App): void {
  app.directive('class-toggle', classToggle)
}
