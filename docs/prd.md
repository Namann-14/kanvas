---
title: Product Requirements Document
description: Kanvas product requirements and feature specifications
---

# 📋 Kanvas — Product Requirements Document (PRD)

## 🧠 Concept

**Kanvas** is a full-stack productivity workspace featuring:

- Kanban boards
- Tasks with priorities, statuses, and assignees
- Notes and attachments
- Real-time updates
- User authentication & workspaces

It’s designed for both **team collaboration** and **personal productivity**, built on top of scalable, production-grade technologies.

---

## 🎯 Goals

- Demonstrate full-stack proficiency using **Next.js 15** and **Prisma**.
- Integrate **Better Auth** for secure authentication and role-based access.
- Enable real-time experiences with **Redis caching and WebSocket support**.
- Maintain clean, modular, and extensible code.
- Document and automate everything with **Fumadocs**.

---

## 🧱 Core Features

### 1. Authentication

- Email + Password (Better Auth)
- OAuth (Google, GitHub)
- Protected routes via middleware
- JWT + Session handling

### 2. Workspaces

- Each user can create multiple workspaces.
- Workspace members (collaboration feature).
- Role-based permissions (Admin, Editor, Viewer).

### 3. Boards

- Each workspace contains multiple boards.
- Boards contain task columns (`Todo`, `In Progress`, `Done`).
- Drag-and-drop reordering (client-side state sync via Redux).

### 4. Tasks

- Title, description, assignee, due date, priority, status.
- Comments, attachments.
- Real-time updates via Redis Pub/Sub.

### 5. Notes

- Personal notes or workspace-shared.
- Markdown support.
- Version history (optional future addition).

---

## ⚙️ Architecture Overview

Frontend (Next.js)
↓
API Routes (App Router / Server Actions)
↓
Better Auth Middleware (JWT & Sessions)
↓
Prisma ORM (Postgres @ Supabase)
↓
Redis Cache (Upstash) for live sync

---

## 🧩 Non-Functional Requirements

| Category      | Details                                   |
| ------------- | ----------------------------------------- |
| Security      | JWT-based sessions, secure cookies        |
| Scalability   | Redis caching, stateless API              |
| Documentation | Fumadocs-powered internal docs            |
| Code Quality  | Husky pre-commit hooks, ESLint, Prettier  |
| Deployment    | Vercel (frontend + serverless API routes) |

---

## 🧠 Future Enhancements

- AI-powered task summarization (OpenAI API).
- Real-time team collaboration.
- Analytics dashboard.
- Custom Kanban templates.
