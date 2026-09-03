<script setup>
const visible = ref(false);
const jobPlatformList = [
  {
    type: "综合主流商业平台",
    array: [
      {
        name: "BOSS直聘",
        url: "https://www.zhipin.com",
        logo: "https://www.zhipin.com/favicon.ico",
      },
      {
        name: "智联招聘",
        url: "https://www.zhaopin.com",
        logo: "https://www.zhaopin.com/favicon.ico",
      },
      {
        name: "前程无忧",
        url: "https://www.51job.com",
        logo: "https://www.51job.com/favicon.ico",
      },
      {
        name: "猎聘",
        url: "https://www.liepin.com",
        logo: "https://concat.lietou-static.com/fe-www-pc/v6/static/images/favicon.371e30de.ico",
      },
      { name: "58同城招聘", url: "https://zhaopin.58.com", logo: "https://www.58.com/favicon.ico" },
    ],
  },
  {
    type: "垂直细分招聘平台",
    array: [
      {
        name: "拉勾网",
        url: "https://www.lagou.com",
        logo: "https://www.lgstatic.com/lg-www-fed/common/static/favicon_faed927.ico",
      },
      {
        name: "牛客网",
        url: "https://www.nowcoder.com",
        logo: "https://www.nowcoder.com/favicon.ico",
      },
    ],
  },
  {
    type: "官方权威招聘平台",
    array: [
      {
        name: "中国公共招聘网",
        url: "http://job.mohrss.gov.cn",
        logo: "http://job.mohrss.gov.cn/r/cms/www/default/images/rone.ico",
      },
      {
        name: "就业在线",
        url: "https://www.jobonline.cn",
        logo: "https://www.jobonline.cn/favicon.ico",
      },
      {
        name: "国聘网",
        url: "https://www.iguopin.com",
        logo: "https://www.iguopin.com/favicon.ico",
      },
      {
        name: "国家大学生就业服务平台",
        url: "https://www.ncss.cn",
        logo: "https://www.ncss.cn/favicon.ico",
      },
    ],
  },
  {
    type: "应届生/实习专属平台",
    array: [
      {
        name: "应届生求职网",
        url: "https://www.yingjiesheng.com",
        logo: "https://www.yingjiesheng.com/favicon.ico",
      },
      {
        name: "实习僧",
        url: "https://www.shixiseng.com",
        logo: "https://sxsimg.xiaoyuanzhao.com/static/img/favicon.ico",
      },
    ],
  },
];

const go = (url) => {
  window.open(url, "_blank");
};
</script>

<template>
  <div>
    <SfButton @click="visible = true"> 投简历 </SfButton>
    <SfModal v-model="visible" title="投简历">
      <div class="w-[500px]">
        <div v-for="item in jobPlatformList" :key="item.type">
          <div class="text-base font-bold text-sf-text">{{ item.type }}</div>
          <div class="flex flex-wrap gap-2">
            <div v-for="platform in item.array" :key="platform.name">
              <img :src="platform.logo" alt="logo" class="mr-2 h-12 w-12 rounded" />
              <div @click="go(platform.url)">{{ platform.name }}</div>
            </div>
          </div>
        </div>
        <SfCollapse>
          <SfCollapseItem title="作者留言">
            到这里，你的专属简历就正式完成啦～很开心能陪你走完这一程。祝你求职顺利，斩获心仪
            offer。感谢使用轻舟简历。
          </SfCollapseItem>
        </SfCollapse>
      </div>
    </SfModal>
  </div>
</template>

<style lang="scss" scoped></style>
