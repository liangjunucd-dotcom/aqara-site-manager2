# Studio Cloud / Site Manager 产品需求文档（PRD）

## 修订记录

| 版本 | 修订说明 | 修订人 | 修订日期 | 备注 |
|------|----------|--------|----------|------|
| v0.6 | 初稿：背景、定位、原则、4.1 | Jun | 2026.07.03 | — |
| v0.7 | 融入 Aqara 全链路架构，优化背景/定位/功能章节 | Jun | 2026.07.06 | 对齐 Builder → Cloud → Studio → 用户 闭环 |
| **v1.3** | **账号-空间-权限-成员体系；产品切换；项目云存储；组织管理后台；B 端多 Studio 方案分发** | Jun | 2026.07.08 | Mock 原型已部署 Vercel + GitHub Pages |

### 在线原型

| 环境 | 地址 |
|------|------|
| Vercel | https://aqara-site-manager2.vercel.app |
| GitHub Pages | https://liangjunucd-dotcom.github.io/aqara-site-manager2/ |

---

## 一、需求背景

### 1.1 业务背景

随着 **Studio（本地主机）+ Studio Cloud（云端运维）** 体系面向 **商用工程交付**、**家庭全屋智能** 两大场景规模化落地，Aqara 正在构建一条从「方案设计 → 现场实施 → 云端运维 → 日常使用 → 数据反哺」的完整产品链路。

在这条链路中，**Studio Cloud / Site Manager** 处于 **运维阶段（Studio Cloud）** 的核心位置：它承接 Builder 产出的 Blueprint 方案，为 Installer 提供绑定目标空间，为 Owner / 运维人员提供长期纳管能力，并向 AI 数据中台输送运行时数据。

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Aqara 空间智能全链路架构                               │
├─────────────┬─────────────┬─────────────────┬─────────────┬─────────────────┤
│  设计阶段    │  运维阶段    │  实施调试阶段     │  日常使用     │  数据闭环        │
│ Aqara       │ Studio      │ Aqara Studio    │ 用户 App    │ Aqara AI        │
│ Builder     │ Cloud       │ + Installer     │ + Studio    │ 数据中台         │
│             │ Site Manager│ + Studio M300   │ Agent       │                 │
└─────────────┴─────────────┴─────────────────┴─────────────┴─────────────────┘
       │              │                │               │              │
       └──────────────┴────────────────┴───────────────┴──────────────┘
                              Blueprint / 本体 / 运行数据 双向流转
```

### 1.2 全链路各阶段与 Site Manager 的关系

| 阶段 | 平台 / 角色 | 核心产出 | 与 Site Manager 的关系 |
|------|-------------|----------|------------------------|
| **设计阶段** | Aqara Builder（Builder 角色） | Blueprint 方案：空间模型 + 空间逻辑 + 场景自动化 | Site Manager **接收**已发布至 Space 的方案，展示绑定关系，支持预同步 |
| **运维阶段** | **Studio Cloud / Site Manager**（Builder / 运维角色） | 空间资产纳管、Studio 健康监控、权限与交付 | **本 PRD 核心范围** |
| **实施调试阶段** | Aqara Studio + Installer | Studio M300 本地配置、Blueprint 导入、自动调试 | Site Manager **提供**可绑定 Space 列表与 Blueprint 槽位 |
| **日常使用** | 用户 App + Studio Agent | 设备控制、空间推理、智能交互 | Site Manager **定义**远程隧道权限与资产归属 |
| **数据闭环** | Aqara AI 数据中台 | 挖掘 / 标注 / Bad Case 分析 | Site Manager **上报**运行日志与健康遥测 |

### 1.3 当前痛点

尽管各阶段产品能力已在逐步建设，但 **云端 Space 与本地 Studio 之间尚未形成标准化联动**，导致全链路价值无法充分释放：

**痛点 1：售前规划无法落地闭环**

- Builder 阶段已支持云端提前创建 Space、在 Builder Lab 完成户型组态与 Blueprint 配置；
- 但 **Installer 现场部署 Studio M300 后，缺少标准化关联流程**，无法快速挂载到售前预建的目标 Space；
- 结果：云端售前规划、方案预配置的价值 **无法下沉到本地 Studio**。

**痛点 2：设备与空间生命周期缺少统一管控**

- 设备绑定、云端解绑、本地解绑、项目移交、售后托管、家庭成员权限等能力 **零散存在**；
- 缺少统一的空间归属、角色权限、远程隧道访问、空壳空间归档、项目交付过户机制；
- 结果：无法支撑 **规模化商用交付** 与 **家庭用户长期运营**。

**痛点 3：运维阶段缺少可视化中枢**

- Studio Cloud 作为运维阶段平台，需要 Site Manager 提供 **类 Exosphere / UniFi 的专业运维体验**；
- 当前缺少统一的 Studio 卡片网格、健康状态可视化、Blueprint 运维入口、详情页运维控制台；
- 结果：运维人员无法 **一屏掌握** 多 Space、多 Studio、多 Blueprint 的运行态势。

### 1.4 建设目标

基于 Aqara 全链路架构，本次迭代在 **Studio Cloud 运维阶段** 搭建 **Site Manager** 模块，作为空间智能体系的 **资源底座与业务流转中枢**：

> 统一 B 端商用 Site 与 C 端家庭 Space 底层模型，打通  
> **「Builder 售前规划 → Installer 现场部署 → Cloud 云端运维 → Owner 日常使用 → 数据中台反哺 Builder」** 完整闭环。

---

## 二、产品定位

### 2.1 在全链路中的定位

Site Manager 是 **Studio Cloud 的核心模块**，对应架构图中 **运维阶段（Studio Cloud）** 的用户界面与业务逻辑层。

```
                    ┌──────────────────┐
                    │  Aqara Builder   │
                    │  产出 Blueprint   │
                    └────────┬─────────┘
                             │ 发布至 Space
                             ▼
