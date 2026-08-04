# 🚀 Interview.AI — Tech Stack & AI Configuration

## 🧠 AI Models Used

The project uses the **Hugging Face Inference Router** (`router.huggingface.co`) to dynamically route requests, ensuring high availability and zero downtime if a specific model goes offline. 

The edge function is configured with a prioritized fallback chain of powerful open-source models:

1. **Primary Model:** `meta-llama/Llama-3.1-8B-Instruct` (Meta's LLaMA 3.1)
2. **Fallback 1:** `Qwen/Qwen2.5-72B-Instruct` (Alibaba's Qwen)
3. **Fallback 2:** `mistralai/Mixtral-8x7B-Instruct-v0.1` (Mistral's MoE model)
4. **Fallback 3:** `HuggingFaceH4/zephyr-7b-beta` (Hugging Face's Zephyr)

*If the primary model is busy or rate-limited, the system automatically falls back to the next available model in the list without the user noticing.*

---

## 💻 Tech Stack Overview

### 1. Frontend Architecture
*   **Core:** React 18 with TypeScript
*   **Build Tool:** Vite (Super fast bundling and HMR)
*   **Routing:** React Router v6 (`react-router-dom`)
*   **Data Fetching:** TanStack Query (`@tanstack/react-query`)

### 2. Styling & UI Components
*   **CSS Framework:** Tailwind CSS
*   **Component Library:** shadcn/ui (Built on top of Radix UI primitives)
*   **Icons:** Lucide React
*   **Animations:** Framer Motion (implicitly via shadcn/ui) & Tailwind Animate

### 3. Backend & Database (BaaS)
*   **Platform:** Supabase (Open-source Firebase alternative)
*   **Database:** PostgreSQL (Managed by Supabase)
*   **Authentication:** Supabase Auth (Email/Password)
*   **Serverless Code:** Supabase Edge Functions (Deno-based, runs the AI logic and Email logic)

### 4. External Services & Utilities
*   **Email Delivery:** Brevo (formerly Sendinblue) via their v3 REST API
*   **PDF Generation:** `html2canvas` + `jsPDF` (For exporting results)
*   **Voice/Speech:** Web Speech API (`SpeechRecognition` for speech-to-text, `SpeechSynthesis` for text-to-speech)
*   **Confetti:** `canvas-confetti` (For successful interview completion)

### 5. Deployment
*   **Frontend Hosting:** Render (and/or Vercel, as both configurations exist)
*   **Backend Hosting:** Render (Runs the Express `server.js` fallback backend) 
*   **Edge Functions:** Hosted directly on Supabase's global edge network
