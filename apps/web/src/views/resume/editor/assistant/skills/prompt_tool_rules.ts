// 工具参数提示：统一约束模型生成可解析的 JSON
export const TOOL_ARGUMENT_RULE =
  "必须是可直接 JSON.parse 的标准 JSON 对象，不要在普通字符前添加反斜杠。";

// 简历写入提示：保证 HTML 内容不会被错误转义
export const PROPOSE_RESUME_EDITS_RULE =
  "富文本字段必须提交 HTML，不得提交 Markdown 或纯文本；段落使用 <p>，列表使用 <ul>/<ol> 与 <li>，强调使用 <strong>/<em>。value 字段以及 record 内的 HTML 标签必须使用原始字符，禁止在 <、>、/、* 等普通字符前添加反斜杠；反斜杠仅用于 JSON 标准转义。";
