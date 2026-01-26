# Snowflake Start Page — Browser Start Page, Multi-Tools

[Simplified Chinese](README.md) | [English](README.en.md)

## 📌 Project Background

The project was launched on September 3, 2020, and open-sourced on November 22, 2025.
The main body is the Snowflake Start Page, which has expanded to include multiple small tools based on the start page; it also integrates multiple infrastructure features.
It can help you learn the practical application of modern frontend technologies such as Vue3, TypeScript, and Vite.

## 🎯 Core Product Modules

✨ [Snowflake Start Page](http://nannan.work)：Core project carrier, providing a personalized and customizable website start page
📄 [Resume Generator](http://nannan.work/#/resume)：Visual resume editing tool that supports template selection, content customization, and one-click export
🎨 [Image Processing Tool](http://nannan.work/#/image)：Lightweight image suite covering common functions such as compression, cropping, and format conversion
👤 [Personal Homepage](http://nannan.work/#/index)：Author's personal page

## 🔧 Core Technical Capabilities

📥**Cache**：LFU-R strategy cache manager based on Pinia; supports custom expiration configuration, automatic elimination when expired/over-limit.
🚀**Request Management**：Request class based on Axios; supports multiple instances, custom interceptors, and unified request/response processing mechanism.
🛣️**Route Management**：Automatic registration based on VueRouter; supports dynamic generation, view lazy loading, and error page redirection mechanism.
🎨**Style Management**：Themed CSS color variable system based on TailwindCSS; supports day/night mode switching.
🌐**Language Management**：Route-level multi-language support based on i18n; supports Chinese/English switching and is extensible.
**Component Library**：Project-specific style component library based on ElementPlus; supports on-demand/global import.
**Tool Library**：Integrates multiple commonly used small tools from VueUse.

## 🔗 Live Demo

You can access the deployed project via the link below

**Website**: <http://nannan.work>

## 🚀 Install & Run

VS Code or Trae is recommended as the development environment. The project provides .vscode configuration files, which can bring a better development experience.

```bash
# Install dependencies
pnpm install

# Run in development
pnpm dev

# Build for production
pnpm build
```

## 📄 License

This project is licensed under the [AGPL 3.0 License](LICENSE).

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
