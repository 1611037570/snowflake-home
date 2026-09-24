import { ref } from "vue";

type ResumeRuntimeOptions = {
  clearSelectedModules: () => void;
};

export const createResumeRuntime = ({ clearSelectedModules }: ResumeRuntimeOptions) => {
  // 专注写作模式不随简历持久化
  const focusMode = ref(false);
  const isPrinting = ref(false);
  let printController: AbortController | null = null;
  const beginPrinting = () => {
    if (isPrinting.value) return null;
    const controller = new AbortController();
    printController = controller;
    isPrinting.value = true;
    return controller.signal;
  };
  const cancelPrinting = () => {
    printController?.abort();
    printController = null;
    isPrinting.value = false;
  };
  const finishPrinting = (signal: AbortSignal) => {
    if (printController?.signal !== signal) return;
    printController = null;
    isPrinting.value = false;
  };
  const isFittingOnePage = ref(false);
  let onePageController: AbortController | null = null;
  const beginFittingOnePage = () => {
    if (isFittingOnePage.value) return null;
    const controller = new AbortController();
    onePageController = controller;
    isFittingOnePage.value = true;
    return controller.signal;
  };
  const cancelFittingOnePage = () => {
    onePageController?.abort();
    onePageController = null;
    isFittingOnePage.value = false;
  };
  const finishFittingOnePage = (signal: AbortSignal) => {
    if (onePageController?.signal !== signal) return;
    onePageController = null;
    isFittingOnePage.value = false;
  };
  const isGenerating = ref(false);
  const configSyncing = ref(true);
  const setConfigSyncing = (value: boolean) => {
    configSyncing.value = value;
  };
  const previewSyncing = ref(true);
  const setPreviewSyncing = (value: boolean) => {
    previewSyncing.value = value;
  };
  const runtimeData = ref({
    editorDuration: 0,
    previewDuration: 0,
    firstFrame: 0,
    env: {} as Record<string, any>,
  });
  const setFocusMode = (value: boolean) => {
    focusMode.value = value;
  };
  const setGenerating = (value: boolean) => {
    isGenerating.value = value;
  };
  const initResumeStatus = () => {
    cancelPrinting();
    cancelFittingOnePage();
    isGenerating.value = false;
    clearSelectedModules();
  };

  return {
    focusMode,
    isPrinting,
    beginPrinting,
    cancelPrinting,
    finishPrinting,
    isFittingOnePage,
    beginFittingOnePage,
    cancelFittingOnePage,
    finishFittingOnePage,
    isGenerating,
    setGenerating,
    configSyncing,
    setConfigSyncing,
    previewSyncing,
    setPreviewSyncing,
    runtimeData,
    setFocusMode,
    initResumeStatus,
  };
};
