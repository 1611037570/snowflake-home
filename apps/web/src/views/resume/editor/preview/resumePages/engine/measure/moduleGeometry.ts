export interface ModuleGeometry {
  width: number; // 模块外框宽度
  height: number; // 模块外框高度
  nodes: Array<{ width: number /* 节点宽度 */, height: number /* 节点高度 */ }>; // 模块内节点尺寸
}

/** 模块外框仅绘图；占位留白必须进入已测量节点，避免分组跨页后预算变化。 */
export const isNeutralModuleGeometry = ({ width, height, nodes }: ModuleGeometry): boolean =>
  Math.abs(height - nodes.reduce((sum, node) => sum + node.height, 0)) <= 1 &&
  nodes.every((node) => Math.abs(node.width - width) <= 1);
