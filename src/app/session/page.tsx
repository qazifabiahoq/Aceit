'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  Volume2,
  VolumeX,
  Loader2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import { realtimeSpeechAnalysis } from '@/ai/flows/realtime-speech-analysis-flow';
import { realtimeVisionAnalysis } from '@/ai/flows/realtime-vision-analysis-flow';
import { realtimeCoachingFeedback } from '@/ai/flows/realtime-coaching-feedback-flow';

const questions = [
  'Tell me about yourself.',
  'What are your biggest strengths?',
  'What is your greatest weakness?',
  'Where do you see yourself in five years?',
  'Why should we hire you?',
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

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function SessionPage() {
  const [sessionTime, setSessionTime] = useState(0);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [feedbackHistory, setFeedbackHistory] = useState<Feedback[]>([]);
  const [activeAgent, setActiveAgent] = useState('Coach');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const speechRecognitionRef = useRef<any | null>(null);
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isSynthesizingRef = useRef(false);
  const transcriptRef = useRef('');

  const router = useRouter();
  const { toast } = useToast();

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  const speak = useCallback((text: string) => {
    if (isMuted || typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    // Pause mic while AI is speaking to prevent feedback loop
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
    }
    isSynthesizingRef.current = true;
    setIsSynthesizing(true);

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) || voices.find(v => v.lang.startsWith('en-US')) || voices[0];
    if (voice) utterance.voice = voice;
    utterance.pitch = 1;
    utterance.rate = 1;

    utterance.onend = () => {
      // Resume mic after AI stops speaking
      isSynthesizingRef.current = false;
      setIsSynthesizing(false);
      if (speechRecognitionRef.current && isMicOn) {
        try { speechRecognitionRef.current.start(); } catch(e) {}
      }
    };

    window.speechSynthesis.speak(utterance);
  }, [isMuted, isMicOn]);

  const cleanup = useCallback(() => {
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
      speechRecognitionRef.current = null;
    }
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    window.speechSynthesis?.cancel();
  }, []);

  const handleEndSession = useCallback(() => {
    sessionStorage.setItem('transcript', transcriptRef.current);
    sessionStorage.setItem('feedbackHistory', JSON.stringify(feedbackHistory));
    cleanup();
    router.push('/results');
  }, [router, feedbackHistory, cleanup]);

  useEffect(() => {
    async function setupMediaAndRecognition() {
      try {
        // Use echoCancellation to prevent mic picking up speakers
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 44100,
          }
        });
        mediaStreamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasCameraPermission(true);
        setHasMicPermission(true);

        const customQuestion = sessionStorage.getItem('customQuestion');
        if (customQuestion) {
          questions[0] = customQuestion;
          sessionStorage.removeItem('customQuestion');
        }

        setTimeout(() => speak(questions[0]), 500);

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-US';

          recognition.onresult = (event: any) => {
            // Don't capture transcript while AI is speaking
            if (isSynthesizingRef.current) return;

            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
              }
            }
            if (finalTranscript) {
              setTranscript(prev => prev + ' ' + finalTranscript);
              setIsSpeaking(true);
              if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
              silenceTimerRef.current = setTimeout(() => setIsSpeaking(false), 2000);
            }
          };

          recognition.onerror = (event: any) => {
            if (event.error === 'not-allowed') {
              setHasMicPermission(false);
            }
          };

          recognition.onend = () => {
            if (isMicOn && !isSynthesizingRef.current) {
              try { recognition.start(); } catch(e) {}
            }
          };

          speechRecognitionRef.current = recognition;
          recognition.start();
        }

      } catch (error) {
        console.error('Error accessing media devices:', error);
        toast({
          variant: 'destructive',
          title: 'Media Access Denied',
          description: 'Please enable camera and microphone permissions to start.',
        });
        setHasCameraPermission(false);
        setHasMicPermission(false);
      }
    }

    setupMediaAndRecognition();
    return () => cleanup();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const analysisInterval = setInterval(async () => {
      if (isProcessing || !isCameraOn || !videoRef.current || !canvasRef.current || isSynthesizingRef.current) return;

      setIsProcessing(true);
      
      try {
        // Vision Analysis
        let visionAnalysisText = 'No vision data.';
        if (videoRef.current && canvasRef.current) {
          const video = videoRef.current;
          const canvas = canvasRef.current;
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;
          const context = canvas.getContext('2d');
          if (context) {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const frameDataUri = canvas.toDataURL('image/jpeg');
            
            try {
              setActiveAgent('Vision');
              const visionResult = await realtimeVisionAnalysis({ frameDataUri, currentQuestion });
              visionAnalysisText = visionResult.actionableAdvice || visionResult.overallImpression;
              setFeedbackHistory(prev => [...prev, { agent: 'Vision', message: visionAnalysisText }]);
            } catch (visionError) {
              console.error('Vision analysis failed silently:', visionError);
              // Fail silently and continue
            }
          }
        }

        // Speech Analysis
        let speechAnalysisText = 'No new speech to analyze.';
        if (transcriptRef.current.slice(-500).trim()) {
           setActiveAgent('Speech');
           const speechResult = await realtimeSpeechAnalysis({ transcriptSegment: transcriptRef.current.slice(-500), currentQuestion });
           speechAnalysisText = speechResult.clarityFeedback || speechResult.structureFeedback;
           setFeedbackHistory(prev => [...prev, { agent: 'Speech', message: speechAnalysisText }]);
        }

        // Coaching Feedback
        setActiveAgent('Coach');
        const feedbackResult = await realtimeCoachingFeedback({
          currentQuestion,
          speechAnalysis: speechAnalysisText,
          visionAnalysis: visionAnalysisText,
        });

        setFeedbackHistory(prev => [...prev, { agent: 'Coach', message: feedbackResult.feedbackText }]);
        speak(feedbackResult.feedbackText);

      } catch (error) {
        console.error('Main analysis loop error:', error);
      } finally {
        setIsProcessing(false);
      }
    }, 8000);

    analysisIntervalRef.current = analysisInterval;

    return () => {
      if (analysisIntervalRef.current) clearInterval(analysisIntervalRef.current);
    };
  }, [isProcessing, isCameraOn, currentQuestion, speak]);

  useEffect(() => {
    const timer = setInterval(() => setSessionTime((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCameraToggle = () => {
    if (mediaStreamRef.current) {
      const videoTrack = mediaStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isCameraOn;
        setIsCameraOn(!isCameraOn);
      }
    }
  };

  const handleMicToggle = () => {
    if (mediaStreamRef.current) {
      const audioTrack = mediaStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        const newMicState = !isMicOn;
        audioTrack.enabled = newMicState;
        setIsMicOn(newMicState);
        if (newMicState) {
          try { speechRecognitionRef.current?.start(); } catch(e) {}
        } else {
          speechRecognitionRef.current?.stop();
        }
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  if (hasCameraPermission === null || hasMicPermission === null) {
    return (
      <div className="container mx-auto p-4 flex-1 flex items-center justify-center text-center">
        <div>
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Initializing Session...</h1>
          <p className="text-muted-foreground">Requesting camera and microphone access.</p>
        </div>
      </div>
    );
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
          {isSynthesizing && (
            <Badge variant="outline" className="text-sm py-1 px-3 text-purple-400 border-purple-400">
              AI Speaking...
            </Badge>
          )}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setIsMuted(p => !p)} title={isMuted ? "Unmute" : "Mute"}>
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
            <Button variant="outline" size="icon" onClick={handleCameraToggle} disabled={!hasCameraPermission}>
              {isCameraOn ? <Camera className="h-5 w-5" /> : <CameraOff className="h-5 w-5" />}
            </Button>
            <Button variant="outline" size="icon" onClick={handleMicToggle} disabled={!hasMicPermission}>
              {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <PhoneOff className="h-5 w-5" />
                  <span>End Session</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to end the session?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Your session data will be processed to generate your performance report.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleEndSession}>Confirm</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start" style={{ height: 'calc(100vh - 180px)' }}>

        <Card className="h-full w-full flex flex-col">
          <CardContent className="p-2 relative flex-1 flex flex-col">
            <div className="relative flex-1 min-h-[300px]">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover rounded-md bg-background"
              />
              <canvas ref={canvasRef} className="hidden" />

              {(!hasCameraPermission || !isCameraOn) && (
                <div className="absolute inset-0 bg-background border rounded-md flex flex-col items-center justify-center p-4">
                  <CameraOff className="h-16 w-16 text-muted-foreground/50" />
                  {!hasCameraPermission && (
                    <Alert variant="destructive" className="mt-4">
                      <AlertTitle>Camera Access Denied</AlertTitle>
                      <AlertDescription>Please enable camera permissions in your browser settings.</AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-background/50 backdrop-blur-sm p-2 rounded-lg">
                <span className="relative flex h-3 w-3">
                  {isProcessing && <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${agentColors[activeAgent]} opacity-75`}></span>}
                  <span className={`relative inline-flex rounded-full h-3 w-3 ${agentColors[activeAgent]}`}></span>
                </span>
                <span className="text-sm font-medium">
                  {isProcessing ? `${activeAgent} Agent Analyzing...` : `${activeAgent} Agent Active`}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="xl:col-span-2 h-full flex flex-col gap-6">
          <Card className="flex-1 flex flex-col">
            <CardContent className="p-6 flex-1 flex flex-col gap-4">
              <h2 className="text-2xl font-semibold text-accent">{currentQuestion}</h2>
              <div className="flex-1 overflow-y-auto pr-2">
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {transcript || (!hasMicPermission ? "Microphone access is required to see your live transcript." : "Your live transcript will appear here as you speak...")}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="flex-1 flex flex-col">
            <CardContent className="p-6 flex-1 flex flex-col gap-4">
              <h2 className="text-lg font-semibold">Real-time Feedback</h2>
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {feedbackHistory.length > 0 ? (
                  [...feedbackHistory].reverse().map((item, index) => (
                    <Alert key={index}>
                      <div className="flex items-center gap-2">
                        <span className={`p-1.5 rounded-full ${agentColors[item.agent]}`}>
                          {agentIcons[item.agent]}
                        </span>
                        <AlertTitle className="m-0">{item.agent} Agent</AlertTitle>
                      </div>
                      <AlertDescription className="pt-2 pl-9">{item.message}</AlertDescription>
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
