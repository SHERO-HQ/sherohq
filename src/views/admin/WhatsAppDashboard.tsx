'use client';

import React, { useState, useEffect } from 'react';
import WhatsAppConversations from '@/components/admin/WhatsAppConversations';

interface DashboardTab {
  id: string;
  label: string;
  icon?: string;
}

export default function WhatsAppDashboard() {
  const [activeTab, setActiveTab] = useState('conversations');

  const tabs: DashboardTab[] = [
    { id: 'conversations', label: 'Conversations', icon: '💬' },
    { id: 'support', label: 'Support Tickets', icon: '🎫' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                WhatsApp Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Manage customer conversations and support tickets
              </p>
            </div>
            <div className="text-4xl">💚</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-t border-gray-200">
          <nav className="flex space-x-1 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.icon && <span className="mr-2">{tab.icon}</span>}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto">
        {activeTab === 'conversations' && <WhatsAppConversations />}

        {activeTab === 'support' && (
          <div className="p-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <p className="text-gray-500">Support tickets feature coming soon...</p>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="p-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <p className="text-gray-500">Analytics dashboard coming soon...</p>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="p-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                WhatsApp Settings
              </h2>
              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-4">
                  <p className="text-sm text-gray-600">
                    <strong>Webhook URL:</strong>{' '}
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {typeof window !== 'undefined'
                        ? `${window.location.origin}/api/webhooks/whatsapp`
                        : '/api/webhooks/whatsapp'}
                    </code>
                  </p>
                </div>
                <div className="border-b border-gray-200 pb-4">
                  <p className="text-sm text-gray-600">
                    <strong>Webhook Status:</strong>{' '}
                    <span className="text-green-600 font-medium">
                      ✓ Configured
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    <strong>Auto-Reply:</strong> Enabled
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
