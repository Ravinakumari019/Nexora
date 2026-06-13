# Project Structure (Milestone 3)

Below are the key files added/updated for the database and authentication setup. Click the links to open each file in your IDE (VS Code, WebStorm, etc.).

| Path | Description |
|------|-------------|
| [prisma/schema.prisma](file:///c:/Users/DELL/OneDrive/Documents/Desktop/Resume_project/chat-application/prisma/schema.prisma) | Prisma schema with `User`, `Account`, `Session`, `Conversation`, `Message` models |
| [src/lib/prisma.ts](file:///c:/Users/DELL/OneDrive/Documents/Desktop/Resume_project/chat-application/src/lib/prisma.ts) | Singleton `PrismaClient` instance used throughout the app |
| [src/app/api/auth/[...nextauth]/route.ts](file:///c:/Users/DELL/OneDrive/Documents/Desktop/Resume_project/chat-application/src/app/api/auth/%5B...nextauth%5D/route.ts) | Auth.js v5 Google OAuth route (Prisma adapter) |
| [.env.local](file:///c:/Users/DELL/OneDrive/Documents/Desktop/Resume_project/chat-application/.env.local) | Local environment (contains DB URL, NextAuth secret, Google client ID/secret – **git‑ignored**) |
| [prisma/seed.ts](file:///c:/Users/DELL/OneDrive/Documents/Desktop/Resume_project/chat-application/prisma/seed.ts) | Simple seed script that creates an admin user |
| [package.json](file:///c:/Users/DELL/OneDrive/Documents/Desktop/Resume_project/chat-application/package.json) | Scripts now include `prisma:generate`, `prisma:migrate`, `seed` and use `bun` for dev/start commands |

---

**How to view them in your IDE**
1. Open the project folder `c:\Users\DELL\OneDrive\Documents\Desktop\Resume_project\chat-application`.
2. Use the file explorer to navigate to the paths above, or click the links directly if your editor supports `file://` URIs.
3. If the explorer doesn’t show new files, press **Ctrl + Shift + P** → **Reload Window** (VS Code) or restart the editor.

---

**Next steps**
- Run `bun run dev` → open `http://localhost:3000/api/auth/signin` to see the Google login button.
- Run `bunx prisma db push --accept-data-loss` to ensure the tables exist in your Neon/PostgreSQL DB.
- When ready, we can proceed to Milestone 4 (chat API / Socket.io server).
