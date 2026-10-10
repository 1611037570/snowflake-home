import { nextTick } from "vue";
import { describe, expect, it, vi } from "vitest";
import { createFormReadyContext } from "./formReady";

const settle = async () => { await nextTick(); await nextTick(); await nextTick(); };

describe("表单就绪任务", () => {
  it("挂载后等待嵌套任务，重复完成不会重复报告", async () => {
    const ready = vi.fn();
    const tracker = createFormReadyContext(ready);
    const finish = tracker.context.begin();
    tracker.mount();
    await settle();
    expect(ready).not.toHaveBeenCalled();
    const childFinish = tracker.context.begin();
    finish();
    finish();
    await settle();
    expect(ready).not.toHaveBeenCalled();
    childFinish();
    await settle();
    expect(ready).toHaveBeenCalledTimes(1);
  });

  it("新初始化轮次重新报告，卸载使待执行回调失效", async () => {
    const ready = vi.fn();
    const tracker = createFormReadyContext(ready);
    tracker.mount();
    await settle();
    tracker.restart();
    await settle();
    expect(ready).toHaveBeenCalledTimes(2);
    tracker.restart();
    tracker.stop();
    await settle();
    expect(ready).toHaveBeenCalledTimes(2);
  });
});
