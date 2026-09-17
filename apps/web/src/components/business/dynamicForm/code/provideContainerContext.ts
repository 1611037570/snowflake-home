import { computed, provide, toValue, type MaybeRefOrGetter } from "vue";
import type { DataPathContext } from "./pathContext";
import {
  DF_CURRENT_FORM,
  DF_CURRENT_LENGTH,
  DF_CURRENT_PATH_CONTEXT,
  DF_CURRENT_TYPE,
  DF_REMOVE,
} from "./injectionKeys";

/**
 * 统一提供容器级上下文（引擎容器内部使用）
 * 三个容器共用同一份契约，避免各自手写 provide 导致能力与注释漂移
 * 入参统一用 getter 或 ref 传入，取值时再解包，保证容器配置变化后仍能同步
 */
export function provideContainerContext(options: {
  /** 当前容器类型 */
  type: string;
  /** 当前容器配置 */
  form: MaybeRefOrGetter<any>;
  /** 当前节点的数据路径上下文，无相对路径解析需求的容器可不传 */
  pathContext?: MaybeRefOrGetter<DataPathContext | undefined>;
  /** 删除当前节点的方法，仅被容器绑定目标的节点传 */
  remove?: () => void;
  /** 数组容器的记录数，仅数组容器传 */
  length?: MaybeRefOrGetter<number>;
}) {
  provide(
    DF_CURRENT_FORM,
    computed(() => toValue(options.form)),
  );
  provide(DF_CURRENT_TYPE, options.type);
  if (options.pathContext) {
    provide(
      DF_CURRENT_PATH_CONTEXT,
      computed(() => toValue(options.pathContext)),
    );
  }
  if (options.remove) {
    provide(DF_REMOVE, options.remove);
  }
  if (options.length) {
    provide(
      DF_CURRENT_LENGTH,
      computed(() => toValue(options.length)),
    );
  }
}
