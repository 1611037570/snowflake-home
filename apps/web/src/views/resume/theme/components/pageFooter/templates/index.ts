import type { Component } from "vue";
import type { FooterTemplateId } from "@/domain/resume/theme/uiTypes";
import TotalTemplate from "./total.vue";
import NumberTemplate from "./number.vue";
import PageTemplate from "./page.vue";

// 页尾模板与主题外观分开登记，页尾内容按简历选择的编号加载。
const footerTemplates: Record<FooterTemplateId, Component> = {
  total: TotalTemplate, // 当前页与总页数模板组件。
  number: NumberTemplate, // 数字页码模板组件。
  page: PageTemplate, // 文字页码模板组件。
};

export const resolveFooterTemplate = (templateId: FooterTemplateId) => footerTemplates[templateId];
