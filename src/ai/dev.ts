import { config } from 'dotenv';
config();

import '@/ai/flows/session-performance-summary.ts';
import '@/ai/flows/live-speech-transcription-flow.ts';
import '@/ai/flows/realtime-speech-analysis-flow.ts';
import '@/ai/flows/realtime-coaching-feedback-flow.ts';
import '@/ai/flows/realtime-vision-analysis-flow.ts';
import '@/ai/flows/generate-followup-questions-flow.ts';
import '@/ai/flows/generate-single-followup-question-flow.ts';
