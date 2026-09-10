import { nextTick } from "vue";
import { RESUME_HEIGHT, RESUME_WIDTH } from "../constants";
import { getExportFileName, resumeTitle } from "../../resumeName";
import type { Ref } from "vue";

type ResumeRootRef = Ref<HTMLElement | null>;

// 获取当前预览中的简历页面
const getResumePages = (rootRef: ResumeRootRef) => {
  const root = rootRef.value;
  if (!root) return [];
  return root.matches(".resume-page-item")
    ? [root]
    : Array.from(root.querySelectorAll<HTMLElement>(".resume-page-item"));
};

// 复制打印页面并移除编辑态样式，避免选中边框进入导出内容
const clonePrintPage = (page: HTMLElement) => {
  const clone = page.cloneNode(true) as HTMLElement;
  clone.style.boxShadow = "none";
  clone.style.borderRadius = "0";
  clone.style.border = "none";
  clone.style.margin = "0";
  clone.style.transform = "none";
  clone.style.zoom = "1";
  clone.querySelectorAll<HTMLElement>(".resume-module-wrapper").forEach((module) => {
    module.classList.remove("outline-2", "outline-offset-3", "outline-dashed", "outline-sf-theme");
  });
  return clone;
};

// 将当前简历页面转成图片，避免 Word 重新解析网页布局导致文件损坏或排版错乱
export const exportWord = async (rootRef: ResumeRootRef, onSuccess?: () => void, scale = 1) => {
  const pages = getResumePages(rootRef);
  if (!pages.length) {
    console.error("未找到可导出的简历页面");
    return;
  }

  let tempContainer: HTMLDivElement | undefined;
  try {
    await nextTick();
    await document.fonts?.ready;
    const [{ snapdom }, { Document, ImageRun, Packer, Paragraph }] = await Promise.all([
      import("@zumer/snapdom"),
      import("docx"),
    ]);

    tempContainer = document.createElement("div");
    tempContainer.style.position = "absolute";
    tempContainer.style.top = "-9999px";
    tempContainer.style.left = "-9999px";
    tempContainer.style.width = `${RESUME_WIDTH}px`;
    document.body.appendChild(tempContainer);

    const imageRuns = [];
    for (const page of pages) {
      const clone = clonePrintPage(page);
      tempContainer.innerHTML = "";
      tempContainer.appendChild(clone);

      const canvas = await snapdom.toCanvas(clone, {
        scale,
        backgroundColor: "#ffffff",
        embedFonts: true,
        width: RESUME_WIDTH,
        height: RESUME_HEIGHT,
      });
      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error("简历页面渲染失败");
      }

      const imageData = canvas.toDataURL("image/png").split(",")[1];
      const imageBytes = Uint8Array.from(atob(imageData), (character) => character.charCodeAt(0));
      imageRuns.push(
        new Paragraph({
          spacing: { before: 0, after: 0 },
          children: [
            new ImageRun({
              type: "png",
              data: imageBytes,
              transformation: { width: RESUME_WIDTH, height: RESUME_HEIGHT },
            }),
          ],
        }),
      );
    }

    const documentFile = new Document({
      title: resumeTitle.value,
      sections: imageRuns.map((imageRun) => ({
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 0, right: 0, bottom: 0, left: 0 },
          },
        },
        children: [imageRun],
      })),
    });
    const blob = await Packer.toBlob(documentFile);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = getExportFileName(resumeTitle.value, "docx");
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    onSuccess?.();
  } catch (error) {
    console.error("生成 Word 文档失败:", error);
  } finally {
    if (tempContainer?.parentNode) {
      tempContainer.parentNode.removeChild(tempContainer);
    }
  }
};
