// 数据来源package.json
// 技术栈数据对象 - 包含所有类别
const techStackList = [
  // 核心框架与构建工具
  {
    key: 'core-frameworks',
    name: '核心框架与构建工具',
    items: [
      { name: 'Vue 3', version: '3.5.22', description: '渐进式JavaScript框架', icon: 'logos:vue' },
      {
        name: 'TypeScript',
        version: '5.9.3',
        description: 'JavaScript超集语言',
        icon: 'logos:typescript-icon',
      },
      { name: 'Vite', version: '7.1.9', description: '快速构建工具', icon: 'logos:vitejs' },
      { name: 'Pinia', version: '3.0.3', description: '状态管理库', icon: 'logos:pinia' },
      { name: 'Vue Router', version: '4.5.1', description: '路由管理', icon: 'logos:router' },
      {
        name: 'Element Plus',
        version: '2.11.4',
        description: 'UI组件库',
        icon: 'element-plus',
      },
      {
        name: 'Tailwind CSS',
        version: '4.1.14',
        description: '原子化CSS框架',
        icon: 'logos:tailwindcss-icon',
      },
      { name: 'pnpm', description: '高性能包管理器', icon: 'logos:pnpm-icon' },
    ],
  },

  // 代码质量与规范化
  {
    key: 'code-quality',
    name: '代码质量与规范化',
    items: [
      { name: 'ESLint', version: '9.37.0', description: '代码检查工具', icon: 'logos:eslint' },
      {
        name: 'Prettier',
        version: '3.6.2',
        description: '代码格式化',
        icon: 'logos:prettier-icon',
      },
      { name: 'Husky', version: '9.1.7', description: 'Git钩子工具', icon: 'logos:husky' },
      {
        name: 'commitlint',
        version: '20.1.0',
        description: '提交消息规范',
        icon: 'mdi:file-document-outline',
      },
      { name: 'Trae', description: 'AI开发工具', icon: 'mdi:hammer-wrench' },
      {
        name: 'lint-staged',
        version: '16.2.3',
        description: '暂存文件检查',
        icon: 'mdi:file-code-outline',
      },
      { name: 'cz-git', version: '1.12.0', description: '提交规范工具', icon: 'mdi:git-commit' },
      {
        name: 'oxlint',
        version: '1.11.2',
        description: '高性能代码检查工具',
        icon: 'mdi:code-tags',
      },
    ],
  },

  // 其他依赖
  {
    key: 'other-dependencies',
    name: '其他依赖',
    items: [
      { name: '@iconify/vue', version: '5.0.0', description: '图标库', icon: 'logos:iconify' },
      { name: '@vueuse/core', version: '13.9.0', description: 'Vue工具集', icon: 'logos:vue' },
      { name: 'axios', version: '^1.12.2', description: 'HTTP客户端', icon: 'logos:axios' },
      { name: 'dayjs', version: '^1.11.18', description: '日期处理', icon: 'logos:dayjs' },
      {
        name: 'html2canvas',
        version: '1.4.1',
        description: 'HTML转Canvas',
        icon: 'mdi:image-plus',
      },
      { name: 'jspdf', version: '3.0.3', description: 'PDF生成', icon: 'mdi:file-pdf-box' },
      {
        name: 'pinia-plugin-persistedstate',
        version: '^4.5.0',
        description: '状态持久化',
        icon: 'logos:pinia',
      },
      {
        name: 'vue-draggable-plus',
        version: '^0.6.0',
        description: '拖拽功能',
        icon: 'mdi:grip-vertical',
      },
      {
        name: 'chinese-workday',
        version: '^1.10.1',
        description: '工作日计算',
        icon: 'mdi:calendar-clock',
      },
      { name: 'vue-i18n', version: '^11.1.12', description: '国际化支持', icon: 'mdi:translate' },
    ],
  },
]

export { techStackList }
