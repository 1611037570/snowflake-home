# 轻舟简历 SEO 优化方案（研究稿）

> 范围：只讨论 `qzcv.net` 的简历产品（`/resume` 及其子页面）。起始页 `/home` 仅在“站点边界”一处提及。
>
> 依据：仓库代码、构建产物 `dist/web`、线上 `robots.txt` / `sitemap.xml` / HTML 响应、公开竞品页面结构。
>
> 性质：研究方案，本轮不改代码。落地时按 P0 → P1 → P2 分批确认。

## 一、结论先行

1. **当前瓶颈不是关键词没选对，而是正文没有被 HTML 承载。** 页面是纯客户端渲染，首屏 HTML 里只有 `<div id="app"></div>` 和两段 `noscript`，不执行 JS 的抓取程序只能拿到标题和描述。
2. **内容资产与可收录 URL 严重不匹配。** 按当前构建产物，站内已有 44 份简历范本、117 种排版模板，但 sitemap 里简历相关 URL 只有 4 个，且没有一份范本有独立地址。
3. **最高性价比的动作：把 44 份范本变成 44 个可抓取的静态详情页，再做 8～12 个分类聚合页。** 不需要迁移 SSR，构建期用同一份数据生成 HTML 即可。
4. **先修地基再放量。** 站长平台验证、sitemap 的 `lastmod`、初始 HTML 的 canonical/robots、软 404、全站页脚，这些不解决，新增页面也很难被稳定收录。
5. **不建议现在做全站 SSR，也不建议把 117 个样式页全部索引。** 前者改动大、回归面广；后者内容差异不足，容易变成规模化薄内容。先做 10 页试点，用 2～4 周验证收录，再批量复制。

预期结果：P1 完成后，简历产品可收录 URL 从 4 个提升到 50 个以上（44 个范本 + 8～12 个分类 + 4 个核心页），且每个落地页的首屏 HTML 自带正文、标题、描述、canonical 与结构化数据。

## 二、现状审计

### 2.1 已验证事实

| 项目 | 现状 | 对 SEO 的影响 |
| --- | --- | --- |
| 渲染方式 | Vue 3 + Vite 纯 CSR，`history` 路由；`dist/web/index.html` 的 body 只有 `<div id="app"></div>`，外加 `noscript` 两段 | 百度对 JS 渲染支持有限，不能假设正文一定被抓取；Google 虽能渲染，但要额外排队，收录速度慢 |
| 初始元数据 | `vite.config.ts` 的 `resumeSeoMetadata` 只把 `/resume`、`/resume/template` 两条信息写进 `index.html` 的内联脚本；`<title>` 与 OG 本身仍是默认入口 | 不执行 JS 时，包括模板页在内都只有首页信息；`/resume/ai`、`/resume/statistics` 连脚本映射都没有，等同于重复页面 |
| canonical | 初始 HTML 中没有 canonical，只有 `pageMetadata.ts` 在浏览器执行后插入 | 不执行 JS 的抓取器拿不到 canonical；多入口访问时重复内容风险高 |
| sitemap | `scripts/seoFiles.ts` 由 `SITE_CONFIGS` 生成，当前 5 条，包含 `/home`，没有 `lastmod` | 简历域名的 sitemap 混入起始页；缺少更新时间，抓取优先级判断少一个信号 |
| 内容资产 | 44 份范本、117 种排版模板；模板页首批只挂 20 张卡片，筛选、翻页、搜索都是客户端状态 | 161 份内容没有独立 URL；长尾词没有落地页；筛选结果无法分享和收录 |
| 详情页 | 不存在。范本只能在全屏预览里看，关闭后回到列表 | 无法针对“电商推广简历”“前端项目经历简历”这类长尾词单独排名 |
| 结构化数据 | 全站 `Organization` + `SoftwareApplication`；模板页替换为 `CollectionPage` | 缺 `WebSite`、`BreadcrumbList`、`ItemList`、`Article`，面包屑和集合关系无法表达 |
| 国际化 | `SfLocale` 只切换语言包，不改 URL；`html lang` 与 meta 由 JS 更新 | 英文内容与中文共用同一 URL，无法独立收录；没有 hreflang |
| 404 | 未匹配路由重定向 `/error`；静态托管对未知路径通常回 `index.html` 200；`/error`、`/resume/editor-demo` 未设置 noindex | 软 404 浪费抓取配额；编辑器 Demo 可能被当成重复内容收录 |
| 内链 | 头部 5 个导航 + 首屏 CTA；提交 `aa0e7ab9` 移除了简历页、统计页、模板页的 `SfFooter` | 站内链接入口少，抓取深度和新页面权重传递不足 |
| 性能 | 现有产物入口 JS 约 701 KB（未压缩），入口还预加载 `vendor-vue`、`vendor-utils`；首屏 H1 使用 `opacity: 0` 的入场动画 | LCP 依赖 JS 执行；移动端 Core Web Vitals 有风险 |
| 统计与验证 | 百度统计已接入；代码中未见 Google Search Console、Bing、百度搜索资源平台的验证标签（也可能用 DNS 或文件验证） | 收录、查询、点击、CWV 无法闭环，优化没有反馈 |
| 站点边界 | `qzcv.net` 同一份产物同时提供 `/home` 与 `/resume`，sitemap 收录 `/home` | 简历域名的主题相关性被稀释；两个产品共享一套静态资源与路由 |

### 2.2 缺口归纳

