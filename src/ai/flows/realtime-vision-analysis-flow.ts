'use server';
/**
 * @fileOverview A Genkit flow for real-time vision analysis during an interview.
 * This file defines the AI agent responsible for analyzing non-verbal cues from video frames.
 *
 * - realtimeVisionAnalysis - A function that handles the vision analysis process.
 * - RealtimeVisionAnalysisInput - The input type for the realtimeVisionAnalysis function.
 * - RealtimeVisionAnalysisOutput - The return type for the realtimeVisionAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// 1. Input Schema
const RealtimeVisionAnalysisInputSchema = z.object({
  frameDataUri: z
    .string()
    .describe(
      "A single video frame, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  currentQuestion: z
    .string()
    .optional()
    .describe('The current interview question, providing context for the analysis.'),
});
export type RealtimeVisionAnalysisInput = z.infer<
  typeof RealtimeVisionAnalysisInputSchema
>;

// 2. Output Schema
const RealtimeVisionAnalysisOutputSchema = z.object({
  overallImpression: z
    .string()
    .describe('A brief summary of the current non-verbal communication, e.g., "Good overall presentation."'),
  facialExpressionFeedback: z
    .string()
    .describe('Detailed feedback on facial expressions, e.g., "Maintain a confident and engaged expression."'),
  eyeContactFeedback: z
    .string()
    .describe('Detailed feedback on eye contact, e.g., "You are maintaining excellent eye contact."'),
  bodyLanguageFeedback: z
    .string()
    .describe('Detailed feedback on body language and posture, e.g., "Your posture is open and inviting."'),
  actionableAdvice: z
    .string()
    .describe('A concise, actionable tip for immediate improvement, e.g., "Remember to smile naturally."'),
});
export type RealtimeVisionAnalysisOutput = z.infer<
  typeof RealtimeVisionAnalysisOutputSchema
>;

// 3. Prompt Definition
const visionAnalysisPrompt = ai.definePrompt({
  name: 'visionAnalysisPrompt',
  input: {schema: RealtimeVisionAnalysisInputSchema},
  output: {schema: RealtimeVisionAnalysisOutputSchema},
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
  prompt: `You are an AI Vision Agent for AceIt, a professional interview coaching platform. Your role is to analyze non-verbal cues from a video frame of an interviewee and provide real-time, actionable feedback.
Focus specifically on facial expressions, eye contact, and overall body language.

The user is currently being interviewed, and the current question they are addressing is: "{{{currentQuestion}}}". If no question is provided, assume general interview context.

Provide your feedback in a structured JSON format, adhering strictly to the provided output schema. Your response must be professional, constructive, and directly address the non-verbal communication observed.

Analyze the following video frame: {{media url=frameDataUri}}`,
});

// 4. Flow Definition
const realtimeVisionAnalysisFlow = ai.defineFlow(
  {
    name: 'realtimeVisionAnalysisFlow',
    inputSchema: RealtimeVisionAnalysisInputSchema,
    outputSchema: RealtimeVisionAnalysisOutputSchema,
  },
  async (input) => {
    const {output} = await visionAnalysisPrompt(input);
    if (!output) {
      throw new Error('Vision analysis prompt returned no output.');
    }
    return output;
  }
);

// 5. Wrapper Function
export async function realtimeVisionAnalysis(
  input: RealtimeVisionAnalysisInput
): Promise<RealtimeVisionAnalysisOutput> {
  return realtimeVisionAnalysisFlow(input);
}
