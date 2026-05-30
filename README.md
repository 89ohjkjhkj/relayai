<p align="center">
  <img src="https://img.shields.io/badge/version-0.1.0-6c5ce7?style=flat-square" alt="version" />
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="license" />
  <img src="https://img.shields.io/badge/PRs-welcome-6c5ce7?style=flat-square" alt="PRs welcome" />
</p>

<h1 align="center">⚡ RelayAI</h1>

<p align="center">
  <strong>The open-source AI gateway built for teams</strong><br/>
  Unified billing · Sub-account quotas · Multi-model routing · Zero vendor lock-in
</p>

<p align="center">
  <a href="#-quick-start">Quick Start</a> ·
  <a href="#-features">Features</a> ·
  <a href="#-pricing">Pricing</a> ·
  <a href="#-api-reference">API</a> ·
  <a href="#-deploy">Deploy</a>
</p>

---

## 😫 The Problem

Your team uses GPT-4, Claude, DeepSeek… but:

- 🔑 **API keys are shared in Slack** — who leaked it? who burned $200 in one night?
- 💸 **No per-person cost tracking** — "Why is our OpenAI bill $3,000 this month?"
- 🔄 **Every model has a different API** — switching providers means rewriting code
- 👥 **No access control** — interns have the same keys as CTOs

## ✅ The Solution

**RelayAI** is a self-hosted AI API gateway that gives you **team management on top of any LLM provider**.

One endpoint. One key format. Full control.

```
Your App → sk-relay-xxx → RelayAI → OpenAI / Claude / DeepSeek / Gemini / ...
                                    ├── Per-member quota
                                    ├── Model whitelisting
                                    ├── Cost tracking & audit logs
                                    └── Automatic channel failover
```

## 🚀 Quick Start

```bash
# Clone & install
git clone https://github.com/YOUR_USERNAME/relay-ai.git
cd relay-ai
npm install

# Set up database
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts     # Creates admin user + demo data

# Start dev server
npm run dev
```

Open `http://localhost:3000` and login with `admin@relay.ai` / `admin123`.

### Make your first AI call

```bash
curl http://localhost:3000/api/v1/chat/completions \
  -H "Authorization: Bearer sk-relay-YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Hello, RelayAI!"}]
  }'
```

**That's it.** Same format as OpenAI — your existing code just works.

## 🎯 Features

### Team & Sub-account Management
- **Create teams** with monthly budgets and plan tiers
- **Invite members** with individual quotas, model permissions, and key limits
- **Role-based access**: Owner → Admin → Member
- **Per-member cost visibility**: see exactly who spent what

### Multi-Model Gateway
- **7 providers supported**: OpenAI, Anthropic, Google Gemini, DeepSeek, Doubao (ByteDance), Azure OpenAI, Custom
- **OpenAI-compatible API**: drop-in replacement, zero code changes
- **Smart channel routing**: priority + weight-based selection with wildcard model matching (`gpt-4*`)
- **Automatic failover**: if one channel is down, try the next
- **Streaming support**: full SSE streaming with real-time token counting

### Three-Layer Quota System
| Layer | What it controls |
|---|---|
| 🔑 API Key | Total spend cap per key |
| 👤 Team Member | Monthly budget per person |
| 🏢 Team | Monthly budget for the whole org |

### Billing & Payments
- **Prepaid top-ups** with real-time balance tracking
- **Redeem codes** — batch generate for distributors and promotions
- **Invoice history** with status tracking
- **BYOK mode** — bring your own API keys, pay only the management fee (coming soon)

### Observability
- **Dashboard**: monthly requests, token usage, costs, model distribution — at a glance
- **Audit logs**: every API call recorded with model, tokens, cost, latency, and status
- **CSV export**: filter by model/status and download for accounting
- **Channel health check**: one-click test to verify upstream connectivity

### Security
- **JWT authentication** with HTTP-only cookies
- **Keys shown once** — after creation, the full key is never displayed again
- **API key masking** in the admin panel (reveal on demand)
- **Route-level middleware** — all management pages require authentication
- **Key expiration & IP whitelisting** (per key)

## 💰 Pricing

RelayAI is **free and open-source**. Self-host it for unlimited users.

For teams that want managed hosting or advanced features:

| Plan | Price | Members | Models | Logs | Audit Export |
|---|---|---|---|---|---|
| **Free** | $0 | 1 | 3 | 7 days | — |
| **Starter** | $9/mo | 3 | Unlimited | 30 days | CSV |
| **Team** ⭐ | $39/mo | 15 | Unlimited | 90 days | CSV + API |
| **Business** | $129/mo | 50 | Unlimited + BYOK | Forever | All + Webhook |

> 🇨🇦 CNY pricing also available: ¥99 / ¥399 / ¥1,299 per month

## 📡 API Reference

RelayAI is **100% compatible with the OpenAI API**. Just change the base URL and key:

### List Models

```bash
GET /api/v1/models
Authorization: Bearer sk-relay-xxx
```

### Chat Completions

```bash
POST /api/v1/chat/completions
Authorization: Bearer sk-relay-xxx
Content-Type: application/json

{
  "model": "gpt-4o",
  "messages": [{"role": "user", "content": "Hello!"}],
  "stream": true
}
```

### Supported Models

| Provider | Models |
|---|---|
| OpenAI | `gpt-4o`, `gpt-4o-mini`, `gpt-4-turbo`, `gpt-3.5-turbo` |
| Anthropic | `claude-3.5-sonnet`, `claude-3.5-haiku`, `claude-3-opus` |
| Google | `gemini-1.5-pro`, `gemini-1.5-flash` |
| DeepSeek | `deepseek-chat`, `deepseek-reasoner` |
| ByteDance | `doubao-pro` |

Adding a new model is as simple as adding it to a channel's model list — no code changes.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│                  RelayAI                     │
│                                             │
│  ┌─────────┐ ┌──────────┐ ┌─────────────┐  │
│  │Dashboard│ │Team Mgmt │ │Channel Mgmt │  │
│  └─────────┘ └──────────┘ └─────────────┘  │
│  ┌─────────┐ ┌──────────┐ ┌─────────────┐  │
│  │Key Mgmt │ │  Logs    │ │  Billing    │  │
│  └─────────┘ └──────────┘ └─────────────┘  │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │         API Gateway Core            │    │
│  │  Auth → Quota → Route → Proxy → Log│    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
         │              │             │
    ┌────┴────┐   ┌────┴────┐   ┌───┴────┐
    │ OpenAI  │   │Anthropic│   │DeepSeek│  ...
    └─────────┘   └─────────┘   └────────┘
```

### Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 + React 18 + TypeScript + Tailwind CSS |
| Backend | Next.js API Routes (App Router) |
| Database | SQLite + Prisma ORM (migrate to PostgreSQL anytime) |
| Auth | JWT (jose) + bcryptjs |
| Icons | Lucide React |

### Project Structure

```
├── app/
│   ├── api/
│   │   ├── auth/          # Login / Register / Logout
│   │   ├── v1/            # OpenAI-compatible proxy gateway
│   │   ├── channels/      # Channel CRUD + test
│   │   ├── teams/         # Team + member management
│   │   ├── keys/          # API key management
│   │   ├── logs/          # Usage log queries
│   │   ├── billing/       # Top-up + redeem codes
│   │   ├── dashboard/     # Aggregated stats
│   │   └── settings/      # System config + redeem code gen
│   ├── channels/          # Channel management UI
│   ├── teams/             # Team management UI
│   ├── keys/              # Key management UI
│   ├── logs/              # Log viewer UI
│   ├── billing/           # Billing UI
│   ├── settings/          # Settings UI
│   └── login/             # Auth UI
├── components/
│   └── sidebar.tsx        # Collapsible sidebar navigation
├── lib/
│   ├── auth.ts            # JWT auth utilities
│   ├── db.ts              # Prisma client singleton
│   ├── gateway.ts         # Proxy gateway core (route/auth/quota/log)
│   └── utils.ts           # Helpers + model pricing table
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Demo data seeder
└── middleware.ts           # Route-level auth guard
```

## 🚢 Deploy

### Docker Compose (Recommended)

```yaml
version: '3.8'
services:
  relayai:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=file:./prod.db
      - JWT_SECRET=your-production-secret
      - NEXT_PUBLIC_APP_NAME=RelayAI
      - NEXT_PUBLIC_APP_URL=https://your-domain.com
    volumes:
      - relayai-data:/app/prisma
volumes:
  relayai-data:
```

### Vercel / Railway

RelayAI runs on any Node.js platform. Just set the environment variables and push.

> ⚠️ For production, switch from SQLite to PostgreSQL by changing `DATABASE_URL` in `prisma/schema.prisma`.

## 🗺️ Roadmap

- [ ] **BYOK mode** — teams bring their own API keys, you charge management fee only
- [ ] **Stripe / LemonSqueezy integration** — automated payments
- [ ] **Webhook notifications** — real-time alerts on quota breaches
- [ ] **Advanced routing** — latency-based, cost-based, and round-robin strategies
- [ ] **Rate limiting** — per-key and per-member RPM/TPM limits
- [ ] **Multi-language UI** — English, Chinese, Japanese
- [ ] **SSO / SAML** — enterprise single sign-on
- [ ] **PostgreSQL migration guide** — one-command production upgrade

## 🤝 Contributing

We welcome contributions! Here's how:

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

RelayAI is released under the [MIT License](LICENSE).

---

<p align="center">
  Built with ❤️ for teams that need control over their AI spend.<br/>
  <strong>Star ⭐ this repo if you find it useful!</strong>
</p>
