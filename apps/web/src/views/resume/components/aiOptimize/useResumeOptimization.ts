import { computed, effectScope, onBeforeUnmount, ref } from "vue";
import { useResumeStore } from "@/stores";
import { createResumeEditor } from "@/stores/modules/resume/resumeEditor";
import { COLLAPSED } from "@/stores/modules/resume/config/formConfig";
import { DEFAULT_MODULE_NAMES } from "@/stores/modules/resume/config/defaultConfig";
import { useResumeContext } from "../../assistant/context/useResumeContext";
import { createResumeChangeObserver } from "../../assistant/changes/captureChanges";
import type { ResumeChange, ResumeChangeState } from "../../assistant/changes/types";
import { describeResumeAiError, runOneKeyOptimization, type ResumeOptimizationInput, type ResumeReport } from "@snowflake/resume-agent";
import { resumeContextCompaction } from "@/apis/llm/contextCompaction";

// 一次生成完整优化草稿和报告，用户在原地预览后决定保存或放弃。
export const useResumeOptimization = () => {
  const store = useResumeStore();
  const draft = ref<any>(null);
  const context = useResumeContext(() => draft.value || {});
  const generating = ref(false);
  const stage = ref("");
  const error = ref("");
  const report = ref<ResumeReport | null>(null);
  const originalItem = ref<any>(null);
  const originalContext = useResumeContext(() => originalItem.value || {});
  const pendingItem = ref<any>(null);
  const changes = ref<ResumeChangeState>({ items: [], unavailable: false });
  const accepted = ref(false);
  const saving = ref(false);
  const saveError = ref("");
  const incomplete = ref(false);
  const notice = ref("");
  // 使用结果时核对开始优化时的内容与结构，避免覆盖期间产生的新编辑。
  let baseline: { id: string /* 目标简历编号。 */; data: string /* 原始内容校验值。 */; structure: string /* 原始模块与主题校验值。 */ } | null = null;
  let controller: AbortController | null = null;
  let disposed = false;
  const hasChanges = computed(() => !!pendingItem.value && !!originalItem.value &&
    JSON.stringify(pendingItem.value.data) !== JSON.stringify(originalItem.value.data));

  const persist = async () => {
    saving.value = true;
    saveError.value = "";
    try { await store.savePendingResumes(); return true; }
    catch { saveError.value = "本地保存失败，请重试保存后再关闭。"; return false; }
    finally { saving.value = false; }
  };

  const run = async (resumeId: string, input: ResumeOptimizationInput, continueExisting = false) => {
    if (generating.value || saving.value) return;
    if (store.isGenerating) { error.value = "另一个简历 AI 任务正在运行，请稍后再试。"; return; }
    // 重试从保留的草稿继续，原简历快照与已经完成的对比详情不丢失。
    const kept = continueExisting && pendingItem.value && report.value && baseline?.id === resumeId ? {
      pending: pendingItem.value, // 继续处理的候选内容。
      original: originalItem.value, // 最初的原简历。
      report: report.value, // 重试失败时仍可查看已有结果。
      baseline, // 最初的内容与结构校验值。
      changes: changes.value, // 已完成修改的详情。
      incomplete: incomplete.value, // 保留原有完成状态。
      notice: notice.value, // 保留原有中断说明。
    } : null;
    if (continueExisting && !kept) return;
    const requestController = new AbortController();
    controller = requestController;
    generating.value = true;
    store.setGenerating(true);
    report.value = null;
    error.value = "";
    saveError.value = "";
    incomplete.value = false;
    notice.value = "";
    accepted.value = false;
    originalItem.value = null;
    pendingItem.value = null;
    baseline = null;
    changes.value = { items: [...(kept?.changes.items ?? [])], unavailable: kept?.changes.unavailable ?? false };
    stage.value = "正在准备简历副本";
    const scope = effectScope();
    const taskId = `optimize:${resumeId}:${Date.now()}`;
    try {
      const source = await store.loadResume(resumeId);
      // 准备期间停止也走恢复路径，继续任务不能因此丢掉已有草稿。
      if (requestController.signal.aborted) throw new DOMException("已停止优化", "AbortError");
      if (!source) throw new Error("这份简历已不存在，请重新选择");
      if (kept && (JSON.stringify(source.data) !== kept.baseline.data || JSON.stringify([source.config, source.ui]) !== kept.baseline.structure)) {
        throw new Error("原简历已有新的修改，请调整目标后重新开始，已有草稿仍可预览。");
      }
      baseline = kept?.baseline ?? {
        id: resumeId, // 固定目标简历，不跟随编辑器当前对象。
        data: JSON.stringify(source.data), // 使用时检查正文是否已变化。
        structure: JSON.stringify([source.config, source.ui]), // 使用时检查模块与主题是否已变化。
      };
      originalItem.value = kept?.original ?? JSON.parse(JSON.stringify(source));
      draft.value = JSON.parse(JSON.stringify(kept?.pending ?? source));
      // 复用真实编辑器操作和字段规则，运行时监听随本次任务结束释放。
      const editor = scope.run(() => createResumeEditor({
        currentItem: computed(() => draft.value), // 固定本轮副本，避免当前简历切换导致串写。
        currentData: computed(() => draft.value?.data), // 所有工具只修改副本中的业务内容。
        itemDefaultCollapsed: computed(() => COLLAPSED), // 新增记录沿用默认折叠口径。
      }));
      if (!editor) throw new Error("优化任务准备失败，请重试");
      let batchChanges: ResumeChange[] = [];
      let batchUnavailable = false;
      const observer = createResumeChangeObserver({
        readData: () => draft.value.data, // 改动对比从本轮副本捕获。
        getModuleTitle: (key) => draft.value.data[key]?.ui?.title || DEFAULT_MODULE_NAMES.find((item) => item.key === key)?.name || key, // 使用目标简历的模块名。
        getLayout: (key) => draft.value.ui?.[key]?.layout, // 按当前布局提取可读内容。
      }, {
        onChange: (change) => batchChanges.push(change), // 整批执行成功后才公布详情。
        onError: () => { batchUnavailable = true; }, // 详情异常不影响内容操作。
      });
      context.beforeRequest?.({ resumeScope: "all" }, taskId);
      originalContext.beforeRequest({ resumeScope: "all" }, taskId);
      const result = await runOneKeyOptimization({ ...input, continuing: !!kept }, {
        signal: requestController.signal, // 停止或关闭时中断统一 Agent。
        onStage: (value) => { stage.value = value; }, // 展示实际阶段。
        originalData: originalContext.getResumeData(), // 报告始终与最初原简历比较。
        contextCompaction: resumeContextCompaction, // 与通用助手采用相同的长上下文预算。
        context: {
          getResumeData: context.getResumeData, // 复用媒体裁剪和冻结的脱敏设置。
          applyResumeOperations: (operations) => {
            const beforeBatch = JSON.parse(JSON.stringify(draft.value.data));
            batchChanges = [];
            batchUnavailable = false;
            let applied: ReturnType<typeof editor.applyResumeOperations>;
            try { applied = editor.applyResumeOperations(operations, observer); }
            catch (cause) {
              // 执行器异常也恢复整批，部分结果只能包含完整通过的批次。
              draft.value.data = beforeBatch;
              editor.refreshRuntime();
              throw cause;
            }
            // 批内失败先恢复，避免半条新增记录进入可使用的部分草稿。
            if (applied.failed.length || applied.fieldFailures.length) {
              draft.value.data = beforeBatch;
              editor.refreshRuntime();
              return {
                ...applied,
                applied: false, // 已回滚，不能宣称本批写入成功。
                changed: [], // 回滚的变化不进入证据。
                unchanged: [], // 整批需要重新处理。
                added: [], // 回滚后没有新增记录。
                failed: operations.map((_, index) => index), // 返回需要重新提交的操作。
                fieldFailures: [], // 回滚后不要求补填不存在的新记录。
              };
            }
            changes.value.items.push(...batchChanges);
            changes.value.unavailable ||= batchUnavailable;
            return applied;
          }, // 校验后的操作仅修改任务副本，失败批次完整恢复。
        },
      });
      if (disposed || controller !== requestController) return;
      // 完成仅交出草稿，预览、报告与放弃都不会修改原简历。
      pendingItem.value = draft.value;
      report.value = result.report;
      incomplete.value = !result.completed;
      notice.value = result.notice;
      stage.value = result.completed ? "优化完成，等待确认" : "已保留部分草稿";
    } catch (cause) {
      if (kept && !disposed) {
        pendingItem.value = kept.pending;
        originalItem.value = kept.original;
        report.value = kept.report;
        baseline = kept.baseline;
        changes.value = kept.changes;
        incomplete.value = kept.incomplete;
        notice.value = kept.notice;
      }
      if (!requestController.signal.aborted) error.value = `${describeResumeAiError(cause)}。本次优化未写入原简历。`;
    } finally {
      if (requestController.signal.aborted && !report.value) stage.value = "已停止优化";
      context.afterRequest?.(taskId);
      originalContext.afterRequest(taskId);
      scope.stop();
      draft.value = null;
      if (controller === requestController) {
        controller = null;
        generating.value = false;
        store.setGenerating(false);
      }
    }
  };

  const cancel = () => {
    if (!controller) return;
    controller.abort();
    // 等待取消请求收尾后释放生成锁，避免旧请求影响新一轮任务。
    stage.value = "正在停止优化";
  };

  const apply = async (): Promise<boolean> => {
    if (saving.value || !baseline || !pendingItem.value || disposed) return false;
    if (accepted.value) return persist();
    saving.value = true;
    error.value = "";
    try {
      const source = await store.loadResume(baseline.id);
      if (disposed) return false;
      if (!source || JSON.stringify([source.config, source.ui]) !== baseline.structure ||
        !store.replaceResumeData(baseline.id, baseline.data, pendingItem.value.data)) {
        throw new Error("原简历已有新的修改或已删除，本次结果未覆盖，请重新优化。");
      }
      accepted.value = true;
      return await persist();
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : "保存结果失败，请重试。";
      return false;
    } finally { saving.value = false; }
  };

  // 调整输入只放弃当前候选，不重新请求，也不动正式简历。
  const backToInput = () => {
    if (saving.value || accepted.value) return;
    pendingItem.value = null;
    report.value = null;
    error.value = "";
    notice.value = "";
    incomplete.value = false;
    baseline = null;
  };

  onBeforeUnmount(() => { disposed = true; cancel(); });
  return { generating, stage, error, report, changes, originalItem, pendingItem, accepted, hasChanges, saving, saveError, incomplete, notice, run, cancel, apply, persist, backToInput };
};
