# Lumea (v0.3) — AI Agent Context & Orientation Map 🧭

> **Purpose of this file**: This living document serves as the high-density context hub and navigation index for AI agents (and human developers). It provides essential system invariants, architectural decisions, and exact file pointers so agents can navigate and reason about the codebase instantly without expensive whole-project scans.

---

## ⚡ Quick Orientation & System Matrix

* **Project Name**: Lumea — AI Mental Health Companion ("Celestial Sanctuary")
* **Current Active Application**: `lumea-next/` (Next.js 16 App Router fullstack app)
* **Status of `lumea-backend/`**: Dormant / legacy Python scaffold. Core API logic (chat, CBT, emotion, insights) is implemented directly in `lumea-next/src/app/api/`.
* **Database & Auth**: Supabase Cloud (PostgreSQL with Row Level Security + Supabase Auth)
* **Primary LLM Engine**: Groq API (`qwen/qwen3.8-27b` with temperature 0.7, streaming SSE)
* **Emotion Classification**: Hugging Face Serverless Inference (`j-hartmann/emotion-english-distilroberta-base`)
* **Styling Paradigm**: Pure Vanilla CSS + dynamic HSL CSS variable design system (Glassmorphic, no Tailwind)

---

## 🗺️ Navigation Map — "Where What Is"

Use these exact pointers to locate modules without searching:

