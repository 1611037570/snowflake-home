<template>
  <SfViewContainer>
    <div class="flex min-h-screen flex-col items-center justify-center bg-gray-100 font-sans">
      <div class="w-fit text-center">
        <!-- 游戏棋盘：响应式网格布局 -->
        <div
          :style="{
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            gridTemplateRows: `repeat(${gridSize}, 1fr)`,
          }"
          class="relative grid gap-3 rounded-lg bg-gray-300 p-4"
        >
          <!-- 未开始游戏时的遮罩提示 -->
          <div
            v-if="!gameStarted"
            class="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-gray-300/90"
          >
            <span class="text-2xl font-bold text-gray-700">点击「开始游戏」开始挑战</span>
          </div>

          <!-- 格子项：循环渲染，动态绑定样式 -->
          <div
            v-for="(cell, index) in board"
            :key="index"
            :class="[
              'flex h-20 w-20 items-center justify-center rounded-md text-2xl font-bold transition-colors duration-200',
              getCellClass(cell),
            ]"
          >
            {{ gameStarted ? cell || "" : "" }}
          </div>
        </div>

        <!-- 分数、步数、最大数字和游戏状态 -->
        <div class="mt-4 text-xl text-gray-700">
          分数: {{ score }} | 步数: {{ moveCount }} | 最大数字:
          <span class="font-bold text-orange-600">{{ maxTile }}</span> |
          <span
            :class="
              gameOver ? 'font-bold text-red-600' : gameStarted ? 'text-green-600' : 'text-gray-500'
            "
          >
            {{
              gameOver
                ? history.length > 0
                  ? "游戏结束! 撤回或重新开始"
                  : "游戏结束! 重新开始"
                : gameStarted
                  ? "继续加油!"
                  : "未开始游戏"
            }}
          </span>
        </div>

        <!-- 开始/重新开始按钮 -->
        <div class="mt-4">
          <button
            v-if="!gameStarted"
            @click="startGame"
            class="h-12 w-40 rounded-md bg-green-600 text-xl font-bold text-white transition-colors hover:bg-green-500 active:bg-green-700"
          >
            🎮 开始游戏
          </button>
          <button
            v-else
            @click="restartGame"
            class="h-12 w-40 rounded-md bg-red-500 text-xl font-bold text-white transition-colors hover:bg-red-400 active:bg-red-600"
          >
            🔄 重新开始
          </button>
        </div>

        <!-- 方向控制按钮（适配移动端/鼠标操作） -->
        <div
          class="mt-6 flex flex-col items-center gap-2"
          :class="!gameStarted ? 'pointer-events-none opacity-50' : ''"
        >
          <button
            @click="handleMove('up')"
            class="h-12 w-20 rounded-md bg-gray-700 text-white transition-colors hover:bg-gray-600 active:bg-gray-800"
          >
            ↑ 上
          </button>
          <div class="flex gap-2">
            <button
              @click="handleMove('left')"
              class="h-12 w-20 rounded-md bg-gray-700 text-white transition-colors hover:bg-gray-600 active:bg-gray-800"
            >
              ← 左
            </button>
            <button
              @click="handleMove('right')"
              class="h-12 w-20 rounded-md bg-gray-700 text-white transition-colors hover:bg-gray-600 active:bg-gray-800"
            >
              右 →
            </button>
          </div>
          <button
            @click="handleMove('down')"
            class="h-12 w-20 rounded-md bg-gray-700 text-white transition-colors hover:bg-gray-600 active:bg-gray-800"
          >
            ↓ 下
          </button>

          <!-- 撤回按钮（显示剩余撤回步数，无历史时禁用） -->
          <button
            @click="undo"
            :disabled="history.length === 0 || !gameStarted || gameOver"
            class="mt-4 h-12 w-42 rounded-md bg-gray-600 text-white transition-colors hover:bg-gray-500 active:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            撤回（剩余步数：{{ history.length }}/5）
          </button>
        </div>

        <!-- 排行榜区域 -->
        <div class="mt-8 w-full max-w-md">
          <button
            @click="showRanking = !showRanking"
            class="h-12 w-full rounded-md bg-gray-700 text-white transition-colors hover:bg-gray-600 active:bg-gray-800"
          >
            {{ showRanking ? "收起排行榜" : "查看排行榜（Top10）" }}
          </button>

          <!-- 排行榜列表（展开时显示） -->
          <div
            v-if="showRanking"
            class="mt-3 max-h-96 overflow-y-auto rounded-lg bg-white p-4 shadow-md"
          >
            <h3 class="mb-3 flex items-center text-xl font-bold text-gray-800">🏆 2048 荣耀榜</h3>
            <div v-if="rankingList.length === 0" class="py-4 text-center text-gray-500">
              暂无记录，快来创造佳绩吧！
            </div>
            <table class="w-full text-left text-sm" v-else>
              <thead class="bg-gray-100">
                <tr>
                  <th class="w-10 rounded-l-md p-2 text-center">排名</th>
                  <th class="p-2">昵称</th>
                  <th class="w-16 p-2 text-center">分数</th>
                  <th class="w-16 p-2 text-center">步数</th>
                  <th class="w-20 p-2 text-center">最大数字</th>
                  <th class="rounded-r-md p-2">记录时间</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, index) in rankingList"
                  :key="index"
                  class="border-b border-gray-100 transition-colors hover:bg-gray-50"
                >
                  <td class="p-2 text-center font-bold">
                    <span
                      :class="
                        index < 3
                          ? [
                              'inline-block h-6 w-6 rounded-full text-xs leading-6 text-white',
                              index === 0
                                ? 'bg-yellow-500'
                                : index === 1
                                  ? 'bg-gray-400'
                                  : 'bg-amber-700',
                            ]
                          : 'text-gray-700'
                      "
                    >
                      {{ index + 1 }}
                    </span>
                  </td>
                  <td class="p-2 font-medium">{{ item.nickname }}</td>
                  <td class="p-2 text-center font-bold text-red-600">{{ item.score }}</td>
                  <td class="p-2 text-center text-gray-700">{{ item.steps }}</td>
                  <td class="p-2 text-center font-bold text-orange-600">{{ item.maxTile }}</td>
                  <td class="p-2 text-xs text-gray-500">{{ item.time }}</td>
                </tr>
              </tbody>
            </table>

            <!-- 清空排行榜按钮（测试用） -->
            <button
              @click="clearRanking"
              class="mt-3 cursor-pointer border-none bg-transparent text-sm text-red-500 transition-colors hover:text-red-700"
            >
              清空排行榜（测试用）
            </button>
          </div>
        </div>
      </div>
    </div>
  </SfViewContainer>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";

