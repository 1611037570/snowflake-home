# 简历主题设计规范

本规范描述当前实现。主题自定义沿用公共数据、几何、测量和分片协议，不能另建一套分页逻辑。

参考截图只提供视觉方向，不授权新增业务功能、示例范本或自定义模块。主题不得解析正文中的约定字符串来生成评分、技能条等未声明的业务能力；普通富文本继续使用公共正文组件。仅为贴近截图而复制公共经历渲染、重解释字段或改写公共标题内部结构的覆盖应撤除，优先使用现有组件与主题配置。

## 职责与数据边界

| 层级 | 职责 | 禁止承担的职责 |
| --- | --- | --- |
| 用户配置 | 用户可调的页边距、模块间距、字号、展示选项、栏顺序，以及主题编号 | 保存主题固定版式、纸张边框、纹理、装饰留白或纸张圆角 |
| 业务适配器 | 将业务字段转换为通用节点，声明内容语义、标题和段间距装配策略 | 按具体主题决定分页或容器尺寸 |
| 主题声明 | 固定版式、区域与栏装饰尺寸、个人信息模板选择、设置限制 | 保存分页结果或重复用户配置 |
| 公共布局 | 将页面边距、主题装饰留白、栏宽和页尾预算结算为区域几何 | 猜测主题名称或从外观组件导出元数据 |
| 公共渲染组件 | 施加一次容器尺寸、选择主题组件，统一测量与预览结构 | 为每个主题追加条件分支 |
| 主题组件 | 绘制背景、线条、标题、条目或正文，消费标准输入 | 私自增加公共边距、重写分片算法或绕过公共数据 |
| 分页算法 | 根据高度、断点、内容区间与块区间装箱 | 识别主题名称或具体业务模块名称 |

保存链路保留主题编号和用户覆盖参数；运行时解析主题固定声明，生成完整预览配置。没有第二份需要单独维护的主题外观快照，也不提供旧结构兼容。

## 主题声明

纯主题定义位于 `src/domain/resume/theme/styles/<主题编号>.ts`，用户配置类型、预设、压缩、固定声明与公共版式同属共享领域层；本目录只维护外观组件和渲染接入。存储层直接依赖领域配置，不引入视图组件。`ui`（主题及用户参数默认值）与 `decisions`（固定能力声明）分开，`pageAppearance`（页面绘图行为）仅处理页面外观。`ui.theme.userTemplate`（个人信息组件编号）与 `titleTemplate`（标题组件编号）由主题预设选择；`auto` 或不声明时按版式使用公共组件，编辑器不提供个人信息模板切换入口。组件分片能力在个人信息模板清单中统一登记，预览与分页共用解析结果。纸张本身不开放圆角；正文装饰底板可在主题组件中绘制圆弧。

以下为固定能力的结构示例，不是新增主题：

```ts
const decisions = {
  layoutType: "topUserTwoColumn", // 页面版式编号
  regions: { // 区域装饰能力
    main: { // 正文区域
      inset: { // 四周装饰内边距，单位像素
        top: 24, // 上侧装饰内边距
        right: 24, // 右侧装饰内边距
        bottom: 24, // 下侧装饰内边距
        left: 24, // 左侧装饰内边距
      },
    },
  },
};

const ui = {
  theme: { // 主题组件选择
    userTemplate: "violetBiographyUser", // 个人信息内容组件编号
  },
};
```

| 固定能力字段 | 中文含义及规则 |
| --- | --- |
| `layoutType` | 四种公共版式之一，不在主题组件里重新排栏 |
| `pageBorder.width` / `pageBorder.color` | 纸张边框宽度与颜色，由主题层提供 |
| `pageBackgroundPattern` | 页面纹理编号，由页面外观读取 |
| `regions.<槽位>.inset` | 四周装饰内边距，完整声明上右下左的非负有限数值 |
| `regions.<槽位>.columns` | 按左栏、右栏语义声明栏内左右装饰空间，仅双栏应用 |
| `regions.<槽位>.joinsPrevious` | 当前区域紧贴前一区域，关闭该区域边界的模块间距；栏内模块间距不变 |
| `regions.user.fillsPageTop` | 个人信息背景覆盖纸张顶边，公共布局仍注入用户页边距 |
| `ui.theme.userTemplate` | 个人信息组件编号；`auto` 或不声明时按版式使用公共组件，未知组件报错；分片能力由组件清单提供 |
| `usesDateRail` | 固定日期栏能力，条目与设置限制读取同一声明 |
| `restrictions` | 用户设置限制及原因，集中维护 |
| `topDecoration` | 首页独立装饰组件编号，真实高度仅扣首页预算 |

