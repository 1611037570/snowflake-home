import { mount, flushPromises } from "@vue/test-utils";
import { defineAsyncComponent, defineComponent, h, nextTick, onMounted, provide, ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import FieldContent from "./fieldContent.vue";
import { createFormReadyContext, FORM_READY } from "../code/formReady";

describe("字段局部加载", () => {
  it("慢字段保留占位，普通字段立即可用，整表就绪仍等待慢字段", async () => {
    let resolve!: (component: ReturnType<typeof defineComponent>) => void;
    const slow = defineAsyncComponent(() => new Promise<ReturnType<typeof defineComponent>>((done) => { resolve = done; }));
    const ready = vi.fn();
    const wrapper = mount(defineComponent({
      setup() {
        const tracker = createFormReadyContext(ready);
        provide(FORM_READY, tracker.context);
        onMounted(tracker.mount);
        return () => h("div", [
          h(FieldContent, null, { default: () => h("input", { value: "姓名" }) }),
          h(FieldContent, null, { default: () => h(slow) }),
        ]);
      },
    }));
    await flushPromises();
    expect(wrapper.find("input").exists()).toBe(true);
    expect(wrapper.find('[aria-busy="true"]').exists()).toBe(true);
    expect(ready).not.toHaveBeenCalled();
    resolve(defineComponent(() => () => h("textarea")));
    await flushPromises();
    await nextTick();
    expect(wrapper.find("textarea").exists()).toBe(true);
    expect(ready).toHaveBeenCalledTimes(1);
    wrapper.unmount();
  });

  it("加载中的字段移除后不再阻塞整表就绪", async () => {
    const visible = ref(true);
    const ready = vi.fn();
    const slow = defineAsyncComponent(() => new Promise<ReturnType<typeof defineComponent>>(() => {}));
    const wrapper = mount(defineComponent({
      setup() {
        const tracker = createFormReadyContext(ready);
        provide(FORM_READY, tracker.context);
        onMounted(tracker.mount);
        return () => h("div", visible.value ? [h(FieldContent, null, { default: () => h(slow) })] : []);
      },
    }));
    await flushPromises();
    expect(ready).not.toHaveBeenCalled();
    visible.value = false;
    await flushPromises();
    expect(ready).toHaveBeenCalledTimes(1);
    wrapper.unmount();
  });
});
