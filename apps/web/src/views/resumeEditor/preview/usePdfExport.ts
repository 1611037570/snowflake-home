/**
 * usePdfExport —— 简历预览导出 PDF 的 composable
 *
 * 作用：将页面上已分页渲染的 .resume-page-item 元素导出为 PDF 文件。
 * 直接利用预览层已生成的分页结构导出，无需重新排版。
 */
import { nextTick } from "vue";
import { resumeTitle } from "../utils";

/** A4 页面宽度（mm） */
const PDF_PAGE_WIDTH = 210;
/** A4 页面高度（mm） */
const PDF_PAGE_HEIGHT = 297;
/** 简历渲染宽度（px，与 page.vue 的 WIDTH 保持一致） */
const RESUME_WIDTH = 794;
/** 简历渲染高度（px，与 page.vue 的 HEIGHT 保持一致） */
const RESUME_HEIGHT = 1123;

/**
 * 创建 PDF 导出能力
 * @returns 导出 PDF 的方法
 */
export const usePdfExport = () => {
  /**
   * 将简历预览导出为 PDF 文件
   * 直接利用页面中已分页的 .resume-page-item 元素导出
   */
  const printPDF = async () => {
    try {
      // 确保DOM已渲染完成
      await nextTick();
      await document.fonts?.ready;
      // 动态导入PDF相关库
      const { snapdom } = await import("@zumer/snapdom");
      const { default: jsPDF } = await import("jspdf");

      // 查找所有已分页的页面元素
      const pages = document.querySelectorAll(".resume-page-item");
      if (pages.length === 0) {
        console.error("未找到可打印的简历页面");
        return;
      }

      // 创建PDF文档 (A4尺寸)
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // 创建隐藏的临时容器用于渲染 (防止缩放干扰)
      const tempContainer = document.createElement("div");
      tempContainer.style.position = "absolute";
      tempContainer.style.top = "-9999px";
      tempContainer.style.left = "-9999px";
      tempContainer.style.width = `${RESUME_WIDTH}px`; // A4 96dpi 宽度
      document.body.appendChild(tempContainer);

      for (let i = 0; i < pages.length; i++) {
        const pageEl = pages[i];

        // 克隆页面并清除可能干扰渲染的样式 (如阴影、圆角)
        const clone = pageEl.cloneNode(true);
        clone.style.boxShadow = "none";
        clone.style.borderRadius = "0";
        clone.style.margin = "0";
        clone.style.transform = "none";
        clone.style.zoom = "1";

        tempContainer.innerHTML = "";
        tempContainer.appendChild(clone);

        // 渲染页面为 Canvas
        const canvas = await snapdom.toCanvas(clone, {
          scale: 2, // 提高清晰度
          backgroundColor: "#ffffff",
          embedFonts: true,
          width: RESUME_WIDTH,
          height: RESUME_HEIGHT,
        });

        if (!canvas || canvas.width === 0 || canvas.height === 0) {
          console.error(`第 ${i + 1} 页渲染失败`);
          continue;
        }

        const imgData = canvas.toDataURL("image/png");

        // 如果不是第一页，添加新页面
        if (i > 0) {
          pdf.addPage();
        }

        // 将图片填满整个PDF页面
        pdf.addImage(imgData, "PNG", 0, 0, PDF_PAGE_WIDTH, PDF_PAGE_HEIGHT, undefined, "FAST");

        // 提取并添加超链接
        const cloneRect = clone.getBoundingClientRect();
        const links = clone.querySelectorAll("a");
        const scaleFactor = PDF_PAGE_WIDTH / RESUME_WIDTH;

        links.forEach((link) => {
          const linkRect = link.getBoundingClientRect();
          const href = link.getAttribute("href");
          if (href) {
            pdf.link(
              (linkRect.left - cloneRect.left) * scaleFactor,
              (linkRect.top - cloneRect.top) * scaleFactor,
              linkRect.width * scaleFactor,
              linkRect.height * scaleFactor,
              { url: href },
            );
          }
        });
      }

      // 清理临时容器
      document.body.removeChild(tempContainer);

      // 保存PDF
      pdf.save(`${resumeTitle.value}.pdf`);

      console.log(`成功导出 ${pages.length} 页 PDF`);
    } catch (error) {
      console.error("生成PDF失败:", error);
    }
  };

  return { printPDF };
};