页面边距属于用户配置；模块间距属于公共装配；装饰内边距属于主题。三者分别结算。紫色履历的正文区域紧贴个人信息区域，正文底板四周二十四像素仍属于装饰内边距，不替代页尾或页面边距。

## 新增与改名交付清单

新增主题、改名主题或补分类时按下表逐项交付，缺任一项都算未完成，不等提醒再补。

| 落点 | 必做内容 |
| --- | --- |
| `domain/resume/theme/styles/<主题编号>.ts` | 主题声明：`name`、`id`、`design`、`description`、`decisions`、`ui`，每个字段附中文注释 |
| `domain/resume/theme/styles/index.ts` | 两处登记：顶部 `import` 与 `themeTemplateList` 数组项，只写一处等于主题不存在 |
| `components/**/themes/<主题编号>.vue` | 需要的绘图层按文件名登记，未存在的文件名自动回退 `default`，不要留空文件占位 |
| `components/userModule/components/<编号>User.vue` | 自定义个人信息组件必须渲染头像（复用 `UserAvatar`，或自绘 `img` 并保留 `isUserFieldHidden('avatar')` 判断）；个人信息组件丢头像视为缺陷 |
| `locales/lang/{zh,en}/resume.json` | `resumeTemplateStyle_<主题编号>_name` 与 `_description` 两份语言同时补齐；只改中文视为未完成 |
| `design` 分类标签 | 同时写呈现形态（`single-column`、`two-column`、`timeline`）与成档分类（`premium`、`polished`、`minimal`、`plain`）；模板页与编辑器筛选取两者交集 |
| 分类覆盖 | 补分类前先查空缺组合并按缺口成套补齐，不要只加单个主题；成档分类在单栏、双栏、时间轴下的覆盖用脚本遍历 `styles/*.ts` 的 `design` 统计 |
| 改名 | 同步主题声明、中英文案与配套标题样式名称注释；`id` 与外观文件名保持不变，改 `id` 等于新建主题 |

新增走 `import.meta.glob` 的外观组件后，若编辑器未加载到该组件，重启 dev server 或改动对应目录的 `index` 入口，不以“文件已存在”当作已生效。

## 组件覆盖入口

| 目录（相对于 `components`） | 主题可定制范围 |
| --- | --- |
| `pageContainer/themes` | 纸张背景、纹理和页面绘图 |
| `pageDecoration/themes` | 独立首页装饰，不伪造业务标语 |
| `regionContainer/themes/user`、`regionContainer/themes/main` | 个人信息与正文区域的底板、轴线和底纹；尺寸由公共容器施加。栏底色铺到纸张边缘的负偏移统一 `@use "../columnBleed"` 的 `column-bleed($anchor)`（`right`/`left` 声明锚在哪一栏，另一侧停在中缝），不要手写偏移样板 |
| `userContainer/themes`、`moduleContainer/themes` | 个人信息与业务模块外框 |
| `title/styles` | 模块标题绘图，按标题样式编号登记，组件加载器随本目录；标题样式清单、主题默认标题样式与标题参数默认值集中在 `domain/resume/theme/titleStyles.ts` |
| `itemContainer/themes` | 条目外框及分片装饰；卡片类条目（左右 24、下 24、上 0 的留白 + 分片收边）复用根目录 `itemCardBase.vue`，主题只写一行薄包装 |
| `userModule/components` | 通过 `ui.theme.userTemplate` 选择个人信息内容组件 |
| `nodeContent/themes/<主题编号>/<内容语义>.vue` | 覆盖指定正文语义，未覆盖时使用默认语义组件 |
| `pageFooter/themes` | 固定页尾槽位内的内容外观，不改变公共三十六像素预算 |

## 时间轴主题

时间轴能力只由 `decisions.usesDateRail`（固定日期栏声明）开启，主题不再各自判断日期是否显示。

