'use client';

import { useState } from 'react';
import { useT, usePlural, Trans } from 'verbi/runtime';

export function Counter() {
  const t = useT();
  const plural = usePlural();
  const [count, setCount] = useState(0);

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        <Trans>Pluralization Demo</Trans>
      </h3>

      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => setCount(Math.max(0, count - 1))}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          {t`Decrease`}
        </button>

        <span className="text-2xl font-bold text-gray-900 dark:text-white min-w-[3rem] text-center">
          {count}
        </span>

        <button
          onClick={() => setCount(count + 1)}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          {t`Increase`}
        </button>
      </div>

      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
        {/* Using the new plural function */}
        <p className="text-blue-800 dark:text-blue-200">
          {plural(count, {
            zero: 'Your cart is empty',
            one: 'You have # item in your cart',
            other: 'You have # items in your cart'
          })}
        </p>
      </div>

      <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-md">
        {/* Alternative using the t function for translated pluralization */}
        <p className="text-purple-800 dark:text-purple-200">
          {t('{count, plural, =0 {No items} one {# item} other {# items}}', { count })}
        </p>
      </div>

      <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-md">
        {/* Another example with more complex pluralization */}
        <p className="text-green-800 dark:text-green-200">
          {plural(count, {
            zero: 'No messages',
            one: '# new message',
            other: '# new messages'
          })}
        </p>
      </div>

      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <p><Trans>Try clicking the buttons to see how pluralization works</Trans></p>
      </div>
    </div>
  );
}