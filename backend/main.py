import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai

# Import the agents from agent.py
from agent import speech_agent, vision_agent, voice_agent, root_agent

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

# Keep a simple model for scoring only
scoring_model = genai.GenerativeModel(
    model_name="gemini-2.5-flash",
    system_instruction="""You are an interview performance evaluator. 
    Analyze the interview transcript and feedback history and return accurate scores."""
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
    return {"status": "AceIt backend running", "version": "2.0", "agents": "connected"}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/api/warmup")
def warmup():
    return {"status": "ok"}

@app.post("/coach")
async def get_coaching(request: CoachRequest):
    try:
        # Build the prompt for the root Coach Agent
        prompt = f"""
        The user was asked this interview question: "{request.question}"
        
        Their spoken answer: "{request.transcript}"
        
        Vision observations from camera: "{request.vision_notes}"
        
        As the Coach Agent, coordinate with your Speech Agent, Vision Agent, and Voice Agent sub-agents to analyze this response.
        
        Provide brief, actionable coaching feedback in 2-3 sentences max.
        Focus on the single most important improvement the user should make.
        Be encouraging and speak directly to the user.
        """
        
        # Call the root Coach Agent which orchestrates Speech, Vision, Voice agents
        response = await root_agent.run_async(prompt)
        feedback_text = str(response)
        
        return {"feedback": feedback_text}
    except Exception as e:
        # Fallback to direct Gemini if agent fails
        try:
            fallback_model = genai.GenerativeModel(model_name="gemini-2.5-flash")
            fallback_prompt = f'The user answered "{request.question}" with: "{request.transcript}". Give 2-3 sentences of actionable interview coaching feedback.'
            fallback_response = fallback_model.generate_content(fallback_prompt)
            return {"feedback": fallback_response.text}
        except Exception as fallback_error:
            raise HTTPException(status_code=500, detail=str(fallback_error))

@app.post("/score")
async def get_scores(request: ScoreRequest):
    try:
        # Use Speech Agent to analyze the full transcript
        speech_prompt = f"""
        Analyze this full interview transcript for speech quality: "{request.transcript}"
        Rate speech clarity, structure, and relevance out of 100.
        """
        
        # Use Vision Agent observations from feedback history
        vision_feedback = [f for f in request.feedback_history if f.get('agent') == 'Vision']
        speech_feedback = [f for f in request.feedback_history if f.get('agent') == 'Speech']
        
        # Use scoring model to generate final scores based on all agent feedback
        prompt = f"""
        Based on this interview transcript: "{request.transcript}"
        
        Speech Agent observations: {json.dumps(speech_feedback)}
        Vision Agent observations: {json.dumps(vision_feedback)}
        All feedback history: {json.dumps(request.feedback_history)}
        
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
        response = scoring_model.generate_content(prompt)
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