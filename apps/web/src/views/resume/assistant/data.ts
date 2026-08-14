// 快捷操作配置
export const quickActions = [
  {
    name: 'AI 生成',
    type: 'generate',
    icon: 'ph:magic-wand-duotone',
    placeholder: '告诉 AI 你想生成什么内容...',
    prompt: {
      role: 'system',
      content: '',
    },
  },
  {
    name: 'AI 润色',
    type: 'polish',
    icon: 'ph:magic-wand-duotone',
    placeholder: '告诉 AI 你想润色哪部分内容...',
    prompt: {
      role: 'system',
      content: '',
    },
  },
  {
    name: 'AI 评分',
    type: 'score',
    icon: 'ph:stethoscope-duotone',
    placeholder: '告诉 AI 你想评分...',
    prompt: {
      role: 'system',
      content: '',
    },
  },
  {
    name: '对标 JD 优化',
    type: 'jd',
    icon: 'ph:stethoscope-duotone',
    placeholder: '粘贴目标岗位的 JD 内容...',
    prompt: {
      role: 'system',
      content: '',
    },
  },
]
