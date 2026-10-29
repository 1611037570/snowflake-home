import { createStore, del, entries, set } from "idb-keyval";
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import type { InterviewSession } from "./types";

// 面试使用独立数据库，不进入简历正文、简历会话目录或简历删除链路。
const database = createStore("snowflake-interviews", "sessions");

export const useInterviewStore = defineStore("interview", () => {
  const sessions = ref<InterviewSession[]>([]);
  const ready = ref(false);
  const loadError = ref("");
  const saveErrors = ref<Record<string, string>>({});
  const saveError = computed(() => Object.values(saveErrors.value)[0] || "");
  const saving = ref(0);
  const tasks = new Map<string, Promise<void>>();
  const deleting = new Set<string>();
  let loading: Promise<void> | null = null;

  const load = () => {
    if (ready.value) return Promise.resolve();
    if (loading) return loading;
    loadError.value = "";
    loading = (async () => {
      try {
        const records = await entries<string, InterviewSession>(database);
        sessions.value = records.map(([, session]) => {
          // 刷新后的旧请求已经失效，保留草稿与部分输出并等待用户继续。
          if (session.status === "active") session.status = "paused";
          const outputs = [session.preparation, session.report, ...session.turns.flatMap((turn) => [turn.question, turn.hint, turn.reference])];
          outputs.forEach((output) => { if (output.status === "generating") output.status = "interrupted"; });
          return session;
        }).sort((a, b) => b.updatedAt - a.updatedAt);
        ready.value = true;
      } catch (error) {
        loadError.value = error instanceof Error ? error.message : "面试记录读取失败";
      } finally { loading = null; }
    })();
    return loading;
  };

  const save = (session: InterviewSession): Promise<void> => {
    if (deleting.has(session.id)) return Promise.resolve();
    const snapshot = JSON.parse(JSON.stringify(session)) as InterviewSession;
    const previous = tasks.get(session.id) || Promise.resolve();
    saving.value += 1;
    const task = previous.catch(() => {}).then(async () => {
      if (deleting.has(session.id)) return;
      await set(session.id, snapshot, database);
      delete saveErrors.value[session.id];
    });
    tasks.set(session.id, task);
    // 按记录保留保存失败，只有该记录写入成功后才清除，避免错误长期残留。
    void task.catch((error) => { saveErrors.value[session.id] = error instanceof Error ? error.message : "面试记录保存失败"; }).finally(() => {
      saving.value -= 1;
      if (tasks.get(session.id) === task) tasks.delete(session.id);
    });
    return task;
  };

  const retrySave = async () => {
    await Promise.allSettled(sessions.value.map(save));
  };

  const remove = async (id: string) => {
    deleting.add(id);
    try {
      await tasks.get(id)?.catch(() => {});
      await del(id, database);
      delete saveErrors.value[id];
      sessions.value = sessions.value.filter((session) => session.id !== id);
    } finally { deleting.delete(id); }
  };

  return { sessions, ready, loadError, saveError, saving, load, save, retrySave, remove };
});
