'use client';

import { useT, Trans } from 'verbi/runtime';
import { useState } from 'react';

export function ExampleClientComponent() {
  const t = useT();
  const [name, setName] = useState('');

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        <Trans>Client-Side Translation</Trans>
      </h3>

      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Trans>Enter your name</Trans>
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder={t`Type your name...`}
          />
        </div>

        {name && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            {/* This demonstrates runtime translation with variables */}
            <p className="text-blue-800 dark:text-blue-200">
              {t('Hello, {name}! Welcome to Verbi.', { name })}
            </p>
          </div>
        )}

        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <Trans>This component uses client-side hooks for dynamic content</Trans>
          </p>
        </div>
      </div>
    </div>
  );
}