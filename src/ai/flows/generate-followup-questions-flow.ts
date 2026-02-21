'use server';
/**
 * @fileOverview A Genkit flow that generates personalized follow-up interview questions.
 *
 * - generateFollowupQuestions - A function that creates questions based on areas for improvement.
 * - GenerateFollowupQuestionsInput - The input type for the function.
 * - GenerateFollowupQuestionsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFollowupQuestionsInputSchema = z.object({
  transcript: z.string().describe('The full transcript of the interview session.'),
  areasForImprovement: z.array(z.string()).describe('A list of weak areas identified from the session.'),
});
export type GenerateFollowupQuestionsInput = z.infer<typeof GenerateFollowupQuestionsInputSchema>;

const GenerateFollowupQuestionsOutputSchema = z.object({
  questions: z
    .array(z.string())
    .describe('A list of 3 personalized follow-up interview questions designed to address the user\'s weak areas.'),
});
export type GenerateFollowupQuestionsOutput = z.infer<typeof GenerateFollowupQuestionsOutputSchema>;

const generateFollowupQuestionsPrompt = ai.definePrompt({
  name: 'generateFollowupQuestionsPrompt',
  input: {schema: GenerateFollowupQuestionsInputSchema},
  output: {schema: GenerateFollowupQuestionsOutputSchema},
  prompt: `You are an expert AI interview coach. Based on the user's interview transcript and their identified areas for improvement, generate exactly 3 personalized follow-up questions.
These questions should be designed to help the user practice and strengthen their weak points.

Interview Transcript:
{{{transcript}}}

Areas for Improvement:
{{#each areasForImprovement}}
- {{{this}}}
{{/each}}

Generate 3 distinct questions. Ensure your output is a JSON object with a "questions" array containing the three questions.`,
});

const generateFollowupQuestionsFlow = ai.defineFlow(
  {
    name: 'generateFollowupQuestionsFlow',
    inputSchema: GenerateFollowupQuestionsInputSchema,
    outputSchema: GenerateFollowupQuestionsOutputSchema,
  },
  async input => {
    const {output} = await generateFollowupQuestionsPrompt(input);
    if (!output) {
      throw new Error('Failed to generate follow-up questions.');
    }
    // Ensure we return exactly 3 questions
    if (output.questions.length > 3) {
      output.questions = output.questions.slice(0, 3);
    }
    return output;
  }
);

export async function generateFollowupQuestions(
  input: GenerateFollowupQuestionsInput
): Promise<GenerateFollowupQuestionsOutput> {
  return generateFollowupQuestionsFlow(input);
}
