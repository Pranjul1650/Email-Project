import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Mail, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Activity,
  Shield,
  Zap,
  RefreshCw,
  Database,
  Settings,
  Server
} from 'lucide-react';
import { DatabaseEmailService } from '../services/DatabaseEmailService';
import { EmailMessage } from '../types';

const databaseEmailService = new DatabaseEmailService();

export default function DatabaseEmailDemo() {
  const [formData, setFormData] = useState({
    to: '',
    subject: '',
    body: '',
    from: 'noreply@example.com'
  });
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [providerHealth, setProviderHealth] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'send' | 'status' | 'monitoring'>('send');

  useEffect(() => {
    loadEmails();
    loadProviderHealth();
    const interval = setInterval(() => {
      loadProviderHealth();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadEmails = async () => {
    try {
      const emailData = await databaseEmailService.getAllEmails();
      setEmails(emailData);
    } catch (error) {
      console.error('Failed to load emails:', error);
    }
  };

  const loadProviderHealth = async () => {
    try {
      const healthData = await databaseEmailService.getProviderHealth();
      setProviderHealth(healthData);
    } catch (error) {
      console.error('Failed to load provider health:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const message: EmailMessage = {
        ...formData,
        id: `email-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      };

      await databaseEmailService.sendEmail(message);
      
      // Reset form
      setFormData(prev => ({
        ...prev,
        to: '',
        subject: '',
        body: ''
      }));

      // Reload emails
      await loadEmails();
      
      alert('Email sent successfully!');
    } catch (error) {
      console.error('Failed to send email:', error);
      alert(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'retry':
        return <RefreshCw className="w-5 h-5 text-yellow-500 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-blue-500" />;
    }
  };

  const getCircuitBreakerColor = (state: string) => {
    switch (state) {
      case 'closed':
        return 'text-green-500';
      case 'open':
        return 'text-red-500';
      case 'half-open':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Server className="w-12 h-12 text-blue-600 mr-4" />
              <h1 className="text-4xl font-bold text-gray-800">Resilient Email API Service</h1>
            </div>
            <p className="text-gray-600 text-lg">
              Database-powered email service with Supabase backend and API endpoints
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg shadow-sm p-1 flex">
              {[
                { id: 'send', label: 'Send Email', icon: Send },
                { id: 'status', label: 'Email History', icon: Database },
                { id: 'monitoring', label: 'API Monitoring', icon: Activity }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center px-6 py-3 rounded-md transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Send Email Tab */}
          {activeTab === 'send' && (
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                <Send className="w-6 h-6 mr-3 text-blue-600" />
                Send Email via API
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      To Email *
                    </label>
                    <input
                      type="email"
                      name="to"
                      value={formData.to}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="recipient@example.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      From Email
                    </label>
                    <input
                      type="email"
                      name="from"
                      value={formData.from}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Email subject"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    name="body"
                    value={formData.body}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    placeholder="Enter your message here..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      Sending via API...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Send Email via API
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Email History Tab */}
          {activeTab === 'status' && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
                  <Database className="w-6 h-6 mr-3 text-blue-600" />
                  Email History (Database)
                </h2>
                <button
                  onClick={loadEmails}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </button>
              </div>

              {emails.length === 0 ? (
                <div className="text-center py-12">
                  <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No emails found in database</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {emails.map((email) => (
                    <div key={email.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(email.status)}
                          <div>
                            <h3 className="font-medium text-gray-900">{email.subject}</h3>
                            <p className="text-sm text-gray-500">To: {email.to_email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {new Date(email.created_at).toLocaleString()}
                          </p>
                          {email.sent_at && (
                            <p className="text-sm text-green-600">
                              Sent: {new Date(email.sent_at).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>

                      {email.email_attempts && email.email_attempts.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">API Attempts:</h4>
                          <div className="space-y-2">
                            {email.email_attempts.map((attempt: any, index: number) => (
                              <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                                <div className="flex items-center space-x-2">
                                  {attempt.success ? (
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <XCircle className="w-4 h-4 text-red-500" />
                                  )}
                                  <span className="text-sm font-medium">{attempt.provider_name}</span>
                                  <span className="text-xs text-gray-500">
                                    Attempt #{attempt.attempt_number}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-gray-500">
                                    {new Date(attempt.attempted_at).toLocaleTimeString()}
                                  </p>
                                  {attempt.error_message && (
                                    <p className="text-xs text-red-600">{attempt.error_message}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {email.last_error && (
                        <div className="mt-4 p-3 bg-red-50 rounded-lg">
                          <p className="text-sm text-red-700">
                            <strong>Last Error:</strong> {email.last_error}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* API Monitoring Tab */}
          {activeTab === 'monitoring' && (
            <div className="space-y-6">
              {/* API Health */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
                    <Activity className="w-6 h-6 mr-3 text-blue-600" />
                    API Service Health
                  </h2>
                  <button
                    onClick={loadProviderHealth}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </button>
                </div>

                {providerHealth && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Email Statistics */}
                    <div className="bg-blue-50 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-blue-900">Email Statistics (24h)</h3>
                        <Zap className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-blue-700">
                          Total: {providerHealth.emailStats.total}
                        </p>
                        <p className="text-sm text-green-700">
                          Sent: {providerHealth.emailStats.sent}
                        </p>
                        <p className="text-sm text-red-700">
                          Failed: {providerHealth.emailStats.failed}
                        </p>
                        <p className="text-sm text-yellow-700">
                          Pending: {providerHealth.emailStats.pending}
                        </p>
                      </div>
                    </div>

                    {/* Circuit Breakers */}
                    <div className="bg-green-50 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-green-900">Circuit Breakers</h3>
                        <Shield className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="space-y-2">
                        {providerHealth.providerHealth?.map((provider: any) => (
                          <div key={provider.provider_name} className="flex items-center justify-between">
                            <span className="text-sm text-green-700">{provider.provider_name}</span>
                            <span className={`text-xs font-medium ${getCircuitBreakerColor(provider.circuit_breaker_state)}`}>
                              {provider.circuit_breaker_state.toUpperCase()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* API Endpoints */}
                    <div className="bg-purple-50 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-purple-900">API Endpoints</h3>
                        <Settings className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-purple-700">POST /send-email</span>
                          <span className="text-xs font-medium text-green-600">Active</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-purple-700">GET /email-status</span>
                          <span className="text-xs font-medium text-green-600">Active</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-purple-700">GET /provider-health</span>
                          <span className="text-xs font-medium text-green-600">Active</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* API Documentation */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                  <AlertCircle className="w-6 h-6 mr-3 text-blue-600" />
                  API Documentation
                </h2>

                <div className="space-y-6">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">POST /functions/v1/send-email</h3>
                    <p className="text-sm text-gray-600 mb-3">Send an email with retry logic and fallback</p>
                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`{
  "to": "recipient@example.com",
  "subject": "Email Subject",
  "body": "Email content",
  "from": "sender@example.com"
}`}
                    </pre>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">GET /functions/v1/get-email-status</h3>
                    <p className="text-sm text-gray-600 mb-3">Get email status by message ID</p>
                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`GET /functions/v1/get-email-status?messageId=uuid`}
                    </pre>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">GET /functions/v1/get-provider-health</h3>
                    <p className="text-sm text-gray-600 mb-3">Get provider health and circuit breaker status</p>
                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`GET /functions/v1/get-provider-health`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}