// 颜色映射配置：按数字大小定义格子样式（统一管理，便于维护）
const CELL_STYLES = {
  0: "bg-gray-200",
  2: "bg-gray-100 text-gray-800",
  4: "bg-gray-50 text-gray-800",
  8: "bg-amber-100 text-gray-800",
  16: "bg-amber-300 text-gray-800",
  32: "bg-amber-500 text-white",
  64: "bg-amber-600 text-white",
  128: "bg-amber-700 text-white",
  256: "bg-amber-800 text-white",
  512: "bg-orange-500 text-white",
  1024: "bg-orange-600 text-white",
  2048: "bg-orange-700 text-white",
  4096: "bg-red-500 text-white",
  8192: "bg-red-700 text-white",
  default: "bg-red-600 text-white",
};

// 响应式数据声明
const gridSize = ref(4); // 棋盘尺寸（可修改：3=3x3，5=5x5等）
const board = ref([]); // 棋盘数据：一维数组存储
const score = ref(0); // 游戏分数
const moveCount = ref(0); // 移动步数统计
const maxTile = ref(2); // 当前合成的最大数字
const gameOver = ref(false); // 游戏状态
const gameStarted = ref(false); // 游戏是否已开始
const history = ref([]); // 撤回历史（最多5步）
const showRanking = ref(false); // 控制排行榜显示/隐藏
const rankingKey = "2048Ranking_v2"; // localStorage存储键（版本号避免冲突）