1. **抓取层**：正文、canonical、robots、结构化数据都依赖 JS 执行，抓取器看到的是一个空壳。
2. **URL 层**：范本和模板没有独立地址，内容资产无法转化为可排名的最小单元。
3. **内容层**：现有页面以功能界面为主，缺少“岗位 × 场景”的文本内容；FAQ 答案默认 `display: none`，AI/统计页几乎没有可读正文。
4. **站点结构层**：没有分类聚合页、没有面包屑、没有全站页脚，抓取路径只有头部 5 个链接。
5. **运营层**：没有站长平台闭环、没有 `lastmod`、没有主动推送、没有收录监控，改动无法验证。

### 2.3 需要确认的部署事实（不在仓库内）

- nginx 的 `try_files`、404、301、缓存规则（仓库中没有 nginx 配置）。
- 域名备案（ICP/公安）与国内访问速度。
- 百度搜索资源平台、Google Search Console、Bing Webmaster 的验证与索引量现状。
- 线上 `/resume/ai`、`/resume/statistics` 的实际收录情况。
- `qzcv.net/home` 是否要继续保留收录。
- `qzcv.net` 与 `nannan.work` 是否共用同一份 `VITE_SITE_URL`：如果相同，`nannan.work` 上的简历页 canonical 会指向 `qzcv.net`，这对避免重复内容有利，但要确认是否符合两个产品的预期。

## 三、目标与关键词地图

### 3.1 目标

北极星指标不是 PV，而是**自然搜索带来的“新建简历”次数**。流量只是中间量，模板页好看但不转化没有意义。

建议的阶段目标（首月建立基线后再校准）：

- 3 个月：可收录 URL ≥ 50，核心页面收录率 ≥ 60%，移动端 CWV 通过。
- 6 个月：范本页、分类页能稳定进入长尾词前 3 页；自然搜索成为新增用户的前三大来源之一。
- 12 个月：形成“工具页 + 范本页 + 分类页 + 指南页”的内容矩阵，不依赖单一大词。

### 3.2 关键词分层

| 层级 | 搜索意图 | 示例词 | 落地页 | 竞争度 | 优先级 |
| --- | --- | --- | --- | --- | --- |
| 工具词 | 想直接做简历 | 在线简历制作、免费简历生成器、简历导出 PDF、AI 简历优化 | `/resume`、`/resume/ai` | 高 | P0/P1 |
| 范本词 | 想找某个岗位的样例 | 电商推广简历、前端简历模板、产品经理简历模板、应届生简历模板 | `/resume/example/{slug}` | 中 | P1 |
| 分类词 | 想按场景/行业浏览 | 校招简历、实习简历、互联网简历、金融简历、英文简历 | `/resume/example/position/{slug}` 等 | 中 | P1 |
| 样式词 | 想找某种排版 | 单栏简历模板、ATS 简历模板、双栏简历模板、简约简历模板 | `/resume/template/{slug}`（精选） | 中低 | P2 |
| 信息词 | 想知道怎么写 | 项目经历怎么写、简历自我评价、没有实习经历怎么办、ATS 是什么 | `/resume/guide/{slug}` | 中 | P2 |
| 品牌词 | 已知道产品 | 轻舟简历、Skiff Resume | `/resume` | 低 | P0 |

关键词研究建议同时用百度指数、5118、爱站、Google Keyword Planner 和 Search Console 的查询报告；站内已有的 `scene`、`industry`、`position`、`workExperience` 四个维度可以直接展开成种子词，不需要另造一套分类。

### 3.3 URL 规划

```text
/resume                              产品首页（工具词）
/resume/template                     模板与范本总库（集合词）
/resume/example/{slug}               范本详情（44 个）
/resume/example/position/{slug}      岗位大类聚合（6～8 个）
/resume/example/scenario/{slug}      场景聚合（校招/实习/社招/转行/留学）
/resume/template/{slug}              排版样式详情（精选 20～30 个，P2）
/resume/guide                        指南索引
/resume/guide/{slug}                 指南文章（10～15 篇）
/resume/ai                           AI 功能页（需补正文）
/resume/statistics                   投递统计页（需补正文）
```

规则：

- 全部小写，单词用连字符，例如 `frontend-project`、`product-manager`；不要用 `fe__3-5__01` 这种内部文件名。
- 一个 URL 只对应一个主关键词，不做“同一关键词多个页面”。
- 筛选、排序、分页参数不进入 sitemap；要么 canonical 回聚合页，要么 noindex。
- 终态 URL 确定后不再改；必须改时 301 到新地址。

### 3.4 一词一页

| 主关键词 | URL | H1 建议 |
| --- | --- | --- |
| 在线简历制作 | `/resume` | 在线制作简历，免费导出 PDF |
| 简历模板 | `/resume/template` | 简历模板与范本库 |
| 电商推广简历模板 | `/resume/example/ecommerce-seo` | 电商推广（SEO/SEM）简历模板 |
| 前端简历模板 | `/resume/example/frontend-project` | 前端工程师简历模板 |
| 校招简历 | `/resume/example/scenario/campus` | 校招简历模板与写法 |
| 互联网简历 | `/resume/example/position/internet` | 互联网行业简历模板 |
| AI 简历优化 | `/resume/ai` | AI 简历优化与模拟面试 |
| 项目经历怎么写 | `/resume/guide/project-experience` | 简历项目经历怎么写 |

注意一个现有问题：`/resume` 与 `/resume/template` 的标题都在抢“简历模板”，容易互相稀释。首页应聚焦“在线制作/免费工具”，模板库聚焦“范本/模板集合”，详情页聚焦具体岗位。

### 3.5 关键词调研执行清单

1. 用站内四个维度导出全部组合，去掉只有 1 个范本的组合。
2. 每个候选词看前 10 名：是模板集合页、单篇范文，还是工具首页；记录页面类型和内容长度。
3. 建一张关键词表：关键词、意图、月搜索量、竞争度、对应 URL、当前状态、负责人。
4. 先做“有范本、有搜索量、竞争度中低”的词，避免一上来打“简历模板”这种头部词。