- 栏宽由正文区域容器下发 `--timeline-rail-width`，条目用 `reserveDateRail`（对齐空间声明）让出同一栏宽，标题、日期、正文和节点都据此对齐；区域容器同时把 `--timeline-rail-width: inherit` 交给条目，避免栏宽写两份。
- 贯穿轴线只画在区域层，选择 `[data-resume-column-content]`（栏内容元素）作定位基准，使模块标题、条目和段间距之间不断线；条目的 `::before`（公共条目竖线）在时间轴主题里收起，否则每条各画一段。
- 节点只画在首个分片上，用 `blockRange.start` 与 `contentRange.start` 判断，跨页续段不重复出现节点；内圈需要遮住轴线时取 `ui.page.background`（纸张底色），不假设白色。
- 复用 `timelineIndent`（公共时间轴缩进标题）时，轴线横坐标必须是 `栏宽 − 18px`：该标题的节点位置按此硬编码，偏离会让标题节点与条目节点错位。该标题的节点颜色读取 `--ring-node`（圆环主题遗留的变量名），新主题需在区域容器里把它指向本主题色。
- 需要连续竖线让出的水平空间时用 `regions.main.inset`（装饰内边距）声明，不要靠条目或模块外框加 `padding` 挤出来，否则测量与渲染的盒模型不一致。

## 标题样式与独立主题同步

新增能脱离完整主题独立呈现的标题样式时，同步在 `titleStyles.ts` 登记为 `standalone`（可独立选择的标题）、在 `plainTitleThemes.ts` 增加单栏独立主题，并补齐中英文模板名称和说明。独立标题主题默认归入极简；明确指定简约分类时设置 `tier: "minimal"`（简约分类标记）。独立标题主题只配置标题样式、配色与基本页面间距，不继承原主题的纸张纹理、区域底板或模块外框。

`scope` 只决定样式出现在哪个入口，不代表它是否被使用：`standalone` 进编辑器标题样式下拉，`theme` 仅随所属完整主题渲染，既不进下拉也不会单独出现在模板页分类。模板页分类筛的是主题卡片的 `design` 标签，不是标题样式，所以「某标题没出现在极简」有两种正常情形：该标题是 `theme` 配套样式（如 `blueBilingualTitle` 只服务 `blueBilingual`，而该主题是 `single-column` + `minimal`，只在简约分类出现）；或该标题虽是 `standalone`，已由某个极简档完整主题承载，不再另出独立卡片。确认是否真的没使用要用编号反查所属主题，不靠分类推断：

```bash
# 在 apps/web 下执行，输出引用该片段的主题文件；无输出才是未被使用
grep -rn "titleTemplate: \"<标题样式编号>\"" src/domain/resume/theme/styles
```

独立主题卡片与编辑器标题样式入口共用同一组文案，键名取标题样式编号（`resumeTemplateStyle_<标题样式编号>_name` / `_description`，`localeId` 即标题样式编号）：把 `scope` 从 `theme` 升级为 `standalone` 时，两份语言文案必须同时补齐，只登记清单不出文案视为未完成。

判断能否直接复用：标题组件在自身节点内画完全部装饰、且不依赖原主题的深色纸张、区域底板或模块外框的，可原样升级为 `standalone`；依赖深色背景的（霓虹类）另做自带底板的独立编号与组件，依赖外框或区域装饰的同样另做独立版本，原主题配套标题继续保留 `theme`（仅供原主题使用）范围，避免完整主题观感被独立版拖改。验收时同时检查模板页对应分类和编辑器标题样式入口，确认独立版本没有丢失序号等关键装饰。

正文开放九种语义：`experience`（经历）、`publication`（论文）、`ip`（知识产权）、`account`（社交账号）、`honor`（荣誉）、`image`（图片）、`video`（视频）、`richText`（富文本）、`block`（普通块）。

`user`（个人信息）、`title`（模块标题）、`slogan`（业务标语）、`spacer`（公共间距）不开放第二套正文覆盖入口，避免同一职责出现两份配置。未知主题或语义的正文覆盖文件直接报错。

覆盖组件按文件登记，不需要在公共渲染器增加主题判断。经历、论文、知识产权的默认日期布局共用 `itemDate.vue`；日期文案仍由各业务组件格式化。

## 个人信息区域定制判定