### 1. Frontend Core & Layouts (`lumea-next/src/app/`)
* **Landing Page**: [page.js](file:///e:/Project/Lumea%20v0.3/lumea-next/src/app/page.js) — Hero sanctuary entry, feature preview, and guest CTA.
* **Global Styles & CSS Tokens**: [globals.css](file:///e:/Project/Lumea%20v0.3/lumea-next/src/app/globals.css) — HSL tokens (`--bg-primary`, `--glass-surface`, `--text-main`, etc.).
* **Dashboard Shell**: [layout.js](file:///e:/Project/Lumea%20v0.3/lumea-next/src/app/dashboard/layout.js) — Persistent wrapper with sidebar and dynamic background.
* **Dashboard Overview**: [page.js](file:///e:/Project/Lumea%20v0.3/lumea-next/src/app/dashboard/page.js) — Quick access cards, daily check-in, and recent metrics.

### 2. Interactive Feature Modules (`lumea-next/src/app/dashboard/`)
* **Empathic Chat**: [chat/page.js](file:///e:/Project/Lumea%20v0.3/lumea-next/src/app/dashboard/chat/page.js) — Real-time streaming conversation, speech synthesis, and session history drawer.
* **CBT Distortion Reframer**: [cbt/page.js](file:///e:/Project/Lumea%20v0.3/lumea-next/src/app/dashboard/cbt/page.js) — Guided Socratic dialogue to reframe automatic negative thoughts.
* **Mood Galaxy Tracker**: [mood/page.js](file:///e:/Project/Lumea%20v0.3/lumea-next/src/app/dashboard/mood/page.js) — 8-point valence mood logging and interactive constellation visualization.
* **Lunar Journal**: [journal/page.js](file:///e:/Project/Lumea%20v0.3/lumea-next/src/app/dashboard/journal/page.js) — Private encrypted reflection logs with pre/post mood ratings.
* **Breath Sync Guide**: [breathing/page.js](file:///e:/Project/Lumea%20v0.3/lumea-next/src/app/dashboard/breathing/page.js) — Visual pacing circle for grounding and de-escalation exercises.
* **User Profile**: [profile/page.js](file:///e:/Project/Lumea%20v0.3/lumea-next/src/app/dashboard/profile/page.js) — Profile stats, avatar, and settings.

### 3. Backend API Routes (`lumea-next/src/app/api/`)
* **Streaming Chat Endpoint**: [chat/route.js](file:///e:/Project/Lumea%20v0.3/lumea-next/src/app/api/chat/route.js) — Groq streaming call with custom `<think>` tag suppression state-machine.
* **Real-Time Emotion Classifier**: [emotion/route.js](file:///e:/Project/Lumea%20v0.3/lumea-next/src/app/api/emotion/route.js) — Hugging Face zero-shot 7-class emotion classification.
* **CBT Socratic Coach API**: [cbt/route.js](file:///e:/Project/Lumea%20v0.3/lumea-next/src/app/api/cbt/route.js) — Structured JSON response identifying 9 cognitive distortions.
* **Mood Insights Endpoint**: [mood-insight/route.js](file:///e:/Project/Lumea%20v0.3/lumea-next/src/app/api/mood-insight/route.js) — Aggregated emotional pattern summaries.

### 4. Components & Modals (`lumea-next/src/components/`)
* **Navigation Sidebar**: [Sidebar.js](file:///e:/Project/Lumea%20v0.3/lumea-next/src/components/Sidebar.js) — Collapsible navigation with active route highlights.
* **Authentication Modal**: [AuthModal.js](file:///e:/Project/Lumea%20v0.3/lumea-next/src/components/AuthModal.js) — Supabase email/password login and signup popup.
* **Daily Spirit Limit Modal**: [LimitModal.js](file:///e:/Project/Lumea%20v0.3/lumea-next/src/components/LimitModal.js) — 100 messages/day safety ceiling to prevent unhealthy dependence.
* **Dynamic Background**: [DynamicBackground.js](file:///e:/Project/Lumea%20v0.3/lumea-next/src/components/DynamicBackground.js) & [SkyBackground.js](file:///e:/Project/Lumea%20v0.3/lumea-next/src/components/SkyBackground.js) — Canvas particle/star effects reacting to active theme.
* **Theme Switcher**: [ThemeSwitcher.js](file:///e:/Project/Lumea%20v0.3/lumea-next/src/components/ThemeSwitcher.js) — Visual switcher for the 5 sanctuary themes.

### 5. Services, Hooks & Safety (`lumea-next/src/lib/`, `src/hooks/`, `src/contexts/`)
* **Safety Phrase Interceptor**: [safetyPhrases.js](file:///e:/Project/Lumea%20v0.3/lumea-next/src/lib/safetyPhrases.js) — 100+ crisis keywords/regex patterns. Intercepts before API call.
* **Supabase Client**: [supabase.js](file:///e:/Project/Lumea%20v0.3/lumea-next/src/lib/supabase.js) — Client initialization with fallback dummy client for local dev without env.
* **Theme Context & Engine**: [ThemeContext.js](file:///e:/Project/Lumea%20v0.3/lumea-next/src/contexts/ThemeContext.js) & [themes.js](file:///e:/Project/Lumea%20v0.3/lumea-next/src/lib/themes.js) — 5 palettes (`night-sky`, `ocean`, `desert`, `dark`, `light`).
* **Auth Hook**: [useAuth.js](file:///e:/Project/Lumea%20v0.3/lumea-next/src/hooks/useAuth.js) — Session management and user profile state.
* **Chat Hook**: [useChat.js](file:///e:/Project/Lumea%20v0.3/lumea-next/src/hooks/useChat.js) — Streaming message handler with reflection loop cadence.

### 6. Database Schema & Policies (`supabase/`)
* **Core Tables & RLS**: [supabase_setup.sql](file:///e:/Project/Lumea%20v0.3/supabase/supabase_setup.sql) — `profiles`, `mood_entries`, `journal_entries`, `chat_history` with user UUID RLS.
* **Multi-Session Chat Schema**: [setup_chat.sql](file:///e:/Project/Lumea%20v0.3/supabase/setup_chat.sql) — `chat_sessions` and `chat_messages` with session cascading and RLS.

---

## 🛡️ Core System Invariants (Agent Rules)

When modifying or adding features, agents MUST observe these constraints:

1. **Safety Interception First**:
   * Every message submitted in chat must be validated client-side using `isDistressDetected(text)` from [safetyPhrases.js](file:///e:/Project/Lumea%20v0.3/lumea-next/src/lib/safetyPhrases.js).
   * If flagged, halt LLM submission immediately and display the crisis support panel. Never bypass this.

2. **No Tailwind / Stick to Design System Tokens**:
   * Do NOT install Tailwind or third-party component libraries unless explicitly requested.
   * All styles must use Vanilla CSS and HSL CSS variables defined in [themes.js](file:///e:/Project/Lumea%20v0.3/lumea-next/src/lib/themes.js) and [globals.css](file:///e:/Project/Lumea%20v0.3/lumea-next/src/app/globals.css).

3. **Streaming & `<think>` Tag Suppression**:
   * Groq LLM responses (e.g. Qwen / DeepSeek / reasoning models) can leak internal thought tokens (`<think>...</think>`).
   * The streaming state machine in [chat/route.js](file:///e:/Project/Lumea%20v0.3/lumea-next/src/app/api/chat/route.js) buffers chunks and strips reasoning blocks before streaming to the client. Keep this logic intact.

4. **Row Level Security (RLS) Discipline**:
   * All queries to Supabase must respect `user_id = auth.uid()`.
   * Never disable RLS on Supabase tables.

5. **Environment Variable Conventions**:
   * Hugging Face inference token is `HF_TOKEN` (not `HUGGINGFACE_API_KEY`).
   * Groq key is `GROQ_API_KEY`.
   * Supabase requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

---

## 📝 Continuous Context Log & Working State

*Update this section whenever significant changes, model upgrades, or architectural decisions occur.*

### Current State (v0.3):
* **Chat Engine**: Operating on `qwen/qwen3.8-27b` via Groq. Streaming uses `ReadableStream` with a think-block buffer filter.
* **Emotion Pipeline**: Synchronous classification via Hugging Face Inference API (`DistilRoBERTa`). Injects detected emotion into the dynamic system prompt.
* **Themes**: 5 themes fully integrated with distinct copy (`aiGreeter`, `placeholder`, `title`) and HSL palettes.
* **Database**: Dual setup scripts exist: [supabase_setup.sql](file:///e:/Project/Lumea%20v0.3/supabase/supabase_setup.sql) for base tables and [setup_chat.sql](file:///e:/Project/Lumea%20v0.3/supabase/setup_chat.sql) for chat sessions/messages.

---

## 🔄 Agent Update Protocol

**When should an agent update this file?**
1. **New Route / Component Added**: Add a 1-line pointer in the **Navigation Map**.
2. **Model or Dependency Changed**: Update the **Quick Orientation** and **Continuous Context Log**.
3. **Architecture Decision / Gotcha Discovered**: Add an entry under **Core System Invariants**.
4. **Maintenance Guideline**: Keep this file concise (< 250 lines). Do NOT dump full code blocks or raw database dumps; always use relative/absolute links and short architectural summaries.
