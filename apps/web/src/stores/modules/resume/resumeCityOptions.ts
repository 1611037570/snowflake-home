// 城市级联字典：省市级联树由静态数据一次性构建，供区域内所有城市字段共用
// 结构与其他扁平字典不同，且仅用于表单级联组件，故与 resumeOptions 分开维护
import cityData from "./cityData.json";

export const RESUME_CITY_OPTIONS = cityData.map((province) => {
  // 直辖市自身即为城市，可直接选中，不再展开子级
  const isDirectCity = province.cities.length === 1 && province.cities[0] === province.label;
  return {
    value: province.label,
    label: province.label,
    children: isDirectCity
      ? undefined
      : province.cities.map((name) => ({ value: name, label: name })),
  };
});