// 计算属性：排序后的排行榜列表
const rankingList = computed(() => {
  const list = JSON.parse(localStorage.getItem(rankingKey) || "[]");
  // 排序规则：分数降序 → 步数升序 → 时间戳降序（最新优先）
  return list.sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score;
    if (a.steps !== b.steps) return a.steps - b.steps;
    return b.timestamp - a.timestamp;
  });
});

/**
 * 初始化空棋盘（未开始游戏时调用）
 */
const initEmptyBoard = () => {
  board.value = Array(gridSize.value * gridSize.value).fill(0);
  score.value = 0;
  moveCount.value = 0;
  maxTile.value = 2;
  gameOver.value = false;
  history.value = [];
};

/**
 * 开始游戏：生成初始数字
 */
const startGame = () => {
  gameStarted.value = true;
  addRandomCell();
  addRandomCell();
  updateMaxTile();
};

/**
 * 重新开始游戏：重置所有状态并生成初始数字
 */
const restartGame = () => {
  // 游戏中重新开始时，询问是否确认
  if (gameStarted.value && !gameOver.value) {
    if (!confirm("确定要重新开始吗？当前进度将会丢失！")) {
      return;
    }
  }

  initEmptyBoard();
  gameStarted.value = true;
  addRandomCell();
  addRandomCell();
  updateMaxTile();
};

/**
 * 获取格子样式
 */
const getCellClass = (value) => {
  return CELL_STYLES[value] || CELL_STYLES.default;
};

/**
 * 随机生成数字（90%概率2，10%概率4）
 */
const addRandomCell = () => {
  const emptyIndices = board.value.reduce(
    (acc, cell, idx) => (cell === 0 ? [...acc, idx] : acc),
    [],
  );

  if (emptyIndices.length === 0) return false;

  const randomIdx = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  board.value[randomIdx] = Math.random() < 0.9 ? 2 : 4;
  updateMaxTile(); // 生成后检查最大数字
  return true;
};

/**
 * 更新当前最大数字
 */
const updateMaxTile = () => {
  const currentMax = Math.max(...board.value);
  if (currentMax > maxTile.value) {
    maxTile.value = currentMax;
    // 关键数字达成（2048/4096/8192）时触发记录
    if ([2048, 4096, 8192].includes(maxTile.value)) {
      setTimeout(() => {
        promptSaveRanking(`🎉 恭喜合成 ${maxTile.value}！`, true);
      }, 300);
    }
  }
};

/**
 * 统一移动处理（键盘+按钮）
 */
const handleMove = (direction) => {
  if (!gameStarted.value || gameOver.value) return; // 未开始或结束时禁止移动

  // 保存历史状态
  const currentState = {
    board: [...board.value],
    score: score.value,
    moveCount: moveCount.value,
    maxTile: maxTile.value,
  };

  let moved = false;
  switch (direction) {
    case "up":
      moved = moveUp();
      break;
    case "down":
      moved = moveDown();
      break;
    case "left":
      moved = moveLeft();
      break;
    case "right":
      moved = moveRight();
      break;
  }

  // 移动成功后更新状态
  if (moved) {
    moveCount.value++; // 步数+1
    addRandomCell();
    history.value.push(currentState);
    history.value = history.value.slice(-5); // 限制5步撤回

    if (!checkCanMove()) {
      handleGameOver();
    }
  }
};

/**
 * 游戏结束处理（触发记录排行榜）
 */