个人信息内容组件由 `ui.theme.userTemplate` 选择，`auto` 或不声明时按版式取公共组件（单栏类版式为 `userHeading`，双栏为 `twoColumnUser`）。只有以下三类差异才允许自建 `<主题编号>User.vue`：

- 分片协议：需要按内容块跨页续排，组件必须输出 `data-layout-block-index`，并在 `userTemplates.ts` 的块分片清单登记（现存 `twoColumnUser`、`tealRailUser`）。
- 结构排布：字段顺序或栏内分组与公共组件不同，例如姓名独占左半栏、资料与头像同侧堆叠、自带成块的页眉装饰底板。
- 字段行为：公共组件没有的取值或占位逻辑，例如无头像时用姓名首字生成肖像。

姓名与头像的尺寸、行高、圆角、描边、颜色都不构成定制理由，改由主题变量下发，变量的默认值就是公共观感：

| 变量组 | 中文含义 | 消费组件 |
| --- | --- | --- |
| `--resume-user-name-size` / `-line-height` / `-spacing` / `-color` / `-family` / `-weight` / `-shadow` | 姓名字号、行高、字距、颜色、字体族、字重、文字阴影 | `userName.vue` |
| `--resume-user-subtitle-size` / `-weight` / `-family` / `-spacing` / `-color` / `-background` / `-padding` / `-shadow` | 副标题字号、字重、字体族、字距、文字色、底纹色、底纹内留白、文字阴影 | `userSubtitle.vue` |
| `--resume-user-avatar-width` / `-height` / `-max-width` / `-radius` / `-fit` / `-position` / `-border` / `-shadow` | 头像宽、高、最大宽、圆角、填充方式、裁切位置、描边、外圈阴影 | `userAvatar.vue` |
| `--resume-user-contact-gap` / `-align` / `--resume-user-contact-item-column-gap` / `--resume-user-contact-label-color` / `--resume-user-icon-color` | 资料行列间距、资料文本对齐、单项标签与数值间距、标签配色、图标配色 | `userContact.vue`、`userContactItem.vue` |

变量声明位置取职责更近的一处：个人信息通栏主题放 `regionContainer/themes/user/<主题编号>.vue`；个人信息排在栏内的双栏主题放已有的 `regionContainer/themes/main/<主题编号>.vue`，区域根元素上的变量会继续传进栏内；只在某个自建排布内生效的放该内容组件根节点。禁止用 `:deep(公共组件内部类名)` 改尺寸与配色，公共组件的类名不是契约；也禁止把 `box-shadow`、`font-family`、`text-shadow` 直接写在传给公共组件根节点的类上，这类写法与组件内部的变量默认值同特异性，生效结果取决于声明顺序，一律改用变量。`userContainer/themes` 现只保留带自身装饰（底色块、页眉底线、区域细线）的外壳，姓名、副标题、头像与资料一律走变量。核对哪些主题仍自建个人信息组件，以及主题侧是否残留穿透写法：

```bash
# 在 apps/web 下执行，逐个对照上面的三类差异，尺寸配色类应改为公共组件加变量
grep -rn 'userTemplate: "' src/domain/resume/theme/styles | sed 's|src/domain/resume/theme/styles/||'
# 这里应当无输出；公共组件自身实现里的 :deep（如 userContactItem 取图标配色）不算主题侧穿透
grep -rn ":deep(" src/views/resume/theme/components/userContainer/themes src/views/resume/theme/components/userModule/components/*User.vue
# 区域外壳里的装饰穿透允许存在，但不得针对个人信息内部结构；这里同样应当无输出
grep -rn ":deep(" src/views/resume/theme/components/regionContainer/themes | grep -iE "resume-user|avatar|img|mt-3"
```

## 标准正文输入与分片协议

覆盖正文组件使用 `NodeContentProps`（标准正文输入），通过 `useNodeContent`（公共分片内容读取）取得裁剪结果。

| 输入字段 | 中文含义 |
| --- | --- |
| `node` | 原始通用排版节点 |
| `payload` | 当前分片载荷，未传时读取节点载荷 |
| `dateRail` | 公共条目外框下发的固定日期栏结果 |
| `contentRange` | 正文起止字符区间，结束位置不包含在内 |
| `blockRange` | 稳定内容块起止区间，结束位置不包含在内 |
| `decoration` | 完整、首段、中段或末段外观阶段 |
| `showDebug` | 是否展示间距调试标记 |
| `leadingOnPage` | 当前分片是否位于页首 |

