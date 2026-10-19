// 明确要求只分析或不修改时关闭写入状态，避免把建议类问题误写进简历。
const NON_WRITE_PATTERNS = [
  /(?:只|仅)(?:做|给|需要)?(?:分析|建议|评估|诊断)/,
  /(?:暂时|暂且)?不(?:要|用|需要)?(?:修改|改动|写入|更新)/,
  /(?:如何|怎么|怎样).{0,8}(?:优化|修改|改写)/,
  /(?:优化|修改|改写).{0,4}(?:建议|方案|思路)/,
];

// 简历助手中的直接操作动词默认表示修改当前简历，非简历产物单独排除。
const WRITE_ACTION_PATTERN =
  /优化|润色|改写|修改|调整|补充|新增|添加|删除|移除|排序|精简|扩写|重写|替换|合并|拆分/;
const NON_RESUME_TARGET_PATTERN = /面试回答|回答方案|打招呼语|职业规划|人生总结/;
const WRITE_CONTINUATION_PATTERN =
  /继续|再来|重新|更专业|更简洁|更详细|换成|改成|按照|这段|这一段|上面|刚才|不对|不是/;
// 疑问句式即使包含操作动词也只是征求建议，不构成写入指令
const QUESTION_PATTERN = /(?:有没有|要不要|是否|有必要|能否|能不能|需不需要|可不可以|吗|？|\?)/;

// 解析本轮是否必须真实写入；没有新指令时延续同一话题已经建立的写入状态。
export const resolveResumeWriteIntent = (content: string, previousWriteTask = false): boolean => {
  const text = content.trim();
  if (!text || NON_WRITE_PATTERNS.some((pattern) => pattern.test(text))) return false;
  if (NON_RESUME_TARGET_PATTERN.test(text)) return false;
  // 疑问句式优先于操作动词：询问是否需要某种修改时不强制写入
  if (QUESTION_PATTERN.test(text)) return false;
  if (WRITE_ACTION_PATTERN.test(text)) return true;
  return previousWriteTask && WRITE_CONTINUATION_PATTERN.test(text);
};