const handleGameOver = () => {
  gameOver.value = true;
  // 游戏结束时强制记录（即使未达成2048）
  setTimeout(() => {
    promptSaveRanking(
      `🎮 游戏结束！\n分数：${score.value} | 最大数字：${maxTile.value} | 步数：${moveCount.value}`,
      false,
    );
  }, 500);
};

/**
 * 键盘事件处理
 */
const handleKeydown = (e) => {
  if (!gameStarted.value) {
    // 未开始时按空格键快速开始
    if (e.code === "Space") {
      e.preventDefault();
      startGame();
    }
    return;
  }

  if (gameOver.value) {
    if (e.code === "Space") {
      e.preventDefault();
      restartGame(); // 结束后按空格重新开始
    }
    return;
  }

  const keyMap = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right",
  };

  if (keyMap[e.code]) {
    e.preventDefault();
    handleMove(keyMap[e.code]);
  }
};

/**
 * 向左移动核心逻辑
 */
const moveLeft = () => {
  let moved = false;
  const newBoard = [...board.value];

  for (let row = 0; row < gridSize.value; row++) {
    // 提取非零数字
    const rowData = [];
    for (let col = 0; col < gridSize.value; col++) {
      const idx = row * gridSize.value + col;
      if (newBoard[idx] !== 0) rowData.push(newBoard[idx]);
    }

    // 合并相同数字
    for (let i = 0; i < rowData.length - 1; i++) {
      if (rowData[i] === rowData[i + 1]) {
        rowData[i] *= 2;
        rowData[i + 1] = 0;
        score.value += rowData[i];
        moved = true;
      }
    }

    // 过滤零值并补零
    const filtered = rowData.filter(Boolean);
    while (filtered.length < gridSize.value) filtered.push(0);

    // 更新棋盘
    for (let col = 0; col < gridSize.value; col++) {
      const idx = row * gridSize.value + col;
      if (newBoard[idx] !== filtered[col]) {
        newBoard[idx] = filtered[col];
        moved = true;
      }
    }
  }

  board.value = newBoard;
  if (moved) updateMaxTile(); // 合并后检查最大数字
  return moved;
};

/**
 * 向右移动（复用向左逻辑）
 */
const moveRight = () => {
  reverseBoard();
  const moved = moveLeft();
  reverseBoard();
  return moved;
};

/**
 * 向上移动（复用向左逻辑）
 */
const moveUp = () => {
  transposeBoard();
  const moved = moveLeft();
  transposeBoard();
  return moved;
};

/**
 * 向下移动（复用向左逻辑）
 */
const moveDown = () => {
  transposeBoard();
  const moved = moveRight();
  transposeBoard();
  return moved;
};

/**
 * 反转棋盘（左右翻转）
 */
const reverseBoard = () => {
  for (let row = 0; row < gridSize.value; row++) {
    const start = row * gridSize.value;
    const end = start + gridSize.value;
    board.value.splice(start, gridSize.value, ...board.value.slice(start, end).reverse());
  }
};

/**
 * 转置棋盘（行列互换）
 */
const transposeBoard = () => {
  const newBoard = [...board.value];
  for (let row = 0; row < gridSize.value; row++) {
    for (let col = 0; col < gridSize.value; col++) {
      const idx = row * gridSize.value + col;
      newBoard[col * gridSize.value + row] = board.value[idx];
    }
  }
  board.value = newBoard;
};

/**
 * 检查是否可继续移动
 */
const checkCanMove = () => {
  // 有空格则可移动
  if (board.value.includes(0)) return true;

  // 横向相邻检查
  for (let row = 0; row < gridSize.value; row++) {
    for (let col = 0; col < gridSize.value - 1; col++) {
      const idx = row * gridSize.value + col;
      if (board.value[idx] === board.value[idx + 1]) return true;
    }
  }

  // 纵向相邻检查
  for (let col = 0; col < gridSize.value; col++) {
    for (let row = 0; row < gridSize.value - 1; row++) {
      const idx = row * gridSize.value + col;
      if (board.value[idx] === board.value[idx + gridSize.value]) return true;
    }
  }

  return false;
};

