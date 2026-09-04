<script setup>
import { ref } from "vue";
import Money from "@/components/base/donation/money.vue";

const visible = ref(false);

// 暴露 open 方法，供外部通过 ref 调用
const open = () => {
  visible.value = true;
};
defineExpose({ open });
const jobPlatformList = [
  {
    type: "常用求职平台",
    array: [
      {
        name: "BOSS直聘",
        url: "https://www.zhipin.com",
        img: "https://www.zhipin.com/favicon.ico",
      },
      {
        name: "智联招聘",
        url: "https://www.zhaopin.com",
        img: "https://www.zhaopin.com/favicon.ico",
      },
      {
        name: "前程无忧",
        url: "https://www.51job.com",
        img: "https://www.51job.com/favicon.ico",
      },
      {
        name: "猎聘",
        url: "https://www.liepin.com",
        img: "https://concat.lietou-static.com/fe-www-pc/v6/static/images/favicon.371e30de.ico",
      },
      { name: "58同城招聘", url: "https://zhaopin.58.com", img: "https://www.58.com/favicon.ico" },
    ],
  },
  {
    type: "官方国企平台",
    array: [
      {
        name: "中国公共招聘网",
        url: "http://job.mohrss.gov.cn",
        img: "http://job.mohrss.gov.cn/r/cms/www/default/images/rone.ico",
      },
      {
        name: "就业在线",
        url: "https://www.jobonline.cn",
        img: "https://www.jobonline.cn/favicon.ico",
      },
      {
        name: "国聘网",
        url: "https://www.iguopin.com",
        img: "https://www.iguopin.com/favicon.ico",
      },
      {
        name: "国家大学生就业服务平台",
        url: "https://www.ncss.cn",
        img: "https://t3.chei.com.cn/ncss/favicon.ico",
      },
      {
        name: "中智招聘",
        url: "https://www.ciiczhaopin.com/index.html",
        img: "https://www.ciiczhaopin.com/favicon.ico",
      },
    ],
  },
  {
    type: "应届生/实习平台",
    array: [
      {
        name: "应届生求职网",
        url: "https://www.yingjiesheng.com",
        img: "https://www.yingjiesheng.com/favicon.ico",
      },
      {
        name: "实习僧",
        url: "https://www.shixiseng.com",
        img: "https://sxsimg.xiaoyuanzhao.com/static/img/favicon.ico",
      },
      {
        name: "智联校园",
        url: "https://xiaoyuan.zhaopin.com/",
        img: "https://www.zhaopin.com/favicon.ico",
      },
    ],
  },
  {
    type: "互联网技术岗位",
    array: [
      {
        name: "拉勾网",
        url: "https://www.lagou.com",
        img: "https://www.lgstatic.com/lg-www-fed/common/static/favicon_faed927.ico",
      },
      {
        name: "牛客网",
        url: "https://www.nowcoder.com",
        img: "https://www.nowcoder.com/favicon.ico",
      },
    ],
  },
  {
    type: "兼职/其他",
    array: [
      {
        name: "青团社",
        url: "https://user.qtshe.com/",
        img: "https://oss-img.qtshe.com/favicon.png",
      },
      {
        name: "鱼泡直聘",
        url: "https://www.yupao.com",
        img: "https://cdn.yupaowang.com/yupao_pc/images/zddq/facvion.ico",
      },
      {
        name: "电鸭社区",
        url: "https://eleduck.com",
        img: "https://eleduck.com/static/favicon.ico",
      },
      {
        name: "猪八戒网",
        url: "https://www.zhubajie.com",
        img: "https://www.zhubajie.com/favicon.ico",
      },
    ],
  },
];

const oepn = (data) => {
  window.open(data.url, "_blank");
};
</script>

