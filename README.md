# 轻舟简历

[简体中文](README.md) | [English](README.en.md)

[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE) ![Vue](https://img.shields.io/badge/Vue-3.5-42b883) ![Vite](https://img.shields.io/badge/Vite-7.1-646CFF) ![NestJS](https://img.shields.io/badge/NestJS-11-E0234E)

## 📌 项目介绍

轻舟简历是一个免费在线简历工具 · _一叶轻舟 渡你过万重山_

提供自定义编辑器与 AI 两套编辑模式，实时渲染所见即所得，写完即可导出 PDF。

通过本项目，您可以学习 **Vue3**、**Vite**、**NestJS** 等现代前后端技术的实战应用。

2025年11月22日开始重构并开源。

## 🔗 在线体验

- 📄 **轻舟简历** · 免费在线制作简历 ![维护中](https://img.shields.io/badge/状态-维护中-brightgreen)

  预览：https://qzcv.net

## ✨ 主要功能

- **编辑器**：左侧表单编辑，右侧实时预览分页效果，支持多种排版主题与行业范本。
- **AI 能力**：一键生成简历、内容优化、AI 助手对话式修改，改动逐条可确认。
- **面试训练**：独立面试栏目，支持面试准备、模拟与复盘记录。
- **求职工具**：离职决策评分、Offer 对比、真实时薪换算等决策小工具。
- **导出**：PDF、图片与 Markdown 导出，无水印。

## 🚀 安装运行

项目基于 **pnpm monorepo** 管理，子包位于 `apps` 目录下：

- **web**：前端主体，简历编辑器、模板与页面 作者主导开发维护 ![作者主导](https://img.shields.io/badge/维护-作者主导-blue)
- **server**：后端服务，AI 能力与数据接口 AI主导开发维护 ![AI主导](https://img.shields.io/badge/维护-AI主导-purple)

**环境要求**

- **Node.js**：`^20.19.0` 或 `>=22.12.0`
- **pnpm**：`^10.0.0`

推荐使用 **VS Code** 作为开发环境，项目提供了 `.vscode` 配置文件，能够带来更好的开发体验。

```shell
# 安装依赖
pnpm install

# 运行项目
pnpm dev

# 打包项目
pnpm build
```

## 📜 开源协议

本项目基于 [MIT License](LICENSE) 开源，可自由使用、修改与分发。

## 作者碎碎念

❄️小雪又至，六载前端路。

回望过去，是**上万次 Commit** 的沉淀，是数不清多次 **console.log**的坚持，也是渴望拥有**代表作**的念想。

直到某个学习的深夜，忽然明白，原来认真写下每行代码、用心解决的每个难点和从未放弃的自己。都是我的代表作。它们真实地构成了我的六年。

初雪落下，与这六年告别，新篇开启。待下个春天见。

> #### **2025年11月22日**
