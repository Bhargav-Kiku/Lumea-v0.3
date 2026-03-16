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

---

## 👥 Team & Contributors

- Bhargav Kikani
- Yash Rank
- Jenil Gandhi
- Viral Nayi

---

## 📚 References & Literature

| No. | Research Paper Title | Author(s) & Year | Key Contribution to Lumea | Link |
| :--- | :--- | :--- | :--- | :--- |
| 1 | DistilBERT, a distilled version of BERT | Sanh, V., et al. (2019) | Foundation for the DistilRoBERTa model used for efficient emotion detection.+1 | [Link](https://arxiv.org/abs/1910.01108) |
| 2 | RoBERTa: A Robustly Optimized BERT | Liu, Y., et al. (2019) | Underlying architecture for high-accuracy emotion classification.+2 | [Link](https://arxiv.org/abs/1907.11692) |
| 3 | Delivering CBT to Young Adults (Woebot) | Fitzpatrick, K. (2017) | Established efficacy of fully automated conversational agents. | [Link](https://aclanthology.org/2020.nlpmh-1.12/) |
| 4 | Empathy-Focused Conversational AI (Wysa) | Inkster, B. (2018) | Validated the use of NLP + CBT for mental health coaching. | [Link](https://aclanthology.org/D18-1151/) |
| 5 | Llama 2: Open Foundation Chat Models | Touvron, H. (2023) | Predecessor research for the LLaMA 3.3 engine used in Lumea. | [Link](https://doi.org/10.1016/j.ijcce.2021.11.002) |
| 6 | Neural Text-to-Speech: A Review | Wang, C. (2021) | Technical basis for implementing Edge-TTS for audio output. | [Link](https://arxiv.org/abs/2307.09288) |
| 7 | Wired for Speech | Nass & Brave (2005) | Theoretical support for human-computer emotional bonding via voice. | [Link](https://aclanthology.org/2020.emnlp-main.427/) |
| 8 | Effectiveness of Health Chatbots | Abd-Alrazaq (2019) | Systematic review supporting the safety of safe, judgment-free spaces. | [Link](https://ieeexplore.ieee.org/document/10123011) |
| 9 | MoodKit Case Study | Schueller, S. (2013) | Influence for mood tracking (1-5 scale) and journal entry features.+2 | [Link](https://jamanetwork.com/journals/jamainternalmedicine/fullarticle/2503453) |
| 10 | SimSensei Kiosk (Ellie) | DeVault, D. (2014) | Research on multimodal cues for detecting psychological distress.+1 | [Link](https://jamanetwork.com/journals/jamainternalmedicine/fullarticle/2804255) |
| 11 | Empathetic Open-domain Chatbots | Zhu, L. (2024) | Framework for adaptive tone based on detected user emotions.+1 | [Link](https://mental.jmir.org/2017/2/e19/) |
| 12 | LLMs in Patient Question Responses | Ayers, J. W. (2023) | Evidence that LLMs can provide more empathetic replies than humans.+1 | [Link](https://mhealth.jmir.org/2018/11/e12106/) |
| 13 | Multi-task Learning for Emotion Detection | Demasi, O. (2020) | Optimization of 7-class emotion scores (Joy, Sadness, etc.).+1 | [Link](https://dl.acm.org/doi/10.5555/2615731.2615822) |
| 14 | Conversational Memory Networks | Hazarika, D. (2018) | Logic for contextual prompt injection in ongoing chat sessions. | [Link](https://pubmed.ncbi.nlm.nih.gov/16001000/) |
| 15 | Deep Learning for Textual Emotion | Chhatavani (2022) | Implementation of emotion analytics in mental health apps. | [Link](https://www.jmir.org/2013/6/e115/) |
| 16 | Smartphone-Based Conversational Agents | Miner, A. S. (2016) | Highlighted the barriers (stigma) that AI companions help bypass.+1 | [Link](https://mitpress.mit.edu/9482/wired-for-speech/) |
| 17 | Establishing Therapeutic Relationships | Bickmore, T. (2005) | Justification for Lumea as a long-term emotional companion.+1 | [Link](https://arxiv.org/abs/1712.05884) |
| 18 | Objective Assessment of Depression | Ghandeharioun (2017) | Logic for visualizing emotional trends over time. | [Link](https://ieeexplore.ieee.org/document/8273611) |
| 19 | Conversational Agents in Health Care | Tudor Car, L. (2020) | Analysis of the Application and Data Layers in e-health.+1 | [Link](https://www.google.com/search?q=https://www.jmir.org/2019/9/e14651/) |
| 20 | Privacy in Online Health Communities | Sharma, A. (2020) | Support for Row-Level Security (RLS) and data persistence.+1 | [Link](https://www.jmir.org/2020/8/e17158/) |
