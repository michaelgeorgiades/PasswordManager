import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { CopyButton } from '../components/password/CopyButton';
import { api } from '../services/api';
import { PasswordListItem } from '@passwordpal/shared';
import toast from 'react-hot-toast';

export const DashboardPage: React.FC = () => {
  const [passwords, setPasswords] = useState<PasswordListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPasswords();
  }, [page]);

  const fetchPasswords = async () => {
    try {
      setLoading(true);
      const response = await api.listPasswords(page, 20);
      setPasswords(response.data);
      setTotalPages(response.totalPages);
    } catch (error) {
      toast.error('Failed to load passwords');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (guid: string) => {
    if (!confirm('Are you sure you want to delete this password?')) {
      return;
    }

    try {
      await api.deletePassword(guid);
      toast.success('Password deleted successfully');
      fetchPasswords();
    } catch (error) {
      toast.error('Failed to delete password');
    }
  };

  const isExpired = (expiresAt?: Date) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const isAccessLimitReached = (password: PasswordListItem) => {
    if (!password.max_access_count) return false;
    return password.current_access_count >= password.max_access_count;
  };

  if (loading && passwords.length === 0) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Passwords</h1>
          <Link to="/generate">
            <Button>+ New Password</Button>
          </Link>
        </div>

        {passwords.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-5xl mb-4">🔐</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No passwords yet
            </h2>
            <p className="text-gray-600 mb-6">
              Generate and save your first secure password
            </p>
            <Link to="/generate">
              <Button>Generate Password</Button>
            </Link>
          </Card>
        ) : (
          <>
            <div className="space-y-4">
              {passwords.map((password) => (
                <Card key={password.id} padding={false}>
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {password.title || 'Untitled Password'}
                        </h3>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center space-x-4">
                            <span>
                              📅 Created: {new Date(password.created_at).toLocaleDateString()}
                            </span>
                            {password.expires_at && (
                              <span className={isExpired(password.expires_at) ? 'text-red-600' : ''}>
                                ⏰ Expires: {new Date(password.expires_at).toLocaleDateString()}
                                {isExpired(password.expires_at) && ' (Expired)'}
                              </span>
                            )}
                          </div>
                          {password.max_access_count && (
                            <div>
                              👁️ Accesses: {password.current_access_count} / {password.max_access_count}
                              {isAccessLimitReached(password) && (
                                <span className="ml-2 text-red-600">(Limit reached)</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <CopyButton text={password.shareable_link} />
                        <Link to={`/retrieve/${password.guid}`} target="_blank">
                          <Button variant="secondary" size="sm">
                            View
                          </Button>
                        </Link>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(password.guid)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>

                    {/* Shareable Link */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500 font-medium">Link:</span>
                        <input
                          type="text"
                          value={password.shareable_link}
                          readOnly
                          className="flex-1 text-xs bg-gray-50 border border-gray-300 rounded px-2 py-1 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-6">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};