/**
 * 撤回功能
 */
const undo = () => {
  if (history.value.length === 0 || !gameStarted.value || gameOver.value) return;

  const lastState = history.value.pop();
  board.value = [...lastState.board];
  score.value = lastState.score;
  moveCount.value = lastState.moveCount;
  maxTile.value = lastState.maxTile;
  gameOver.value = !checkCanMove();
};

/**
 * 弹窗提示用户输入昵称并保存排行榜
 * @param {string} title - 弹窗标题
 * @param {boolean} isAchievement - 是否是达成关键数字（而非游戏结束）
 */
const promptSaveRanking = (title, isAchievement = false) => {
  // 游戏结束时强制记录，达成成就时可选
  const nickname = prompt(`${title}\n请输入昵称（1-8个字符）：`, "玩家");
  if (!nickname || nickname.trim().length === 0 || nickname.trim().length > 8) {
    if (isAchievement) alert("昵称无效，本次成就未记录！");
    else alert("昵称无效，游戏记录未保存！");
    return;
  }

  // 构造记录数据
  const record = {
    nickname: nickname.trim(),
    score: score.value,
    steps: moveCount.value,
    maxTile: maxTile.value,
    time: new Date().toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
    timestamp: Date.now(), // 用于排序
  };

  // 保存到本地存储
  saveRanking(record);
  alert(
    `✅ 记录保存成功！\n昵称：${record.nickname}\n分数：${record.score}\n步数：${record.steps}\n最大数字：${record.maxTile}`,
  );
  showRanking.value = true; // 自动展开排行榜
};

/**
 * 保存排行榜记录（去重+排序+限制Top10）
 */
const saveRanking = (record) => {
  const existing = JSON.parse(localStorage.getItem(rankingKey) || "[]");

  // 去重：同一昵称保留最优记录（分数高→步数少→时间新）
  const uniqueRecords = Array.from(
    existing
      .reduce((map, item) => {
        const key = item.nickname.toLowerCase(); // 不区分大小写去重
        const current = map.get(key);
        if (!current) {
          map.set(key, item);
        } else {
          // 比较优先级：分数高 > 步数少 > 时间新
          const isBetter =
            record.score > current.score ||
            (record.score === current.score && record.steps < current.steps) ||
            (record.score === current.score &&
              record.steps === current.steps &&
              record.timestamp > current.timestamp);

          if (isBetter) map.set(key, item);
        }
        return map;
      }, new Map())
      .values(),
  );

  // 添加新记录并排序
  uniqueRecords.push(record);
  const sorted = uniqueRecords.sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score;
    if (a.steps !== b.steps) return a.steps - b.steps;
    return b.timestamp - a.timestamp;
  });

  // 保留Top10并保存
  const top10 = sorted.slice(0, 10);
  localStorage.setItem(rankingKey, JSON.stringify(top10));
};

/**
 * 清空排行榜
 */
const clearRanking = () => {
  if (confirm("⚠️ 确定要清空所有排行榜记录吗？此操作不可恢复！")) {
    localStorage.removeItem(rankingKey);
    alert("排行榜已清空！");
  }
};

// 生命周期钩子
onMounted(() => {
  initEmptyBoard(); // 初始化空棋盘（不生成数字）
  window.addEventListener("keydown", handleKeydown); // 监听键盘事件
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown); // 解绑事件
});
</script>

<style scoped>
/* 如需自定义样式，可在此添加（已通过Tailwind覆盖大部分样式） */
/* 示例：自定义滚动条样式（排行榜区域） */
::v-deep(.max-h-96)::-webkit-scrollbar {
  width: 6px;
}
::v-deep(.max-h-96)::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 3px;
}
::v-deep(.max-h-96)::-webkit-scrollbar-track {
  background-color: #f5f5f5;
}
</style>
