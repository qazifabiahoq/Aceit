'use server';
/**
 * @fileOverview A Genkit flow that generates a single, relevant follow-up interview question.
 *
 * - generateSingleFollowupQuestion - A function that creates one question based on a user's answer.
 * - GenerateSingleFollowupQuestionInput - The input type for the function.
 * - GenerateSingleFollowupQuestionOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSingleFollowupQuestionInputSchema = z.object({
  originalQuestion: z.string().describe('The interview question that was asked.'),
  userAnswer: z.string().describe("The user's answer to the question."),
});
export type GenerateSingleFollowupQuestionInput = z.infer<typeof GenerateSingleFollowupQuestionInputSchema>;

const GenerateSingleFollowupQuestionOutputSchema = z.object({
  followupQuestion: z
    .string()
    .describe("A single, concise follow-up question that delves deeper into the user's answer."),
});
export type GenerateSingleFollowupQuestionOutput = z.infer<typeof GenerateSingleFollowupQuestionOutputSchema>;

const prompt = ai.definePrompt({
  name: 'generateSingleFollowupQuestionPrompt',
  input: {schema: GenerateSingleFollowupQuestionInputSchema},
  output: {schema: GenerateSingleFollowupQuestionOutputSchema},
  prompt: `You are an expert AI interview coach. The user just answered a question. Your task is to generate ONE concise and relevant follow-up question to probe deeper into their response. The follow-up should be based directly on what they said.

Original Question:
"{{{originalQuestion}}}"

User's Answer:
"{{{userAnswer}}}"

Generate one follow-up question. Do not add any preamble. For example, if the user mentions a project, you could ask "Can you tell me more about the challenges you faced in that project?". If the answer is very short or irrelevant, generate a question that gently steers them back to providing a more detailed response to the original question.
`,
});

const generateSingleFollowupQuestionFlow = ai.defineFlow(
  {
    name: 'generateSingleFollowupQuestionFlow',
    inputSchema: GenerateSingleFollowupQuestionInputSchema,
    outputSchema: GenerateSingleFollowupQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate a follow-up question.');
    }
    return output;
  }
);

export async function generateSingleFollowupQuestion(
  input: GenerateSingleFollowupQuestionInput
): Promise<GenerateSingleFollowupQuestionOutput> {
  return generateSingleFollowupQuestionFlow(input);
}