种子词可以先从下面这 20 个开始，再按站长平台的真实查询扩展：

| 关键词 | 意图 | 建议 URL | 优先级 |
| --- | --- | --- | --- |
| 在线简历制作 | 工具 | `/resume` | P0 |
| 免费简历制作 | 工具 | `/resume` | P0 |
| AI 简历优化 | 工具 | `/resume/ai` | P1 |
| 简历模板 | 集合 | `/resume/template` | P0 |
| 简历范文 | 集合 | `/resume/template` | P1 |
| 应届生简历模板 | 场景 | `/resume/example/scenario/campus` | P1 |
| 实习简历模板 | 场景 | `/resume/example/scenario/internship` | P1 |
| 前端简历模板 | 岗位 | `/resume/example/frontend-project` | P1 |
| 产品经理简历模板 | 岗位 | `/resume/example/product-manager` | P1 |
| 运营简历模板 | 岗位 | `/resume/example/operation` | P1 |
| 电商推广简历 | 岗位 | `/resume/example/ecommerce-seo` | P1 |
| 金融简历模板 | 行业 | `/resume/example/position/finance` | P1 |
| 英文简历模板 | 场景 | `/resume/example/scenario/english-resume` | P2 |
| ATS 简历模板 | 样式 | `/resume/template/ats` | P2 |
| 单栏简历模板 | 样式 | `/resume/template/single-column` | P2 |
| 简历项目经历怎么写 | 信息 | `/resume/guide/project-experience` | P1 |
| 简历自我评价怎么写 | 信息 | `/resume/guide/self-evaluation` | P2 |
| 没有实习经历怎么写简历 | 信息 | `/resume/guide/no-internship` | P2 |
| 简历照片要不要放 | 信息 | `/resume/guide/photo` | P2 |
| 简历一页还是两页 | 信息 | `/resume/guide/one-page` | P2 |

### 3.6 竞品结构参考

超级简历的公开结构是：`/jianlimoban/` 总库 → `/jianlimoban/{场景}/` 分类 → `/jianlimoban/{id}.html` 单模板，再加上 `/sample/` 范文、`/mianshi` 面试题库。它把“模板数量”拆成了可收录的分类页和详情页，而不是全部塞进一个列表。

轻舟简历的 44 份范本更适合走同样的“总库 → 分类 → 详情”结构，但不要照搬它的模板化文案：竞品单页也有“适合 XX 招聘投递，也适合其他相关岗位参考”这类重复句，轻舟如果只做到这个程度，很难在长尾词上超过它。差异要放在岗位专属的写作建议、真实项目示例和 ATS 说明上。

这类站点的通用打法是：

- 工具首页打“在线制作/免费生成”头部词；
- 分类聚合页打“场景/行业/岗位”中部词；
- 单模板/单范文页打“XX 简历模板”长尾词；
- 范文、指南、面试题库打信息型词，再内链回模板和工具；
- 模板卡片用预览图、标签、使用人数和明确 CTA 提升点击与转化。

轻舟简历缺的是第 3、4 层，不是第 1 层。先把已有范本变成第 3 层，再补第 4 层，顺序不要反。

## 四、技术方案

### 4.1 四种方案对比

| 方案 | 做法 | 改动量 | 首屏 | 维护成本 | 主要风险 | 适用 |
| --- | --- | --- | --- | --- | --- | --- |
| A. 构建期快照 | Playwright 访问每个路由，保存渲染后的 HTML | 中 | 好（HTML 自带内容），但 Vue 挂载可能闪一下 | 中 | 快照与运行时不一致、动态数据 | 4 个核心路由 |
| B. 数据驱动静态页 | 用范本数据 + HTML 模板生成独立静态页，不加载 Vue | 小到中 | 最好 | 低 | 需要维护一套静态模板 | 范本、分类、指南 |
| C. SSR/SSG 迁移 | vite-ssg / Nuxt，整站服务端渲染 | 大 | 最好 | 高 | 依赖 `window`、IndexedDB、Element Plus，回归面广 | 长期选项 |
| D. 动态渲染 | 按 UA 给爬虫返回快照，用户仍走 SPA | 小 | 用户侧不变 | 中 | Google 只视为过渡方案；维护两套输出 | 临时兜底 |

### 4.2 推荐组合

- **P1 用 B**：范本详情、分类聚合、指南页都做成数据驱动的静态页。这些页面本质是“内容页”，不需要编辑器、不需要登录态，用 Vue 运行时反而是负担。
- **P2 再评估 A**：`/resume`、`/resume/template`、`/resume/ai`、`/resume/statistics` 是应用界面，可以用快照或继续优化 `noscript`。先在一台预发环境验证 Vue 挂载是否闪烁、动态统计数字是否造成 hydration 不一致。
- **暂不做 C**：现有应用大量依赖浏览器 API，整站 SSR 的收益主要集中在 4 个核心页，投入产出不划算。
- **D 只做兜底**：如果百度收录迟迟不启动，可以临时按 UA 返回静态页，但不应作为长期架构。

### 4.3 B 的架构

```text
resumeTemplateList / themeTemplateList / 语言包 / site.config.ts
                          │
                          ▼
              scripts/seoPages（构建期生成器）
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
  页面注册表          HTML 模板           sitemap 条目
  （slug/标题/描述/   （语义化结构，       （含 lastmod）
   正文/内链）         无 Vue 运行时）
        │                 │                 │
        └─────────────────┼─────────────────┘
                          ▼
dist/web/resume/example/<slug>/index.html
dist/web/resume/example/position/<slug>/index.html
dist/web/resume/guide/<slug>/index.html
dist/web/sitemap.xml
```

