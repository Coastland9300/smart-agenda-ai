import { CalendarEvent, AISettings } from '../types';

export const sendTelegramNotification = async (
  message: string, 
  settings: AISettings
): Promise<void> => {
  if (!settings.telegramBotToken || !settings.telegramChatId) {
    console.warn("Telegram settings not configured");
    return;
  }

  const url = `https://api.telegram.org/bot${settings.telegramBotToken}/sendMessage`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: settings.telegramChatId,
        text: message,
        parse_mode: 'Markdown' // Be careful with special chars in titles
      }),
    });

    if (!response.ok) {
      console.error("Failed to send Telegram message", await response.text());
    }
  } catch (error) {
    console.error("Telegram API Error:", error);
  }
};

export const formatEventForTelegram = (event: CalendarEvent, action: 'created' | 'deleted' | 'updated' | 'completed'): string => {
  const dateObj = new Date(event.start_time);
  let timeString = '';
  
  if (event.isAllDay) {
      timeString = dateObj.toLocaleDateString('ru-RU', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      }) + ' (Весь день)';
  } else {
      timeString = dateObj.toLocaleString('ru-RU', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit'
      });
  }

  if (action === 'created') {
    return `✅ *Создано событие:*\n"${event.title}"\n🕒 ${timeString}`;
  } else if (action === 'deleted') {
    return `🗑 *Удалено событие:*\n"${event.title}"\n🕒 ${timeString}`;
  } else if (action === 'completed') {
    return `🎉 *Задача выполнена:*\n"${event.title}"\n✅ Отмечено как завершенное`;
  }
  return `📝 *Обновлено событие:*\n"${event.title}"\n🕒 ${timeString}`;
};

export const sendFullAgenda = async (events: CalendarEvent[], settings: AISettings): Promise<void> => {
  const now = new Date();
  
  // Filter for TODAY's events only (not completed)
  const todaysEvents = events
    .filter(e => {
      if (e.completed) return false;
      const eDate = new Date(e.start_time);
      return eDate.getDate() === now.getDate() &&
             eDate.getMonth() === now.getMonth() &&
             eDate.getFullYear() === now.getFullYear();
    })
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  if (todaysEvents.length === 0) {
    await sendTelegramNotification(`🎉 *На сегодня (${now.toLocaleDateString('ru-RU')}) задач нет!*\nНаслаждайтесь отдыхом.`, settings);
    return;
  }

  let message = `📅 *План на сегодня (${now.toLocaleDateString('ru-RU')}):*\n\n`;

  todaysEvents.forEach(e => {
    let timeStr = '';
    if (e.isAllDay) {
        timeStr = 'Весь день';
    } else {
        const date = new Date(e.start_time);
        timeStr = date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    }
    
    // Sanitize title for Markdown to prevent broken formatting if title contains special chars
    const cleanTitle = e.title.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
    
    message += `• *${timeStr}* — ${cleanTitle}\n`;
  });

  await sendTelegramNotification(message, settings);
};