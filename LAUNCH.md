# 📣 RelayAI Launch Copy / 发布文案集合

> Replace `<YOUR_DEMO_URL>` with your Vercel URL after deploy.

---

## 1. Show HN (Hacker News) — English

**Title** (max 80 chars):
```
Show HN: RelayAI – Open-source AI gateway with team quotas and unified billing
```

**Body**:
```
Hi HN! I built RelayAI because every team I worked with hit the same wall:

- One company OpenAI key shared in Slack → no idea who burned $400 last week
- Want to try Claude AND DeepSeek? → another vendor, another invoice
- Junior accidentally loops GPT-4 in dev → bill explodes overnight

RelayAI is a self-hosted gateway that sits between your team and the AI providers. You add OpenAI / Claude / DeepSeek / Gemini keys once, and:

• Three-layer quotas: team budget → per-user limit → per-key limit
• OpenAI-compatible API — change `base_url`, your existing code just works
• Unified billing across all providers, with audit logs per request
• Sub-account API keys, instantly revocable when someone leaves

Built with Next.js 14 + Prisma + Tailwind. Deploys to Vercel + Neon (free tier) in 5 minutes. MIT license.

Live demo: <YOUR_DEMO_URL>
GitHub: https://github.com/89ohjkjhkj/relayai

What I'm not sure about:
- Is BYOK (bring your own keys) or pooled keys more useful for small teams?
- Should I prioritize Stripe billing or Alipay first?

Would love feedback — especially from anyone who's tried OpenRouter / Portkey / LiteLLM and wished something was different.
```

---

## 2. Reddit — r/SideProject / r/SaaS

**Title**:
```
I built an open-source "AI API middleman" for teams — finally know who's burning the OpenAI budget
```

**Body**:
```
TL;DR: Self-hosted gateway between your team and OpenAI/Claude/DeepSeek. Three-layer quotas, audit logs, OpenAI-compatible API. MIT licensed.

GitHub: https://github.com/89ohjkjhkj/relayai
Demo: <YOUR_DEMO_URL>

**The problem I had at my last job:**
Our company had ONE OpenAI account that 12 engineers shared. Every month finance asked "why is this $1,200?" and nobody knew. Someone left the company → we had to rotate the key → broke 8 internal tools.

**What RelayAI does:**
- You configure upstream keys once (OpenAI, Claude, etc.)
- Each engineer gets their own sub-key with quota
- Built-in dashboard shows token usage per person, per model, per project
- API is OpenAI-compatible — `base_url = "https://your-relay.com/v1"` and existing code works
- Audit log of every request

**Tech stack:**
Next.js 14 (App Router), Prisma, PostgreSQL, Tailwind. Deploys to Vercel free tier.

Looking for feedback on:
1. Most teams want BYOK (their own provider keys) or pooled (we resell)?
2. Worth adding webhooks for over-budget alerts?
3. Would you pay for a hosted version, or just self-host?

Cheers!
```

---

## 3. 即刻 (Jike) — 中文

```
开源了一个项目：RelayAI —— 给团队用的 AI 网关 🚀

🐛 解决的痛点：
1️⃣ 公司一个 OpenAI Key 全员共用，月底账单一脸懵
2️⃣ 想同时用 GPT-4 + Claude + DeepSeek，要管理 N 个账号
3️⃣ 实习生写了死循环跑 GPT-4，半夜烧掉 $200
4️⃣ 员工离职 Key 泄露，所有调用方都要改

✨ 它干了什么：
• 三层配额（团队 / 个人 / API Key）
• 一个 Key 调所有模型，OpenAI 兼容接口（改 base_url 就行）
• 自动汇总账单，谁用了多少 token 一目了然
• 子账号一键停用，配额秒回收

技术栈：Next.js 14 + Prisma + Tailwind，部署到 Vercel 免费额度即可。MIT 协议，自己拉走改也行。

GitHub: github.com/89ohjkjhkj/relayai
Demo: <YOUR_DEMO_URL>

求 ⭐ 也求建议：
- 你们更想要 BYOK（带自己的 Key 来）还是池化转售？
- 国内用户支付优先做支付宝还是微信？

🙏
```

---

## 4. Twitter / X — Thread (English)

**Tweet 1**:
```
I just open-sourced RelayAI 🚀

A self-hosted AI gateway for teams using OpenAI/Claude/DeepSeek/Gemini.

✅ Three-layer quotas (team / user / key)
✅ OpenAI-compatible API
✅ Unified billing & audit logs
✅ Deploys to Vercel in 5 mins

MIT licensed 👇
github.com/89ohjkjhkj/relayai
```

**Tweet 2**:
```
The problem:
- 12 engineers share ONE OpenAI key
- $1,200 bill, nobody knows who burned it
- Junior dev loops GPT-4 → wakes up to $400 charge
- Someone leaves → rotate key → break 8 production tools

Sound familiar?
```

**Tweet 3**:
```
The fix:

Each engineer gets their own sub-key with a hard cap.
Real-time dashboard shows usage per person, model, project.
Switch from GPT-4 to Claude with no code change.
Revoke a key in 1 click.

Live demo → <YOUR_DEMO_URL>
```

**Tweet 4**:
```
Built with @nextjs 14, @prisma, @neondatabase, deployed on @vercel.

Forever free if self-hosted.

What feature should I build next?
🔁 Webhooks for over-budget alerts
🔁 Stripe billing
🔁 Slack/Discord integration
🔁 Mobile app
```

---

## 5. 微信朋友圈 / 微信群 — 中文短版

```
熬了几个晚上做的开源项目上线啦 🎉

🤖 RelayAI —— AI 模型团队管理网关

如果你公司也在踩这些坑：
👉 一个 OpenAI Key 全员用，月底对账抓狂
👉 想试 Claude/DeepSeek 又懒得搞新账号
👉 实习生写崩了一个 GPT-4 调用，半夜烧掉几百刀

它都能解决。

⭐ GitHub 求 Star：github.com/89ohjkjhkj/relayai
🌐 在线 Demo：<YOUR_DEMO_URL>

可以自部署到 Vercel，5 分钟搞定，永久免费。
（也欢迎转发给团队负责人 😆）
```

---

## 📅 发布顺序建议（按优先级）

| 顺序 | 平台 | 理由 |
|------|------|------|
| 1 | **Show HN** | 周二/周三 美国早上 8-10 点（北京时间晚 11 点-凌晨 1 点）发，技术圈第一波种子用户 |
| 2 | **微信朋友圈/群** | 立刻发，朋友帮你点亮第一波 ⭐ 给项目加权 |
| 3 | **即刻** | 国内 AI 圈活跃，容易被转发 |
| 4 | **Twitter Thread** | @ 几个 AI 大 V，可能被转发 |
| 5 | **Reddit r/SideProject** | 周末发，全球独立开发者社区 |
| 6 | **掘金/V2EX/少数派** | 可以写一篇深度技术博客，长尾流量 |

## ⭐ 提涨 Star 小技巧

1. **GitHub Topics** 必填：`ai`, `gateway`, `openai`, `claude`, `llm`, `saas`, `nextjs`, `typescript`, `self-hosted`
2. **awesome-llm 列表** 提 PR：https://github.com/Hannibal046/Awesome-LLM
3. **首次 100 ⭐ 是关键** —— 朋友帮点 + 各群发一波，过 100 后会被 GitHub Trending 推荐
4. README 第一屏放 GIF/截图，转化率提升 3 倍以上