开发环境没有产物阶段，生成器以 Vite 中间件形式直接返回页面，和现有 `seoFilesPlugin` 的做法一致；构建时通过 `emitFile` 写入产物目录。

数据读取不要复制一份：生成器在 Vite 插件里用 SSR 模块加载能力（`server.ssrLoadModule`，或新版 Module Runner）加载 `resumeData.ts`，由 Vite 处理 `import.meta.glob`；如果该模块牵连到 Vue 运行时，再拆一个只导入纯数据文件的 `seoData.ts` 入口。静态页的样式可以复用现有设计 token，但不要加载整套应用 CSS 和 Vue 运行时，否则又回到首屏性能问题。

### 4.4 生成器职责

1. 读取并校验数据：slug 唯一、标题/描述长度、必填文案、关联范本存在。
2. 生成完整 HTML：`head`、面包屑、H1、导语、简历正文、写作要点、FAQ、相关范本、CTA、页脚、JSON-LD。简历正文本身是 HTML 字符串，生成前必须用现有 DOMPurify 清洗，不能直接拼接。
3. 生成 sitemap：只包含 canonical URL，写入 `lastmod`；私有用 noindex 的页面不进入。
4. 生成 `seo-manifest.json`：页面清单、标题、更新时间，供 nginx 白名单、主动推送、构建校验共用。
5. 任何一页校验失败就让构建失败，避免线上出现半套页面。
6. 页面正文与 SPA 使用同一份数据，禁止在静态模板里复制一份简历内容。

### 4.5 与 SPA 的衔接

- 详情页主 CTA 指向 `/resume/template?template=<slug>`，进入模板库后直接打开该范本的全屏预览，由用户确认后再创建简历。这样不会因为一次 GET 请求产生副作用。
- 如果产品接受“点 CTA 直接建草稿”，可以改成 `/resume/editor?template=<slug>`，但需要明确重复点击、容量已满、草稿覆盖等边界。
- 详情页的“在线预览”与主 CTA 共用同一个深链；模板库需要新增读取 `template` 查询参数并打开对应卡片的逻辑。
- 模板库卡片增加真实的 `<a href="/resume/example/<slug>">查看详情</a>`，不要只用 JS 点击打开弹窗，否则爬虫拿不到详情页入口。
- 静态页内所有站内链接都用普通 `<a>`，不依赖前端路由；从静态页进入 SPA 时是一次完整页面加载，行为可预期。

### 4.6 核心页静态化（P2）

两种做法，二选一或组合：

1. **快照**：用 Playwright 打开 `/resume`、`/resume/template` 等页面，等待首屏稳定后保存 HTML。优点是还原真实界面；缺点是 Vue 挂载时会清空并重绘，可能出现闪动，动态数字（在线人数、统计）还会造成 hydration 不一致。必须先在预发环境验证。
2. **丰富 `noscript`**：把产品介绍、功能清单、范本分类链接、FAQ 文本写进 `noscript`。这不是长久方案，但对不执行 JS 的抓取器是低成本兜底；注意不要在里面堆关键词，也不要放用户看不到的误导内容。

无论哪种，都不要对爬虫和用户返回两套不同信息（cloaking）；静态页与 SPA 的文案应同源。

### 4.7 部署与 nginx

仓库里没有 nginx 配置，以下需要在服务器侧确认或新增：

- `try_files $uri $uri/index.html $uri.html /index.html;`，确保 `/resume/example/foo` 能命中 `resume/example/foo/index.html`（或 `foo.html`），其余回 SPA。不要用 `$uri/`，否则 nginx 可能先 301 到带斜杠的地址，破坏 canonical。
- 统一尾斜杠策略：要么全部 301 到无斜杠，要么全部带斜杠；canonical 与 sitemap 必须与之一致。
- 未知路径返回 404，而不是 200 的 SPA 壳；`/error` 返回 404 并加 `noindex`。
- 固定主域（`qzcv.net`，不含 `www`）：`http` → `https`、`www` → 裸域都做 301；canonical、sitemap、OG 全部使用主域。
- HTML 短缓存（例如 5 分钟），带 hash 的静态资源长缓存；`gzip_static` 已由 `vite-plugin-compression` 产出 `.gz`。
- 如果要做百度主动推送，在部署脚本里调用 API；token 放环境变量，不写进仓库。

### 4.8 代码落点

| 文件 | 改动 | 目的 |
| --- | --- | --- |
| `apps/web/site.config.ts` | 增加页面类型、所属产品、`lastmod`、是否进入 sitemap | 让 sitemap 与页面元数据同源 |
| `apps/web/scripts/seoFiles.ts` | 支持 `lastmod`、按产品过滤、合并静态页清单 | 生成正确的 sitemap/robots |
| `apps/web/scripts/seoPages.ts`（新增） | 页面注册表、HTML 模板、sitemap 条目、dev 中间件 | 批量生成静态页 |
| `apps/web/vite.config.ts` | 注册生成器，注入站点地址与范本数量 | 构建期产出页面 |
| `apps/web/index.html` | 由 `SITE_CONFIGS` 生成全路由元数据；初始 HTML 直接输出 canonical/robots | 不执行 JS 也有正确头部 |
| `apps/web/src/utils/modules/pageMetadata.ts` | 补面包屑结构化数据、`editor-demo` 的 noindex、canonical 归一化 | 客户端导航与静态页一致 |
| `apps/web/src/views/resume/template/data/list.ts` | 增加 `slug`、`seoTitle`、`seoDescription`、`audience`、`highlights`、`related`、`updatedAt` | 详情页内容与内链的数据源 |
| `apps/web/src/views/resume/template/index.vue` | 卡片增加“查看详情”真实链接；读取 `?template=` 深链 | 列表到详情的内链与 CTA 衔接 |
| `apps/web/src/views/resume/components/resumeFooter.vue`（新增，可选） | 分类、指南、产品链接的轻量页脚 | 静态页必须有；应用内可作为 `SfFooter` 的轻量替代 |
| `deploy.sh` / nginx | `try_files`、404、301、主动推送 | 部署侧收口 |
| `apps/server`（可选） | 主动推送代理或定时任务 | 避免 token 暴露在前端 |

