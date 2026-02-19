'use server';
/**
 * @fileOverview A Genkit flow that provides a comprehensive summary of an interview session.
 *
 * - sessionPerformanceSummary - A function that handles the generation of the session summary.
 * - SessionPerformanceSummaryInput - The input type for the sessionPerformanceSummary function.
 * - SessionPerformanceSummaryOutput - The return type for the sessionPerformanceSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SessionPerformanceSummaryInputSchema = z.object({
  transcript: z.string().describe('The full transcript of the interview session.'),
});
export type SessionPerformanceSummaryInput = z.infer<typeof SessionPerformanceSummaryInputSchema>;

const SessionPerformanceSummaryOutputSchema = z.object({
  overallScore: z.number().describe('An overall score for the interview performance, out of 100.'),
  strengths: z.array(z.string()).describe('A list of key strengths identified during the interview.'),
  areasForImprovement: z
    .array(z.string())
    .describe('A list of specific areas where the candidate can improve, with actionable advice.'),
  detailedFeedback: z.string().describe('A comprehensive narrative feedback summarizing the session.'),
});
export type SessionPerformanceSummaryOutput = z.infer<typeof SessionPerformanceSummaryOutputSchema>;

export async function sessionPerformanceSummary(
  input: SessionPerformanceSummaryInput
): Promise<SessionPerformanceSummaryOutput> {
  return sessionPerformanceSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'sessionPerformanceSummaryPrompt',
  input: {schema: SessionPerformanceSummaryInputSchema},
  output: {schema: SessionPerformanceSummaryOutputSchema},
  prompt: `You are an expert AI interview coach named AceIt. Your task is to provide a comprehensive summary of an interview session based on the provided transcript.
Analyze the candidate's responses for clarity, relevance, confidence, and overall communication effectiveness. Provide constructive and actionable feedback.

Transcript:
{{{transcript}}}`,
});

const sessionPerformanceSummaryFlow = ai.defineFlow(
  {
    name: 'sessionPerformanceSummaryFlow',
    inputSchema: SessionPerformanceSummaryInputSchema,
    outputSchema: SessionPerformanceSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