┌──────────────┐    ┌──────────────────┐    ┌──────────────┐
│ 本体/标准库  │◄───│  Site Manager    │───►│ AI 数据中台   │
│ (Ontology)   │    │  (Studio Cloud)  │    │ 挖掘/标注     │
└──────────────┘    └────────┬─────────┘    └──────────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
        Space/Site     Studio 卡片      权限/交付
        结构分区        健康监控         远程隧道
                             │
                             │ 提供绑定目标
                             ▼
                    ┌──────────────────┐
                    │  Aqara Studio    │
                    │  Installer 实施   │
                    └────────┬─────────┘
                             │ 配置下发
                             ▼
                    ┌──────────────────┐
                    │  Studio M300     │
                    │  物理主机         │
                    └────────┬─────────┘
                             │ 用户控制
                             ▼
                    ┌──────────────────┐
                    │  用户 App         │
                    │  Studio Agent    │
                    └──────────────────┘
```

**一句话定位：**

> Site Manager 是 Aqara 空间智能体系在 **运维阶段** 的 **「空间-Studio-Blueprint-权限」四元组管理中枢**，连接 Builder 设计成果与 Studio 现场实施，支撑 Owner 长期资产运营。

### 2.2 管理对象与边界

| 对象 | 定义 | 管理方 | 创建时机 |
|------|------|--------|----------|
| **Space / Site** | 空间容器（商用项目 / 家庭住宅） | Site Manager（云端） | 售前阶段，云端前置创建 |
| **SpaceStructureNode** | 空间逻辑分区（楼层/区域/房间） | Site Manager | 售前或运维阶段 |
| **Blueprint** | 方案（空间模型+逻辑+自动化） | Aqara Builder 创建，Site Manager 展示绑定 | 设计阶段产出，发布至 Space |
| **Studio（Site）** | 物理/逻辑主机（M300 等） | Site Manager 纳管，Studio 本地运行 | 现场绑定后激活 |
| **Device** | Matter/Zigbee 末端设备 | Studio 本地管理，Site Manager 同步状态 | 实施调试阶段注册 |

**边界说明：**

- **Site Manager 负责**：空间 CRUD、Studio 纳管与监控、Blueprint 绑定关系、权限与交付、运维日志
- **Aqara Builder 负责**：Blueprint 设计与发布、本体/标准库维护
- **Aqara Studio 负责**：Installer 实施调试、Blueprint 导入、本地设备配置
- **用户 App 负责**：日常设备控制；远程能力受 Site Manager 权限约束

### 2.3 目标用户

| 用户角色 | 所在阶段 | 使用 Site Manager 的场景 |
|----------|----------|--------------------------|
| **工程集成商（Installer）** | 实施 + 运维 | 批量预建 Space、预配 Blueprint 槽位、监控交付项目健康 |
| **B 端企业业主** | 运维 + 日常 | 管理商用 Space 资产、授权运维人员、查看 Studio 运行态势 |
| **C 端家庭业主** | 运维 + 日常 | 管理家庭 Space、主 Studio 状态、家庭成员权限 |
| **Builder / 方案设计师** | 设计 + 运维 | 发布 Blueprint 至 Space，跟踪方案在 Studio 上的落地情况 |
| **受托运维 / 家庭成员** | 运维 / 日常 | 基于 Space 角色获得对应 Studio 的查看或控制能力 |

### 2.4 核心价值主张

| # | 价值 | 说明 | 对应架构阶段 |
|---|------|------|-------------|
| 1 | **全链路可闭环** | 售前预建 → 现场绑定 → 云端运维 → 资产交付 → 数据反哺 | 设计→运维→实施→日常→数据 |
| 2 | **交付范式标准化** | 固化「云端先建 Space、现场 Studio 自选关联」，区别于家用后配模式 | 运维 + 实施 |
| 3 | **B/C 一套底座** | 统一数据模型，按 `spaceType` 差异化 UI / 权限 / 菜单 | 运维 |
| 4 | **Blueprint 可追溯** | 从 Builder 发布到 Studio 绑定，全链路方案版本可查看、可下载、可解绑 | 设计 + 运维 |
| 5 | **资产归属清晰** | 所有者 / 受托管理员 / 家庭成员三层身份，交付与托管不冲突 | 运维 |
| 6 | **远程权限可控** | 云端角色驱动本地隧道能力，断云不影响 Studio 本地运行 | 运维 + 日常 |
| 7 | **运行态可视** | Studio 卡片 + 健康状态条 + 详情页，一屏掌握全局 | 运维 |

---

## 三、设计原则

| 序号 | 原则 | 说明 | 架构依据 |
|------|------|------|----------|
| 1 | **云端前置创建，规划优先** | Space/Site 统一云端创建；Studio 仅做关联绑定，不自动建空间 | 设计→运维→实施 顺序 |
| 2 | **设备自选关联，精准绑定** | Studio 绑定时加载账号可绑定 Space 列表，Installer 手动选择 | 实施阶段 Installer 流程 |
| 3 | **Blueprint 随 Space 流转** | Blueprint 由 Builder 发布至 Space，Studio 导入实施，Cloud 只读展示 | Builder→Cloud→Studio 链路 |
| 4 | **双向解绑，资产永久留存** | 云端/本地均可解绑；空间数据、方案、日志、权限全部保留 | 运维阶段资产策略 |
| 5 | **所有权与运维权分离** | 所有者 / 受托管理员 / 家庭成员三层权限 | 交付 + 托管场景 |
| 6 | **一套模型，双场景渲染** | `spaceType` 区分商用/家庭，UI 自动适配 | B/C 统一底座 |
| 7 | **云端权限驱动本地隧道** | 远程能力由 Space 角色定义，本地动态映射 | 运维→日常 权限链 |
| 8 | **运行数据上行，设计数据下行** | 运维遥测上报数据中台；本体/标准库反馈优化 Builder | 数据闭环 |
| 9 | **断云不断本地** | 云端不可用不影响 Studio M300 本地运行与 App 局域网控制 | 日常使用独立性 |

---

## 四、功能需求

> 以下功能按 **Site Manager 在运维阶段的职责** 组织，并在各节标注与全链路其他阶段的 **接口关系**。

### 4.1 云端创建 Space/Site（商用/家庭）

**功能概述：** 用户在云端提前创建空白空间，区分商用 Site、家庭 Space，用于售前建档、Blueprint 预同步、项目前置管理。

**链路位置：** 设计阶段（Builder 发布 Blueprint）→ **运维阶段（本功能）** → 实施阶段（Installer 选择绑定）

**交互流程：**

1. 进入 Space 总览页，点击「创建空间」；
2. 选择类型：【商用项目 Site】/【家庭住宅 Space】；
3. 录入名称、地址、项目备注等；
4. 确认创建，生成 `spaceId`，当前账号默认为所有者；
5. 空壳 Space 展示在列表，等待 Blueprint 预同步与 Studio 绑定。

**空壳 Space 能力：** 方案预同步、信息编辑、归档、删除；暂无设备运维与远程隧道。

**上游依赖：** Aqara Builder Blueprint 发布 API（可选预同步）  
**下游消费：** Aqara Studio 绑定时加载 Space 列表

---

### 4.2 空间总览大厅（Space Index）

**功能概述：** 登录后默认入口，展示 Org 下所有 Space，是进入 Site Manager 的统一门户。

**链路位置：** 运维阶段入口

| 能力 | 说明 |
|------|------|
| 空间卡片 | 名称、类型、Studio 数、健康概览、空壳/活跃/归档状态 |
| Org 切换 | 多组织上下文（企业 / 个人工作区） |
| 搜索过滤 | 名称、类型、状态 |
| 快捷创建 | 「创建空间」 |

**B/C 差异化：** 商用展示项目地址与分区数；家庭展示住宅地址与成员数。

---

### 4.3 空间逻辑分区（Structure Tree）

**功能概述：** Space 内层级化逻辑分区，Studio 主机挂载到具体节点。

**链路位置：** 运维阶段；对应 Blueprint 中「空间模型」的 Cloud 侧映射

- 新建 / 重命名 / 删除分区（含父子层级）
- 折叠 / 展开 / 固定侧边栏
- 点击分区过滤 Studio 卡片
- 家庭 Space 默认隐藏复杂树（C 端轻量化）

---

### 4.4 Studio 主机纳管（Site Manager 核心）

**功能概述：** 以卡片网格展示 Space 内所有 Studio，提供运行健康可视化——对应架构图 **Site Manager 卡片 + 状态条**。

**链路位置：** 运维阶段核心 UI；数据来源于 Studio M300 同步

**卡片统一布局：**

```
名称 + 主站/子站          Blueprint 标签
aqarastudio-xxxx
━━━━━━━━ 健康状态条（绿/黄/红分段）━━━━━━━━
05:00        11:00        Now
分区名称                      x/x 设备
[设备类型图标]
```

**规范：** 网格 `minmax(280px,1fr)`；等高卡片；长名称 truncate；Blueprint 固定 118px。

**健康状态条：**

| 颜色 | 含义 |
|------|------|
| 绿 | 正常运行 |
| 黄 | 待升级 / 弱信号网关 / 局部告警 |
| 红 | 故障 / 网关离线 / 严重告警 |

**命名：** 统一「xxx 主机」格式。

**空状态：** 极简引导 +「添加站点」，无营销元素。

---

### 4.5 方案设计与项目云存储（V1.3 重构）

**功能概述：** 方案设计文件不再以顶栏面板展示，而是纳入 **项目级云存储**，与日志备份、配置快照共享配额。

**链路位置：** 设计（Aqara Builder 导入）→ 运维（云存储纳管）→ 实施（按 Studio 分发）

**信息架构：**

```
项目内左侧菜单
├── Studios Hub        — 站点运维（卡片展示「运行方案」）
├── 云存储              — 项目共享存储（方案 / 日志 / 快照）
├── Topology Design
├── Studio Cloud Logs
└── Project Settings   — 基本信息 + 项目成员
```

**云存储能力：**

| 资源类型 | 来源 | 说明 |
|----------|------|------|
| 方案设计 | Aqara Builder 导入 | 存入项目后，可分发到多台 Studio |
| 日志备份 | Studio Cloud 自动上传 | 运行日志、事件快照归档 |
| 配置快照 | 系统 / Studio | 控制器配置备份 |

**配额：** 个人项目默认 5 GB；组织项目默认 50 GB（可扩展）。

**B 端多 Studio 差异化：** 同一项目可关联多个方案；每台 Studio 绑定不同方案（如酒店标准客房 vs 行政套房）。云存储页展示「已绑定 N 台 Studio」并支持分发；Studio 卡片右上角显示当前运行方案名。

**与旧版 Blueprint 标签关系：** 若 Studio 已绑定项目方案，优先展示方案名；否则回退至 legacy Blueprint 标签；均未绑定显示「未绑定方案」。

**数据流：**

```
Aqara Builder 发布方案
    → 应用到 Site Manager 项目（写入云存储）
        → 运维人员在云存储中「分发到 Studio」
            → Studio 卡片展示运行方案
                → Aqara Studio 本地运行实例
