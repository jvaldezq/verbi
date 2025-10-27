import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getMessages } from 'verbi/next/server';
import { VerbiProvider } from '@/components/VerbiClientProvider';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'es' },
  ];
}

export const metadata: Metadata = {
  title: "Verbi Example - AI-powered i18n",
  description: "Example app demonstrating Verbi internationalization",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages(locale);

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <VerbiProvider locale={locale} messages={messages}>
          <div className="min-h-screen">
            <header className="border-b bg-white dark:bg-gray-900">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                  <h1 className="text-xl font-semibold">Verbi Example</h1>
                  <LanguageSwitcher currentLocale={locale} />
                </div>
              </div>
            </header>
            {children}
          </div>
        </VerbiProvider>
      </body>
    </html>
  );
}