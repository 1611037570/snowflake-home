const getSpan = (item: any) => Number(item.span) || 24;

// 字段行默认垂直间距：容器未声明 rowClass 时使用
export const DEFAULT_ROW_CLASS = "gap-y-3";

// 根据栅格判断行首和行尾，统一计算左右间距
export const getFormItemStyles = (list: any[]) => {
  let currentAccumulatedSpan = 0;

  return list.map((item: any, index: number) => {
    const span = getSpan(item);
    if (currentAccumulatedSpan + span > 24) {
      currentAccumulatedSpan = 0;
    }

    const isFirstInRow = currentAccumulatedSpan === 0;
    const nextItem = list[index + 1];
    const nextSpan = nextItem ? getSpan(nextItem) : 0;
    const isLastInRow =
      currentAccumulatedSpan + span === 24 ||
      (!!nextItem && currentAccumulatedSpan + span + nextSpan > 24) ||
      index === list.length - 1;

    currentAccumulatedSpan += span;
    if (currentAccumulatedSpan >= 24) {
      currentAccumulatedSpan = 0;
    }

    return {
      paddingLeft: isFirstInRow ? "0" : "3px",
      paddingRight: isLastInRow ? "0" : "3px",
    };
  });
};
