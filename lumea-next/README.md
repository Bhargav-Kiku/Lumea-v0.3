# Lumeanext

**A Secure AI Mental Health Companion Integrating Real-Time Emotion Analytics and CBT**

Lumeanext is a web-based conversational wellness platform built to address the shortage of accessible mental health support. It combines a large language model for empathetic dialogue, a parallel NLP emotion classification pipeline, structured Cognitive Behavioral Therapy (CBT) exercises, and a deterministic crisis-interception safety layer — all served through a modern, low-cognitive-load glassmorphic interface.

> Published research: *"Lumeanext: A Secure AI Mental Health Companion Integrating Real-Time Emotion Analytics and CBT"* — Department of Computer Science and Engineering, Parul University, Vadodara, India.

---

## Table of Contents

1. [Overview](#overview)
2. [Key Features](#key-features)
3. [System Architecture](#system-architecture)
4. [Technology Stack](#technology-stack)
5. [Database Schema](#database-schema)
6. [Environment Variables](#environment-variables)
7. [Local Development](#local-development)
8. [Deployment (Vercel)](#deployment-vercel)
9. [Safety and Ethics](#safety-and-ethics)
10. [Research Findings](#research-findings)
11. [Limitations](#limitations)

---

## Overview

Accessing consistent mental healthcare remains a logistical challenge across many demographics. Anxiety and depressive disorders are increasingly common, yet the corresponding healthcare infrastructure has not expanded at the same pace — leading to extended wait times for psychiatric consultations, and in rural or underserved regions, an absence of clinical facilities entirely.

Lumeanext operates within this gap as a digital platform for emotional tracking, private journaling, and conversational support. It is not a replacement for clinical care; it is designed to serve as an accessible, anonymous, and empathetic first resource for individuals hesitant to engage with traditional clinical environments.

The platform's core thesis is that real-time NLP emotion recognition, injected into a generative LLM prompt at inference time, produces responses that are measurably more contextually appropriate than those from un-tuned general-purpose models — without requiring resource-intensive fine-tuning or proprietary clinical datasets.

---

## Key Features

### Empathic Conversational Chat

Powered by the **Llama 3.3-70B** model via the Groq inference API. Responses are streamed to the client using Server-Sent Events (SSE), targeting a Time to First Token (TTFT) of under 500ms. The system achieved a measured **310ms TTFT** in evaluation.

### Real-Time Emotion Classification

Every user message is routed in parallel to the **`j-hartmann/emotion-english-distilroberta-base`** model on Hugging Face Inference. The top-scoring emotion from a 7-class framework (Joy, Sadness, Anger, Fear, Surprise, Disgust, Neutral) is injected into the LLM system prompt as dynamic context. This approach was validated against 150 synthetic chat queries, achieving a classification accuracy of **80-86%**.

| Emotion | System Adjustment |
| :--- | :--- |
| Joy | Validating and engaged tone |
| Sadness | Gentle and empathetic tone |
| Anger | Non-judgmental, passive listening |
| Fear | Reassuring and grounding tone |
| Surprise | Stabilizing tone |
| Disgust | Objective validation |
| Neutral | Conversational tone |

### CBT Reframing Module

Users input automatic negative thoughts; the LLM returns a structured JSON payload identifying the cognitive distortion. The application parses this and presents a guided reframe interface. The module educates users on 9 recognized distortion types:

| Distortion | Clinical Definition |
| :--- | :--- |
| Catastrophizing | Anticipating the worst possible outcome |
| All-or-Nothing | Evaluating situations in binary terms |
| Mind Reading | Presuming the thoughts of others |
| Should Statements | Applying rigid rules to oneself |
| Emotional Reasoning | Assuming negative emotions reflect reality |
| Overgeneralization | Seeing a single event as a constant pattern |
| Mental Filtering | Dwelling on negatives while ignoring positives |
| Labeling | Assigning global traits based on isolated events |
| Personalization | Assuming disproportionate blame for external events |

### Mood Tracking and Analytics

Users log their emotional state on an 8-point categorical spectrum. Aggregated entries are visualized on the dashboard as a particle constellation map, allowing users to observe their emotional patterns over time.

### Reflective Journal

A private, structured journaling space backed by Supabase PostgreSQL with Row Level Security (RLS). Entries are isolated at the database kernel level — no query can retrieve a row whose `user_id` does not match the requesting token's `auth.uid()`.

### Guided Breathing Exercises

An interactive breathing module providing paced visual cues for grounding and de-escalation techniques.

### Dynamic Theme Engine

Five distinct visual themes (Light, Dark, Desert, Ocean, Night Sky) each adapt the full visual identity, color tokens, copy text, and AI greeting style. The engine was designed to reduce cognitive load by using low-contrast borders and HSL color tokens rather than high-contrast clinical aesthetics.

---

## System Architecture

Lumeanext uses a modular, three-tier layered architecture separating presentation logic from application logic and data persistence.

```
+---------------------------------------------+
|              Presentation Layer              |
|   Next.js 16 App Router  Glassmorphic UI    |
|        Dynamic Theme Engine  SSE Client      |
+------------------+--------------------------+
                   |
+------------------v--------------------------+
|           Application Logic Layer           |
|  Next.js Server Actions  Rate Limiter (100  |
|  msgs/day)  Safety Engine  Prompt Builder   |
|         Groq API       Hugging Face API      |
+------------------+--------------------------+
                   |
+------------------v--------------------------+
|             Data Access Layer               |
|   Supabase PostgreSQL  JWT Auth  RLS        |
+---------------------------------------------+
```

### Message Processing Pipeline

Each incoming user message follows this five-step sequence:

1. **JWT Validation** — The server verifies the session token and enforces a daily rate limit of 100 messages per user.
2. **Safety Scan** — Text is evaluated by the deterministic safety engine before any external API call is made.
3. **Emotion Classification** — Input is dispatched to the Hugging Face DistilRoBERTa endpoint.
4. **Prompt Construction** — The classified emotion is injected as a directive into the LLM system prompt.
5. **Generation** — The Llama 3.3-70B model generates a response, streamed to the client via SSE and logged to the database alongside its emotional score.

---

## Technology Stack

| Layer | Technology |
| :--- | :--- |
| Framework | Next.js 16 (App Router) |
| Runtime | React 19 |
| AI Language Model | Llama 3.3-70B via Groq SDK |
| Emotion Classification | DistilRoBERTa (`j-hartmann/emotion-english-distilroberta-base`) via Hugging Face Inference |
| Database and Auth | Supabase (PostgreSQL + JWT + RLS) |
| Performance Monitoring | Vercel Speed Insights |
| Styling | Vanilla CSS with HSL design tokens and glassmorphism |
| Linting | ESLint with `eslint-config-next` |

---

## Database Schema

The following Supabase tables are required. All tables enforce Row Level Security with policies tied to `auth.uid()`.

### `journal_entries`

| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | `uuid` | Primary key, auto-generated |
| `user_id` | `text` | References `auth.users` |
| `title` | `text` | Entry title |
| `content` | `text` | Entry body |
| `created_at` | `timestamptz` | Default: `now()` |
| `is_private` | `boolean` | Visibility flag |

### `mood_entries`

| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | `uuid` | Primary key, auto-generated |
| `user_id` | `text` | References `auth.users` |
| `mood` | `integer` | 1-8 categorical scale |
| `created_at` | `timestamptz` | Default: `now()` |

Ensure RLS is enabled on both tables. Example policy:

```sql
CREATE POLICY "Users can only access their own data"
ON journal_entries
FOR ALL
USING (auth.uid()::text = user_id);
```

---

## Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# Supabase — public, exposed to the browser bundle
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Supabase — server-side only, bypasses RLS; never prefix with NEXT_PUBLIC_
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AI APIs — server-side only
GROQ_API_KEY=your_groq_api_key
HF_TOKEN=your_hugging_face_token
```

> **Warning:** The `SUPABASE_SERVICE_ROLE_KEY` bypasses all Row Level Security policies. It must never be exposed to the client bundle. Use it only within Next.js API routes and Server Actions.

---

## Local Development

**Prerequisites:** Node.js 18+, npm

```bash
# 1. Clone the repository
git clone https://github.com/your-org/lumea-next.git
cd lumea-next

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.local.example .env.local
# Fill in the required values as described above

# 4. Start the development server
npm run dev
```

The application will be available at `http://localhost:3000`.

---

## Deployment (Vercel)

Lumeanext is optimized for deployment on Vercel.

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your_github_repo_url
git push -u origin main
```

### Step 2 — Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import your GitHub repository.
2. In the **Environment Variables** section, add each variable from your `.env.local`:

| Variable | Scope |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side only |
| `GROQ_API_KEY` | Server-side only |
| `HF_TOKEN` | Server-side only |

3. Click **Deploy**.

---

## Safety and Ethics

### Crisis Interception Protocol

The safety engine is the highest-priority layer in the processing pipeline, evaluated before any external API call is dispatched. It maintains an internal dictionary of over 100 high-risk phrases covering explicit self-harm references, expressions of hopelessness, finality indicators, and planning language.

The engine incorporates three interception mechanisms to prevent circumvention:

- **Exact substring matching** — the fastest path for direct keyword detection.
- **Leetspeak normalization** — a custom text normalizer converts obfuscated characters (e.g., `k!ll mys3lf` becomes `kill myself`) before matching.
- **Levenshtein distance fuzzy matching** — implemented via the Wagner-Fischer algorithm, allowing a configurable edit distance (1 typo for words 4+ characters, 2 typos for words 7+ characters) to catch misspellings and intentional evasion.

If a match is detected at any stage, the LLM generation pipeline is immediately terminated and a localized emergency helpline interface is rendered to the user.

**India: 104 (National Health Helpline) | iCall: 9152987821 | Vandrevala Foundation: 1860-2662-345**

### Clinical Disclaimer

Lumeanext is an AI-powered digital companion. It does not provide medical advice, clinical diagnoses, or therapeutic treatment. It is not a substitute for a licensed mental health professional or psychiatrist. Users experiencing a mental health crisis should seek immediate support from a qualified professional or emergency services.

---

## Research Findings

The following outcomes were documented during the evaluation of Lumeanext as part of the published IEEE paper.

### Performance

| Metric | Result |
| :--- | :--- |
| Time to First Token (TTFT) | 310ms (target: under 500ms) |
| Emotion classification accuracy | 80-86% on 150 synthetic queries |
| Safety keyword interception | 100% recall on internal test dictionary |

### Emotion Classification Observations

Highest precision was observed for explicit expressions of **Fear** and **Sadness**. Minor misclassifications occurred primarily between nuanced states — specifically, distinguishing between passive Neutral statements and mild Joy. This accuracy range was sufficient for dynamic prompt tuning without introducing jarring tonal shifts in the LLM output.

### Observational Example

The practical effect of the DistilRoBERTa integration is illustrated by the following simulated high-anxiety prompt:

**User input:** *"I can't do this anymore. The exam is tomorrow, my chest hurts, and I know I'm going to fail no matter how much I study."*

Without emotion context, baseline LLMs typically respond with factual, emotionally detached study advice. In the Lumeanext pipeline, the classification model tagged this input as **Fear/Anxiety (94% confidence)**, adjusting the system prompt constraints:

**System output:** *"I hear you, and it is completely understandable to feel overwhelmed right now. Your chest hurting is a real physical reaction to all this pressure. You don't have to study right this second. Let's just take a moment to breathe. I'm right here with you."*

The adjusted output focuses on grounding techniques rather than task resolution, demonstrating the practical utility of emotion-driven prompt tuning.

---

## Limitations

- **Hallucination risk:** Generative models remain susceptible to producing inaccurate or contextually inappropriate responses. The system is not suitable as a sole clinical intervention.
- **Safety recall gap:** The deterministic keyword scanner relies on explicit textual matches. Nuanced, metaphorical, or indirect expressions of distress that omit hardcoded vocabulary may not be intercepted.
- **Absence of clinical validation:** The system awaits a formal clinical trial. Current usability findings are based on initial evaluator feedback and are not statistically representative.
- **Emotion model scope:** The DistilRoBERTa model classifies into 7 broad categories. Granular or co-occurring emotional states (e.g., anxious-but-hopeful) are reduced to a single dominant label.

---

*Lumeanext — Department of Computer Science and Engineering, Parul University, Vadodara, India.*
*Authors: Bhargav Kikani, Jenil Gandhi, Yash Rank, Viral Nayi. Supervisor: Dr. Deepika Gautam.*
