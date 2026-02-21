'use client';

import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, ArrowRight, Brain, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  generateFollowupQuestions,
  GenerateFollowupQuestionsOutput,
} from '@/ai/flows/generate-followup-questions-flow';
import { useRouter } from 'next/navigation';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

type ScoreData = {
  overall: number;
  speech: number;
  vision: number;
  clarity: number;
  pacing: number;
  strengths: string[];
  improvements: string[];
};

export default function ResultsPage() {
  const [scores, setScores] = useState<ScoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [followupQuestions, setFollowupQuestions] =
    useState<GenerateFollowupQuestionsOutput | null>(null);
  const [loadingFollowup, setLoadingFollowup] = useState(false);
  const [transcript, setTranscript] = useState('');
  const router = useRouter();

  useEffect(() => {
    const sessionTranscript = sessionStorage.getItem('transcript') || '';
    setTranscript(sessionTranscript);

    const fetchScores = async () => {
      if (!backendUrl) {
        setError('Backend not connected yet. Please set NEXT_PUBLIC_BACKEND_URL.');
        setLoading(false);
        return;
      }

      const feedbackHistoryStr = sessionStorage.getItem('feedbackHistory');
      const feedbackHistory = feedbackHistoryStr ? JSON.parse(feedbackHistoryStr) : [];

      if (!sessionTranscript && feedbackHistory.length === 0) {
        setError('No session data found. Please complete a session first.');
        setLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`${backendUrl}/score`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transcript: sessionTranscript, feedback_history: feedbackHistory }),
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch scores: ${response.statusText}`);
        }

        const data: ScoreData = await response.json();
        setScores(data);

        if (data.improvements && data.improvements.length > 0) {
          setLoadingFollowup(true);
          try {
              const followupResult = await generateFollowupQuestions({
                  transcript: sessionTranscript,
                  areasForImprovement: data.improvements,
              });
              setFollowupQuestions(followupResult);
          } catch (e) {
              console.error('Failed to generate followup questions:', e);
          } finally {
              setLoadingFollowup(false);
          }
        }
      } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError('An unknown error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, []);

  const getPerformanceMessage = (score: number) => {
    if (score >= 90) return { text: 'Outstanding!', subtext: 'You are exceptionally well-prepared.' };
    if (score >= 80) return { text: 'Excellent', subtext: 'You are well-prepared for your next interview.' };
    if (score >= 70) return { text: 'Good', subtext: 'Solid performance with a few areas to polish.' };
    if (score >= 60) return { text: 'Fair', subtext: 'A good starting point. Focus on the improvement areas.' };
    return { text: 'Needs Improvement', subtext: 'Keep practicing to build your confidence and skills.' };
  };

  const handlePracticeQuestion = (question: string) => {
    sessionStorage.setItem('customQuestion', question);
    router.push('/session');
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-5xl py-12 px-4 md:px-6 text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
        <h1 className="text-2xl font-bold">Generating Your Report...</h1>
        <p className="text-muted-foreground">Please wait while we analyze your session data.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-5xl py-12 px-4 md:px-6 text-center">
        <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-red-500">An Error Occurred</h1>
        <p className="text-muted-foreground">{error}</p>
        <Button asChild className="mt-6">
            <Link href="/session">
                Start New Session <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
        </Button>
      </div>
    );
  }

  if (!scores) {
     return (
      <div className="container mx-auto max-w-5xl py-12 px-4 md:px-6 text-center">
        <h1 className="text-2xl font-bold">Waiting for session data...</h1>
        <p className="text-muted-foreground">Please complete an interview session to see your results.</p>
         <Button asChild className="mt-6">
            <Link href="/session">
                Start New Session <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
        </Button>
      </div>
    );
  }

  const performanceMessage = getPerformanceMessage(scores.overall);

  const chartData = [
    { agent: "Speech", score: scores.speech },
    { agent: "Vision", score: scores.vision },
    { agent: "Clarity", score: scores.clarity },
    { agent: "Pacing", score: scores.pacing },
  ];

  return (
    <div className="container mx-auto max-w-5xl py-12 px-4 md:px-6">
      <div className="space-y-4 text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">Session Results</h1>
        <p className="text-lg md:text-xl text-muted-foreground">
          Here&apos;s a summary of your performance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Overall Performance</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row items-center gap-8 p-6">
            <div className="flex flex-col items-center justify-center">
              <div className="relative h-48 w-48">
                 <svg width="100%" height="100%" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="transparent" stroke="hsl(var(--border))" strokeWidth="10"></circle>
                    <circle cx="50" cy="50" r="45" fill="transparent" stroke="hsl(var(--accent))" strokeWidth="10" strokeDasharray={`calc(${scores.overall} * 2.83) 283`} strokeLinecap="round" transform="rotate(-90 50 50)"></circle>
                 </svg>
                 <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-5xl font-bold">{scores.overall}</span>
                 </div>
              </div>
              <p className="mt-4 text-2xl font-semibold">{performanceMessage.text}</p>
              <p className="text-muted-foreground">{performanceMessage.subtext}</p>
            </div>
            <div className="w-full flex-1 space-y-4">
              {chartData.map((item) => (
                <div key={item.agent} className="flex items-center gap-4">
                  <span className="w-20 text-sm text-muted-foreground">{item.agent}</span>
                  <div className="flex-1 bg-muted rounded-full h-4">
                    <div
                      className="bg-accent h-4 rounded-full transition-all duration-500"
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                  <span className="w-8 text-sm font-semibold">{item.score}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2">
            <div className="border-b md:border-b-0 md:border-r">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                        Key Strengths
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    {scores.strengths.length > 0 ? (
                        <ul className="space-y-3 list-inside">
                        {scores.strengths.map((item, index) => (
                            <li key={index} className="flex items-start gap-3">
                               <CheckCircle2 className="h-5 w-5 text-green-500 mt-1 shrink-0" />
                               <span>{item}</span>
                            </li>
                        ))}
                        </ul>
                    ) : (
                        <p className="text-muted-foreground">No specific strengths identified yet. Keep practicing!</p>
                    )}
                </CardContent>
            </div>
             <div>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <XCircle className="h-6 w-6 text-red-500" />
                        Areas for Improvement
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    {scores.improvements.length > 0 ? (
                        <ul className="space-y-3 list-inside">
                        {scores.improvements.map((item, index) => (
                            <li key={index} className="flex items-start gap-3">
                               <XCircle className="h-5 w-5 text-red-500 mt-1 shrink-0" />
                               <span>{item}</span>
                            </li>
                        ))}
                        </ul>
                    ) : (
                         <p className="text-muted-foreground">No specific improvement areas identified. Great job!</p>
                    )}
                </CardContent>
            </div>
        </Card>
        
        {loadingFollowup ? (
             <Card className="lg:col-span-3">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Brain className="h-6 w-6" />
                        Recommended Next Questions
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                   <p className="text-muted-foreground">Generating personalized questions based on your performance...</p>
                   <Loader2 className="h-6 w-6 animate-spin" />
                </CardContent>
            </Card>
        ) : followupQuestions && followupQuestions.questions.length > 0 && (
             <Card className="lg:col-span-3">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Brain className="h-6 w-6" />
                        Recommended Next Questions
                    </CardTitle>
                    <CardDescription>Practice these to address your areas for improvement.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {followupQuestions.questions.map((q, index) => (
                        <Card key={index} className="bg-muted/50 p-4 flex flex-col justify-between">
                            <p className="font-semibold mb-4">&quot;{q}&quot;</p>
                            <Button size="sm" onClick={() => handlePracticeQuestion(q)}>
                                Practice This Question
                            </Button>
                        </Card>
                    ))}
                </CardContent>
            </Card>
        )}

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Full Transcript</CardTitle>
            <CardDescription>
              Review the complete conversation from your session.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="prose prose-invert max-w-none h-64 overflow-y-auto rounded-md border p-4 bg-muted/50">
              <p className="whitespace-pre-line">{transcript || 'No transcript available.'}</p>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-3 text-center mt-8">
            <Button asChild size="lg">
                <Link href="/session">
                    Start New Session <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
            </Button>
        </div>
      </div>
    </div>
  );
}