### 4.9 字段设计

```ts
/** 范本详情页的 SEO 与内容配置。 */
type ResumeTemplateSeo = {
  slug: string; // URL 标识，小写英文或拼音，例：frontend-project
  seoTitle: string; // 详情页标题，含主关键词，建议 18～28 个汉字
  seoDescription: string; // 详情页描述，建议 70～80 个汉字
  audience: string; // 适合人群，例：3～5 年经验的前端工程师
  highlights: string[]; // 该范本的写作要点，3～5 条，详情页正文展示
  related: string[]; // 相关范本 slug，用于详情页内链
  updatedAt: string; // 内容更新时间，写入 sitemap 的 lastmod
};

/** 分类聚合页配置。 */
type ResumeTemplateHub = {
  slug: string; // 分类 URL 标识，例：internet、campus
  title: string; // 分类页 H1
  keyword: string; // 该页主关键词
  description: string; // 分类导语，建议 300～500 字，人工撰写
  templateSlugs: string[]; // 该分类下收录的范本 slug
  faq: { question: string; answer: string }[]; // 分类常见问题，2～4 条
};
```

`ResumeTemplate` 上新增 `seo: ResumeTemplateSeo`，其余现有字段不动；分类页单独维护 `hub` 清单，不要从筛选结果自动生成，否则又会出现大量只有一张卡片的薄页面。

## 五、页面模板与内容规范

### 5.1 范本详情页

建议结构（从上到下）：

1. 面包屑：首页 > 简历模板 > 互联网 > 前端工程师。
2. H1：`{岗位}简历模板（{经验}）`，全页只出现一次。
3. 导语：80～120 字，说明这份范本适合谁、解决什么问题。
4. 元信息：行业、岗位、经验、更新时间。
5. 简历正文：按“个人信息（脱敏）→ 求职意向 → 工作经历 → 项目经历 → 教育 → 技能”顺序输出语义化 HTML，不要整页截图。
6. 写作要点：3～5 条，每条 40～80 字，必须针对该岗位，不能全站复制。
7. 常见问题：3～5 条，问题要来自真实搜索词，例如“没有大厂经历能投吗”“项目经历要写几个”。
8. 相关范本：4～6 个，同岗位/同行业优先。
9. CTA：`用这份范本开始制作`。
10. 页脚：分类、指南、关于、隐私。

图片也要按内容页处理：预览图用 WebP，`alt` 写“电商推广简历模板预览”这类描述，固定 `width`/`height` 避免布局偏移；首屏图不要 lazy，折叠线以下的图再 lazy。

底线：除简历正文外，每页至少 300 字独立中文；标题、描述、导语、写作要点不能是同一套模板只换岗位名。达不到就不要放进索引，先留在模板库里。

### 5.2 分类聚合页

- 先做 8 个左右：技术研发、产品与设计、运营与市场、金融财务、教育与医疗、校招、实习、社招/转行。
- 每页 400～600 字导语：这个方向简历的筛选逻辑、常见短板、范本怎么选。
- 列出 8～20 个范本，按相关度排序；少于 3 个的分类先不做。
- 页尾放 2～4 条分类 FAQ，再链接到相关指南。
- 分类页之间互相链接，形成“总库 → 分类 → 详情”的三层结构。

### 5.3 指南页

建议先写 10 篇，每篇 1500～2500 字，结构统一：

1. 问题是什么、HR 实际怎么看。
2. 写法/方法，给可执行的步骤。
3. 正反例，最好引用站内范本片段。
4. 常见错误。
5. 推荐范本与工具。
6. FAQ。

选题优先级：

- 项目经历怎么写（STAR/成果量化）
- 没有实习经历怎么写简历
- 简历自我评价怎么写
- 应届生简历模板怎么选
- ATS 简历是什么、怎么过
- 简历照片要不要放
- 转行简历怎么写
- 英文简历注意事项
- 简历投递记录怎么管理
- 简历一页还是两页

指南的价值在于“信息型搜索 → 范本页 → 工具页”的内链路径，不要写成产品广告。

### 5.4 功能页（`/resume/ai`、`/resume/statistics`）

这两个页面目前是应用界面：AI 页只有设置面板，统计页以看板为主、未录入数据时只有标题和空状态。它们却在 sitemap 里占着 0.8/0.7 的优先级，属于“标题承诺了内容，页面没有内容”的典型错配。

处理方式二选一：

- **补内容**：在应用界面上方增加 H1、120～200 字导语、功能说明、使用步骤和 2～3 条 FAQ；让不登录的用户也能读到“能做什么、怎么用、数据存在哪里”。
- **先 noindex**：如果短期没有内容预算，先把这两个 URL 从 sitemap 移除并设置 noindex，等页面有正文后再放开。不要让它们以薄页面参与排名。

首页 FAQ 也一样：答案默认 `display: none` 虽然仍在 DOM 里，但权重会被打折。建议改成 `<details>/<summary>` 或直接可见，展开交互用原生元素完成，不依赖 JS 才显示。

### 5.5 内链规则

