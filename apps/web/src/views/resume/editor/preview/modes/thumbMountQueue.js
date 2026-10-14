// 所有缩略图共用挂载队列，避免同一批模板同时测量完整简历。
const mountQueue = [];
let scheduled = false;

const flushMountQueue = () => {
  mountQueue.shift()?.();
  if (mountQueue.length) scheduleMount();
  else scheduled = false;
};

const scheduleMount = () => {
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(flushMountQueue, { timeout: 300 });
    return;
  }
  window.setTimeout(flushMountQueue, 16);
};

export const enqueueThumbMount = (task) => {
  mountQueue.push(task);
  if (!scheduled) {
    scheduled = true;
    scheduleMount();
  }
  // 卡片在轮到挂载前离开列表时移除任务，避免卸载后继续渲染。
  return () => {
    const index = mountQueue.indexOf(task);
    if (index >= 0) mountQueue.splice(index, 1);
  };
};
