/**
 * commitlint 配置文件
 * 文档
 * https://commitlint.js.org/#/reference-rules
 * https://cz-git.qbb.sh/zh/guide/
 */
/** @type { import('cz-git').UserConfig } */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 提交类型枚举，git提交type必须是以下类型
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'perf',
        'docs',
        'style',
        'test',
        'refactor',
        'build',
        'ci',
        'chore',
        'wip',
        'revert',
        'init',
      ],
    ],
    // subject大小写不做校验
    'subject-case': [0],
  },
  prompt: {
    alias: { fd: 'docs: fix typos' },
    messages: {
      type: '选择你要提交的类型 :',
      scope: '选择一个提交范围（可选）:',
      customScope: '请输入自定义的提交范围 :',
      subject: '填写简短精炼的变更描述 :\n',
      body: '填写更加详细的变更描述（可选）。使用 "|" 换行 :\n',
      breaking: '列举非兼容性重大的变更（可选）。使用 "|" 换行 :\n',
      footerPrefixesSelect: '选择关联issue前缀（可选）:',
      customFooterPrefix: '输入自定义issue前缀 :',
      footer: '列举关联issue (可选) 例如: #31, #I3244 :\n',
      generatingByAI: '正在通过 AI 生成你的提交简短描述...',
      generatedSelectByAI: '选择一个 AI 生成的简短描述:',
      confirmCommit: '是否提交或修改commit ?',
    },
    types: [
      { value: 'feat', name: 'feat:     新增功能' },
      { value: 'fix', name: 'fix:      修复缺陷' },
      { value: 'docs', name: 'docs:     文档更新' },
      {
        value: 'style',
        name: 'style:    代码格式（不影响功能，例如空格、分号等格式修正）',
      },
      {
        value: 'refactor',
        name: 'refactor: 代码重构（不包括 bug 修复、功能新增）',
      },
      { value: 'perf', name: 'perf:     性能优化' },
      { value: 'test', name: 'test:     测试相关' },
      {
        value: 'build',
        name: 'build:    构建相关',
      },
      { value: 'ci', name: 'ci:       修改 CI 配置、脚本' },

      { value: 'revert', name: 'revert:   回滚 commit' },
      {
        value: 'chore',
        name: 'chore:    对构建过程或辅助工具和库的更改（不影响源文件、测试用例）',
      },
    ],
    useEmoji: true,
    emojiAlign: 'center',
    useAI: false,
    aiNumber: 1,
    themeColorCode: '',
    scopes: [],
    allowCustomScopes: true,
    allowEmptyScopes: true,
    customScopesAlign: 'bottom',
    customScopesAlias: '以上都不是？我要自定义',
    emptyScopesAlias: '跳过',
    upperCaseSubject: false,
    markBreakingChangeMode: false,
    allowBreakingChanges: ['feat', 'fix'],
    breaklineNumber: 100,
    breaklineChar: '|',
    // 跳过的步骤
    skipQuestions: [
      'scope',
      'customScope',
      'body',
      'breaking',
      'footerPrefixesSelect',
      'customFooterPrefix',
      'footer',
    ],

    issuePrefixes: [],
    customIssuePrefixAlign: 'top',
    emptyIssuePrefixAlias: '跳过',
    customIssuePrefixAlias: '自定义前缀',
    allowCustomIssuePrefix: true,
    allowEmptyIssuePrefix: true,
    confirmColorize: true,
    scopeOverrides: undefined,
    defaultBody: '',
    defaultIssues: '',
    defaultScope: '',
    defaultSubject: '',
  },
}
