import { inject, nextTick, onBeforeUnmount, type InjectionKey } from "vue";

export interface FormReadyContext {
  // 注册控件就绪任务，返回可重复调用的完成函数。
  begin: () => () => void;
}

// 仅动态表单提供就绪上下文，独立使用的控件不参与等待。
export const FORM_READY: InjectionKey<FormReadyContext> = Symbol("form-ready");

export function useFormReadyTask() {
  const context = inject(FORM_READY, undefined);
  const finish = context?.begin() ?? (() => {});
  onBeforeUnmount(finish);
  return finish;
}

// 等待挂载后的嵌套异步控件登记完成，只报告当前初始化轮次的就绪状态。
export function createFormReadyContext(onReady: () => void) {
  let pending = 0;
  let version = 0;
  let active = false;
  let reported = false;
  const check = async () => {
    const currentVersion = ++version;
    await nextTick();
    await nextTick();
    if (currentVersion !== version || !active || pending || reported) return;
    reported = true;
    onReady();
  };
  const context: FormReadyContext = {
    begin: () => {
      pending++;
      version++;
      let finished = false;
      return () => {
        if (finished) return;
        finished = true;
        pending--;
        void check();
      };
    },
  };
  return {
    // 供表单及其异步子控件登记任务的上下文。
    context,
    // 新数据进入时重新等待当前可见控件，已有任务继续有效。
    restart: () => { reported = false; void check(); },
    // 根表单挂载后才允许报告就绪。
    mount: () => { active = true; void check(); },
    // 卸载后使等待中的回调失效。
    stop: () => { active = false; version++; },
  };
}
