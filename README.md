# 🚀 Best SAAS Kit V2

**The Ultimate AI-Powered SAAS Starter Kit**

A production-ready, feature-complete SAAS starter kit built with Next.js 15, designed to help developers launch AI-powered applications quickly and efficiently.

> **Version**: 2.0.1 - Stable Release

---

## ✨ Features

### 🔐 **Authentication & User Management**
- **NextAuth.js** integration with Google OAuth
- Protected routes and middleware
- User profiles and session management
- Admin panel with user analytics

### 💳 **Payment & Billing**
- **Stripe** integration for payments
- Pro plan subscription ($99 one-time payment)
- Billing dashboard and payment history
- Webhook handling for payment events

### 🤖 **AI Integration**
- **OpenRouter API** for multiple AI models
- Interactive chat interface
- Credit-based usage system
- AI response streaming

### 📊 **Analytics & Dashboard**
- User analytics and insights
- Revenue tracking
- Credit usage monitoring
- Admin analytics panel

### 🎨 **Modern UI/UX**
- **Tailwind CSS v4** for styling
- **ShadCN UI** components
- Dark/Light theme support
- Responsive design
- Smooth animations with Framer Motion

### 🗄️ **Database**
- **Neon PostgreSQL** database
- Custom database functions
- User management and analytics
- Subscription tracking

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + ShadCN UI
- **Authentication**: NextAuth.js
- **Database**: Neon PostgreSQL
- **Payments**: Stripe
- **AI**: OpenRouter API
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18 or higher)
- **npm** or **yarn** or **pnpm**
- **Git**

## 📁 Project Structure

```
best-saas-kit-v2/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── admin/             # Admin panel pages
│   │   ├── api/               # API routes
│   │   ├── auth/              # Authentication pages
│   │   ├── dashboard/         # User dashboard
│   │   ├── demo/              # Demo page
│   │   └── page.tsx           # Landing page
│   ├── components/            # React components
│   │   ├── admin/             # Admin components
│   │   ├── auth/              # Auth components
│   │   ├── billing/           # Billing components
│   │   ├── chat/              # AI chat components
│   │   ├── dashboard/         # Dashboard components
│   │   ├── landing/           # Landing page components
│   │   └── ui/                # UI components (ShadCN)
│   ├── lib/                   # Utility functions
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── database.ts        # Database functions
│   │   ├── stripe.ts          # Stripe utilities
│   │   └── ...
│   ├── hooks/                 # Custom React hooks
│   ├── types/                 # TypeScript type definitions
│   └── middleware.ts          # Next.js middleware
├── public/                    # Static assets
├── .env.example              # Environment variables template
├── .env.local                # Your environment variables (not in git)
├── package.json              # Dependencies and scripts
├── tailwind.config.js        # Tailwind CSS configuration
└── tsconfig.json             # TypeScript configuration
```

## 🎯 Usage Guide

### 🏠 Landing Page
The landing page includes:
- Hero section with call-to-action
- Features showcase
- Pricing section
- Testimonials
- Footer with links

### 👤 User Authentication
- Users can sign in with Google OAuth
- Automatic user creation in database
- Session management with NextAuth
- Protected routes for authenticated users

### 📊 Dashboard Features
- **Overview**: User stats and quick actions
- **Chat**: AI-powered chat interface
- **Analytics**: Usage statistics and insights
- **Billing**: Subscription management and payment history
- **Profile**: User profile management
- **Settings**: Account preferences

### 👑 Admin Panel
Admin users (configured via email) get access to:
- User management and analytics
- Revenue tracking
- System-wide statistics
- User activity monitoring

### 💬 AI Chat
- Interactive chat interface
- Multiple AI models via OpenRouter
- Credit-based usage system
- Real-time streaming responses

## 🎨 Customization

### 🎨 Styling
- Modify `src/app/globals.css` for global styles
- Update `tailwind.config.js` for Tailwind customization
- Edit components in `src/components/ui/` for UI changes

### 🔧 Configuration
- Update `src/lib/stripe.ts` for pricing changes
- Modify `src/lib/database.ts` for database schema changes
- Edit `src/middleware.ts` for route protection

### 🤖 AI Models
- Change AI models in `.env.local` (`OPENROUTER_MODEL`)
- Modify chat interface in `src/components/chat/`
- Update credit costs in `src/lib/database.ts`

## 📦 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run db:setup     # Initialize database (if you add this script)
npm run db:migrate   # Run database migrations (if you add this script)
npm run db:seed      # Seed database with sample data (if you add this script)
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com/)
   - Import your GitHub repository

2. **Environment Variables**
   - Add all environment variables from `.env.local`
   - Update `NEXTAUTH_URL` and `NEXT_PUBLIC_SITE_URL` to your domain

3. **Deploy**
   - Vercel will automatically deploy your application

## 🔧 Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NEXTAUTH_URL` | Your site URL | ✅ | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | NextAuth secret key | ✅ | `your-secret-key` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | ✅ | `123456789.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | ✅ | `GOCSPX-...` |
| `DATABASE_URL` | Neon PostgreSQL connection string | ✅ | `postgresql://user:pass@host/db` |
| `STRIPE_SECRET_KEY` | Stripe secret key | ✅ | `sk_test_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | ✅ | `pk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | ✅ | `whsec_...` |
| `OPENROUTER_API_KEY` | OpenRouter API key | ✅ | `sk-or-v1-...` |
| `OPENROUTER_MODEL` | AI model to use | ✅ | `qwen/qwen3-235b-a22b-2507` |

## 🐛 Troubleshooting

### Common Issues

**1. Database Connection Error**
```bash
Error: connect ECONNREFUSED
```
- Check your `DATABASE_URL` in `.env.local`
- Ensure your Neon database is running
- Verify the connection string format

**2. Google OAuth Error**
```bash
OAuthCallback error
```
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- Check authorized redirect URIs in Google Cloud Console
- Ensure `NEXTAUTH_URL` matches your domain

**3. Stripe Webhook Error**
```bash
Webhook signature verification failed
```
- Verify `STRIPE_WEBHOOK_SECRET` in `.env.local`
- Check webhook endpoint URL in Stripe dashboard
- Ensure webhook is receiving POST requests

**4. AI Chat Not Working**
```bash
OpenRouter API error
```
- Check `OPENROUTER_API_KEY` is valid
- Verify you have credits in your OpenRouter account
- Ensure `OPENROUTER_MODEL` is available

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework for production
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
- [ShadCN UI](https://ui.shadcn.com/) - Beautiful UI components
- [NextAuth.js](https://next-auth.js.org/) - Authentication for Next.js
- [Stripe](https://stripe.com/) - Payment processing
- [Neon](https://neon.tech/) - Serverless PostgreSQL
- [OpenRouter](https://openrouter.ai/) - AI model access