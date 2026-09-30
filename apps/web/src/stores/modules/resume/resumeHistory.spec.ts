import { beforeEach, describe, expect, it, vi } from "vitest";
import { computed, ref } from "vue";
import { createResumeHistory } from "./resumeHistory";

// 头像与作品图的 base64 体积远大于正文，用例里用短字符串代替即可区分版本
const AVATAR_OLD = "data:image/webp;base64,OLD";
const AVATAR_NEW = "data:image/webp;base64,NEW";
const IMG_OLD = "data:image/webp;base64,IMG_OLD";
const IMG_NEW = "data:image/webp;base64,IMG_NEW";

const createItem = () => ({
  id: "resume-1",
  data: {
    user: { data: { name: "张三", avatar: AVATAR_OLD } },
    image: { list: [{ data: { name: "作品", img: IMG_OLD } }] },
  },
  config: { modules: [{ key: "user" }, { key: "image" }] },
  ui: { page: {} },
});

describe("resumeHistory 媒体撤销", () => {
  let item: any;
  let currentItem: any;
  let history: ReturnType<typeof createResumeHistory>;
  let refreshRuntime: () => void;

  beforeEach(() => {
    vi.useFakeTimers();
    item = createItem();
    currentItem = computed(() => item);
    refreshRuntime = vi.fn();
    history = createResumeHistory({ currentItem, refreshRuntime });
    // 初始化基准：等价于编辑器完成配置同步后开启历史
    history.enableHistory();
  });

  // 触发一次内容变更并等待历史防抖落地
  const commitChange = (mutate: () => void) => {
    mutate();
    history.onContentChange(item);
    vi.advanceTimersByTime(500);
  };

  it("撤销文字编辑时保留当前头像与作品图", () => {
    commitChange(() => (item.data.user.data.avatar = AVATAR_NEW));
    commitChange(() => (item.data.user.data.name = "李四"));

    history.undo();

    expect(item.data.user.data.name).toBe("张三");
    expect(item.data.user.data.avatar).toBe(AVATAR_NEW);
    expect(item.data.image.list[0].data.img).toBe(IMG_OLD);
  });

  it("撤销头像更换时回到上一张头像", () => {
    commitChange(() => (item.data.user.data.avatar = AVATAR_NEW));

    history.undo();

    expect(item.data.user.data.avatar).toBe(AVATAR_OLD);
  });

  it("撤销作品图更换时回到上一张作品图", () => {
    commitChange(() => (item.data.image.list[0].data.img = IMG_NEW));

    history.undo();

    expect(item.data.image.list[0].data.img).toBe(IMG_OLD);
  });

  it("重做后再次取回更换后的头像", () => {
    commitChange(() => (item.data.user.data.avatar = AVATAR_NEW));
    history.undo();
    expect(item.data.user.data.avatar).toBe(AVATAR_OLD);

    history.redo();
    expect(item.data.user.data.avatar).toBe(AVATAR_NEW);
  });

  it("撤销删除媒体时不会把当前媒体贴回", () => {
    commitChange(() => (item.data.user.data.avatar = ""));

    history.undo();

    expect(item.data.user.data.avatar).toBe(AVATAR_OLD);
  });

  it("连续多次更换头像可逐级撤回", () => {
    const middle = "data:image/webp;base64,MIDDLE";
    commitChange(() => (item.data.user.data.avatar = middle));
    commitChange(() => (item.data.user.data.avatar = AVATAR_NEW));

    history.undo();
    expect(item.data.user.data.avatar).toBe(middle);
    history.undo();
    expect(item.data.user.data.avatar).toBe(AVATAR_OLD);
  });

  it("快照中不写入 base64 媒体", () => {
    commitChange(() => (item.data.user.data.name = "李四"));
    commitChange(() => (item.data.user.data.name = "王五"));

    // 历史栈含一条基线版本，两次编辑后共 3 条
    expect(history.undoStack.value).toHaveLength(3);
    history.undoStack.value.forEach((snapshot) => {
      expect(snapshot).not.toContain("base64");
      expect(snapshot).toContain("@media:avatar");
      expect(snapshot).toContain("@media:img");
    });
  });

  it("撤销栈溢出淘汰历史后，剩余快照的媒体仍可还原", () => {
    for (let index = 0; index < 15; index += 1) {
      commitChange(() => (item.data.user.data.name = `姓名${index}`));
    }

    expect(history.undoStack.value.length).toBeLessThanOrEqual(12);
    expect(item.data.user.data.avatar).toBe(AVATAR_OLD);

    // 连续撤销到栈底，头像始终有值且不为占位标识
    for (let index = 0; index < 12; index += 1) {
      history.undo();
      expect(item.data.user.data.avatar).toBe(AVATAR_OLD);
      expect(item.data.user.data.avatar.startsWith("@media:")).toBe(false);
    }
  });

  it("重置历史后只保留当前内容作为新基线", () => {
    commitChange(() => (item.data.user.data.avatar = AVATAR_NEW));
    history.resetHistoryBase();

    // 重置后没有更早版本可回退，撤销不产生副作用
    expect(history.undoStack.value).toHaveLength(1);
    history.undo();
    expect(item.data.user.data.avatar).toBe(AVATAR_NEW);
  });
});
