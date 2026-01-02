# Nigerian Law-Tech Platform

A modern legal-tech SaaS platform where contract reviews are performed exclusively by licensed lawyers.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Animations**: Framer Motion
- **Backend**: Supabase (Auth, Storage, Database)
- **Payments**: Paystack
- **Database**: PostgreSQL

## Features

- User authentication (Email, Google OAuth)
- Mandatory KYC verification
- Contract upload and review workflow
- Paystack payment integration
- Admin panel for contract assignment
- Lawyer panel for contract review
- Real-time status tracking

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

Fill in your Supabase and Paystack credentials.

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
PAYSTACK_SECRET_KEY=your_paystack_secret_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Database Setup

Run the SQL migrations in `supabase/migrations/` to set up your database schema.

## Important Notes

- **NO AI is used for contract review** - All reviews are performed by licensed lawyers only
- AI is used only for the FAQ chatbot
- All legal disclaimers must be displayed to users
