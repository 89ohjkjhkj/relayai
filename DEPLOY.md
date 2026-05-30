# 🚀 Deployment Guide

Deploy RelayAI to **Vercel** with **Neon** (free PostgreSQL) in **5 minutes**.

## Step 1: Create a free PostgreSQL database on Neon

1. Go to **https://neon.tech**
2. Click **Sign up with GitHub** (free, no credit card)
3. Click **Create Project**
   - Project name: `relayai`
   - Region: choose closest to your users (e.g. Singapore for Asia)
4. Once created, copy the **`DATABASE_URL`** (looks like `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require`)

## Step 2: Deploy on Vercel

1. Go to **https://vercel.com/new**
2. Click **Continue with GitHub** if first time
3. **Import** the `relayai` repository
4. Expand **Environment Variables** and add:

   | Name | Value |
   |------|-------|
   | `DATABASE_URL` | (paste from Neon) |
   | `JWT_SECRET` | (generate random: `openssl rand -base64 32`) |

5. Click **Deploy** — wait ~2 minutes

## Step 3: First-time setup

After deploy succeeds, your app is live at `https://your-app.vercel.app`.

The first user to register becomes **super admin** automatically. Go to:

```
https://your-app.vercel.app/register
```

Register an account, then in the admin panel:
- Add your **upstream API keys** (OpenAI / Claude / DeepSeek)
- Create teams, generate API keys
- You're live!

## Optional: Custom domain

In Vercel project settings → **Domains** → add `relayai.com` (you'll need to buy it from Namecheap/GoDaddy ~$12/year).

## Troubleshooting

**Build fails with "Can't reach database"**
→ Check DATABASE_URL is set correctly in Vercel env vars

**"Prisma schema validation"**
→ Make sure `provider = "postgresql"` in `prisma/schema.prisma`

**Login fails / sessions don't work**
→ Make sure `JWT_SECRET` is set in Vercel env vars
