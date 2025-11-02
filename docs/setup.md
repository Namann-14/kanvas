# ⚙️ Kanvas — Setup Guide

This comprehensive guide will walk you through setting up **Kanvas** from scratch, ensuring you have a fully functional development environment.

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher
- **npm** or **pnpm** package manager
- **Git** for version control
- A **Supabase** account (or PostgreSQL database)
- An **Upstash Redis** account (free tier available)

---

## 🧱 Step 1: Create the Next.js Application

Initialize a new Next.js project with TypeScript and ESLint:

```bash
npx create-next-app@latest kanvas --typescript --eslint --app
cd kanvas
```

---

## 🧰 Step 2: Install Core Dependencies

Install all required packages for the full-stack application:

```bash
npm install @reduxjs/toolkit react-redux prisma @prisma/client better-auth next-auth @upstash/redis
```

Install development tools:

```bash
npm install -D tailwindcss postcss autoprefixer husky lint-staged prettier eslint
```

**What these packages provide:**

- **Redux Toolkit & React-Redux**: State management
- **Prisma**: Database ORM and migrations
- **Better Auth**: Modern authentication solution
- **Upstash Redis**: Serverless Redis for caching
- **Husky & Lint-Staged**: Git hooks for code quality

---

## 🎨 Step 3: Configure TailwindCSS

Initialize TailwindCSS:

```bash
npx tailwindcss init -p
```

Update `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

Add Tailwind directives to `src/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## 🗄️ Step 4: Setup Prisma + Supabase

### Initialize Prisma

```bash
npx prisma init
```

### Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Database URLs
DATABASE_URL="postgresql://postgres.xxxxx:password@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxxxx:password@aws-0-region.pooler.supabase.com:5432/postgres"

# Better Auth
BETTER_AUTH_SECRET="your-super-secret-key-here"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# Upstash Redis
UPSTASH_REDIS_REST_URL="https://your-redis-url.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"
```

### Define Your Schema

Edit `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/prisma"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Run Migrations

```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

## 🔐 Step 5: Configure Better Auth

Create the auth configuration file at `src/lib/auth.ts`:

```typescript
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  secret: process.env.BETTER_AUTH_SECRET!,
});
```

Create the API route at `src/app/api/auth/[...all]/route.ts`:

```typescript
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth.handler);
```

---

## 🧠 Step 6: Setup Redux Toolkit

### Create Store Configuration

Create `src/store/index.ts`:

```typescript
import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### Create User Slice

Create `src/store/slices/userSlice.ts`:

```typescript
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  user: any | null;
}

const initialState: UserState = {
  user: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<any>) => {
      state.user = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
```

### Wrap Your App with Provider

Update `src/app/layout.tsx`:

```typescript
"use client";

import { Provider } from "react-redux";
import { store } from "@/store";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Provider store={store}>{children}</Provider>
      </body>
    </html>
  );
}
```

---

## 🧩 Step 7: Setup Upstash Redis

Create the Redis client at `src/lib/redis.ts`:

```typescript
import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Helper functions
export async function getCachedData<T>(key: string): Promise<T | null> {
  return await redis.get<T>(key);
}

export async function setCachedData(
  key: string,
  data: any,
  expirationSeconds?: number,
): Promise<void> {
  if (expirationSeconds) {
    await redis.setex(key, expirationSeconds, data);
  } else {
    await redis.set(key, data);
  }
}
```

---

## 🧹 Step 8: Setup Code Quality Tools

### Initialize Husky

```bash
npx husky init
```

### Configure Pre-Commit Hook

Update `.husky/pre-commit`:

```bash
npx lint-staged
```

### Add Lint-Staged Configuration

Add to `package.json`:

```json
{
  "lint-staged": {
    "*.{js,ts,jsx,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

### Create Prettier Configuration

Create `.prettierrc`:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": false,
  "printWidth": 80,
  "tabWidth": 2
}
```

---

## 🚀 Step 9: Run the Development Server

Start your development server:

```bash
npm run dev
```

Your application will be available at **http://localhost:3000**

---

## 📁 Project Structure

After setup, your project structure should look like this:

```
kanvas/
├── .husky/                 # Git hooks
├── docs/                   # Documentation
├── prisma/
│   ├── migrations/         # Database migrations
│   └── schema.prisma       # Database schema
├── public/                 # Static assets
├── src/
│   ├── app/               # Next.js app directory
│   │   ├── api/           # API routes
│   │   ├── globals.css    # Global styles
│   │   ├── layout.tsx     # Root layout
│   │   └── page.tsx       # Home page
│   ├── components/        # React components
│   ├── lib/               # Utility functions
│   │   ├── auth.ts        # Auth configuration
│   │   └── redis.ts       # Redis client
│   ├── store/             # Redux store
│   │   ├── index.ts       # Store configuration
│   │   └── slices/        # Redux slices
│   └── generated/         # Generated Prisma client
├── .env                   # Environment variables
├── .prettierrc            # Prettier configuration
├── eslint.config.mjs      # ESLint configuration
├── package.json           # Dependencies
├── tailwind.config.js     # Tailwind configuration
└── tsconfig.json          # TypeScript configuration
```

---

## ✅ Verification Checklist

Ensure everything is working correctly:

- [ ] Development server runs without errors
- [ ] Database connection is successful
- [ ] Prisma Client is generated
- [ ] Redis connection works
- [ ] Authentication routes are accessible
- [ ] ESLint and Prettier are configured
- [ ] Git hooks are functioning

---

## 🔧 Available Scripts

| Command                  | Description                          |
| ------------------------ | ------------------------------------ |
| `npm run dev`            | Start development server             |
| `npm run build`          | Build for production                 |
| `npm start`              | Start production server              |
| `npm run lint`           | Run ESLint                           |
| `npx prisma studio`      | Open Prisma Studio (database viewer) |
| `npx prisma migrate dev` | Create and apply migrations          |
| `npx prisma generate`    | Regenerate Prisma Client             |

---

## 🆘 Troubleshooting

### Database Connection Issues

- Verify your `DATABASE_URL` and `DIRECT_URL` are correct
- Ensure your IP is whitelisted in Supabase
- Check that the database exists

### Prisma Client Not Found

```bash
npx prisma generate
```

### Redis Connection Errors

- Verify your Upstash credentials
- Check that the Redis instance is active

---

## 🎯 Next Steps

Now that your environment is set up:

1. Review the [Product Requirements Document](./prd.md)
2. Explore the database schema in Prisma Studio
3. Start building features!
4. Check out the API documentation (coming soon)

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Better Auth Documentation](https://better-auth.com)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org)
- [Upstash Documentation](https://docs.upstash.com)
