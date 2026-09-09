// 工具参数提示：统一约束模型生成可解析的 JSON
export const TOOL_ARGUMENT_RULE =
  "必须严格遵守本工具的 parameters 参数定义：调用参数必须是可直接 JSON.parse 的标准 JSON 对象，字段名、字段类型和嵌套结构不得自行增删或改写；不要输出 Markdown 代码块、解释文字或注释；字符串中的换行使用 JSON 转义形式 \\n，除 JSON 标准转义外，不要在普通字符前添加反斜杠。";

// 简历写入提示：保证 HTML 内容不会被错误转义
export const PROPOSE_RESUME_EDITS_RULE =
  "value 字段中的 HTML 标签必须直接使用 <p>、</p>、<strong> 等原始字符，禁止在 <、>、/、* 等普通字符前添加反斜杠；反斜杠仅用于 JSON 标准转义。";
