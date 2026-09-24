import React from 'react';
import { X, Sparkles, Bell, Check, Info } from 'lucide-react';
import { NotificationItem } from '../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-[#0D1E36] border border-slate-700 rounded-3xl p-5 text-slate-100 shadow-2xl relative mt-12 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-orange-400" />
            <h3 className="text-sm font-bold text-white">Notifications de la Cabine</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action bar */}
        <div className="py-2 flex justify-between items-center text-[11px] text-slate-400 border-b border-slate-800/60">
          <span>{notifications.filter(n => !n.read).length} non lues</span>
          <button
            onClick={onMarkAllAsRead}
            className="text-orange-400 hover:underline cursor-pointer"
          >
            Tout marquer comme lu
          </button>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto no-scrollbar py-2 space-y-2 flex-1">
          {notifications.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-2xl border text-xs transition ${
                item.read
                  ? 'bg-[#11233D]/60 border-slate-800 text-slate-400'
                  : 'bg-[#11233D] border-orange-500/40 text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between font-semibold text-white mb-1">
                <span className="flex items-center gap-1.5">
                  {item.type === 'trial' ? (
                    <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                  ) : (
                    <Info className="w-3.5 h-3.5 text-blue-400" />
                  )}
                  {item.title}
                </span>
                <span className="text-[10px] text-slate-400 font-normal">{item.time}</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-300">{item.message}</p>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-white font-medium transition cursor-pointer"
        >
          Fermer
        </button>
      </div>
    </div>
  );
};