```

---

### 4.5.1 Blueprint 方案关联（Legacy 运维入口）

**功能概述：** Studio 卡片上 legacy Blueprint 绑定关系的 Popover 运维入口（与项目云存储方案并存，逐步迁移）。

**Popover 操作：**

- 方案更新时间
- **在 Aqara Studio 中打开**
- 下载（JSON）
- 删除绑定（destructive）

---

### 4.6 现场设备绑定与关联

**功能概述：** 标准化「云端先建 Space → 现场 Studio 自选关联」——打通 **运维阶段** 与 **实施调试阶段**。

**云端侧（Site Manager）：**

- 空壳 Space 等待绑定
- 支持 Provision Studio 预注册（名称、型号、ISP、时区）
- 预注册 Studio 以「待激活」展示

**本地侧（Aqara Studio，Installer）：**

1. 登录云端账号
2. 加载可绑定 Space 列表（含空壳 + 预注册槽位）
3. 手动选择 Space / 分区 / Blueprint
4. 自动调试 → 修改 → 结束调试
5. 绑定成功，Site Manager 卡片变为「在线」

**规则：** Studio 不得自动创建 Space；一 Studio 一 Space 槽位；绑定后同步设备清单与 Blueprint 版本。

---

### 4.7 双向解绑

**功能概述：** 云端/本地均可解除 Studio 与 Space 关联，数字资产永久保留。

| 方向 | 触发 | 保留 | 清除 |
|------|------|------|------|
| 云端解绑 | Site Manager | 结构树、Blueprint 记录、日志、权限、备份 | 实时状态、远程隧道 |
| 本地解绑 | Aqara Studio | 同上 | 同上 |

**链路意义：** 支持 **模式 B 交付**（设备转手/二手房重绑新 Space）。

---

### 4.8 Studio 详情页

**功能概述：** 单 Studio 运维控制台，参考 Exosphere 双列卡片布局。

**链路位置：** 运维阶段下钻；「Open in Aqara Studio」跳转 **实施/日常** 阶段工具

**结构：**

- **Header：** 型号 + 面包屑 | Open in Aqara App + **Open in Aqara Studio**
- **Tabs：** Overview / Programs / History

| Overview 卡片 | 内容 |
|---------------|------|
| Health | Healthy / Attention / Critical |
| Actions | Manage Device、Run Diagnostics |
| System Status | 云端绑定信息 |
| Details | SN、Role、Update Level、Blueprint、Timezone |
| Recommended Settings | 权限提示 |
| History | 最近备份 + 跳转 |

| Programs | 自动化规则、设备清单、Blueprint 库 |
| History | 系统日志、备份快照 |

---

### 4.9 成员与权限管理（V1.3 统一模型）

**功能概述：** 区分 **组织成员**、**外部成员**、**项目成员** 三层，项目设置仅管理项目成员。

**链路位置：** 运维阶段定义 → 日常阶段（App / 远程 Studio）执行

#### 4.9.1 组织层（组织管理后台）

| 模块 | 说明 |
|------|------|
| 基本信息 | 企业名称、描述、拥有者 |
| 成员管理 | 组织成员 / 外部成员（`orgRole`: owner / admin / member / external） |
| 角色管理 | 组织级角色模板 |
| 组织架构 | 部门树 |

入口：头像下拉 → 「组织管理后台」→ 云效式「进入应用」选企业。

#### 4.9.2 项目层（Project Settings）

| 模块 | 说明 |
|------|------|
| 基本信息 | 项目名称、描述、删除 |
| 项目成员 | 邀请协作者，角色映射 Admin / Operator |
| 自定义角色 | 展示名自定义（如「爸爸」「妈妈」），权限仍映射 Admin/Operator |

**不在项目设置体现：** 组织成员 vs 外部成员的类型区分——归组织管理后台。

#### 4.9.3 空间类型

| 类型 | 标识 | 说明 |
|------|------|------|
| 个人空间 | `personal_space` | Personal Workspace，默认工作区，不可进组织管理后台 |
| 组织空间 | `org_space` | 企业项目，支持组织成员与外部协作者 |

#### 4.9.4 项目角色

| 角色 | 权限 | 场景 |
|------|------|------|
| Owner | 全部 + 删除项目 | 创建者 |
| Admin | 编辑设置、管理成员、Provision | 集成商 / 运维主管 |
| Operator | 运维操作，无设置权限 | 现场工程师 / 外部 Installer |

**B/C 差异：** 商用完整 RBAC + 组织后台；家庭简化为所有者 + 家庭成员共享。

---

### 4.15 账号与工作区体系（V1.3 新增）

**模型：** `Account → Space(Project) → Studio`

| 概念 | 说明 |
|------|------|
| Account | 个人账号 `user_id`；组织复合账号 `user_id + org_id` |
| Personal Workspace | 默认工作区，所有用户必有 |
| 组织工作区 | 用户加入企业后的工作上下文 |
| 工作区切换 | 头像下拉仅展示当前工作区 + 「切换」展开列表 |

**顶栏品牌：** 固定 **Aqara Builder** 品牌；右侧产品切换器为「当前产品名 + ▼」（Site Manager / Space Plan），参考阿里云效。

**默认登录：** 进入 Site Manager 控制台（非设计平台）。

---

### 4.16 Aqara Builder 产品切换（V1.3 新增）

| 产品 | 说明 |
|------|------|
| Site Manager | Studio Cloud 运维控制台 |
| Space Plan | Aqara Builder 设计平台（方案库、插件） |

设计平台方案可「应用到 Site Manager」：选择工作区 + 目标项目（或新建）→ 写入项目云存储。

---

### 4.17 Studio Cloud 区域切换（V1.3 新增）

顶栏常驻 **Studio Cloud 区域**切换器（仅 Site Manager 站点运维场景显示，设计平台不显示）。

不同国家/地区连接不同 Studio 云节点，影响可见项目数据来源。

---

### 4.18 个人设置（V1.3 新增）

入口：头像下拉 → 个人设置

| 模块 | 说明 |
|------|------|
| 个人信息 | 显示名、邮箱 |
| 已加入组织 | 列表 + 退出组织（拥有者需先移交） |
| 进入组织管理后台 | 从已加入组织跳转 |

---

### 4.10 项目交付与过户

**链路位置：** 运维阶段 → 日常阶段 Owner 接管

**模式 A — 云端整体过户（工程标准）：** 集成商发起交付 → 转移 Space 所有权 → 集成商降级/移除 → 业主确认

**模式 B — 设备重绑新 Space（转手）：** 本地解绑 → 新 Space → 重新绑定 → 原 Space 归档

---

### 4.11 Builder Lab 方案预同步

**功能概述：** Site Manager 内嵌 Builder Lab，售前云端完成户型组态。

**链路位置：** **设计阶段** 能力在 **运维阶段** 的前置入口

- RF / Matter 组网模拟
- AI 布局推荐
- 方案保存为 Blueprint 并关联 Space

---

### 4.12 远程隧道与访问控制

**链路位置：** 运维定义权限 → 日常 App/Studio 远程连接

- 按角色控制远程查看/配置/调试
- Open in Aqara App / Studio 受权限 gate
- 弱信号在健康条黄色段体现
- 操作写审计日志

---

### 4.13 空壳空间归档与生命周期

| 状态 | 定义 | 操作 |
|------|------|------|
| 空壳 | 无 Studio 绑定 | 编辑、预同步、删除 |
| 活跃 | 有 Studio 在线 | 全量运维 |
| 已归档 | 交付完成/手动归档 | 只读、恢复 |
| 已解绑 | 全部 Studio 解绑 | 重绑、归档 |

---

### 4.14 审计日志与运维遥测

**链路位置：** 运维阶段产生 → **AI 数据中台** 消费

- 结构变更、Blueprint 分配、绑定/解绑、交付、权限变更
- Analytics：Space 级在线率、告警趋势、Studio 健康分布

---

## 五、数据模型

### 5.1 实体关系（V1.3）

```
User
  └── Account (personal | org_member)
        └── Organization (enterprise only)
              ├── OrgMember (internal | external)
              ├── OrgDepartment
              └── OrgRole

