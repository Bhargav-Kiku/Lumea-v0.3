# Lumea - AI Mental Health Companion 🌙

**Lumea** is an empathetic, supportive, and compassionate AI-powered mental health companion designed to provide a safe, judgment-free space for users to express themselves, track their emotional well-being, and reflect on their journey.

---

## 📐 System Architecture & Diagrams

For detailed visual representations of the system, including **Use Case Diagrams**, **Data Flow (DFD)**, and **Layered Components**, please refer to the [System Architecture Documentation](ARCHITECTURE.md).

---

## 🚀 Tech Stack

### Frontend & UI Framework
- **[Streamlit](https://streamlit.io/)**: Powers the modular web application interface with responsive layout and interactive elements.
- **Custom CSS**: Dynamic stylesheets (`assets/style_light.css` & `assets/style_dark.css`) for immersive dark/light modes and floating theme toggles.

### Backend & AI Analytics
- **Python**: Core application logic and API orchestration.
- **[Groq API](https://groq.com/)**: Executes real-time conversation utilizing streaming text generations powered by high-performance models like `Llama 3`.
- **[Hugging Face Inference API](https://huggingface.co/)**: Employs absolute state-of-the-art classifier pipelines for deep emotion recognition.
- **[Edge-TTS](https://github.com/rany2/edge-tts)**: Generates soothing, high-fidelity emotional audio output directly from chat transcripts through warm neural-voice profiles.

### Database & Storage
- **[Supabase](https://supabase.com/)**: Handles authentication structures alongside relationary row-level security algorithms with real-time relational setups inside secure UUID boundaries for chat histories/mood metrics storage.

---

## 🧠 Core Algorithms

### 1. Emotion Analytics (DistilRoBERTa)
Lumea analyzes the underlying raw sentiment of human-entered text by feeding triggers through Hugging Face’s `j-hartmann/emotion-english-distilroberta-base`.
- **Mapping Scale**: Categorizes response arrays explicitly into 7 core matrices:
  - 😊 Joy | 😢 Sadness | 😠 Anger | 😨 Fear | 😲 Surprise | 🤢 Disgust | 😐 Neutral
- **Process**: Scores are converted directly to percentage scales and utilized dynamically as environmental contexts to tweak general response frequencies elegantly.

### 2. Contextual System-Prompt Override
Groq responses dynamically reshape with specific dynamic injection prompts tailored directly to detected input emotion buffers:
```python
system_prompt += f"\n[System Context: User input detected as {current_emotion}. Acknowledge implicitly adjusting tone to higher supportive thresholds.]"
```
This ensures AI tone mirrors exact emotional waves authentically without hard-setting rigid boundaries.

### 3. Progressive Session Rate Limiting
To ensure lightweight buffer compliance thresholds, rate limiters reset daily inside absolute local stream checkpoints:
- **Baseline Algorithm**: Increments message counters on successful loads up to **100 loops per 24 hours**. Checkpoint verifies absolute dates flips before overriding safety thresholds securely.

### 4. Self-Harm Mitigation & Response Interruption
To guarantee user safety, explicit phrasing related to self-harm triggers local interception flows **before** executing AI responses:
- **Safety Checker**: Utilizing strict substring matching (`is_self_harm_risk` from `utils/safety.py`), user statements are scanned for imminent triggers.
- **Support Intervention**: If risk is detected, Lumea suppresses generation of AI dialogue and forces visual injection of styled UI cards carrying emergency fallback routing to localized Indian helplines (**Vandrevala Foundation**, **AASRA**, & **Kiran**) that operate 24x7.

---

## 🗄️ Database Architecture (Supabase API)

Since Lumea communicates directly via streaming state logic inside Streamlit frames, standard endpoints integrate natively using securely routed database handles or absolute table indexes.

### Core Relational Indexes

#### 📂 `profiles`
Tracks user personalization parameters.
| Attribute | Type | Detail |
| :--- | :--- | :--- |
| `id` | UUID | Primary Index (v4) |
| `user_id` | UUID | Auth Reference |
| `username` | TEXT | Unique Handle |
| `bio` | TEXT | Description Profile |

#### 📊 `mood_entries`
Stores temporal mood datasets for visual analytics.
| Attribute | Type | Detail |
| :--- | :--- | :--- |
| `mood` | INTEGER | scale 1-5 (😢 to 😄) |
| `note` | TEXT | Optional context |
| `tags` | TEXT | e.g., work, social |

#### 📓 `journal_entries`
Private narrative recordings.
| Attribute | Type | Detail |
| :--- | :--- | :--- |
| `title` | TEXT | Entry Topic |
| `content` | TEXT | Absolute Reflection Log |
| `is_private`| BOOLEAN| Setup Access boundaries |

#### 📂 `chat_sessions`
Tracks active dialogue cycles.
| Attribute | Type | Detail |
| :--- | :--- | :--- |
| `id` | UUID | Primary Index |
| `user_id` | UUID | Auth Reference |
| `title` | TEXT | Conversation Summary Title |

#### 💬 `chat_messages`
Linked nodes of chat responses.
| Attribute | Type | Detail |
| :--- | :--- | :--- |
| `id` | UUID | Primary Index |
| `session_id`| UUID | Session Node Parent |
| `role` | TEXT | 'user' or 'assistant' |
| `content` | TEXT | Absolute Message Text |
| `emotion` | TEXT | Analysed Sentiment (Optional) |
| `score` | NUMERIC| Confidence Score % |

---

## 🛠️ Setup & Installation

**Prerequisites**:
1. Python 3.9+
2. Valid API credentials for **Groq**, **Supabase**, and **Hugging Face**.

### 1. Configure Environment variables
Duplicate `.env.example` directly for accurate routing variables config mapping sets inside system scopes:
```bash
cp .env.example .env
```

### 2. Required variables layout
Make sure keys aren't generic:
```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key

# Django Secret Key (Legacy)
SECRET_KEY=your_django_secret_key

# Database (PostgreSQL from Supabase)
DATABASE_URL=postgresql://postgres:your_password@db.your_project.supabase.co:5432/postgres

# AI APIs
GROQ_API_KEY=your_groq_api_key_here
HF_TOKEN=your_huggingface_inference_token_here
```

### 3. Boot execution sequences
Instantiate Streamlit bounds using terminal prompts:
```powershell
pip install -r requirements.txt
streamlit run app.py
```
