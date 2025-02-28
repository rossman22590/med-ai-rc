// app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from 'sonner';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import Link from 'next/link';
import type { Metadata } from 'next';

import './globals.css';
import { DeployButton } from '@/components/deploy-button';
import { StarButton } from '@/components/star-button';
import Navigation from '@/components/layout/navigation';
import { UserButton } from '@/components/auth/user-button';

// Add this line to make all pages dynamic
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Family Medical Translator',
  description: 'Simplified medical reports and explanations for the whole family',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
        <body>
          {/* Header */}
          <div className="fixed right-0 left-0 w-full top-0 bg-white dark:bg-zinc-950 border-b z-20">
            <div className="flex justify-between items-center p-4">
              <div className="flex flex-row items-center gap-2 shrink-0 ">
                <span className="flex flex-row items-center gap-2 home-links">
                  {/* <Link
                    className="text-zinc-800 dark:text-zinc-100 -translate-y-[.5px]"
                    rel="noopener"
                    target="_blank"
                    href="https://vercel.com/"
                  >
                    <svg
                      data-testid="geist-icon"
                      height={18}
                      strokeLinejoin="round"
                      viewBox="0 0 16 16"
                      width={18}
                      style={{ color: 'currentcolor' }}
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M8 1L16 15H0L8 1Z"
                        fill="currentColor"
                      />
                    </svg>
                  </Link> */}
                  <div className="w-4 text-lg text-center text-zinc-300 dark:text-zinc-600">
                    <svg
                      data-testid="geist-icon"
                      height={16}
                      strokeLinejoin="round"
                      viewBox="0 0 16 16"
                      width={16}
                      style={{ color: 'currentcolor' }}
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M4.01526 15.3939L4.3107 14.7046L10.3107 0.704556L10.6061 0.0151978L11.9849 0.606077L11.6894 1.29544L5.68942 15.2954L5.39398 15.9848L4.01526 15.3939Z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                  <div className="flex flex-row items-center gap-4">
                    <Link className="flex flex-row items-center gap-2" href="/">
                      <div className="flex flex-row items-center gap-2">
                        <div className="text-zinc-800 dark:text-zinc-100">
                          <svg
                            data-testid="geist-icon"
                            height={16}
                            strokeLinejoin="round"
                            viewBox="0 0 16 16"
                            width={16}
                            style={{ color: 'currentcolor' }}
                          >
                            <path
                              d="M2.5 0.5V0H3.5V0.5C3.5 1.60457 4.39543 2.5 5.5 2.5H6V3V3.5H5.5C4.39543 3.5 3.5 4.39543 3.5 5.5V6H3H2.5V5.5C2.5 4.39543 1.60457 3.5 0.5 3.5H0V3V2.5H0.5C1.60457 2.5 2.5 1.60457 2.5 0.5Z"
                              fill="currentColor"
                            />
                            <path
                              d="M14.5 4.5V5H13.5V4.5C13.5 3.94772 13.0523 3.5 12.5 3.5H12V3V2.5H12.5C13.0523 2.5 13.5 2.05228 13.5 1.5V1H14H14.5V1.5C14.5 2.05228 14.9477 2.5 15.5 2.5H16V3V3.5H15.5C14.9477 3.5 14.5 3.94772 14.5 4.5Z"
                              fill="currentColor"
                            />
                            <path
                              d="M8.40706 4.92939L8.5 4H9.5L9.59294 4.92939C9.82973 7.29734 11.7027 9.17027 14.0706 9.40706L15 9.5V10.5L14.0706 10.5929C11.7027 10.8297 9.82973 12.7027 9.59294 15.0706L9.5 16H8.5L8.40706 15.0706C8.17027 12.7027 6.29734 10.8297 3.92939 10.5929L3 10.5V9.5L3.92939 9.40706C6.29734 9.17027 8.17027 7.29734 8.40706 4.92939Z"
                              fill="currentColor"
                            />
                          </svg>
                        </div>
                        <div className="text-lg font-bold text-zinc-800 dark:text-zinc-100">
                          Family Medical{' '}
                          <span className="hidden min-[385px]:inline">
                            Reports
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>
                </span>
              </div>
              <div className="flex flex-row items-center gap-4 shrink-0">
                <UserButton />
                {/* <StarButton />
                <DeployButton /> */}
              </div>
            </div>
          </div>
          
          {/* Navigation Sidebar */}
          <Navigation />
          
          {/* Main Content */}
          <div className="pt-16 md:pl-[60px] lg:pl-[200px] min-h-screen">
            {children}
          </div>
          
          <Toaster position="top-center" />
        </body>
      </html>
    </ClerkProvider>
  );
}
