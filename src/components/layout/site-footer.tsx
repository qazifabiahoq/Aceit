import { Logo } from '@/components/icons';
import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="container py-8">
        <div className="flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row md:gap-2">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <Logo className="h-6 w-6" />
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              AceIt: Interview with Confidence.
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
             <Link href="#" className="hover:text-foreground">Privacy Policy</Link>
             <Link href="#" className="hover:text-foreground">Terms of Service</Link>
             <Link href="#" className="hover:text-foreground">Contact</Link>
          </div>
          <p className="text-center text-sm text-muted-foreground md:text-left">
            © 2026 AceIt. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
