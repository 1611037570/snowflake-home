declare module "virtual:resume-public-sections" {
  /** 按公开范本标识索引的模块段落。 */
  const sections: Record<string, import("./catalog").ExampleSection[]>;
  export default sections;
}
