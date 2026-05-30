import { NextResponse } from 'next/server'

export async function GET() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>RelayAI — The Open-Source AI Gateway Built for Teams</title>
  <meta name="description" content="Unified billing, sub-account quotas, and multi-model routing for teams using GPT-4, Claude, DeepSeek, and more. Self-hosted, OpenAI-compatible, free to start." />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --brand: #6c5ce7;
      --brand-light: #a29bfe;
      --brand-dark: #5a4bd1;
      --dark-bg: #0a0a1a;
      --dark-card: #111122;
      --dark-card-hover: #1a1a33;
      --dark-border: #222244;
      --text-primary: #f0f0f5;
      --text-secondary: #8888aa;
      --text-muted: #555577;
      --green: #00b894;
      --red: #e17055;
      --yellow: #fdcb6e;
    }

    html { scroll-behavior: smooth; }

    body {
      font-family: 'Inter', -apple-system, sans-serif;
      background: var(--dark-bg);
      color: var(--text-primary);
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }

    a { color: var(--brand-light); text-decoration: none; }
    a:hover { color: var(--brand); }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
    }

    /* ── NAV ── */
    nav {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 100;
      background: rgba(10, 10, 26, 0.85);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--dark-border);
    }
    nav .container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 64px;
    }
    .nav-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 800;
      font-size: 20px;
      color: var(--text-primary);
    }
    .nav-logo svg { width: 28px; height: 28px; }
    .nav-links { display: flex; gap: 32px; align-items: center; }
    .nav-links a {
      color: var(--text-secondary);
      font-size: 14px;
      font-weight: 500;
      transition: color 0.2s;
    }
    .nav-links a:hover { color: var(--text-primary); }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 10px 24px;
      border-radius: 10px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
    }
    .btn-primary {
      background: var(--brand);
      color: white;
    }
    .btn-primary:hover { background: var(--brand-dark); transform: translateY(-1px); box-shadow: 0 4px 20px rgba(108, 92, 231, 0.4); }
    .btn-outline {
      background: transparent;
      color: var(--text-primary);
      border: 1px solid var(--dark-border);
    }
    .btn-outline:hover { border-color: var(--brand); color: var(--brand-light); }
    .btn-lg { padding: 14px 32px; font-size: 16px; border-radius: 12px; }
    .btn-ghost {
      background: transparent;
      color: var(--text-secondary);
      border: none;
    }
    .btn-ghost:hover { color: var(--text-primary); }

    /* ── HERO ── */
    .hero {
      padding: 160px 0 100px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .hero::before {
      content: '';
      position: absolute;
      top: -50%;
      left: 50%;
      transform: translateX(-50%);
      width: 800px;
      height: 800px;
      background: radial-gradient(circle, rgba(108, 92, 231, 0.15) 0%, transparent 70%);
      pointer-events: none;
    }
    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 16px;
      background: rgba(108, 92, 231, 0.1);
      border: 1px solid rgba(108, 92, 231, 0.3);
      border-radius: 100px;
      font-size: 13px;
      font-weight: 500;
      color: var(--brand-light);
      margin-bottom: 32px;
    }
    .hero-badge .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--green);
      animation: pulse-dot 2s infinite;
    }
    @keyframes pulse-dot {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
    .hero h1 {
      font-size: 64px;
      font-weight: 900;
      line-height: 1.1;
      letter-spacing: -2px;
      margin-bottom: 24px;
    }
    .hero h1 .gradient {
      background: linear-gradient(135deg, var(--brand-light) 0%, var(--brand) 50%, #e17055 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .hero p {
      font-size: 20px;
      color: var(--text-secondary);
      max-width: 600px;
      margin: 0 auto 40px;
      line-height: 1.6;
    }
    .hero-buttons {
      display: flex;
      gap: 16px;
      justify-content: center;
      flex-wrap: wrap;
    }
    .hero-stats {
      display: flex;
      justify-content: center;
      gap: 48px;
      margin-top: 64px;
      padding-top: 48px;
      border-top: 1px solid var(--dark-border);
    }
    .hero-stat {
      text-align: center;
    }
    .hero-stat .num {
      font-size: 36px;
      font-weight: 800;
      color: var(--brand-light);
    }
    .hero-stat .label {
      font-size: 13px;
      color: var(--text-muted);
      margin-top: 4px;
    }

    /* ── PROBLEMS ── */
    .problems {
      padding: 100px 0;
    }
    .section-label {
      display: inline-block;
      padding: 4px 12px;
      background: rgba(225, 112, 85, 0.1);
      border: 1px solid rgba(225, 112, 85, 0.3);
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      color: var(--red);
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 16px;
    }
    .section-label.brand {
      background: rgba(108, 92, 231, 0.1);
      border-color: rgba(108, 92, 231, 0.3);
      color: var(--brand-light);
    }
    .section-label.green {
      background: rgba(0, 184, 148, 0.1);
      border-color: rgba(0, 184, 148, 0.3);
      color: var(--green);
    }
    .section-title {
      font-size: 40px;
      font-weight: 800;
      letter-spacing: -1px;
      margin-bottom: 16px;
    }
    .section-subtitle {
      font-size: 18px;
      color: var(--text-secondary);
      max-width: 600px;
      margin-bottom: 48px;
    }
    .pain-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }
    .pain-card {
      padding: 28px;
      background: var(--dark-card);
      border: 1px solid var(--dark-border);
      border-radius: 16px;
      transition: all 0.2s;
    }
    .pain-card:hover {
      border-color: rgba(225, 112, 85, 0.4);
      background: var(--dark-card-hover);
    }
    .pain-icon {
      font-size: 28px;
      margin-bottom: 12px;
    }
    .pain-card h3 {
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .pain-card p {
      font-size: 14px;
      color: var(--text-secondary);
      line-height: 1.5;
    }

    /* ── FEATURES ── */
    .features {
      padding: 100px 0;
    }
    .feature-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }
    .feature-card {
      padding: 32px;
      background: var(--dark-card);
      border: 1px solid var(--dark-border);
      border-radius: 16px;
      transition: all 0.2s;
    }
    .feature-card:hover {
      border-color: rgba(108, 92, 231, 0.5);
      background: var(--dark-card-hover);
      transform: translateY(-2px);
    }
    .feature-card .icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: rgba(108, 92, 231, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
      font-size: 22px;
    }
    .feature-card h3 {
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .feature-card p {
      font-size: 14px;
      color: var(--text-secondary);
      line-height: 1.5;
    }

    /* ── CODE ── */
    .code-section {
      padding: 100px 0;
    }
    .code-block {
      background: #0d0d20;
      border: 1px solid var(--dark-border);
      border-radius: 16px;
      overflow: hidden;
      max-width: 720px;
      margin: 0 auto;
    }
    .code-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 16px 20px;
      border-bottom: 1px solid var(--dark-border);
    }
    .code-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }
    .code-dot.r { background: #e17055; }
    .code-dot.y { background: #fdcb6e; }
    .code-dot.g { background: #00b894; }
    .code-header span {
      margin-left: auto;
      font-size: 12px;
      color: var(--text-muted);
      font-family: monospace;
    }
    .code-body {
      padding: 24px;
      font-family: 'SF Mono', 'Fira Code', monospace;
      font-size: 14px;
      line-height: 1.8;
      overflow-x: auto;
    }
    .code-body .comment { color: var(--text-muted); }
    .code-body .string { color: var(--green); }
    .code-body .key { color: var(--brand-light); }
    .code-body .method { color: var(--yellow); }
    .code-body .url { color: var(--brand-light); }

    /* ── PRICING ── */
    .pricing {
      padding: 100px 0;
      text-align: center;
    }
    .pricing-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-top: 48px;
    }
    .pricing-card {
      background: var(--dark-card);
      border: 1px solid var(--dark-border);
      border-radius: 16px;
      padding: 32px;
      text-align: left;
      transition: all 0.2s;
      position: relative;
    }
    .pricing-card:hover {
      border-color: var(--dark-border);
      transform: translateY(-2px);
    }
    .pricing-card.featured {
      border-color: var(--brand);
      box-shadow: 0 0 40px rgba(108, 92, 231, 0.15);
    }
    .pricing-card.featured::before {
      content: 'POPULAR';
      position: absolute;
      top: -12px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--brand);
      color: white;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 12px;
      border-radius: 6px;
      letter-spacing: 1px;
    }
    .pricing-card .plan-name {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .pricing-card .price {
      font-size: 42px;
      font-weight: 800;
      margin: 12px 0 4px;
    }
    .pricing-card .price span {
      font-size: 16px;
      font-weight: 500;
      color: var(--text-muted);
    }
    .pricing-card .price-desc {
      font-size: 13px;
      color: var(--text-muted);
      margin-bottom: 24px;
    }
    .pricing-card ul {
      list-style: none;
      margin-bottom: 28px;
    }
    .pricing-card li {
      font-size: 14px;
      color: var(--text-secondary);
      padding: 6px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .pricing-card li .check { color: var(--green); font-weight: 700; }
    .pricing-card li .cross { color: var(--text-muted); }
    .pricing-card .btn { width: 100%; text-align: center; }

    /* ── CTA ── */
    .cta {
      padding: 100px 0;
      text-align: center;
      position: relative;
    }
    .cta::before {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 600px;
      height: 400px;
      background: radial-gradient(circle, rgba(108, 92, 231, 0.12) 0%, transparent 70%);
      pointer-events: none;
    }
    .cta h2 {
      font-size: 44px;
      font-weight: 800;
      letter-spacing: -1px;
      margin-bottom: 16px;
    }
    .cta p {
      font-size: 18px;
      color: var(--text-secondary);
      margin-bottom: 36px;
    }

    /* ── FOOTER ── */
    footer {
      border-top: 1px solid var(--dark-border);
      padding: 40px 0;
      text-align: center;
    }
    footer p {
      font-size: 13px;
      color: var(--text-muted);
    }

    /* ── RESPONSIVE ── */
    @media (max-width: 900px) {
      .hero h1 { font-size: 40px; }
      .pain-grid { grid-template-columns: 1fr; }
      .feature-grid { grid-template-columns: 1fr; }
      .pricing-grid { grid-template-columns: repeat(2, 1fr); }
      .hero-stats { gap: 24px; flex-wrap: wrap; }
      .nav-links .desktop-only { display: none; }
    }
    @media (max-width: 600px) {
      .hero h1 { font-size: 32px; }
      .hero p { font-size: 16px; }
      .pricing-grid { grid-template-columns: 1fr; }
      .hero-stats { flex-direction: column; gap: 16px; }
    }
  </style>
</head>
<body>

<!-- NAV -->
<nav>
  <div class="container">
    <a href="#" class="nav-logo">
      <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="28" height="28" rx="8" fill="#6c5ce7"/>
        <path d="M8 14l4-4 4 4-4 4z" fill="white" opacity="0.9"/>
        <path d="M14 8l4-4 4 4-4 4z" fill="white" opacity="0.6"/>
        <path d="M14 14l4-4 4 4-4 4z" fill="white" opacity="0.4"/>
      </svg>
      RelayAI
    </a>
    <div class="nav-links">
      <a href="#features" class="desktop-only">Features</a>
      <a href="#pricing" class="desktop-only">Pricing</a>
      <a href="https://github.com/89ohjkjhkj/relayai" class="desktop-only" target="_blank">GitHub</a>
      <a href="/login" class="btn btn-ghost">Login</a>
      <a href="/register" class="btn btn-primary">Get Started Free</a>
    </div>
  </div>
</nav>

<!-- HERO -->
<section class="hero">
  <div class="container">
    <div class="hero-badge">
      <span class="dot"></span>
      Open-source & self-hosted
    </div>
    <h1>
      Your team's AI<br/>
      <span class="gradient">gateway & wallet</span>
    </h1>
    <p>
      Unified billing, sub-account quotas, and multi-model routing for teams 
      using GPT-4, Claude, DeepSeek, and 10+ more models. OpenAI-compatible. Self-hosted.
    </p>
    <div class="hero-buttons">
      <a href="/register" class="btn btn-primary btn-lg">Start for Free →</a>
      <a href="https://github.com/89ohjkjhkj/relayai" class="btn btn-outline btn-lg" target="_blank">
        ⭐ Star on GitHub
      </a>
    </div>
    <div class="hero-stats">
      <div class="hero-stat">
        <div class="num">12+</div>
        <div class="label">AI Models</div>
      </div>
      <div class="hero-stat">
        <div class="num">7</div>
        <div class="label">Providers</div>
      </div>
      <div class="hero-stat">
        <div class="num">100%</div>
        <div class="label">OpenAI-Compatible</div>
      </div>
      <div class="hero-stat">
        <div class="num">$0</div>
        <div class="label">To Get Started</div>
      </div>
    </div>
  </div>
</section>

<!-- PAIN POINTS -->
<section class="problems">
  <div class="container">
    <span class="section-label">The Pain</span>
    <h2 class="section-title">Sharing API keys in Slack?</h2>
    <p class="section-subtitle">
      If your team uses AI, you already know these headaches.
    </p>
    <div class="pain-grid">
      <div class="pain-card">
        <div class="pain-icon">🔑</div>
        <h3>Keys shared everywhere</h3>
        <p>Your OpenAI key is in 5 Slack channels, 3 Notion docs, and someone's .zshrc. No revocation. No audit trail.</p>
      </div>
      <div class="pain-card">
        <div class="pain-icon">💸</div>
        <h3>Bill shock every month</h3>
        <p>$3,000 OpenAI bill? No idea who burned it. No per-person cost tracking. Finance wants answers you can't give.</p>
      </div>
      <div class="pain-card">
        <div class="pain-icon">🔄</div>
        <h3>Every model is different</h3>
        <p>OpenAI, Claude, DeepSeek — each has its own SDK. Switching providers means rewriting integration code.</p>
      </div>
      <div class="pain-card">
        <div class="pain-icon">👥</div>
        <h3>No access control</h3>
        <p>Interns and CTOs share the same key. No quotas. No model restrictions. No way to say "you can only use GPT-4o-mini".</p>
      </div>
    </div>
  </div>
</section>

<!-- FEATURES -->
<section class="features" id="features">
  <div class="container">
    <span class="section-label brand">Features</span>
    <h2 class="section-title">Everything your team needs</h2>
    <p class="section-subtitle">
      RelayAI gives you enterprise-grade AI governance in a self-hosted package.
    </p>
    <div class="feature-grid">
      <div class="feature-card">
        <div class="icon">👥</div>
        <h3>Team & Sub-accounts</h3>
        <p>Create teams, invite members, set individual quotas and model permissions. Owner → Admin → Member roles.</p>
      </div>
      <div class="feature-card">
        <div class="icon">🛡️</div>
        <h3>Three-Layer Quotas</h3>
        <p>Key-level, member-level, and team-level spending caps. Nobody overspends — ever.</p>
      </div>
      <div class="feature-card">
        <div class="icon">⚡</div>
        <h3>Multi-Model Routing</h3>
        <p>7 providers, 12+ models. Priority + weight-based routing with automatic failover. Just change the model name.</p>
      </div>
      <div class="feature-card">
        <div class="icon">🔌</div>
        <h3>OpenAI-Compatible</h3>
        <p>100% compatible with OpenAI SDK. Change the base URL, that's it. Your existing code just works.</p>
      </div>
      <div class="feature-card">
        <div class="icon">📊</div>
        <h3>Dashboard & Audit Logs</h3>
        <p>See who called what model, how many tokens, and how much it cost — all in real-time. Export to CSV.</p>
      </div>
      <div class="feature-card">
        <div class="icon">💰</div>
        <h3>Billing & Redeem Codes</h3>
        <p>Prepaid top-ups, transaction history, and batch redeem codes for distributors. BYOK mode coming soon.</p>
      </div>
      <div class="feature-card">
        <div class="icon">🔒</div>
        <h3>Security First</h3>
        <p>JWT auth, keys shown once, API key masking, route-level auth guards, key expiration & IP whitelisting.</p>
      </div>
      <div class="feature-card">
        <div class="icon">🌊</div>
        <h3>Full Streaming Support</h3>
        <p>SSE streaming with real-time token counting. Your chat apps stream exactly like they would with OpenAI.</p>
      </div>
      <div class="feature-card">
        <div class="icon">🧪</div>
        <h3>Channel Health Check</h3>
        <p>One-click test to verify your upstream API keys are valid and reachable. No more guessing.</p>
      </div>
    </div>
  </div>
</section>

<!-- CODE -->
<section class="code-section">
  <div class="container">
    <div style="text-align: center;">
      <span class="section-label green">Integration</span>
      <h2 class="section-title">Change one line. You're done.</h2>
      <p class="section-subtitle" style="margin: 0 auto 48px;">
        RelayAI is 100% OpenAI-compatible. Switch your base URL and keep your existing code.
      </p>
    </div>
    <div class="code-block">
      <div class="code-header">
        <div class="code-dot r"></div>
        <div class="code-dot y"></div>
        <div class="code-dot g"></div>
        <span>quickstart.py</span>
      </div>
      <div class="code-body">
<span class="key">from</span> openai <span class="key">import</span> OpenAI

<span class="comment"># Just change the base URL — that's it</span>
client = OpenAI(
    <span class="key">api_key</span>=<span class="string">"sk-relay-your-key"</span>,
    <span class="key">base_url</span>=<span class="string">"https://your-relayai.com/api/v1"</span>
)

response = client.chat.completions.<span class="method">create</span>(
    <span class="key">model</span>=<span class="string">"gpt-4o-mini"</span>,
    <span class="key">messages</span>=[{<span class="string">"role"</span>: <span class="string">"user"</span>, <span class="string">"content"</span>: <span class="string">"Hello!"</span>}]
)

<span class="method">print</span>(response.choices[0].message.content)
      </div>
    </div>
  </div>
</section>

<!-- PRICING -->
<section class="pricing" id="pricing">
  <div class="container">
    <span class="section-label brand">Pricing</span>
    <h2 class="section-title">Free to start. Scale when ready.</h2>
    <p class="section-subtitle" style="margin: 0 auto 0;">
      Self-host RelayAI for unlimited users. Upgrade for advanced team features.
    </p>
    <div class="pricing-grid">
      <div class="pricing-card">
        <div class="plan-name">Free</div>
        <div class="price">$0<span>/mo</span></div>
        <div class="price-desc">For solo developers</div>
        <ul>
          <li><span class="check">✓</span> 1 team member</li>
          <li><span class="check">✓</span> 3 models</li>
          <li><span class="check">✓</span> 7-day log retention</li>
          <li><span class="cross">—</span> No audit export</li>
          <li><span class="cross">—</span> No priority support</li>
        </ul>
        <a href="/register" class="btn btn-outline">Get Started</a>
      </div>
      <div class="pricing-card">
        <div class="plan-name">Starter</div>
        <div class="price">$9<span>/mo</span></div>
        <div class="price-desc">For small teams</div>
        <ul>
          <li><span class="check">✓</span> 3 team members</li>
          <li><span class="check">✓</span> Unlimited models</li>
          <li><span class="check">✓</span> 30-day log retention</li>
          <li><span class="check">✓</span> CSV export</li>
          <li><span class="cross">—</span> No API audit</li>
        </ul>
        <a href="/register" class="btn btn-outline">Start Trial</a>
      </div>
      <div class="pricing-card featured">
        <div class="plan-name">Team</div>
        <div class="price">$39<span>/mo</span></div>
        <div class="price-desc">For growing teams</div>
        <ul>
          <li><span class="check">✓</span> 15 team members</li>
          <li><span class="check">✓</span> Unlimited models</li>
          <li><span class="check">✓</span> 90-day log retention</li>
          <li><span class="check">✓</span> CSV + API export</li>
          <li><span class="check">✓</span> Priority support</li>
        </ul>
        <a href="/register" class="btn btn-primary">Start Trial</a>
      </div>
      <div class="pricing-card">
        <div class="plan-name">Business</div>
        <div class="price">$129<span>/mo</span></div>
        <div class="price-desc">For enterprises</div>
        <ul>
          <li><span class="check">✓</span> 50 team members</li>
          <li><span class="check">✓</span> Unlimited + BYOK</li>
          <li><span class="check">✓</span> Forever logs</li>
          <li><span class="check">✓</span> All export formats</li>
          <li><span class="check">✓</span> Webhook + SLA</li>
        </ul>
        <a href="/register" class="btn btn-outline">Contact Sales</a>
      </div>
    </div>
  </div>
</section>

<!-- CTA -->
<section class="cta">
  <div class="container">
    <h2>Stop sharing API keys in Slack.</h2>
    <p>RelayAI gives your team control, visibility, and savings — in 5 minutes.</p>
    <div class="hero-buttons">
      <a href="/register" class="btn btn-primary btn-lg">Start for Free →</a>
      <a href="https://github.com/89ohjkjhkj/relayai" class="btn btn-outline btn-lg" target="_blank">
        View on GitHub
      </a>
    </div>
  </div>
</section>

<!-- FOOTER -->
<footer>
  <div class="container">
    <p>© 2026 RelayAI · Open-source under MIT License · <a href="https://github.com/89ohjkjhkj/relayai">GitHub</a></p>
  </div>
</footer>

</body>
</html>`;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