- 任何详情页到首页不超过 3 次点击：首页 → 模板库/分类页 → 详情页。
- 每页固定放面包屑、4～6 个相关范本、1～2 个相关指南、1 个分类页入口。
- 模板库底部增加“全部范本索引”，用纯文本链接列出 44 个详情页；这比无限滚动更利于抓取，也方便用户跳转。
- 静态 SEO 页统一页脚：8 个分类、10 篇指南、关于/隐私/联系；不要只放图标，锚文本要能说明目标页面。应用内如果不想恢复 `SfFooter`，至少保留模板库底部的范本索引和分类入口。
- 锚文本用“前端工程师简历模板”，不要用“点击这里”“查看更多”。

### 5.6 质量门槛与索引白名单

- 每页人工审核后再加入 sitemap；不要“生成即收录”。
- 用一份 `indexable` 白名单控制 sitemap 与 `robots`，下架页面返回 404/410，不要只从 sitemap 删除。
- 117 个样式页先不单独收录；等有差异化文案、预览图和真实使用数据后，再挑 20～30 个做详情页。
- 同一份范本不要同时生成中文页和英文页再互相 canonical，除非两页内容确实不同。
- 每月回看：没有展现、没有点击、内容重复的页面，合并或下架。

### 5.7 文案禁区

- 关键词堆砌、隐藏文字、伪原创、采集。
- “保证通过”“100% 拿到 offer”“HR 内部模板”等无法证明的承诺。
- 伪造使用人数、评价、合作企业。
- 同一段介绍在几十个页面重复出现。

## 六、元数据、结构化数据与社交卡片

### 6.1 Title 与 Description

Title 公式：`{主关键词}_{差异点}_{品牌}`，建议 18～28 个汉字。

- 首页：`在线简历制作_免费简历模板与范本_轻舟简历`
- 模板库：`简历模板与范本_44 份范文_ATS 排版_轻舟简历`
- 详情页：`电商推广简历模板_3-5 年经验_SEO/SEM_轻舟简历`
- 分类页：`互联网简历模板_前端后端产品运营范文_轻舟简历`
- 指南：`项目经历怎么写_STAR 法则与示例_轻舟简历`

Description 公式：`{对象} + {数量/经验/差异点} + {动作}`，建议 70～80 个汉字。

- 详情页：`这是一份适合 3～5 年电商推广岗位的简历范本，包含搜索优化、投放提效和项目经历写法，可在线编辑并导出 PDF。`

现状问题：

- 首页标题 32 字、品牌在最前，百度结果页可能截断，关键词权重也被品牌名占用。
- `/resume/ai`、`/resume/statistics` 的原始 HTML 仍是首页信息，需要纳入构建期元数据。
- `keywords` meta 对 Google 基本无效，对百度也只是弱信号，不值得继续投入；保留即可，不要为它改文案。

### 6.2 canonical、robots、hreflang

- 每个可收录页在**原始 HTML** 里输出自指 canonical，绝对地址、https、无尾斜杠。
- `robots` 也在服务端输出：`index,follow` 或 `noindex,nofollow`，不要等 JS。
- `/resume/editor`、`/resume/print`、`/resume/mine`、`/resume/editor-demo`、`/error` 统一 noindex。`/resume/print` 只给服务端导出用，可以继续 Disallow；`/resume/editor`、`/resume/mine` 能从站内 CTA/导航到达，建议允许抓取并返回 noindex，否则爬虫看不到 noindex，URL 仍可能被索引成一个空页面。
- 筛选/排序参数：canonical 回分类页，或直接 noindex；不要为每个筛选组合生成 URL。
- `?template=<slug>` 这类深链只用于打开预览，canonical 指向对应详情页，或直接 noindex，避免和详情页争排名。
- 英文如果要独立收录，用 `/en/...` 独立 URL，并在中英文页互加 `hreflang` 与 `x-default`；如果暂时不做，就不要在英文语言包里宣称独立收录。
- 响应式站点建议加 `<meta name="applicable-device" content="pc,mobile">`，便于百度识别移动适配。

### 6.3 结构化数据

| 页面 | 类型 | 关键字段 |
| --- | --- | --- |
| 全站 | `WebSite` + `Organization` + `SoftwareApplication` | 名称、别名、URL、logo、sameAs、免费价格 |
| 详情页 | `Article` 或 `CreativeWork` + `BreadcrumbList` | headline、description、datePublished、dateModified、author、image |
| 分类页 | `CollectionPage` + `ItemList` + `BreadcrumbList` | 分类名、条目列表、面包屑 |
| 指南页 | `Article` + `BreadcrumbList`（可选 `FAQPage`） | 标题、作者、更新时间、FAQ |
| 模板库 | `CollectionPage` + `ItemList` | 集合名、范本列表 |