Space (personal_space | org_space)
  ├── SpaceStructureNode (树形分区)
  ├── SpaceShare (项目成员 + 角色)
  ├── SpaceCustomRole (自定义角色名 → Admin/Operator)
  ├── ProjectStorage (云存储配额)
  │     ├── ProjectAsset (design | log-backup | snapshot)
  │     └── ProjectPlan (方案库，可分发)
  └── Studio (Site)
        ├── appliedProjectPlanId (via ProjectPlan.appliedSiteIds)
        ├── timeline[] (健康历史)
        └── Device[]
```

### 5.2 核心类型

| 类型 | 字段要点 |
|------|----------|
| `Space` | `spaceType`, `storageOrgId`, `storageQuotaGb` |
| `SpaceShare` | `role` (Admin/Operator), `roleLabel`, `shareType` |
| `ProjectPlan` | `spaceId`, `planId`, `appliedSiteIds[]`, `sizeMb` |
| `ProjectAsset` | `kind`, `source`, `projectPlanId?` |
| `OrgMember` | `orgRole` (owner/admin/member/external) |

### 5.3 与全链路数据流

| 数据 | 来源 | 去向 | 说明 |
|------|------|------|------|
| Blueprint | Aqara Builder | Space → Studio | 设计方案下行 |
| 本体/Ontology | Builder 标准库 | Studio Agent | 空间推理基础 |
| 设备状态 / 健康 | Studio M300 | Site Manager 卡片 | 运行态上行 |
| 审计 / 对话日志 | Site Manager / 运营平台 | AI 数据中台 | 挖掘反馈 |
| 优化建议 | AI 数据中台 | Builder 本体库 | 设计闭环 |

---

## 六、非功能需求

| 类别 | 要求 |
|------|------|
| 性能 | Space ≤200 首屏 <2s；Studio 网格 100 张流畅 |
| 兼容 | Chrome/Safari/Edge 最新两版；375px–1920px 响应式 |
| 安全 | Space 角色鉴权；敏感操作二次确认；审计不可篡改 |
| 可用性 | 断云不影响 Studio M300 本地运行 |
| 扩展 | 预留 i18n；预留数据中台上报接口 |

---

## 七、版本规划

| 里程碑 | 版本 | 范围 | 对应链路阶段 |
|--------|------|------|-------------|
| M1 空间底座 | v0.6 | 4.1–4.3 | 运维：Space 创建与管理 |
| M2 Studio 纳管 | v0.7 | 4.4–4.5、4.8、4.14 | 运维：卡片/Blueprint/详情 |
| M3 绑定闭环 | v1.0 | 4.6–4.7、4.11 | 运维↔实施 联调 |
| M4 权限交付 | v1.1 | 4.9–4.10、4.12–4.13 | 运维→日常 交付 |
| M5 数据闭环 | v1.2 | 4.14 深化 + 数据中台对接 | 运维→数据→Builder |
| **M6 账号权限** | **v1.3** | **4.15–4.18、4.9 重构、4.5 云存储** | **运维：多租户 + 方案分发** |

---

## 八、不在本次范围

| 模块 | 负责团队 / 阶段 |
|------|----------------|
| Aqara Builder 方案编辑器 | 设计阶段 / Builder 团队 |
| Aqara Studio Installer 调试流程 | 实施阶段 / Studio 团队 |
| Studio Agent / 空间推理 MCP | 日常阶段 / Agent 团队 |
| AI 数据中台挖掘与 Bad Case | 数据闭环 / 平台团队 |
| Marketplace 方案交易 | 设计阶段 / 商业团队 |

---

## 九、附录

### 9.1 术语表

| 术语 | 定义 |
|------|------|
| Space / Site | 空间容器，商用称 Site，家庭称 Space |
| Studio | 边缘智能主机（如 M300），Cloud 侧称 Site |
| Blueprint | Builder 产出的方案，含空间模型+逻辑+自动化 |
| 空壳 Space | 已创建但无 Studio 绑定的空间 |
| Installer | 工程集成商，负责现场实施调试 |
| Builder | 方案设计师，使用 Aqara Builder |
| 本体 / Ontology | 设备与空间的语义标准库 |

### 9.2 功能-架构映射速查

| PRD 章节 | 设计 | 运维 | 实施 | 日常 | 数据 |
|----------|:----:|:----:|:----:|:----:|:----:|
| 4.1 创建 Space | | ● | | | |
| 4.4 Studio 卡片 | | ● | ○ | | ○ |
| 4.5 方案/云存储 | ● | ● | ○ | | |
| 4.6 设备绑定 | | ○ | ● | | |
| 4.8 Studio 详情 | | ● | ○ | ○ | |
| 4.9 权限 | | ● | | ● | |
| 4.15 账号工作区 | | ● | | ● | |
| 4.16 Builder 切换 | ● | ● | | | |
| 4.17 区域切换 | | ● | ○ | | ○ |
| 4.18 个人设置 | | ● | | ● | |
| 4.10 交付 | | ● | ○ | ● | |
| 4.11 Builder Lab | ● | ● | | | |
| 4.14 日志遥测 | | ● | | ○ | ● |

> ● 主要负责 ○ 参与/消费

---

*文档维护：Jun · Aqara Studio Cloud 团队*