完整节点与分片探针、实际预览共用 `nodeFragment.vue`（节点外框入口）和同一正文组件。外框选择、日期栏和分片属性不能在两棵树分别实现。

模块分组与标题槽位也共用 `moduleFrame.vue`（模块外框入口）。普通分组外框只能绘图，不得额外增加节点预算之外的内边距、边框占位或间距；测量检查模块外框宽高与内部节点是否一致。单个整块节点可以承载外框留白，其宽高按完整模块外框测量。协议失败传入无效页面计划，修正结构后允许重新测量。

正文组件通过 `data-layout-text-block`（正文块标记）显式声明正文身份，同一节点只能有一个正文块，且必须位于最后；分片覆盖检查只允许该块按字符区间重复出现，不再把末尾标签等普通块自动当作正文。默认内容载荷使用 `ContentItem`（条目字段）和 `ContentPayload`（解析正文与显示载荷），主题覆盖复用同一字段协议。

整块个人信息不输出内部断点、不接受块范围裁剪。声明稳定块分片的组件必须提供稳定顺序；显式使用 `data-layout-block-index`（内容块序号）时，序号必须与真实内容顺序一致。论文与知识产权的可选行按实际存在的顺序编号，不能用固定行号代替实际块号。

正文字符区间沿用源内容索引，不能在裁剪前另行改写正文。主题只能消费切好的内容和范围，不再实现一套分页。续段移除的留白必须与测量和公共分片几何保持一致。

可选内容行通过 `createContentBlocks`（可见块编号工具）登记实际存在的块，再通过 `isContentBlockVisible`（公共块范围判断）裁剪，不分别维护行号加减。显式编号允许隐藏字段留下空号，但必须是非负整数且严格递增；重复、逆序、空编号在测量入口报告节点。

主题固定声明区分未声明与显式错误：未声明使用公共默认值；非法版式、边框宽度、能力类型与空限制原因报告具体字段。显式个人信息组件、顶部装饰和页面纹理必须在对应公共注册表存在，不静默换成默认样式。

生成页面计划后，公共覆盖检查核对字符和实际存在的块是否遗漏、重复或越界。正文块在跨页时可反复出现，其内容完整性按字符区间检查；隐藏块空号不算遗漏。异常计划标记无效并提供节点说明，不作为正常分页结果展示。

## 几何与条件判断规范

- 公共 `RegionContainer`（区域容器）只读取引擎结算后的区域内边距，不再回到主题重新解析；未声明几何留白表示零。容器施加区域内边距、通栏宽度与页面水平内缩；公共 `ColumnBox`（栏盒子）施加栏装饰空间。主题组件不重复施加。
- 栏外观通过 `data-resume-column`（公共栏语义编号）定位，不通过子元素位置猜测左右栏。标题装饰通过 `--resume-title-decoration-display`（装饰显示方式）与 `--resume-title-border-width`（标题描边宽度）继承，下层标题自己绘图；区域不直接修改标题内部类名。
- `usesDateRail`（日期显示能力）由主题固定声明统一决定；`reserveDateRail`（无日期条目的对齐空间）属于条目盒模型，两者不再共用一个可覆盖的开关。
- 区域通过 `widthMode`（纸张或内容宽度模式）声明宽度行为，公共几何不按标语等业务名称判断。
- 轴线与装饰定位使用公共区域变量，不把页面边距写成主题私有固定值；双栏中缝留白由引擎统一生成，主题与外观组件不自行补写栏内边距。
- 图片上限读取公共布局结算后的区域留白，包含引擎注入的页面上边距。
- 区域、栏、内容分片能力、日期栏和顶部装饰变化全部使旧测量立即作废；异步节点增高触发实际重测。
- 内容存在性、块范围、编辑状态、页码开关和公共版式结构仍可使用条件判断。禁止在公共布局、测量、渲染和分页中按具体主题名称新增分支。
- 不为消除条件而给每个字段增加组件或配置语言。主题覆盖整块语义内容，细小重复绘图复用已有公共组件。

## 验收与当前边界

