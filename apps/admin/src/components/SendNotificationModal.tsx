'use client';

import React, { useState } from 'react';
import { X, Bell, Send, CheckCircle2 } from 'lucide-react';
import { opsApi } from '@/lib/api';

interface SendNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SendNotificationModal({ isOpen, onClose }: SendNotificationModalProps) {
  const [target, setTarget] = useState<'COOKS' | 'CUSTOMERS' | 'ALL'>('COOKS');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setIsSubmitting(true);
    await opsApi.broadcastNotification(title, message, target);
    setIsSubmitting(false);
    setSentSuccess(true);

    setTimeout(() => {
      setSentSuccess(false);
      setTitle('');
      setMessage('');
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-[22px] w-full max-w-lg p-6 shadow-2xl border border-gray-100 relative">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Broadcast Notification</h3>
              <p className="text-xs text-gray-500">Send high-priority push dispatch to Bengaluru fleet</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {sentSuccess ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#059669] flex items-center justify-center mb-3">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-gray-900">Broadcast Dispatched!</h4>
            <p className="text-sm text-gray-600 max-w-xs mt-1">
              Sent to active {target.toLowerCase()} in Bengaluru Metro.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Recipient Audience
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'COOKS', label: '🍳 Active Cooks' },
                  { id: 'CUSTOMERS', label: '👥 Customers' },
                  { id: 'ALL', label: '🌐 Everyone' },
                ].map((aud) => (
                  <button
                    key={aud.id}
                    type="button"
                    onClick={() => setTarget(aud.id as any)}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                      target === aud.id
                        ? 'bg-[#059669] text-white border-[#059669] shadow-sm'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {aud.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Notification Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Surge Alert: High demand in Koramangala & HSR"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent text-gray-900 placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Message Body
              </label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter alert message details, incentives, or weather notice..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent text-gray-900 placeholder-gray-400 resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#059669] hover:bg-[#047857] text-white flex items-center gap-2 shadow-md shadow-emerald-900/20 disabled:opacity-50 transition-all"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? 'Sending...' : 'Dispatch Alert'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