详情页 JSON-LD 示例：

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "电商推广（SEO/SEM）简历模板",
  "description": "适合 3～5 年电商推广岗位的简历范本，包含搜索优化与投放提效的项目写法。",
  "datePublished": "2026-10-01",
  "dateModified": "2026-10-18",
  "author": { "@type": "Organization", "name": "轻舟简历" },
  "publisher": { "@type": "Organization", "name": "轻舟简历" },
  "mainEntityOfPage": "https://qzcv.net/resume/example/ecommerce-seo"
}
```

注意：

- Google 的 FAQ 富结果已经收窄，不要为了富结果堆 FAQ；结构化数据要与页面可见内容一致。
- 百度对 JSON-LD 的消费有限，但对 Google/Bing 和语义理解仍有价值；重点是页面本身可读。
- 上线前用 Rich Results Test 和 Schema Markup Validator 各跑一遍。

### 6.4 OG 与社交卡片

- 每个详情页/分类页有独立 `og:title`、`og:description`、`og:url`、`og:image`，图片 1200×630。
- 范本页的 OG 图建议用该范本的预览截图；没有截图时用品牌模板图，不要所有页面共用一张。
- 加 `og:locale`；英文页加 `og:locale:alternate`。

## 七、抓取、收录与运营

### 7.1 百度

1. 在百度搜索资源平台完成站点验证（HTML 标签或文件），确认 `qzcv.net` 是主域。
2. 提交 `https://qzcv.net/sitemap.xml`；sitemap 只保留简历产品 URL（是否保留 `/home` 需产品决策）。
3. 开通普通收录的 API 主动推送，部署后只推新增/更新的 URL；配额有限，不要重复推全量。
4. 用抓取诊断检查 `/resume`、`/resume/template`、详情页，确认百度能拿到 200、正文和 canonical。
5. 观察索引量、抓取频次、抓取异常；软 404 和重复标题优先处理。
6. 移动适配：响应式站点声明 `applicable-device`，在资源平台确认适配关系。
7. 备案与主体信息保持一致；这是百度信任的基础项。

### 7.2 Google 与 Bing

- Google Search Console：验证、提交 sitemap、URL Inspection、Core Web Vitals、查询报告。
- Bing Webmaster Tools：可以从 GSC 导入，提交 sitemap。
- Google 能渲染 JS，但渲染排队；静态 HTML 仍然更快、更稳。
- 用 GSC 的“网页”报告区分“已抓取未编入索引”“重复网页”“软 404”，逐项清零。

### 7.3 360 与搜狗

- 360 站长平台、搜狗站长平台分别验证并提交 sitemap。
- 百度和 360/搜狗对静态 HTML 的依赖更强，P1 的静态页对它们是直接收益。

### 7.4 外链与品牌

- GitHub 仓库 README 已经指向 `qzcv.net`，保持 `sameAs` 一致（GitHub、知乎、小红书、B 站等）。
- 在掘金、V2EX、少数派、知乎写“为什么做轻舟简历”“开源简历工具”这类真实内容，带产品链接；不要买链接、不要站群。
- 提交到 AI 工具导航、独立产品导航、Product Hunt（英文版）。
- 品牌名统一：中文“轻舟简历”、英文“Skiff Resume”，不要在不同页面混用第三种叫法。

### 7.5 监测与复盘

- 每周：收录数、抓取异常、404、CWV。
- 每月：查询/页面报告、CTR、自然流量、自然流量 → 新建简历转化率。
- 每季度：内容刷新与下架、标题实验、内链审计。
- 看 nginx 日志里的 Baiduspider/Googlebot 抓取路径，确认它们真的到了详情页，而不是只抓首页。

## 八、路线图

| 阶段 | 时间 | 交付 | 验收 |
| --- | --- | --- | --- |
| P0 地基 | 第 1 周 | 站长验证、sitemap 提交、主动推送；sitemap 加 `lastmod`（`/home` 是否移除需产品确认）；构建期全路由元数据 + 初始 canonical/robots；`editor-demo`/`error` noindex；404 与主域 301 收口；确认 `VITE_SITE_URL`；AI/统计页补内容或先 noindex；埋点 | 百度/Google 能抓到 200 + 正确头部；软 404 清零；能看到自然流量与转化 |
| P1 页面 | 第 2～5 周 | 静态生成器；44 个范本详情页；8 个分类聚合页；详情页内链、页脚、JSON-LD、sitemap；先上 10 页试点 | 10 页试点 2～4 周内至少 3 页被收录；再批量到 50+；每页首屏 HTML 有正文 |
| P2 内容 | 第 6 周起，持续 8～12 周 | 10 篇指南；20～30 个精选样式页（可选）；英文独立 URL 与 hreflang；4 个核心页静态化；CWV 与标题实验；外链 | 长尾词开始有稳定展现；自然流量与新建简历转化可归因 |

P1 的关键节奏是“试点 → 验证 → 批量”，不要一次性生成 50 页再等结果。试点页选 5 个不同方向（技术、产品、运营、金融、校招/实习），覆盖不同的搜索意图，才能看出哪类页面有效。

工作量粗估（不含指南写作）：

| 工作 | 人日 |
| --- | --- |
| 生成器、静态模板、dev 中间件 | 5～7 |
| 44 个详情页的导语、写作要点、FAQ | 6～10 |
| 8 个分类聚合页的导语与选品 | 3～4 |
| 结构化数据、页脚、内链、sitemap | 2～3 |
| 试点、收录验证、修问题 | 3～5 |
| 合计 | 19～29 |

如果只有一个人做，P1 更现实的周期是 6～8 周；可以先把生成器和 5 个试点页做完，再决定是否批量。

## 九、指标

| 指标 | 定义 | 基线 | 4 周 | 8 周 | 12 周 |
| --- | --- | --- | --- | --- | --- |
| 可收录 URL | sitemap 中简历相关 URL 数 | 4 | 15+ | 50+ | 60+ |
| 收录数/率 | 站长平台已收录 / 已提交 | 待测 | 建立基线 | ≥ 50% | ≥ 60% |
| 有效抓取频次 | 百度/Google 对详情页的抓取次数 | 待测 | 建立基线 | 周环比上升 | 稳定 |
| 软 404 | 返回 200 的错误页数量 | 待测 | 0 | 0 | 0 |
| CWV 通过率 | 移动端良好页面占比 | 待测 | ≥ 70% | ≥ 80% | ≥ 90% |
| 展现/点击/CTR | 站长平台与 GSC | 待测 | 建立基线 | 环比上升 | 稳定增长 |
| 种子词排名 | 20 个核心词的平均排名 | 待测 | 建立基线 | 前 3 页占比 ≥ 30% | 前 3 页占比 ≥ 50% |
| 自然流量 | 百度统计/GSC 自然搜索会话 | 待测 | 建立基线 | 环比上升 | 同比上升 |
| 自然 → 新建简历 | 自然流量带来的新建简历次数 | 待测 | 建立基线 | 可归因 | 环比上升 |

