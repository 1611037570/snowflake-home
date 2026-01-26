# Snowflake Start Page — Localized Browser Start Page

[Simplified Chinese](README.md) | [English](README.en.md)

## 📌 Project Introduction

The project was launched on September 3, 2020, and open-sourced on November 22, 2025.

The main body is the Snowflake Start Page, which has expanded to include multiple small tools based on the start page; it also integrates multiple infrastructure features.

Through this project, you can learn the practical application of modern frontend technologies such as **Vue3**, **TypeScript**, and **Vite**.

## 🎯 Core Product Modules

- ✨ **Snowflake Start Page**：Core project carrier, providing a personalized and customizable website start page (http://nannan.work)
- 📄 **Resume Generator**：Visual resume editing tool that supports template selection, content customization, and one-click export (http://nannan.work/#/resume)
- 🎨 **Image Processing Tool**：Lightweight image suite covering common functions such as compression, cropping, and format conversion (http://nannan.work/#/image)
- 👤 **Personal Homepage**：Author's personal showcase page (http://nannan.work/#/index)

## 🔧 Core Technical Capabilities

### 🔥 Core Technology Stack

| Technical Area    | Implementation Solution                                              | Technical Features                                                                  |
| ----------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| **Cache Mgmt**    | 📥 LFU-R strategy cache manager based on **Pinia**                   | Supports custom expiration, automatic elimination when expired/over-limit           |
| **Request Mgmt**  | 🚀 Request class based on **Axios**                                  | Supports multiple instances, custom interceptors, unified request/response handling |
| **Route Mgmt**    | 🛣️ Automatic registration based on **VueRouter**                     | Supports dynamic generation, view lazy loading, error page redirection              |
| **Style Mgmt**    | 🎨 Themed CSS color variable system based on **TailwindCSS**         | Supports day/night mode switching                                                   |
| **Language Mgmt** | 🌐 Route-level multi-language support based on **i18n**              | Supports Chinese/English switching and extensibility                                |
| **Component Lib** | 🧩 Project-specific style component library based on **ElementPlus** | Supports on-demand/global import                                                    |
| **Tool Lib**      | 🛠️ Integrates multiple commonly used small tools from **VueUse**     | Provides rich frontend utility functions                                            |

### 🛠️ Development Technology Stack

**Frontend Framework & Language**: **Vue 3** + **TypeScript**  
**Build Tool**: **Vite**  
**State Management**: **Pinia**  
**UI Component Library**: **ElementPlus**  
**Style Solution**: **TailwindCSS**  
**Route Management**: **VueRouter**  
**HTTP Client**: **Axios**  
**Internationalization**: **i18n**  
**Utility Library**: **VueUse**

---

## 🔗 Live Demo

You can access the deployed project via the link below:

**Website**: <http://nannan.work>

---

## 🚀 Install & Run

**VS Code** or **Trae** is recommended as the development environment. The project provides `.vscode` configuration files, which can bring a better development experience.

```bash
# Install dependencies
pnpm install

# Run in development
pnpm dev

# Build for production
pnpm build
```

---

## 📄 License

This project is licensed under the [AGPL 3.0 License](LICENSE).

---

## ❄️ First Snow Again, Six Years of Frontend

Looking back, it is the sediment of tens of thousands of commits,
the persistence of countless `console.log`,
and the desire to have a signature work.

Until one late night of study, I suddenly realized:
every line written with care, every challenge solved with heart,
and the self that never gave up — these are my signature works.
Together they truly shaped my six years.

With the first snow falling, I bid farewell to these six years and open a new chapter.
See you next spring.

> #### November 22, 2025
