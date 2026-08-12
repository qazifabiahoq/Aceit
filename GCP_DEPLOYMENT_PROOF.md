# Google Cloud Services Deployment Proof — AceIt

This document demonstrates AceIt's use of Google Cloud services and APIs as required by the hackathon submission rules.

---

## 1. Google Agent Development Kit (ADK) — Vertex AI Agents

**File:** [`backend/agent.py`](./backend/agent.py)

AceIt's backend uses the **Google ADK (`google-adk`)** to build a multi-agent AI coaching system on **Vertex AI Agent Builder**. Four specialized `LlmAgent` instances run on `gemini-2.5-flash`:

- `speech_agent` — analyzes spoken answer structure, clarity, and filler words
- `vision_agent` — analyzes facial expressions, eye contact, and body language via camera
- `voice_agent` — monitors tone, pace, and vocal confidence
- `root_agent` (`Coach_Agent`) — orchestrates all three sub-agents to deliver real-time interview coaching

```python
from google.adk.agents import LlmAgent

root_agent = LlmAgent(
  name='Coach_Agent',
  model='gemini-2.5-flash',
  sub_agents=[speech_agent, vision_agent, voice_agent],
  ...
)
```

---

## 2. Google Generative AI SDK — Gemini API

**File:** [`backend/main.py`](./backend/main.py)

The FastAPI backend directly calls the **Gemini 2.5 Flash** model via `google-generativeai` to score interview performance:

```python
import google.generativeai as genai

genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

scoring_model = genai.GenerativeModel(
    model_name="gemini-2.5-flash",
    system_instruction="You are an interview performance evaluator..."
)
```

---

## 3. Google Genkit + Google AI Plugin — Frontend AI Flows

**File:** [`src/ai/genkit.ts`](./src/ai/genkit.ts)

The Next.js frontend uses **Google Genkit** with the `@genkit-ai/google-genai` plugin, routing all AI flows through the Gemini API:

```typescript
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});
```

Seven AI flows run through this instance (see [`src/ai/flows/`](./src/ai/flows/)), including:

- **[`realtime-coaching-feedback-flow.ts`](./src/ai/flows/realtime-coaching-feedback-flow.ts)** — calls `gemini-2.5-flash-preview-tts` for real-time voice coaching audio
- **[`live-speech-transcription-flow.ts`](./src/ai/flows/live-speech-transcription-flow.ts)** — live speech-to-text transcription
- **[`realtime-vision-analysis-flow.ts`](./src/ai/flows/realtime-vision-analysis-flow.ts)** — real-time camera/body language analysis
- **[`session-performance-summary.ts`](./src/ai/flows/session-performance-summary.ts)** — end-of-session performance scoring

---

## 4. Firebase App Hosting — Cloud Run Deployment

**File:** [`apphosting.yaml`](./apphosting.yaml)

The frontend is deployed via **Firebase App Hosting**, which runs the Next.js app on **Google Cloud Run**:

```yaml
runConfig:
  maxInstances: 1
```

---

## GCP Services Summary

| Service | Usage |
|---|---|
| Vertex AI Agent Builder (via Google ADK) | Multi-agent coaching system — `backend/agent.py` |
| Gemini 2.5 Flash (Generative AI API) | Interview scoring + all AI flows |
| Gemini 2.5 Flash TTS | Real-time voice coaching audio |
| Google Genkit (`@genkit-ai/google-genai`) | Frontend AI flow orchestration |
| Firebase App Hosting / Cloud Run | Frontend deployment |
