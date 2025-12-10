export const manifestConfig: any = {
  name: 'Snowflake Index', // 应用全称
  short_name: 'Snowflake', // 应用简称 (用于主屏幕显示)
  description: 'A beautiful personal homepage', // 应用描述
  theme_color: '#ffffff', // 主题色 (影响浏览器工具栏颜色)
  // 应用图标配置
  icons: [
    {
      src: 'logo.svg', // 图标路径
      sizes: '192x192', // 尺寸
      type: 'image/svg+xml', // 类型
    },
    {
      src: 'logo.svg',
      sizes: '512x512',
      type: 'image/svg+xml',
    },
  ],
}
