import {
  BrainCircuit,
  Eye,
  Mic,
  AudioLines,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { placeholderImages } from '@/lib/placeholder-images';

const features = [
  {
    icon: <Mic className="h-8 w-8 text-accent" />,
    title: 'Speech Agent',
    description:
      'Analyzes your answer structure, clarity, and relevance in real time to refine your verbal communication.',
  },
  {
    icon: <Eye className="h-8 w-8 text-accent" />,
    title: 'Vision Agent',
    description:
      'Reads your facial expressions, eye contact, and body language to improve your non-verbal cues.',
  },
  {
    icon: <BrainCircuit className="h-8 w-8 text-accent" />,
    title: 'Coach Agent',
    description:
      'Orchestrates all inputs to determine precise, actionable feedback tailored to your performance.',
  },
  {
    icon: <AudioLines className="h-8 w-8 text-accent" />,
    title: 'Voice Agent',
    description:
      'Delivers coaching feedback naturally through speech, without interrupting your flow or train of thought.',
  },
];

const howItWorks = [
  {
    step: '01',
    title: 'Start Session',
    description:
      'Begin your practice interview with a single click. Our AI will guide you through a series of common interview questions.',
  },
  {
    step: '02',
    title: 'Receive Live Feedback',
    description:
      'As you speak, our agents analyze your communication and provide instant, actionable advice on the screen.',
  },
  {
    step: '03',
    title: 'Review Your Results',
    description:
      'After the session, get a detailed performance report with scores, strengths, and areas for improvement.',
  },
];

const testimonials = [
  {
    quote:
      'AceIt transformed my interview skills. The real-time feedback is a game-changer for anyone looking to build confidence.',
    name: 'Alex Johnson',
    title: 'Product Manager',
    image: placeholderImages[0],
  },
  {
    quote:
      'I felt my confidence skyrocket after just one session. The vision analysis helped me realize I wasn’t making enough eye contact. Highly recommended!',
    name: 'Sarah Lee',
    title: 'Software Engineer',
    image: placeholderImages[1],
  },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      <section className="py-24 md:py-32 lg:py-40 text-center">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter">
              Your Personal AI Interview Coach. Live.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Interview with Confidence. AceIt provides real-time coaching on
              your speech and body language.
            </p>
            <Button asChild size="lg" className="font-semibold">
              <Link href="/session">
                Start Your Session <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="py-16 md:py-24 bg-background/50"
      >
        <div className="container px-4 md:px-6">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div key={index} className="flex flex-col items-start space-y-3">
                {feature.icon}
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="max-w-2xl mx-auto text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter">
              How It Works
            </h2>
            <p className="text-muted-foreground md:text-lg">
              A seamless experience from start to finish.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {howItWorks.map((step) => (
              <div key={step.step} className="flex flex-col space-y-4">
                <span className="text-5xl font-bold text-accent">
                  {step.step}
                </span>
                <h3 className="text-2xl font-bold">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="testimonials"
        className="py-16 md:py-24 bg-background/50"
      >
        <div className="container px-4 md:px-6">
          <div className="max-w-2xl mx-auto text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter">
              Trusted by Professionals
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-card/50">
                <CardContent className="p-6">
                  <blockquote className="text-lg">
                    &ldquo;{testimonial.quote}&rdquo;
                  </blockquote>
                </CardContent>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Image
                      src={testimonial.image.imageUrl}
                      alt={`Photo of ${testimonial.name}`}
                      width={48}
                      height={48}
                      className="rounded-full"
                      data-ai-hint={testimonial.image.imageHint}
                    />
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.title}
                      </p>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32 text-center">
        <div className="container px-4 md:px-6">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter">
              Ready to Ace Your Next Interview?
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground">
              Take the first step towards mastering your communication skills.
            </p>
            <Button asChild size="lg" className="font-semibold">
              <Link href="/session">
                Start a Free Session <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