表中的 4/8/12 周数值是建议目标，首月拿到真实基线后要重新校准；不要把排名承诺写进对外文档。

## 十、风险与边界

1. **规模化薄内容**：44 个详情页如果只是换岗位名，可能被判定为低质。必须人工写导语、写作要点、FAQ；达不到质量门槛的页面不索引。
2. **百度 JS 渲染不确定**：不能假设百度一定执行 JS。静态 HTML 是对冲，不是可选项。
3. **两套渲染的一致性**：静态页与 SPA 必须使用同一份数据、同一套文案；不要给爬虫看一套、给用户看另一套。
4. **维护成本**：范本数据变更后需要重新生成页面与 sitemap；用 manifest 和构建校验保证不漏页。
5. **收录周期**：新站/新目录通常要 2～8 周；不要频繁改标题、改 URL，否则会反复重置信号。
6. **范围边界**：本方案只覆盖简历产品；`/home` 是否 noindex、是否 301 到 `nannan.work`，属于域名边界决策，需单独确认。
7. **合规**：备案、隐私政策、用户数据说明要齐全；文案避免“保证通过”“100%”等广告法风险词。

## 附录 A：当前与目标元数据对照

| 页面 | 当前 Title | 目标 Title |
| --- | --- | --- |
| `/resume` | 轻舟简历 - 免费在线简历制作与导出、免注册、多款简历范本与模板（32 字） | 在线简历制作_免费简历模板与范本_轻舟简历 |
| `/resume/template` | 简历范本与模板 - ATS 投递排版、在线制作 \| 轻舟简历（30 字） | 简历模板与范本_44 份范文_ATS 排版_轻舟简历 |
| `/resume/ai` | AI 简历优化 - 智能润色与模拟面试 \| 轻舟简历 | 保持，补 H1 与 300 字导语 |
| `/resume/statistics` | 求职投递统计 - 记录投递进度与 offer \| 轻舟简历 | 保持，补 H1 与 300 字导语 |
| `/resume/example/{slug}` | 不存在 | {岗位}简历模板_{经验}_{行业}_轻舟简历 |

## 附录 B：范本详情页 HTML 骨架

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>电商推广简历模板_3-5 年经验_SEO/SEM_轻舟简历</title>
    <meta name="description" content="适合 3～5 年电商推广岗位的简历范本，包含搜索优化、投放提效与项目经历写法，可在线编辑并导出 PDF。" />
    <link rel="canonical" href="https://qzcv.net/resume/example/ecommerce-seo" />
    <meta name="robots" content="index,follow" />
    <meta property="og:title" content="电商推广简历模板_3-5 年经验_SEO/SEM_轻舟简历" />
    <meta property="og:description" content="适合 3～5 年电商推广岗位的简历范本，包含搜索优化、投放提效与项目经历写法。" />
    <meta property="og:url" content="https://qzcv.net/resume/example/ecommerce-seo" />
    <meta property="og:image" content="https://qzcv.net/seo/templates/ecommerce-seo.webp" />
    <link rel="stylesheet" href="/seo/seo-pages.css" />
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "首页", "item": "https://qzcv.net/resume" },
          { "@type": "ListItem", "position": 2, "name": "简历模板", "item": "https://qzcv.net/resume/template" },
          { "@type": "ListItem", "position": 3, "name": "电商推广简历模板", "item": "https://qzcv.net/resume/example/ecommerce-seo" }
        ]
      }
    </script>
  </head>
  <body>
    <header class="seo-header">
      <a href="/resume">轻舟简历</a>
      <nav>
        <a href="/resume/template">全部模板</a>
        <a href="/resume/ai">AI 优化</a>
      </nav>
    </header>
    <main>
      <nav aria-label="面包屑">首页 > 简历模板 > 电商推广 > 正文</nav>
      <h1>电商推广（SEO/SEM）简历模板</h1>
      <p class="lede">适合 3～5 年电商推广岗位……</p>
      <section aria-labelledby="resume-body">
        <h2 id="resume-body">简历正文</h2>
        <!-- 语义化的简历内容，手机号与邮箱脱敏 -->
      </section>
      <section aria-labelledby="tips">
        <h2 id="tips">这份范本怎么写</h2>
        <ul>
          <li>用自然流量、投产比、获客成本三个指标串起经历。</li>
        </ul>
      </section>
      <section aria-labelledby="faq">
        <h2 id="faq">常见问题</h2>
        <!-- 可见的问答，不用 display:none 折叠 -->
      </section>
      <p><a class="cta" href="/resume/template?template=ecommerce-seo">用这份范本开始制作</a></p>
    </main>
    <footer>
      <a href="/resume/example/position/ecommerce">电子商务简历</a>
      <a href="/resume/guide/project-experience">项目经历怎么写</a>
    </footer>
  </body>
</html>
```

## 附录 C：参考资料

- 超级简历的目录结构（分类聚合页 + 单模板页 + 范文/面试内容）：[wondercv.com](https://www.wondercv.com/)、[简历模板频道](https://www.wondercv.com/jianlimoban/)
- Google 的 JavaScript SEO 说明：[JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- Schema.org 词汇表：[schema.org](https://schema.org/)
- 百度搜索资源平台：[ziyuan.baidu.com](https://ziyuan.baidu.com/)
- Core Web Vitals：[web.dev/vitals](https://web.dev/vitals/)
