<script setup>
const visible = ref(false);
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
    desc: "短期兼职、临时工、蓝领岗位",
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

const go = (data) => {
  window.open(data.url, "_blank");
};
</script>

<template>
  <div>
    <div @click="visible = true">
      <slot>
        <SfButton> 投简历 </SfButton>
      </slot>
    </div>
    <SfModal v-model="visible" title="投简历">
      <div class="w-[420px]">
        <SfCollapse>
          <SfCollapseItem title="作者留言">
            到这里，你的专属简历就正式完成啦～很开心能陪你走完这一程。祝你求职顺利，斩获心仪
            offer。感谢使用轻舟简历。
          </SfCollapseItem>
          <SfCollapseItem title="安全提醒">
            本平台仅作信息展示，不参与招聘。内容均来自互联网，仅供参考!!!
          </SfCollapseItem>
          <SfCollapseItem title="防骗指南">
            任何收费均为诈骗，勿泄露密码/验证码，认准官方域名，面试前核实企业资质。遇骗请立即报警。
          </SfCollapseItem>
        </SfCollapse>
        <div v-for="item in jobPlatformList" :key="item.type">
          <div class="text-base font-bold text-sf-text">{{ item.type }}</div>
          <div class="flex flex-wrap gap-3">
            <div v-for="platform in item.array" :key="platform.name">
              <SfApp boxSize="18" :data="platform" @onClick="go" size="15" />
            </div>
          </div>
        </div>
      </div>
    </SfModal>
  </div>
</template>

<style lang="scss" scoped></style>
