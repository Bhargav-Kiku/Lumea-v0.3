# Lumea - System Architecture & Diagrams 📐

This document provides a visual and structural overview of the **Lumea** AI Mental Health Companion, detailing user interactions, data streaming cycles, and component layering.

---

## 👥 1. Use Case Diagram
Describes how a user interacts with the various functional modules of the application.

```mermaid
flowchart TD
    User([User 👤])
    
    subgraph Lumea_App [Lumea Application]
        direction TB
        UC1((🔐 Authenticate))
        UC2((🏠 View Dashboard))
        UC3((💬 Empathic Chat))
        UC4((📊 Log & Track Mood))
        UC5((📓 Journal Entry))
        UC6((☀️ Theme Toggle))
    end
    
    User --> UC1
    User --> UC2
    User --> UC3
    User --> UC4
    User --> UC5
    User --> UC6
```

---

## 🔄 2. Data Flow Diagram (DFD)
Tracks the flow of information from user input through processing streams down to persistent databases.

```mermaid
flowchart LR
    User([User]) -->|1. Message / Mood| App[Streamlit App]
    
    subgraph Processing_Layer [Processing & Analytics]
        direction TB
        App -->|2a. Validate Limit| RL[Rate Limiter]
        App -->|2b. Check Safety| SF[Safety Utility]
        App -->|2c. Analyze Text| HF[Hugging Face API]
        HF -->|3. Emotion Return| App
        App -->|4. Text + Context| Groq[Groq API]
        Groq -->|5. Stream Response Chunks| App
        App -->|6. Convert Audio| TTS[Edge-TTS]
    end
    
    subgraph Data_Layer [Data Persistence]
        App -->|7. Save History| DB[(Supabase Database)]
    end
    
    TTS -.->|Audio Stream| User
    App -->|Visual Insights| User
```

---

## 🏛️ 3. Layered System Architecture
Highlights the decomposition of application boundaries from client frameworks to data layers.

```mermaid
flowchart TD
    subgraph Client_Layer [Client Layer]
        Browser[Web Browser]
        CSS[Floating dark/light Theme CSS]
    end

    subgraph Application_Layer ["Application Layer (Streamlit)"]
        direction TB
        Router[Router App.py]
        Views[Views / Subpages]
        Components[Shared Layouts / Sidebar]
        Utils[Utils / Rate Limits]
        
        Router --> Views
        Views --> Components
        Views --> Utils
    end

    subgraph Service_Layer [External AI Node APIs]
        Groq_API[Groq API \n Llama 3.3]
        HF_API[Hugging Face API \n DistilRoBERTa Emotion]
        TTS_API[Edge-TTS Node]
    end

    subgraph Database_Layer ["Database Layer (Supabase)"]
        Auth[Supabase Auth Services]
        Table_Profiles[(Profiles)]
        Table_Moods[(Mood_Entries)]
        Table_Logs[(Journal_Entries)]
        Table_Sessions[(Chat_Sessions)]
        Table_Messages[(Chat_Messages)]
    end

    %% Connectors
    Browser <--> Router
    Views <--> Service_Layer
    Router <--> Auth
    Utils <--> Database_Layer
```

---

## 🧩 4. Core Logic Flows

### 💬 Chat Workflow Loop
1. **Input**: User sends statement.
2. **Safety Check**: Immediate interrupt verifies input against `utils/safety.py` imminent self-harm phrasing bounds matching.
3. **Analysis**: Prompt pushes triggers via `DistilRoBERTa` vectors classifying buffers explicitly (e.g., *Sadness 85%*).
4. **Condition Injection**: Static frames append emotional buffers to Groq headers elegantly.
5. **Rendering / Alerting**: 
    - **Safe pass**: Message streams real-time with ambient AI routing.
    - **Trigger pass**: Dialogue holds/suppresses response streams and forces injection of accessible localized support cards to emergency Indian Helplines.
6. **Datalake Sync**: Context pushes into `chat_history` SQL buffers consistently.