<template>
  <div>
    <div @click="visible = true">
      <slot>
        <!-- 投递按钮：增加发送图标并美化样式 -->
        <SfButton>
          <SfIcon icon="ph:paper-plane-right-fill" class="mr-2 rotate-180" size="4" />
          投递简历
        </SfButton>
      </slot>
    </div>
    <SfModal v-model="visible" title="投递简历">
      <SfScrollbar height="600px" class="overflow-hidden">
        <div class="w-[420px]">
          <!-- 提示折叠面板：每个标题增加对应图标、色块与描述美化 -->
          <SfCollapse class="deliver-collapse mb-4">
            <SfCollapseItem name="author">
              <template #title>
                <div class="flex items-center">
                  <span
                    class="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-md bg-pink-100"
                  >
                    <SfIcon icon="solar:heart-bold" class="text-pink-500" size="4" />
                  </span>
                  <span class="text-sm font-medium text-sf-text">作者留言</span>
                </div>
              </template>
              <div
                class="rounded-lg border border-pink-100/50 bg-pink-50/40 py-2 pr-3 pl-8 text-[13px] leading-6 break-words text-sf-text/80"
              >
                到这里，我想你的专属简历已经完成啦～很开心能陪你走完这一程。祝你求职顺利，斩获心仪
                offer。感谢使用轻舟简历。
              </div>
            </SfCollapseItem>
            <SfCollapseItem name="money">
              <template #title>
                <div class="flex items-center">
                  <span
                    class="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-md bg-pink-100"
                  >
                    <SfIcon icon="solar:heart-bold" class="text-pink-500" size="4" />
                  </span>
                  <span class="text-sm font-medium text-sf-text">支持项目</span>
                </div>
              </template>
              <div
                class="rounded-lg border border-pink-100/50 bg-pink-50/40 px-3 py-2 text-[13px] leading-6 break-words text-sf-text/80"
              >
                <Money />
              </div>
            </SfCollapseItem>
            <SfCollapseItem name="safe">
              <template #title>
                <div class="flex items-center">
                  <span
                    class="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-md bg-amber-100"
                  >
                    <SfIcon icon="bi:shield-exclamation" size="4" class="text-amber-500" />
                  </span>
                  <span class="text-sm font-medium text-sf-text">安全提醒</span>
                </div>
              </template>
              <div
                class="rounded-lg border border-amber-100/60 bg-amber-50/50 py-2 pr-3 pl-8 text-[13px] leading-6 break-words text-sf-text/80"
              >
                本平台仅作信息展示，不参与招聘。内容均来自互联网，仅供参考!!!
              </div>
            </SfCollapseItem>
            <SfCollapseItem name="fraud">
              <template #title>
                <div class="flex items-center">
                  <span
                    class="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-md bg-emerald-100"
                  >
                    <SfIcon icon="stash:lock-closed" size="4" class="text-emerald-500" />
                  </span>
                  <span class="text-sm font-medium text-sf-text">防骗指南</span>
                </div>
              </template>
              <div
                class="rounded-lg border border-emerald-100/60 bg-emerald-50/50 py-2 pr-3 pl-8 text-[13px] leading-6 break-words text-sf-text/80"
              >
                任何收费均为诈骗，勿泄露密码/验证码，认准官方域名，面试前核实企业资质。遇骗请立即报警。
              </div>
            </SfCollapseItem>
          </SfCollapse>
          <div v-for="item in jobPlatformList" :key="item.type" class="mb-3">
            <div class="mb-2 flex items-center text-base font-bold text-sf-text">
              <span class="mr-2 inline-block h-4 w-1 rounded-full bg-sf-theme" />
              {{ item.type }}
            </div>
            <div class="flex flex-wrap gap-3 pl-1">
              <div v-for="platform in item.array" :key="platform.name">
                <SfApp boxSize="18" :data="platform" @onClick="oepn" size="15" />
              </div>
            </div>
          </div>
        </div>
      </SfScrollbar>
    </SfModal>
  </div>
</template>

<style lang="scss" scoped>
// 折叠面板内容区去默认边框，与美化后的卡片内容融合
:deep(.deliver-collapse .el-collapse-item__wrap) {
  background: transparent;
}
:deep(.deliver-collapse .el-collapse-item__content) {
  padding-bottom: 12px;
}
</style>
