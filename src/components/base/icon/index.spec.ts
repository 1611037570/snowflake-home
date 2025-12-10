// 测试挂载工具
import { mount } from '@vue/test-utils'
// Vitest 基本断言与测试
import { describe, expect, it, vi } from 'vitest'
// 被测组件
import BaseIcon from './index.vue'

// 模拟 Iconify，确保 loadIcon 成功
vi.mock('@iconify/vue', () => ({
  Icon: { name: 'Icon', template: '<span />' },
  loadIcon: () => Promise.resolve(),
}))

// 最小用例：加载成功触发 success 事件
describe('BaseIcon', () => {
  it('加载成功时触发 success 事件', async () => {
    const wrapper = mount(BaseIcon, {
      global: {
        config: {
          globalProperties: {
            $s: () => '', // 简化的尺寸类生成
          },
        },
      },
    })
    await new Promise((r) => setTimeout(r, 0)) // 让微任务队列执行 loadIcon
    expect(wrapper.emitted('success')).toBeTruthy() // 断言成功事件已触发
  })
})
