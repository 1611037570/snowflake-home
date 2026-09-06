// 技能：简历数据编写规范
// 由 resume-data-contract-generator.md 生成，更新时请通过生成器，勿直接修改
// 描述：本技能用于指导 AI 正确填写简历 JSON 中的 data 字段。 【适用场景】当用户说"写简历/改简历/新增工作经历/更新项目/修改个人优势"等涉及简历内容增删改时，必须加载本技能。 【核心职责】只负责生成或修改各模块的 data 内容（如 work.data、user.data），不涉及 UI 状态（collapsed/hidden）、模块配置（config/fixedConfig）或页面布局。 【数据来源】本规范基于项目 formConfig.ts 中定义的字段结构生成，所有字段路径、类型、必填性均来源于此。 【输出目标】通过 propose_resume_edits 以 operations 提交写操作，不直接返回 data。 【禁止行为】不编写完整简历文件，不操作 UI 状态，不修改 config/fixedConfig，不臆造不存在的字段。
export const resumeDataContract = () => ({
  id: "resume_data_contract",
  name: "简历数据编写规范",
  description: `本技能用于指导 AI 正确填写简历 JSON 中的 data 字段。 【适用场景】当用户说"写简历/改简历/新增工作经历/更新项目/修改个人优势"等涉及简历内容增删改时，必须加载本技能。 【核心职责】只负责生成或修改各模块的 data 内容（如 work.data、user.data），不涉及 UI 状态（collapsed/hidden）、模块配置（config/fixedConfig）或页面布局。 【数据来源】本规范基于项目 formConfig.ts 中定义的字段结构生成，所有字段路径、类型、必填性均来源于此。 【输出目标】通过 propose_resume_edits 以 operations 提交写操作，不直接返回 data。 【禁止行为】不编写完整简历文件，不操作 UI 状态，不修改 config/fixedConfig，不臆造不存在的字段。`,
  instructions: `# 1. 数据总体结构

一份简历按模块拆分，AI 读写统一使用以下结构，每个模块只保留 data：

\`\`\`typescript
{
  user: { data: 对象 },   // 对象型模块
  work: { data: 数组 },   // 数组型模块
}
\`\`\`

- **对象型模块**（user, skill, advantage）：\`data\` 是一个普通对象。

- **数组型模块**（account, education, work, project, video, image, honor, custom）：\`data\`是一个数组，每个元素是一条记录。

> **重要**：用户的实际简历可能只包含以上模块中的一部分，请只操作已存在的模块，不要凭空创建不存在的模块。\`read_resume_data\` 返回的就是该结构，\`propose_resume_edits\` 通过 operations 定位其中要修改的模块、记录与字段。

# 2. 各模块\`data\` 字段明细

## 2.1 用户信息 (\`user.data\`)

| 字段       | 类型     | 必填 | 格式/备注               |
| :------- | :----- | :- | :------------------ |
| avatar   | string | 否  | 头像 URL              |
| name     | string | ✅  | 真实姓名，2-20位          |
| birthday | string | 否  | 出生日期，格式 YYYY.MM     |
| phone    | string | ✅  | 手机号，11位数字（1开头）      |
| sex      | string | 否  | 可选值 "男"/"女"         |
| position | string | 否  | 求职岗位                |
| email    | string | 否  | 邮箱地址                |
| workTime | string | 否  | 参加工作时间，格式 YYYY.MM   |
| status   | string | 否  | 可选值 "在职"/"离职"/"应届生" |
| city     | string | 否  | 期望城市                |

## 2.2 社交账号 (\`account.data[]\`)

| 字段   | 类型     | 必填 | 格式/备注             |
| :--- | :----- | :- | :---------------- |
| name | string | ✅  | 账号名称（如 GitHub、博客） |
| url  | string | ✅  | 账号链接地址            |

## 2.3 教育经历 (\`education.data[]\`)

| 字段        | 类型     | 必填 | 格式/备注                             |
| :-------- | :----- | :- | :-------------------------------- |
| name      | string | ✅  | 学校名称                              |
| education | string | ✅  | 可选值 "高中"/"大专"/"本科"/"硕士"/"博士"      |
| post      | string | ✅  | 专业                                |
| mode      | string | ✅  | 可选值 "全日制"/"非全日制"/""(不填写)          |
| time      | array  | ✅  | 时间区间 \\["开始.YYYY.MM","结束.YYYY.MM"] |
| content   | string | 否  | 富文本 HTML（<p>包裹）                   |

## 2.4 专业技能 (\`skill.data\`)

| 字段      | 类型     | 必填 | 格式/备注           |
| :------ | :----- | :- | :-------------- |
| content | string | ✅  | 富文本 HTML（<p>包裹） |

## 2.5 个人优势 (\`advantage.data\`)

| 字段      | 类型     | 必填 | 格式/备注           |
| :------ | :----- | :- | :-------------- |
| content | string | ✅  | 富文本 HTML（<p>包裹） |

## 2.6 工作经历 (\`work.data[]\`)

| 字段      | 类型     | 必填 | 格式/备注                             |
| :------ | :----- | :- | :-------------------------------- |
| name    | string | ✅  | 公司名称                              |
| post    | string | ✅  | 岗位名称                              |
| time    | array  | ✅  | 时间区间 \\["开始.YYYY.MM","结束.YYYY.MM"] |
| content | string | ✅  | 富文本 HTML（<p>包裹）                   |

## 2.7 项目经历 (\`project.data[]\`)

| 字段      | 类型     | 必填 | 格式/备注                             |
| :------ | :----- | :- | :-------------------------------- |
| name    | string | ✅  | 公司/项目名称                           |
| post    | string | ✅  | 岗位/角色                             |
| time    | array  | ✅  | 时间区间 \\["开始.YYYY.MM","结束.YYYY.MM"] |
| content | string | ✅  | 富文本 HTML（<p>包裹）                   |

## 2.8 视频作品 (\`video.data[]\`)

| 字段   | 类型     | 必填 | 格式/备注 |
| :--- | :----- | :- | :---- |
| name | string | ✅  | 视频名称  |
| url  | string | ✅  | 视频地址  |
| desc | string | ✅  | 视频描述  |

## 2.9 图片作品 (\`image.data[]\`)

| 字段   | 类型     | 必填 | 格式/备注         |
| :--- | :----- | :- | :------------ |
| name | string | ✅  | 图片名称          |
| img  | string | ✅  | 图片 URL        |
| desc | string | ✅  | 图片描述          |
| size | number | ✅  | 图片尺寸百分比，默认 50 |

## 2.10 荣誉证书 (\`honor.data[]\`)

| 字段   | 类型     | 必填 | 格式/备注  |
| :--- | :----- | :- | :----- |
| name | string | ✅  | 荣誉证书名称 |

## 2.11 自定义经历 (\`custom_<id>.data[]\`)

> **特别说明**：自定义模块是动态添加的，顶层 key 以\`custom_\`开头（如 \`custom_a810d50c\`）。请勿修改顶层 key 或模块内 \`name\`（该字段控制 UI 显示名），只需提交该模块自己的\`data\`内容。

| 字段      | 类型     | 必填 | 格式/备注                             |
| :------ | :----- | :- | :-------------------------------- |
| name    | string | ✅  | 名称                                |
| post    | string | ✅  | 职位/角色                             |
| time    | array  | ✅  | 时间区间 \\["开始.YYYY.MM","结束.YYYY.MM"] |
| content | string | ✅  | 富文本 HTML（<p>包裹）                   |

# 3. 格式强制约定（必须遵守）

1. **时间格式**：所有时间必须使用 \`YYYY.MM\`（如 \`2023.07\`）。\`workTime\`和\`birthday\`只能是\`YYYY.MM\`，**严禁带日**（如 \`2022.08.01\`是错的）。
2. **富文本正文**：所有\`content\`字段必须是 HTML 字符串，用\`<p>\`包裹，加粗用\`<strong>\`。
3. **数组新增**：通过 propose_resume_edits 提交 op: add 并携带 record 内容新增记录，系统会同步表单配置；新增内容的草稿经用户保留后生效。
4. **数组型模块的** **\`data\`**：如果用户要修改第 N 条记录，注意数组索引从 0 开始。

# 4. 工作流程

1. 用户提出修改简历内容。
2. 确认目标模块（如 \`work\`）。
3. 先调用 read_resume_data 读取目标模块真实数据，作为定位修改目标的依据。
4. 查阅本规范中对应的"字段明细表"，确定要修改的模块、记录下标与字段。
5. 通过 propose_resume_edits 以 operations 提交写操作：对象型模块用 { op: "update", module, field, value }，数组型模块修改用 index 定位、新增用 { op: "add", module, record }；不直接在最终结果中返回 data。
6. 若 propose_resume_edits 返回 errors，先按错误逐条修正后重新提交，不得直接结束任务。

# 5. 正确与错误示例

| 场景      | ❌ 错误写法                           | ✅ 正确写法                           |
| :------ | :------------------------------- | :------------------------------- |
| 时间（数组内） | \`"time": ["2023-01", "2024-01"]\` | \`"time": ["2023.01", "2024.01"]\` |
| 参加工作时间  | \`"workTime": "2022.08.01"\`       | \`"workTime": "2022.08"\`          |
| 富文本正文   | \`"content": "我负责开发"\`             | \`"content": "<p>我负责开发</p>"\`      |`,
});
