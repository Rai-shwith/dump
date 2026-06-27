# Dump — Serverless Online Clipboard

<div align="center">

[![Live](https://img.shields.io/badge/Live-dump.ashwithrai.me-0ea5e9?style=for-the-badge&logo=cloudflare&logoColor=white)](https://dump.ashwithrai.me)
[![Frontend](https://img.shields.io/badge/Frontend-Cloudflare%20Pages-f97316?style=for-the-badge&logo=cloudflarepages&logoColor=white)](https://dump.ashwithrai.me)
[![API](https://img.shields.io/badge/API-Cloudflare%20Workers-f59e0b?style=for-the-badge&logo=cloudflareworkers&logoColor=white)](https://dump.ashwithrai.me/api)

[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Hono](https://img.shields.io/badge/Hono-API-e36002?style=flat-square&logo=hono&logoColor=white)](https://hono.dev/)
[![Cloudflare KV](https://img.shields.io/badge/Storage-Cloudflare%20KV-f38020?style=flat-square&logo=cloudflare&logoColor=white)](https://developers.cloudflare.com/kv/)

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=18&pause=1200&color=38BDF8&center=true&vCenter=true&width=700&lines=Create+clipboard+links+instantly.;Protect+content+with+passwords+or+owner+tokens.;Use+one-time+view+for+private+sharing.;Built+with+React%2C+Hono%2C+and+Cloudflare+Workers." alt="Typing SVG animation" />

</div>

## 🔗 Live Project

**Open Dump:** [https://dump.ashwithrai.me](https://dump.ashwithrai.me)

## ✨ What is Dump?

Dump is a **serverless online clipboard** for sharing text through short links.
It is anonymous, fast, and designed for secure temporary sharing.

## 🚀 Core Features

- Custom clipboard URLs
- Public, reserved, and protected clipboard modes
- Password protection (`view` or `edit` mode)
- Owner token bypass for privileged actions
- Expiration controls (from 1 minute to 1 year)
- One-time view auto-delete support
- Global starred clipboard list (max 5)
- Raw text endpoint for scripts and automation

## 🧱 Architecture at a Glance

- **Frontend:** React + Vite + TypeScript (`apps/dump-web`) on Cloudflare Pages
- **Backend:** Hono + Cloudflare Workers (`workers/dump-worker`)
- **Storage:** Cloudflare KV (`clip:<code>:meta`, `clip:<code>:content`, `app:starred`)
- **Domain:** `dump.ashwithrai.me`
- **API Base:** `https://dump.ashwithrai.me/api`

## 📁 Repository Structure

```text
dump/
├── apps/
│   └── dump-web/          # React + Vite frontend
├── workers/
│   └── dump-worker/       # Cloudflare Worker + Hono API
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DECISIONS.md
│   ├── API.md
│   └── tasks/
└── README.md
```

## 🔐 Security & Product Decisions

Key decisions are documented in:

- [`docs/DECISIONS.md`](/docs/DECISIONS.md)
- [`docs/ARCHITECTURE.md`](/docs/ARCHITECTURE.md)
- [`docs/API.md`](/docs/API.md)

Highlights:

- Passwords and owner tokens are stored as SHA-256 hashes
- Expired clipboards return 404 without revealing history
- Security headers and CORS are applied via middleware
- SEO indexing is intentionally blocked for privacy

## 🛠️ Local Development

### Frontend

```bash
cd apps/dump-web
npm install
npm run dev
```

### Worker

```bash
cd workers/dump-worker
npm install
npm run dev
```

## ✅ Validation Commands

```bash
# frontend
cd apps/dump-web
npm run lint
npm run build

# worker
cd ../../workers/dump-worker
npm run lint
```