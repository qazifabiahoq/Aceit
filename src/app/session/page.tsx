'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  PhoneOff,
  BrainCircuit,
  Eye,
  AudioLines,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const questions = [
  "Tell me about yourself.",
  "What are your biggest strengths?",
  "What is your greatest weakness?",
  "Where do you see yourself in five years?",
  "Why should we hire you?",
];

const agentIcons: { [key: string]: React.ReactNode } = {
  Speech: <Mic className="h-4 w-4" />,
  Vision: <Eye className="h-4 w-4" />,
  Coach: <BrainCircuit className="h-4 w-4" />,
  Voice: <AudioLines className="h-4 w-4" />,
};

const agentColors: { [key: string]: string } = {
  Speech: 'bg-sky-500',
  Vision: 'bg-green-500',
  Coach: 'bg-purple-500',
  Voice: 'bg-amber-500',
};

type Feedback = {
  agent: string;
  message: string;
};

export default function SessionPage() {
  const [sessionTime, setSessionTime] = useState(0);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [activeAgent, setActiveAgent] = useState('Coach');
  const [isMounted, setIsMounted] = useState(false);
  
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  
  const handleEndSession = useCallback(() => {
    // In a real app, you would save session data here
    router.push('/results');
  }, [router]);


  useEffect(() => {
    const feedbackInterval = setInterval(() => {
      const agents = ['Speech', 'Vision', 'Coach'];
      const agent = agents[Math.floor(Math.random() * agents.length)];
      const messages = {
          Speech: "Your pace is good, keep it up.",
          Vision: "Great eye contact. You appear confident.",
          Coach: "Try to structure your next answer using the STAR method."
      };
      setFeedback(prev => [...prev, { agent, message: (messages as any)[agent] }]);
      setActiveAgent(agent);
    }, 8000);

    const transcriptInterval = setInterval(() => {
        setTranscript(prev => prev + " and that's how I approached the problem using a data-driven mindset to achieve a positive outcome. ")
    }, 5000);
    
    return () => {
        clearInterval(feedbackInterval);
        clearInterval(transcriptInterval);
    }
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const handleCameraToggle = () => {
    setIsCameraOn(prev => !prev);
    toast({
        title: `Camera ${!isCameraOn ? 'enabled' : 'disabled'}`,
        description: `Your camera has been ${!isCameraOn ? 'turned on' : 'turned off'}.`,
    })
  }

  const handleMicToggle = () => {
    setIsMicOn(prev => !prev);
    toast({
        title: `Microphone ${!isMicOn ? 'enabled' : 'disabled'}`,
        description: `Your microphone has been ${!isMicOn ? 'turned on' : 'turned off'}.`,
    })
  }
  
  if (!isMounted) {
    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8 flex-1">
            <div className="flex justify-between items-center mb-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-8 w-24" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
                <Skeleton className="h-full w-full" />
                <Skeleton className="h-full w-full lg:col-span-2" />
            </div>
        </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 flex-1">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <h1 className="text-xl md:text-2xl font-bold">
          Question {currentQuestionIndex + 1}/{questions.length}
        </h1>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-lg py-1 px-3">
            {formatTime(sessionTime)}
          </Badge>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handleCameraToggle}>
              {isCameraOn ? <Camera className="h-5 w-5" /> : <CameraOff className="h-5 w-5" />}
            </Button>
            <Button variant="outline" size="icon" onClick={handleMicToggle}>
              {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </Button>
            <Button variant="destructive" size="icon" onClick={handleEndSession}>
              <PhoneOff className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start" style={{height: 'calc(100vh - 180px)'}}>
        
        {/* Left Column: Camera Feed */}
        <Card className="h-full w-full flex flex-col">
            <CardContent className="p-2 relative flex-1">
                {isCameraOn ? (
                    <div className="w-full h-full bg-muted rounded-md flex items-center justify-center">
                        <Camera className="h-16 w-16 text-muted-foreground/50"/>
                    </div>
                ) : (
                    <div className="w-full h-full bg-background border rounded-md flex flex-col items-center justify-center">
                        <CameraOff className="h-16 w-16 text-muted-foreground/50"/>
                        <p className="mt-4 text-muted-foreground">Camera is off</p>
                    </div>
                )}
                 <div className="absolute bottom-4 left-4 flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${agentColors[activeAgent]} opacity-75`}></span>
                        <span className={`relative inline-flex rounded-full h-3 w-3 ${agentColors[activeAgent]}`}></span>
                    </span>
                    <span className="text-sm font-medium">
                        {activeAgent} Agent Active
                    </span>
                </div>
            </CardContent>
        </Card>

        {/* Center & Right Column Wrapper */}
        <div className="xl:col-span-2 h-full flex flex-col gap-6">
            <Card className="flex-1 flex flex-col">
                <CardContent className="p-6 flex-1 flex flex-col gap-4">
                    <h2 className="text-2xl font-semibold text-accent">{questions[currentQuestionIndex]}</h2>
                    <div className="flex-1 overflow-y-auto pr-2">
                         <p className="text-muted-foreground leading-relaxed">
                            {transcript || "Your live transcript will appear here as you speak..."}
                         </p>
                    </div>
                </CardContent>
            </Card>

            <Card className="flex-1 flex flex-col">
                 <CardContent className="p-6 flex-1 flex flex-col gap-4">
                    <h2 className="text-lg font-semibold">Real-time Feedback</h2>
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                        {feedback.length > 0 ? (
                            feedback.map((item, index) => (
                                <Alert key={index}>
                                    <div className="flex items-center gap-2">
                                        <span className={`p-1.5 rounded-full ${agentColors[item.agent]}`}>
                                            {agentIcons[item.agent]}
                                        </span>
                                        <AlertTitle className="m-0">{item.agent} Agent</AlertTitle>
                                    </div>
                                    <AlertDescription className="pt-2 pl-9">
                                        {item.message}
                                    </AlertDescription>
                                </Alert>
                            ))
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-muted-foreground">Feedback from AI agents will appear here.</p>
                            </div>
                        )}
                    </div>
                 </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
