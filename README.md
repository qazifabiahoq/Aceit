# AceIt: Real-Time AI Interview Coach

> Practice interviews with a real AI coach that listens, watches, and gives feedback as you speak.

Live Demo: https://aceit-iota.vercel.app

GitHub: https://github.com/qazifabiahoq/Aceit

Youtube Video: https://youtu.be/yxKx4Rj3uOc?si=khc4Eb64bKpUQvz-

---

## The Problem

Every year millions of qualified candidates fail job interviews not because of lack of skill, but because of poor communication, weak delivery, and no access to quality coaching. Traditional interview prep is passive: read a guide, watch a video, hope for the best. There is no real feedback, no accountability, and no personalization.

AceIt changes that. It gives every job seeker access to a personal AI interview coach that coaches them in real time, just like a human coach would.

---

## What AceIt Does

AceIt runs a live mock interview session where the user speaks their answers out loud. While the user talks, four specialized AI agents analyze the session simultaneously and deliver spoken, real-time coaching feedback after each answer.

At the end of the session the user receives a full performance report with an overall score, individual scores for Speech, Vision, Clarity, and Pacing, key strengths, areas for improvement, and a full transcript of the session.

---

## System Architecture

```
+---------------------------+
|        User Browser       |
|  (Camera + Microphone)    |
+------------+--------------+
             |
             v
+---------------------------+
|   Frontend: Next.js App   |
|   Built in Firebase Studio|
|   Deployed on Vercel      |
|                           |
|  - Session Page           |
|  - Results Page           |
|  - Web Speech API         |
|    (live transcription)   |
+------+------------+-------+
       |            |
       |            v
       |   +-------------------+
       |   |  Genkit AI Flows  |
       |   |  (runs on Vercel) |
       |   |                   |
       |   | - Speech Flow     |
       |   | - Vision Flow     |
       |   | - Coach Flow      |
       |   | - Followup Flow   |
       |   +--------+----------+
       |            |
       |            v
       |   +----------------------------+
       |   |   Google Vertex AI         |
       |   |   Agent Builder            |
       |   |                            |
       |   |  [Speech Agent]            |
       |   |   Analyzes clarity,        |
       |   |   pacing, structure        |
       |   |                            |
       |   |  [Vision Agent]            |
       |   |   Analyzes body language,  |
       |   |   eye contact, posture     |
       |   |   via camera frame         |
       |   |                            |
       |   |  [Coach Agent]             |
       |   |   Combines speech +        |
       |   |   vision into one          |
       |   |   coaching message         |
       |   |                            |
       |   |  [Voice Agent]             |
       |   |   Handles follow-up        |
       |   |   question generation      |
       |   |                            |
       |   |  Powered by                |
       |   |  Gemini 2.5 Flash          |
       |   +----------------------------+
       |
       v
+---------------------------+
|  Backend: Python FastAPI  |
|  Deployed on Render       |
|                           |
|  POST /coach              |
|   Real-time coaching      |
|                           |
|  POST /score              |
|   Session scoring and     |
|   performance report      |
+---------------------------+
```

---

## How the Four Agents Work

**Speech Agent** listens to the user's transcript and evaluates clarity, filler words, sentence structure, and relevance to the question being asked. It delivers actionable feedback like "Your answer lacked a clear opening. Start with a direct statement."

**Vision Agent** captures a frame from the user's camera every session cycle and analyzes body language, eye contact, facial expression, and posture. It gives feedback like "Maintain steady eye contact with the camera to project confidence."

**Coach Agent** receives the output from both the Speech Agent and Vision Agent and synthesizes them into a single, prioritized coaching message that is spoken aloud to the user through the browser.

**Voice Agent** generates a personalized follow-up question based on the user's actual answer, making the session feel like a real two-way interview rather than a fixed quiz. After two follow-up questions per topic, it moves to the next main interview question.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, TypeScript, Tailwind CSS |
| AI Flows | Google Genkit |
| AI Models | Google Gemini 2.5 Flash |
| Agent Platform | Google Vertex AI Agent Builder |
| Backend | Python, FastAPI |
| Speech Transcription | Web Speech API (browser native) |
| Frontend Hosting | Vercel (free tier) |
| Backend Hosting | Render (free tier) |
| Development Environment | Firebase Studio |

---

## How to Run Locally

**Frontend**

```bash
git clone https://github.com/qazifabiahoq/Aceit
cd Aceit
npm install
```

Create a `.env.local` file:

```
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_BACKEND_URL=https://aceit-91y1.onrender.com
```

```bash
npm run dev
```

**Backend**

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Create a `.env` file in the backend folder:

```
GEMINI_API_KEY=your_gemini_api_key
```

---

## Business Value

The global online education and career coaching market is worth over $300 billion. Interview coaching alone costs anywhere from $100 to $500 per hour with a human coach. AceIt delivers the same caliber of real-time, personalized coaching at zero cost to the user, making quality interview preparation accessible to everyone regardless of budget or location.

---

## Built For

Google Gemini Live Agent Challenge 2026
