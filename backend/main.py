import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = genai.GenerativeModel(
    model_name="gemini-2.5-flash",
    system_instruction="""You are the lead AI interview coach for AceIt, a real-time interview coaching platform. 
    AceIt helps job seekers practice and improve their interview skills by providing live feedback on their speech, 
    body language, and delivery. You have three specialized sub-agents:
    - Speech Agent: analyzes answer content, structure and clarity
    - Vision Agent: analyzes facial expressions, eye contact and body language
    - Voice Agent: monitors tone, pace and confidence of delivery
    
    Synthesize all feedback and deliver clear, encouraging, and actionable coaching.
    Keep feedback concise, specific, and constructive. Never overwhelm the user.
    Prioritize the most impactful improvement. Speak directly in second person.
    Be encouraging but honest."""
)

class CoachRequest(BaseModel):
    transcript: str
    question: str
    vision_notes: str = ""

class ScoreRequest(BaseModel):
    transcript: str
    feedback_history: list

@app.get("/")
def health_check():
    return {"status": "AceIt backend running", "version": "1.0"}

@app.post("/coach")
async def get_coaching(request: CoachRequest):
    try:
        prompt = f"""
        The user was asked: "{request.question}"
        Their answer transcript: "{request.transcript}"
        Vision observations: "{request.vision_notes}"
        
        Provide brief, actionable coaching feedback in 2-3 sentences max.
        Focus on the most important improvement.
        """
        response = model.generate_content(prompt)
        return {"feedback": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/score")
async def get_scores(request: ScoreRequest):
    try:
        prompt = f"""
        Based on this interview transcript: "{request.transcript}"
        And this feedback history: {json.dumps(request.feedback_history)}
        
        Return ONLY a JSON object with these exact fields, no other text:
        {{
            "overall": <number 0-100>,
            "speech": <number 0-100>,
            "vision": <number 0-100>,
            "clarity": <number 0-100>,
            "pacing": <number 0-100>,
            "strengths": ["strength1", "strength2", "strength3"],
            "improvements": ["improvement1", "improvement2", "improvement3"]
        }}
        """
        response = model.generate_content(prompt)
        text = response.text.strip()
        if "```" in text:
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        scores = json.loads(text)
        return scores
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)
