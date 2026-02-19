'use server';
/**
 * @fileOverview A Genkit flow for live speech transcription during an interview session.
 *
 * - liveSpeechTranscription - A function that handles the transcription of speech from audio input.
 * - LiveSpeechTranscriptionInput - The input type for the liveSpeechTranscription function.
 * - LiveSpeechTranscriptionOutput - The return type for the liveSpeechTranscription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LiveSpeechTranscriptionInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "Audio data as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
});
export type LiveSpeechTranscriptionInput = z.infer<
  typeof LiveSpeechTranscriptionInputSchema
>;

const LiveSpeechTranscriptionOutputSchema = z.object({
  transcript: z.string().describe('The transcribed text from the audio input.'),
});
export type LiveSpeechTranscriptionOutput = z.infer<
  typeof LiveSpeechTranscriptionOutputSchema
>;

const liveSpeechTranscriptionPrompt = ai.definePrompt({
  name: 'liveSpeechTranscriptionPrompt',
  input: {schema: LiveSpeechTranscriptionInputSchema},
  output: {schema: LiveSpeechTranscriptionOutputSchema},
  prompt: `Transcribe the following audio into text. Provide only the transcribed text, without any additional commentary or formatting.
Audio: {{media url=audioDataUri}}`,
});

const liveSpeechTranscriptionFlow = ai.defineFlow(
  {
    name: 'liveSpeechTranscriptionFlow',
    inputSchema: LiveSpeechTranscriptionInputSchema,
    outputSchema: LiveSpeechTranscriptionOutputSchema,
  },
  async input => {
    const {output} = await liveSpeechTranscriptionPrompt(input);
    if (!output) {
      throw new Error('Failed to transcribe audio: no output received.');
    }
    return output;
  }
);

export async function liveSpeechTranscription(
  input: LiveSpeechTranscriptionInput
): Promise<LiveSpeechTranscriptionOutput> {
  return liveSpeechTranscriptionFlow(input);
}
