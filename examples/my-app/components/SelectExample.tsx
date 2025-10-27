'use client';

import { useState } from 'react';
import { useT, useSelect, useGender, Trans } from 'verbi/runtime';

export function SelectExample() {
  const t = useT();
  const select = useSelect();
  const gender = useGender();
  const [selectedGender, setSelectedGender] = useState<'male' | 'female' | 'neutral'>('male');
  const [userType, setUserType] = useState<'admin' | 'user' | 'guest'>('user');

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        <Trans>Select & Gender Demo</Trans>
      </h3>

      {/* Gender Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Trans>Select a gender</Trans>
        </label>
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setSelectedGender('male')}
            className={`px-3 py-1 rounded ${
              selectedGender === 'male'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            {t`Male`}
          </button>
          <button
            onClick={() => setSelectedGender('female')}
            className={`px-3 py-1 rounded ${
              selectedGender === 'female'
                ? 'bg-pink-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            {t`Female`}
          </button>
          <button
            onClick={() => setSelectedGender('neutral')}
            className={`px-3 py-1 rounded ${
              selectedGender === 'neutral'
                ? 'bg-purple-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            {t`Neutral`}
          </button>
        </div>
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
          <p className="text-blue-800 dark:text-blue-200">
            {gender(selectedGender, {
              male: 'He is a software engineer',
              female: 'She is a software engineer',
              neutral: 'They are a software engineer',
              other: 'They are a software engineer'
            })}
          </p>
        </div>
      </div>

      {/* User Type Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Trans>Select user type</Trans>
        </label>
        <select
          value={userType}
          onChange={(e) => setUserType(e.target.value as any)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4"
        >
          <option value="admin">Admin</option>
          <option value="user">User</option>
          <option value="guest">Guest</option>
        </select>
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-md">
          <p className="text-green-800 dark:text-green-200">
            {select(userType, {
              admin: 'You have full access to all features',
              user: 'You have access to standard features',
              guest: 'You have limited access',
              other: 'Unknown access level'
            })}
          </p>
        </div>
      </div>

      {/* Combined Example */}
      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-md">
        <p className="text-purple-800 dark:text-purple-200 font-semibold mb-2">
          <Trans>Combined Example</Trans>
        </p>
        <p className="text-purple-700 dark:text-purple-300">
          {gender(selectedGender, {
            male: `Welcome back, sir! ${select(userType, {
              admin: 'Your admin dashboard is ready.',
              user: 'Your workspace is ready.',
              guest: 'Please sign in for full access.',
              other: ''
            })}`,
            female: `Welcome back, ma'am! ${select(userType, {
              admin: 'Your admin dashboard is ready.',
              user: 'Your workspace is ready.',
              guest: 'Please sign in for full access.',
              other: ''
            })}`,
            neutral: `Welcome back! ${select(userType, {
              admin: 'Your admin dashboard is ready.',
              user: 'Your workspace is ready.',
              guest: 'Please sign in for full access.',
              other: ''
            })}`,
            other: 'Welcome back!'
          })}
        </p>
      </div>
    </div>
  );
}