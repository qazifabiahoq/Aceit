'use server';
/**
 * @fileOverview A Genkit flow for real-time speech analysis, providing feedback on clarity, structure, and relevance.
 *
 * - realtimeSpeechAnalysis - A function that handles the speech analysis process.
 * - RealtimeSpeechAnalysisInput - The input type for the realtimeSpeechAnalysis function.
 * - RealtimeSpeechAnalysisOutput - The return type for the realtimeSpeechAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RealtimeSpeechAnalysisInputSchema = z.object({
  transcriptSegment: z.string().describe('A segment of the user\'s transcribed speech for analysis.'),
  currentQuestion: z.string().optional().describe('The current interview question, if available, to assess relevance.'),
});
export type RealtimeSpeechAnalysisInput = z.infer<typeof RealtimeSpeechAnalysisInputSchema>;

const RealtimeSpeechAnalysisOutputSchema = z.object({
  clarityFeedback: z.string().describe('Feedback on the clarity of the speech, e.g., "Your speech was very clear." or "Consider articulating more precisely."'),
  structureFeedback: z.string().describe('Feedback on the structure of the speech, e.g., "Well-structured answer with a clear point." or "Your response felt a bit rambling; try to organize your thoughts."'),
  relevanceFeedback: z.string().describe('Feedback on the relevance of the speech to the current question, e.g., "Your answer was highly relevant to the question." or "While interesting, your point seemed to drift from the main question."'),
  actionableSuggestions: z.array(z.string()).describe('A list of actionable suggestions for immediate improvement.'),
});
export type RealtimeSpeechAnalysisOutput = z.infer<typeof RealtimeSpeechAnalysisOutputSchema>;

const realtimeSpeechAnalysisPrompt = ai.definePrompt({
  name: 'realtimeSpeechAnalysisPrompt',
  input: {schema: RealtimeSpeechAnalysisInputSchema},
  output: {schema: RealtimeSpeechAnalysisOutputSchema},
  prompt: `You are an expert AI interview coach specializing in real-time speech analysis.
Your goal is to provide constructive feedback on a user's speech segment, focusing on clarity, structure, and relevance to an interview question.
Analyze the provided 'transcriptSegment' and give precise, actionable feedback.

Current Interview Question: {{{currentQuestion}}}

User Speech Segment:
{{{transcriptSegment}}}

Provide feedback based on the following criteria:
- Clarity: Is the speech easy to understand? Are words articulated well?
- Structure: Does the response have a logical flow? Is there a clear beginning, middle, and end to the thought?
- Relevance: Does the response directly address the 'currentQuestion' (if provided)?

The feedback should be concise and designed for real-time delivery. Provide specific actionable suggestions for improvement.
Ensure your output strictly adheres to the JSON schema provided.`,
});

const realtimeSpeechAnalysisFlow = ai.defineFlow(
  {
    name: 'realtimeSpeechAnalysisFlow',
    inputSchema: RealtimeSpeechAnalysisInputSchema,
    outputSchema: RealtimeSpeechAnalysisOutputSchema,
  },
  async (input) => {
    const {output} = await realtimeSpeechAnalysisPrompt(input);
    if (!output) {
      throw new Error('Real-time speech analysis failed to produce output.');
    }
    return output;
  }
);

export async function realtimeSpeechAnalysis(input: RealtimeSpeechAnalysisInput): Promise<RealtimeSpeechAnalysisOutput> {
  return realtimeSpeechAnalysisFlow(input);
}
