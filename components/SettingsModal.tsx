import React, { useState, useEffect } from 'react';
import { X, Save, MessageCircle, Bell } from 'lucide-react';
import { AISettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: AISettings) => void;
  currentSettings: AISettings;
  onInstallApp?: () => void; // New prop for PWA install
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, currentSettings, onInstallApp }) => {
  const [settings, setSettings] = useState<AISettings>(currentSettings);

  useEffect(() => {
    setSettings(currentSettings);
  }, [currentSettings, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(settings);
    onClose();
  };

  const reminderOptions = [
    { value: 0, label: 'Без напоминания' },
    { value: 5, label: 'За 5 минут' },
    { value: 15, label: 'За 15 минут' },
    { value: 30, label: 'За 30 минут' },
    { value: 60, label: 'За 1 час' },
    { value: 1440, label: 'За 1 день' },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/20 dark:bg-black/50 backdrop-blur-sm animate-fade-in-up">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-gray-700 transform transition-all max-h-[90vh] overflow-y-auto scrollbar-hide">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Настройки</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500 dark:text-gray-400">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          {/* AI Settings Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-4 bg-indigo-500 rounded-full" />
              <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Настройки AI</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Провайдер</label>
              <div className="grid grid-cols-3 gap-2">
                {(['google', 'algion', 'openrouter'] as const).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setSettings({ ...settings, provider: p, model: p === 'algion' ? 'gpt-4o' : settings.model })}
                    className={`py-2 px-3 rounded-xl border text-sm font-medium transition-all ${settings.provider === p
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200 dark:shadow-none'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                      }`}
                  >
                    {p === 'google' ? 'Google' : p === 'algion' ? 'Algion' : 'OpenRouter'}
                  </button>
                ))}
              </div>
            </div>

            {settings.provider === 'google' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Google API Key</label>
                <input
                  type="password"
                  value={settings.apiKey || ''}
                  onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                  placeholder="AIza..."
                />
                <p className="text-[10px] text-gray-400 mt-1">Оставьте пустым, чтобы использовать ключ из .env</p>
              </div>
            )}

            {settings.provider === 'openrouter' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">OpenRouter Key</label>
                <input
                  type="password"
                  value={settings.apiKey || ''}
                  onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                  placeholder="sk-or-..."
                />
              </div>
            )}

            {settings.provider === 'algion' && (
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
                <p className="text-xs text-indigo-700 dark:text-indigo-300">
                  Algion использует бесплатный ключ <strong>free</strong> и модель <strong>gpt-4o</strong> по умолчанию.
                </p>
              </div>
            )}
          </div>

          <div className="h-px bg-gray-100 dark:bg-gray-700 my-2" />

          {/* Defaults Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Bell size={16} className="text-orange-500" />
              <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Общие настройки</h3>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Напоминание по умолчанию</label>
              <select
                value={settings.defaultReminderMinutes || 0}
                onChange={(e) => setSettings({ ...settings, defaultReminderMinutes: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white appearance-none cursor-pointer"
              >
                {reminderOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {onInstallApp && (
              <button
                type="button"
                onClick={onInstallApp}
                className="w-full py-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded-xl font-bold text-sm hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors border border-indigo-100 dark:border-indigo-800/50 flex items-center justify-center gap-2"
              >
                📱 Установить приложение
              </button>
            )}
          </div>

          {/* Telegram Section */}
          <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-1">
              <MessageCircle size={16} className="text-blue-500" />
              <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Telegram Уведомления</h3>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Создайте бота в @BotFather и вставьте токен сюда. Chat ID можно узнать у бота @userinfobot.
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bot Token</label>
              <input
                type="text"
                value={settings.telegramBotToken || ''}
                onChange={(e) => setSettings({ ...settings, telegramBotToken: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white font-mono text-sm"
                placeholder="123456789:ABC..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Chat ID</label>
              <input
                type="text"
                value={settings.telegramChatId || ''}
                onChange={(e) => setSettings({ ...settings, telegramChatId: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white font-mono text-sm"
                placeholder="12345678"
              />
            </div>
          </div>

          {/* Data Management Section */}
          <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-1">
              <Save size={16} className="text-green-500" />
              <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Управление данными</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={async () => {
                  try {
                    const { db } = await import('../services/db');
                    const json = await db.exportEvents();
                    const blob = new Blob([json], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `smart-agenda-backup-${new Date().toISOString().slice(0, 10)}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  } catch (e) {
                    alert('Ошибка экспорта');
                  }
                }}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors text-gray-700 dark:text-gray-200"
              >
                Экспорт (JSON)
              </button>

              <label className="cursor-pointer px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors text-gray-700 dark:text-gray-200 text-center">
                <span>Импорт (JSON)</span>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const text = await file.text();
                      const { db } = await import('../services/db');
                      if (confirm('Это действие добавит события из файла. Продолжить?')) {
                        const count = await db.importEvents(text);
                        alert(`Успешно импортировано событий: ${count}`);
                        window.location.reload(); // Reload to refresh data
                      }
                    } catch (err) {
                      alert('Ошибка импорта: Неверный формат файла');
                    }
                    e.target.value = ''; // Reset input
                  }}
                />
              </label>
            </div>
          </div>

          <div className="pt-2">
            <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none">
              <Save size={18} />
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsModal;