import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { RetrievePasswordResponse } from '@passwordpal/shared';
import { Card } from '../components/common/Card';
import { CopyButton } from '../components/password/CopyButton';
import toast from 'react-hot-toast';

export const RetrievePage: React.FC = () => {
  const { guid } = useParams<{ guid: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [passwordData, setPasswordData] = useState<RetrievePasswordResponse | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (guid) {
      fetchPassword();
    }
  }, [guid]);

  const fetchPassword = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.retrievePassword(guid!);
      setPasswordData(data);
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Failed to retrieve password';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading password...</p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <div className="text-5xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Unable to Retrieve Password
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            to="/"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Go to Homepage
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Password Pal
          </h1>
          <p className="text-gray-600">Secure password retrieval</p>
        </div>

        {/* Password Card */}
        <Card>
          {passwordData?.title && (
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {passwordData.title}
              </h2>
            </div>
          )}

          {/* Password Display */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="flex items-center space-x-2">
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordData?.password || ''}
                readOnly
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg font-mono text-lg focus:outline-none"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="px-4 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
              <CopyButton text={passwordData?.password || ''} />
            </div>
          </div>

          {/* Metadata */}
          <div className="space-y-3 text-sm">
            {passwordData?.expires_at && (
              <div className="flex items-start space-x-2 text-gray-600">
                <span>⏰</span>
                <div>
                  <strong>Expires:</strong>{' '}
                  {new Date(passwordData.expires_at).toLocaleString()}
                </div>
              </div>
            )}

            {passwordData?.max_access_count && (
              <div className="flex items-start space-x-2 text-gray-600">
                <span>👁️</span>
                <div>
                  <strong>Accesses:</strong> {passwordData.current_access_count} /{' '}
                  {passwordData.max_access_count}
                  {passwordData.remaining_accesses !== undefined && (
                    <span className="ml-2 text-orange-600">
                      ({passwordData.remaining_accesses} remaining)
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-start space-x-2 text-gray-600">
              <span>📅</span>
              <div>
                <strong>Created:</strong>{' '}
                {new Date(passwordData?.created_at || '').toLocaleString()}
              </div>
            </div>
          </div>

          {/* Warning if limited */}
          {(passwordData?.remaining_accesses !== undefined &&
            passwordData.remaining_accesses <= 3) && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>Warning:</strong> This password can only be accessed{' '}
                {passwordData.remaining_accesses} more time(s) before it becomes
                unavailable.
              </p>
            </div>
          )}
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Create your own secure password
          </Link>
        </div>
      </div>
    </div>
  );
};
