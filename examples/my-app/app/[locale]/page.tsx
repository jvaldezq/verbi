import { getT } from 'verbi/next/server';
import { ExampleClientComponent } from '@/components/ExampleClientComponent';
import { Counter } from '@/components/Counter';
import { SelectExample } from '@/components/SelectExample';

export default async function HomePage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  const t = await getT(locale);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-white dark:bg-gray-900 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
                {t('Welcome to Verbi Example')}
              </h1>

              <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                {t('AI-powered i18n for Next.js with zero runtime overhead')}
              </p>

              <p className="mt-4 text-gray-600 dark:text-gray-300">
                {t('Build-time translation powered by AI')}
              </p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t('Key Features')}
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {t('AI Translation')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('Use OpenAI, Anthropic, or DeepL for high-quality translations')}
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {t('Zero Runtime')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('All translations happen at build time with smart caching')}
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {t('Type Safe')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('Full TypeScript support with autocomplete and type checking')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Examples */}
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t('Try It Out')}
              </h2>
            </div>

            {/* Client Component Example */}
            <div className="mb-12">
              <ExampleClientComponent />
            </div>

            {/* Counter with Pluralization */}
            <div className="mb-12">
              <Counter />
            </div>

            {/* Select and Gender Example */}
            <div className="mb-12">
              <SelectExample />
            </div>

            {/* Date and Time Example */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {t('Date & Time Formatting')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('Today is {date}', { date: new Date().toLocaleDateString() })}
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              {t('Are you ready to Get Started?')}
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              {t('Add Verbi to your Next.js project in minutes')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://github.com/yourusername/verbi"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 dark:text-blue-700 dark:bg-white dark:hover:bg-gray-100"
              >
                {t('View on GitHub')}
              </a>
              <a
                href="https://npmjs.com/package/verbi"
                className="inline-flex items-center justify-center px-6 py-3 border border-white text-base font-medium rounded-md text-white bg-transparent hover:bg-white hover:text-blue-600"
              >
                {t('Install from npm')}
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}