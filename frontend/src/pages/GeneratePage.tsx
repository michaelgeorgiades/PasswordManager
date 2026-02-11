import React, { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/common/Card';
import { PasswordGenerator } from '../components/password/PasswordGenerator';
import { SavePasswordForm } from '../components/password/SavePasswordForm';
import { useNavigate } from 'react-router-dom';

export const GeneratePage: React.FC = () => {
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [customPassword, setCustomPassword] = useState('');
  const [mode, setMode] = useState<'generate' | 'custom'>('generate');
  const navigate = useNavigate();

  const handlePasswordSaved = () => {
    navigate('/dashboard');
  };

  const activePassword = mode === 'generate' ? generatedPassword : customPassword;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Create Shareable Password
        </h1>

        {/* Mode Toggle */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6 max-w-md">
          <button
            onClick={() => setMode('generate')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              mode === 'generate'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Generate Password
          </button>
          <button
            onClick={() => setMode('custom')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              mode === 'custom'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Enter My Own
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Generator or Custom Input */}
          <Card>
            {mode === 'generate' ? (
              <>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Password Generator
                </h2>
                <PasswordGenerator onPasswordGenerated={setGeneratedPassword} />
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Enter Your Password
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Enter the password or secret you want to share securely.
                </p>
                <textarea
                  value={customPassword}
                  onChange={(e) => setCustomPassword(e.target.value)}
                  placeholder="Enter your password or secret text..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </>
            )}
          </Card>

          {/* Save Password */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Save & Share
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Save this password to get a shareable link. You can set expiration
              and access limits.
            </p>
            <SavePasswordForm
              password={activePassword}
              onSaved={handlePasswordSaved}
            />
          </Card>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Card>
            <div className="text-center">
              <div className="text-3xl mb-2">🔐</div>
              <h3 className="font-semibold text-gray-900 mb-1">Secure Encryption</h3>
              <p className="text-sm text-gray-600">
                Passwords are encrypted with AES-256-CBC
              </p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <div className="text-3xl mb-2">⏰</div>
              <h3 className="font-semibold text-gray-900 mb-1">Time-Limited</h3>
              <p className="text-sm text-gray-600">
                Set expiration dates for automatic cleanup
              </p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <div className="text-3xl mb-2">👁️</div>
              <h3 className="font-semibold text-gray-900 mb-1">Access Control</h3>
              <p className="text-sm text-gray-600">
                Limit how many times a password can be viewed
              </p>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};