引擎单测针对公共能力输入及几何不变量；真实主题遍历同一组验收规则，不为每个主题写独立分页算法或专属期望值。非引擎层不新增测试用例，以临时真实浏览器核验尺寸、跨页内容及双树一致性。

主题层交付前固定跑三条命令并在结论里如实报告：`pnpm i18n:check`（中英文案缺口）、`pnpm check:resume`（边界检查加引擎几何单测）、`pnpm exec vue-tsc --build`（与改动前的基线错误集对比，只报本次引入的错误，既有失败要说明归属，不顺手修无关主题）。分类覆盖缺口用编号清单直接统计，不靠记忆判断：

```bash
# 在 apps/web 下执行
node -e "const fs=require('fs');const d='src/domain/resume/theme/styles';const g={};for(const f of fs.readdirSync(d)){if(!f.endsWith('.ts')||f==='index.ts'||f==='createThemeTemplate.ts'||f==='plainTitleThemes.ts')continue;const t=((fs.readFileSync(d+'/'+f,'utf8').match(/design:\s*\[([^\]]*)\]/)||[])[1]||'').replace(/\"/g,'').split(',').map(s=>s.trim().split('//')[0].trim()).filter(Boolean);for(const form of ['single-column','two-column','timeline'])for(const tier of ['premium','polished','minimal','plain'])if(t.includes(form)&&t.includes(tier))(g[form+'|'+tier]||=[]).push(f.replace('.ts',''));}console.log(g);"
```

`plainTitleThemes.ts` 里的独立标题主题由 `tier` 推导分类，不在上面的统计范围内，需要另行核对极简与简约两档的独立主题数量。

独立标题在极简档的覆盖是 `plainTitleThemes.ts` 的 `titleStyleId` 与极简档（`plain`）完整主题所用标题样式的并集，缺口用命令统计，不靠记忆判断：

```bash
# 在 apps/web 下执行，输出为空即所有独立标题都能在极简呈现
node -e "const fs=require('fs'),d='src/domain/resume/theme/styles';const st=[...fs.readFileSync('src/domain/resume/theme/titleStyles.ts','utf8').matchAll(/id:\s*\"([A-Za-z0-9]+)\"[\s\S]{0,80}?scope:\s*\"standalone\"/g)].map(m=>m[1]);const e=new Set([...fs.readFileSync(d+'/plainTitleThemes.ts','utf8').matchAll(/titleStyleId:\s*\"([A-Za-z0-9]+)\"/g)].map(m=>m[1]));const pl=new Set();for(const f of fs.readdirSync(d)){if(!f.endsWith('.ts')||f==='index.ts'||f==='createThemeTemplate.ts'||f==='plainTitleThemes.ts')continue;const s=fs.readFileSync(d+'/'+f,'utf8');if(/design:[^\n]*\"plain\"/.test(s)){const t=(s.match(/titleTemplate:\s*\"([A-Za-z0-9]+)\"/)||[])[1];if(t)pl.add(t);}}console.log('极简无承载的独立标题:',st.filter(x=>!e.has(x)&&!pl.has(x)));"
```

内置浏览器面板不可见时模板卡片预览不挂载、截图直接失败，观感核对需要在可见浏览器里完成，不以“元素存在”当作渲染通过。

当前支持四种标准版式和个人信息、正文、标语三类区域，尚不是任意区域自由组合的布局系统。正文整块可覆盖，但未为每个字段提供细粒度插槽；新增业务语义需要登记默认组件。部分业务载荷仍使用宽泛类型，主题组件的块序和字符协议尚不能完全自动验证。这些是现存约束，不应以主题私有算法绕过。

## 公共任务与导出边界

- 测量管线用单调变更版本合并任务，随作用域自动停止；已取消的等待任务不能继续写回结果。
- 独立打印页等待预览公开的最新测量与有效页面计划，并在页面提交后开放打印。无效计划、溢出和超时报告错误，元素存在不代表完成。
- 网页导出与浏览器打印共用实际使用样式的筛选入口，保留主题绘图、级联层、公共变量和使用中的字体。网页资源按绝对地址去重，资源缺失不输出声称完整的离线文件。
- 编辑控件使用 `data-resume-editor-action`（编辑态控件标记）排除，不通过绝对定位类猜测控件。
- 富文本标签与内联样式权限沿用现有规则，本轮不收窄。
