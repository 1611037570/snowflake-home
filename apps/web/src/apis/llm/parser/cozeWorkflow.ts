import { processJson } from "../request/stream-utils";
export const cozeWorkflowStreamParser = (line: string, { onEvent, isDebug }: any) => {
  const jsonObj = processJson(line, isDebug);
  if (isDebug) console.log("CozeWorkflow JSON", jsonObj);

  const { content_type = "", content = "" } = jsonObj;
  if (content_type !== "text") {
    return "";
  }

  onEvent?.("content", content);
  if (isDebug) {
    console.log("当前内容 :>> ", content);
  }
  return content;
};
