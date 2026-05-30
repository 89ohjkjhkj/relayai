---
name: ai-relay-saas-business-feasibility
overview: 面向团队售卖的 AI API 中转 SaaS 项目商业可行性分析方案：覆盖合规风险、市场与竞品、定价策略、目标客户画像、成本与盈亏平衡测算，并给出 MVP 范围与下一步技术落地建议。
todos:
  - id: draft-summary-and-compliance
    content: 撰写执行摘要 + 合规风险分析（上游 ToS / 国内监管 / 跨境数据 / 支付 / Cookie 池高风险标注）
    status: completed
  - id: market-and-personas
    content: 输出竞品对比表（海外+国内）与目标客户画像、差异化卖点
    status: completed
    dependencies:
      - draft-summary-and-compliance
  - id: pricing-and-breakeven
    content: 设计三档订阅 SKU、后付费倍率、兑换码返佣，并完成启动成本与盈亏平衡量化测算
    status: completed
    dependencies:
      - market-and-personas
  - id: mvp-risks-nextsteps
    content: 定义 MVP 商业闭环范围、风险清单与对冲策略，给出 A/B/C 三条下一步路径建议
    status: completed
    dependencies:
      - pricing-and-breakeven
  - id: assemble-and-open
    content: 组装完整 Markdown 报告写入 artifact 目录的 business-feasibility.md，并调用结果视图展示
    status: completed
    dependencies:
      - mvp-risks-nextsteps
---

## 产品概述

打造一个面向团队售卖的 AI API 中转 SaaS 平台（先做 SaaS、私有化后续）。在正式进入技术开发前，先输出一份**商业可行性分析报告**，覆盖合规、市场、定价、盈亏与 MVP 范围，作为后续技术方案与立项决策的依据。

## 核心交付内容

- 一份结构化的中文 Markdown 报告，落盘到工作区便于后续迭代。
- 一页纸"执行摘要"，给出"是否值得做 / 最小可行投入 / 关键风险"的明确结论。
- **合规风险分析**：上游 ToS（OpenAI/Anthropic/Google 转售条款）、国内监管（生成式 AI 备案、增值电信、网信办大模型备案、个保法）、跨境数据、支付通道（支付宝/微信/Stripe/USDT）合规边界、风控与免责建议；对截图中"账号管理（Cookie 池）"功能单独标注**高合规风险**。
- **市场与竞品对比**：海外（OpenRouter、Portkey、LiteLLM Cloud、Helicone、Eden AI）+ 国内（OneHub/New API 系个人代理站、聚合 MaaS）多维度对比表，定位"帅哥哥的中转"类项目市场画像。
- **目标客户画像 & 差异化卖点**：聚焦 AI 应用创业团队、企业研发、跨境电商、内容工厂、教培机构；卖点围绕"团队 + 子账号配额 + 多计费模式"组合。
- **定价策略**：上游 1M tokens 成本估算、行业加价系数基准（1.2–2.5x）、三档订阅 SKU（Starter/Team/Business）示例、后付费倍率、兑换码与代理返佣方案。
- **成本与盈亏平衡测算**：启动成本、月运营成本、毛利率与坏账假设，量化"X 个付费团队 / Y Token 月消耗即盈亏平衡"结论。
- **MVP 商业闭环范围**：注册→建团队→付款→邀请成员→分配配额→调用→对账；明确第一版可砍内容。
- **风险清单与对冲**：上游封号、价格战、政策收紧、付费纠纷、滥用攻击。
- **下一步建议**：给出 A/B/C 三条候选路径（国内合规先行 / 海外 MVP 起量 / 企业内部销售），并提示"技术架构设计"或"项目骨架代码"两个后续选项。

## 输出要求

- 客观、数据可追溯，估算项明确标注。
- 法律合规结论附"非法律意见，建议咨询专业律师"免责声明。
- 使用中文，表格与对比结构化呈现，便于快速决策。
- 文档完成后通过结果视图展示给用户。

## Agent Extensions

本任务为商业可行性分析文档撰写，主要依赖 LLM 的研究与结构化写作能力，不依赖外部 Skill / MCP。如需补充实时市场调研数据（如最新模型价格、竞品最新版本），可由用户在确认 plan 后自行提供，或在后续步骤中按需引入浏览类工具，本 plan 不预先绑定任何 Extension，避免过度复杂化。