import { checkPermission } from "@/utils";
import { defineAsyncComponent } from "vue";
const list = [
  {
    name: "启动台",
    component: defineAsyncComponent(() => import("./components/launchpad.vue")),
    type: "system",
  },
  {
    name: "关于",
    component: defineAsyncComponent(() => import("./components/about.vue")),
    type: "system",
  },
  {
    name: "图片处理",
    component: defineAsyncComponent(() => import("./components/image.vue")),
    type: "system",
  },
  {
    name: "轻舟简历",
    component: defineAsyncComponent(() => import("./components/writeResume.vue")),
    type: "system",
  },
  {
    name: "投简历",
    component: defineAsyncComponent(() => import("./components/sendResume.vue")),
    type: "system",
  },

  {
    name: "设置",
    component: defineAsyncComponent(() => import("./components/setting.vue")),
    type: "system",
  },
  {
    name: "便签",
    component: defineAsyncComponent(() => import("./components/note.vue")),
    type: "page",
    page: "note",
  },
  {
    name: "邮箱",
    component: defineAsyncComponent(() => import("./components/email.vue")),
    type: "system",
  },
  {
    name: "添加",
    component: defineAsyncComponent(() => import("./components/appCenter.vue")),
    type: "system",
  },
  {
    name: "密码箱",
    component: defineAsyncComponent(() => import("./components/passwordBox.vue")),
    type: "page",
    page: "passwordBox",
  },
];

const showList = list.filter((item: any) => {
  if (item.type == "system") {
    return true;
  }

  // 校验 page 是否在权限白名单中
  return checkPermission(item.page);
});

export default showList;
