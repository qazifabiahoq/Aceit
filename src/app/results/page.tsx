import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LabelList } from "recharts"

const chartData = [
  { agent: "Speech", score: 85, fill: "var(--color-speech)" },
  { agent: "Vision", score: 78, fill: "var(--color-vision)" },
  { agent: "Clarity", score: 92, fill: "var(--color-clarity)" },
  { agent: "Pacing", score: 81, fill: "var(--color-pacing)" },
]

const chartConfig = {
  score: {
    label: "Score",
  },
  speech: {
    label: "Speech",
    color: "hsl(var(--chart-2))",
  },
  vision: {
    label: "Vision",
    color: "hsl(var(--chart-3))",
  },
  clarity: {
    label: "Clarity",
    color: "hsl(var(--chart-4))",
  },
  pacing: {
    label: "Pacing",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig

const mockData = {
  overallScore: 84,
  strengths: [
    'Clear and articulate answers.',
    'Good use of the STAR method for behavioral questions.',
    'Maintained strong eye contact and professional posture.',
    'Demonstrated enthusiasm and a positive attitude.',
  ],
  areasForImprovement: [
    'Pace was slightly fast on technical questions. Try to pause briefly.',
    'Could provide more specific metrics when describing achievements.',
    'Occasionally used filler words like "um" and "like".',
  ],
  transcript: `Interviewer: Tell me about yourself.
  You: Certainly. I'm a passionate software engineer with over five years of experience in developing scalable web applications. My journey in tech began with a fascination for building things, which led me to pursue a degree in computer science. At my previous role at TechCorp, I was instrumental in a project that increased user engagement by 15% through the implementation of a new real-time collaboration feature. I'm driven by solving complex problems and I'm excited by the opportunity to contribute to a forward-thinking team like yours.
  Interviewer: What are your biggest strengths?
  You: My biggest strength is my ability to bridge the gap between technical and non-technical stakeholders. I can translate complex technical concepts into understandable terms, which fosters better collaboration and ensures projects align with business goals. For example, I led a series of workshops with the product team that resulted in a 30% reduction in requirement-related rework. I'm also highly proficient in modern JavaScript frameworks and cloud infrastructure.`,
};

export default function ResultsPage() {
  return (
    <div className="container mx-auto max-w-5xl py-12 px-4 md:px-6">
      <div className="space-y-4 text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">Session Results</h1>
        <p className="text-lg md:text-xl text-muted-foreground">
          Here's a summary of your performance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Overall Performance</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex flex-col items-center justify-center">
              <div className="relative h-48 w-48">
                 <svg width="100%" height="100%" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="transparent" stroke="hsl(var(--border))" strokeWidth="10"></circle>
                    <circle cx="50" cy="50" r="45" fill="transparent" stroke="hsl(var(--accent))" strokeWidth="10" strokeDasharray={`calc(${mockData.overallScore} * 2.83) 283`} strokeLinecap="round" transform="rotate(-90 50 50)"></circle>
                 </svg>
                 <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-5xl font-bold">{mockData.overallScore}</span>
                 </div>
              </div>
              <p className="mt-4 text-2xl font-semibold">Excellent</p>
              <p className="text-muted-foreground">You are well-prepared for your next interview.</p>
            </div>
             <div className="w-full flex-1">
                 <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                  <BarChart accessibilityLayer data={chartData} layout="vertical" margin={{ left: 10 }}>
                    <CartesianGrid horizontal={false} />
                    <YAxis dataKey="agent" type="category" tickLine={false} tickMargin={10} axisLine={false} className="text-sm" />
                    <XAxis dataKey="score" type="number" hide />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                    <Bar dataKey="score" radius={5}>
                        <LabelList
                          position="right"
                          offset={8}
                          className="fill-foreground font-semibold"
                          fontSize={12}
                        />
                    </Bar>
                  </BarChart>
                </ChartContainer>
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
                <CardContent>
                    <ul className="space-y-3 list-inside">
                    {mockData.strengths.map((item, index) => (
                        <li key={index} className="flex items-start gap-3">
                           <CheckCircle2 className="h-5 w-5 text-green-500 mt-1 shrink-0" />
                           <span>{item}</span>
                        </li>
                    ))}
                    </ul>
                </CardContent>
            </div>
             <div>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <XCircle className="h-6 w-6 text-red-500" />
                        Areas for Improvement
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-3 list-inside">
                    {mockData.areasForImprovement.map((item, index) => (
                        <li key={index} className="flex items-start gap-3">
                           <XCircle className="h-5 w-5 text-red-500 mt-1 shrink-0" />
                           <span>{item}</span>
                        </li>
                    ))}
                    </ul>
                </CardContent>
            </div>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Full Transcript</CardTitle>
            <CardDescription>
              Review the complete conversation from your session.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-invert max-w-none h-64 overflow-y-auto rounded-md border p-4 bg-muted/50">
              <p className="whitespace-pre-line">{mockData.transcript}</p>
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
