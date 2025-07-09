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
  Settings
} from 'lucide-react';
import { EmailService } from '../services/EmailService';
import { MockEmailProvider } from '../services/providers/MockEmailProvider';
import { EmailMessage, EmailStatus } from '../types';

const emailService = new EmailService([
  new MockEmailProvider('Provider A', 0.7, 200),
  new MockEmailProvider('Provider B', 0.8, 300),
  new MockEmailProvider('Provider C', 0.6, 150)
]);

export default function EmailDemo() {
  const [formData, setFormData] = useState({
    to: '',
    subject: '',
    body: '',
    from: 'noreply@example.com'
  });
  const [emailStatuses, setEmailStatuses] = useState<EmailStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState<any>(null);
  const [circuitBreakerStates, setCircuitBreakerStates] = useState<Map<string, any>>(new Map());
  const [logs, setLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'send' | 'status' | 'monitoring'>('send');

  useEffect(() => {
    const interval = setInterval(updateServiceInfo, 1000);
    return () => clearInterval(interval);
  }, []);

  const updateServiceInfo = async () => {
    const rateLimitInfo = await emailService.getRateLimitInfo();
    const circuitBreakerStates = emailService.getCircuitBreakerStates();
    const logs = emailService.getRecentLogs(20);
    
    setRateLimitInfo(rateLimitInfo);
    setCircuitBreakerStates(circuitBreakerStates);
    setLogs(logs);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const message: EmailMessage = {
        ...formData,
        id: `email-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      };

      const status = await emailService.sendEmail(message);
      setEmailStatuses(prev => [status, ...prev]);
      
      // Reset form
      setFormData(prev => ({
        ...prev,
        to: '',
        subject: '',
        body: ''
      }));
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

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR':
        return 'text-red-500';
      case 'WARN':
        return 'text-yellow-500';
      case 'INFO':
        return 'text-blue-500';
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
              <Mail className="w-12 h-12 text-blue-600 mr-4" />
              <h1 className="text-4xl font-bold text-gray-800">Resilient Email Service</h1>
            </div>
            <p className="text-gray-600 text-lg">
              Production-ready email service with retry logic, fallback, and circuit breakers
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg shadow-sm p-1 flex">
              {[
                { id: 'send', label: 'Send Email', icon: Send },
                { id: 'status', label: 'Email Status', icon: Database },
                { id: 'monitoring', label: 'Monitoring', icon: Activity }
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
                Send Email
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
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Send Email
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Email Status Tab */}
          {activeTab === 'status' && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                <Database className="w-6 h-6 mr-3 text-blue-600" />
                Email Status
              </h2>

              {emailStatuses.length === 0 ? (
                <div className="text-center py-12">
                  <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No emails sent yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {emailStatuses.map((status) => (
                    <div key={status.messageId} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(status.status)}
                          <div>
                            <h3 className="font-medium text-gray-900">{status.originalMessage.subject}</h3>
                            <p className="text-sm text-gray-500">To: {status.originalMessage.to}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {status.createdAt.toLocaleString()}
                          </p>
                          {status.sentAt && (
                            <p className="text-sm text-green-600">
                              Sent: {status.sentAt.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>

                      {status.attempts.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Attempts:</h4>
                          <div className="space-y-2">
                            {status.attempts.map((attempt, index) => (
                              <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                                <div className="flex items-center space-x-2">
                                  {attempt.success ? (
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <XCircle className="w-4 h-4 text-red-500" />
                                  )}
                                  <span className="text-sm font-medium">{attempt.provider}</span>
                                  <span className="text-xs text-gray-500">
                                    Attempt #{attempt.attemptNumber}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-gray-500">
                                    {attempt.timestamp.toLocaleTimeString()}
                                  </p>
                                  {attempt.error && (
                                    <p className="text-xs text-red-600">{attempt.error}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Monitoring Tab */}
          {activeTab === 'monitoring' && (
            <div className="space-y-6">
              {/* Service Health */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                  <Activity className="w-6 h-6 mr-3 text-blue-600" />
                  Service Health
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Rate Limit */}
                  <div className="bg-blue-50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-blue-900">Rate Limit</h3>
                      <Zap className="w-5 h-5 text-blue-600" />
                    </div>
                    {rateLimitInfo && (
                      <div className="space-y-2">
                        <p className="text-sm text-blue-700">
                          Remaining: {rateLimitInfo.remaining}/{rateLimitInfo.limit}
                        </p>
                        <p className="text-xs text-blue-600">
                          Reset: {rateLimitInfo.reset.toLocaleTimeString()}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Circuit Breakers */}
                  <div className="bg-green-50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-green-900">Circuit Breakers</h3>
                      <Shield className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="space-y-2">
                      {Array.from(circuitBreakerStates.entries()).map(([provider, state]) => (
                        <div key={provider} className="flex items-center justify-between">
                          <span className="text-sm text-green-700">{provider}</span>
                          <span className={`text-xs font-medium ${getCircuitBreakerColor(state.state)}`}>
                            {state.state.toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* System Status */}
                  <div className="bg-purple-50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-purple-900">System Status</h3>
                      <Settings className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-purple-700">Providers</span>
                        <span className="text-xs font-medium text-purple-600">3 Active</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-purple-700">Emails Sent</span>
                        <span className="text-xs font-medium text-purple-600">
                          {emailStatuses.filter(s => s.status === 'sent').length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Logs */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                  <AlertCircle className="w-6 h-6 mr-3 text-blue-600" />
                  Recent Logs
                </h2>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {logs.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No logs available</p>
                  ) : (
                    logs.map((log, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded">
                        <span className="text-xs text-gray-500 min-w-0 flex-shrink-0">
                          {log.timestamp.toLocaleTimeString()}
                        </span>
                        <span className={`text-xs font-medium min-w-0 flex-shrink-0 ${getLogLevelColor(log.level)}`}>
                          {log.level}
                        </span>
                        <span className="text-sm text-gray-700 flex-1 min-w-0">
                          {log.message}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}