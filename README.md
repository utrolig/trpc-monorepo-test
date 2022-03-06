# Install

```bash
npm install -g pnpm
pnpm add -g pnpm
pnpm install
```

# Copy .env example
```bash
cd apps/api
cp .env.example .env
```

If you need authentication to work, you will have to create a discord application and set the callback url to: `http://localhost:400/api/auth/discord/callback`

# Generate Prisma client OR sync schema

```bash
cd apps/api

pnpm db:generate
# OR
pnpm db:sync
```

# Start api

```bash
cd apps/api
pnpm dev
```

# Start web

```bash
cd apps/web
pnpm dev
```

# Typecheck web to reproduce error
```bash
cd apps/web
pnpm typecheck
```
