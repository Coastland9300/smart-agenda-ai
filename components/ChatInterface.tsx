import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Sparkles, Loader2, Mic, MicOff } from 'lucide-react';
import { ChatMessage, CalendarEvent } from '../types';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isProcessing: boolean;
  events?: CalendarEvent[]; // Added events for suggestions context
}

// Simple type definition for Web Speech API
interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isProcessing, events = [] }) => {
  const [input, setInput] = useState('');
  const [placeholder, setPlaceholder] = useState("Напиши планы или вставь расписание...");
  const [isFocused, setIsFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  // Auto-resize textarea logic
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '56px';
      const scrollHeight = textareaRef.current.scrollHeight;
      if (input) {
        textareaRef.current.style.height = `${Math.min(scrollHeight, 120)}px`;
      }
    }
  }, [input]);

  // Dynamic Placeholder & Suggestions Logic
  useEffect(() => {
    const placeholders = [
      "Например: Встреча с командой завтра в 10:00",
      "Попробуй: Спортзал каждый вторник и четверг в 19:00",
      "Вставь полное расписание на день...",
      "Например: Перенеси встречу на 15:00",
      "Удали события на выходные",
      "Напоминай пить воду каждые 2 часа"
    ];

    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % placeholders.length;
      setPlaceholder(placeholders[index]);
    }, 4000);

    // Generate Contextual Suggestions
    const hour = new Date().getHours();
    const newSuggestions: string[] = [];

    if (hour < 11) {
      newSuggestions.push("Распланируй мой день");
      if (!events.some(e => e.title.toLowerCase().includes('standup'))) {
        newSuggestions.push("Добавь дейли в 10:00");
      }
    } else if (hour >= 11 && hour < 14) {
      newSuggestions.push("Запланируй обед через час");
    } else if (hour > 17) {
      newSuggestions.push("Подведи итоги дня");
      newSuggestions.push("План на завтра");
    }

    if (events.length === 0) {
      newSuggestions.push("Пример расписания");
    }

    setSuggestions(newSuggestions);

    return () => clearInterval(interval);
  }, [events]); // Re-run when events change

  // Voice Input Logic
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as unknown as IWindow).SpeechRecognition || (window as unknown as IWindow).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Ваш браузер не поддерживает голосовой ввод. Попробуйте Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ru-RU';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        // Append text with space if input is not empty
        setInput(prev => prev ? `${prev} ${transcript}` : transcript);
        if (textareaRef.current) textareaRef.current.focus();
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isProcessing) {
      onSendMessage(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = '56px';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl md:rounded-[32px] shadow-2xl shadow-indigo-100/50 dark:shadow-black/50 overflow-hidden border border-white dark:border-gray-700 transition-colors duration-300">
      {/* Soft Header */}
      <div className="p-6 pb-4 border-b border-gray-100/50 dark:border-gray-700/50 flex items-center justify-between bg-white/50 dark:bg-gray-800/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50">
            <Bot size={20} />
          </div>
          <div>
            <h2 className="font-bold text-gray-800 dark:text-gray-100 text-lg">Ассистент</h2>
            <div className="flex items-center space-x-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <p className="text-gray-400 dark:text-gray-400 text-xs font-medium">Онлайн</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-hide">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 animate-fade-in-up">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 rounded-3xl flex items-center justify-center mb-4 shadow-sm relative group">
              <Sparkles className="text-indigo-400 dark:text-indigo-300 group-hover:scale-110 transition-transform duration-500" size={28} />
              <div className="absolute inset-0 bg-indigo-200/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Привет!</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed mb-6">
              Я помогу организовать твое время. Можешь отправить мне целое расписание текстом.
            </p>
            <div className="flex flex-wrap justify-center gap-2 max-w-md">
              <button
                onClick={() => setInput("Встреча с командой завтра в 10:00")}
                className="text-xs bg-gray-50 dark:bg-gray-700 hover:bg-indigo-50 dark:hover:bg-gray-600 hover:text-indigo-600 dark:hover:text-indigo-300 text-gray-500 dark:text-gray-400 py-2 px-4 rounded-full transition-colors border border-gray-100 dark:border-gray-600"
              >
                "Встреча завтра в 10:00"
              </button>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex animate-fade-in-up ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] px-6 py-4 shadow-sm text-[15px] leading-relaxed transition-colors duration-200 whitespace-pre-wrap ${msg.role === 'user'
                ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-[24px] rounded-br-none shadow-indigo-200 dark:shadow-none'
                : msg.isError
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 rounded-[24px] rounded-bl-none'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 border border-gray-100 dark:border-gray-600 rounded-[24px] rounded-bl-none'
                }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isProcessing && (
          <div className="flex justify-start animate-fade-in-up">
            <div className="bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-[24px] rounded-bl-none px-5 py-4 shadow-sm flex items-center space-x-3">
              <Loader2 className="animate-spin text-indigo-500 dark:text-indigo-400" size={18} />
              <span className="text-gray-400 dark:text-gray-300 text-sm font-medium">Анализирую расписание...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Smart Suggestions Chips */}
      {suggestions.length > 0 && !isProcessing && (
        <div className="px-6 py-2 flex gap-2 overflow-x-auto scrollbar-hide">
          {suggestions.map((sug, i) => (
            <button
              key={i}
              onClick={() => setInput(sug)}
              className="flex-shrink-0 text-xs px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded-full border border-indigo-100 dark:border-indigo-800/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors animate-fade-in whitespace-nowrap"
            >
              ✨ {sug}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 sm:p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md pt-2">
        <form
          onSubmit={handleSubmit}
          className={`relative w-full transition-all duration-300 rounded-[24px] bg-white dark:bg-gray-950 ${isFocused ? 'shadow-lg shadow-indigo-100/50 dark:shadow-indigo-900/20 transform -translate-y-1' : 'shadow-sm'}`}
        >
          {/* Command Icon / Mic Button */}
          <div className="absolute left-2 bottom-[10px] z-10">
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2 rounded-full transition-all duration-300 ${isListening ? 'bg-red-100 text-red-500 animate-pulse' : 'text-gray-400 hover:text-indigo-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              title="Голосовой ввод"
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
          </div>

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Слушаю..." : placeholder}
            className={`w-full pl-12 pr-14 py-4 bg-gray-50/90 dark:bg-gray-900/90 hover:bg-white dark:hover:bg-gray-950 text-gray-800 dark:text-gray-100 rounded-[24px] border transition-all duration-300 outline-none resize-none h-[56px] min-h-[56px] max-h-[120px] scrollbar-hide leading-6 block
              ${isFocused
                ? 'bg-white dark:bg-gray-950 border-indigo-300 dark:border-indigo-500 ring-4 ring-indigo-50 dark:ring-indigo-900/20'
                : 'border-gray-200 dark:border-gray-700'
              }
              placeholder:text-gray-400 dark:placeholder:text-gray-500
            `}
            disabled={isProcessing}
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!input.trim() || isProcessing}
            className={`absolute right-2 bottom-[8px] p-2.5 rounded-2xl transition-all duration-300 shadow-sm transform z-10 flex items-center justify-center
              ${input.trim() && !isProcessing
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-lg active:scale-95 hover:rotate-[-10deg]'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed'
              }
            `}
          >
            <Send size={18} className={input.trim() && !isProcessing ? 'ml-0.5' : ''} />
          </button>
        </form>

        {isFocused && !isListening && (
          <p className="absolute -bottom-4 left-0 right-0 text-center text-[10px] text-gray-400 dark:text-gray-500 opacity-70 pointer-events-none animate-fade-in-up">
            Нажмите Enter для отправки
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;