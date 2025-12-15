import { GoogleGenAI, Type } from "@google/genai";
import { AIResponse, AIActionType } from "../types";

export const parseUserIntent = async (text: string, currentEventsContext: string): Promise<AIResponse> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing in environment variables.");
    return {
      action: AIActionType.UNKNOWN,
      confirmation_message: "Ошибка: API ключ не настроен. Пожалуйста, проверьте конфигурацию."
    };
  }

  const ai = new GoogleGenAI({ apiKey });
  const now = new Date();
  
  const systemInstruction = `
    Текущая дата и время: ${now.toISOString()} (${now.toLocaleDateString('ru-RU')})
    
    Контекст (Существующие события): 
    ${currentEventsContext}

    Инструкции:
    1. Проанализируй запрос пользователя.
    2. Определи действие: 
       - 'create': создание ОДНОГО события.
       - 'batch_create': если пользователь предоставляет СПИСОК событий или расписание.
       - 'update': изменение существующего.
       - 'delete': удаление.
       - 'read': запрос расписания.
       - 'unknown': непонятно.
    
    3. Для 'create' или 'batch_create':
       - start_time: ISO 8601.
       - recurrence: 'daily', 'weekly', 'monthly', 'yearly', 'none'.
       - recurrence_interval: integer (по умолчанию 1). Если пользователь пишет "каждые 2 дня", то recurrence='daily', recurrence_interval=2.
       - is_all_day: boolean.
    
    4. ЧЕРЕДОВАНИЕ ЗАДАЧ (Alternating tasks):
       Если пользователь просит чередовать задачи (например: "В одну субботу бассейн, в следующую зал" или "Четная неделя - А, нечетная - Б"):
       - Используй action: 'batch_create'.
       - Создай ДВА события в массиве 'events'.
       - Оба события должны иметь recurrence='weekly' и recurrenceInterval=2 (раз в 2 недели).
       - Start_time ПЕРВОГО события: ближайшая подходящая дата.
       - Start_time ВТОРОГО события: дата первого события + 7 дней.

    5. Отвечай всегда на РУССКОМ языке в поле 'confirmation_message'.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: text,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            action: { type: Type.STRING, enum: [AIActionType.CREATE, AIActionType.BATCH_CREATE, AIActionType.UPDATE, AIActionType.DELETE, AIActionType.READ, AIActionType.UNKNOWN] },
            title: { type: Type.STRING, nullable: true },
            start_time: { type: Type.STRING, nullable: true },
            end_time: { type: Type.STRING, nullable: true },
            description: { type: Type.STRING, nullable: true },
            reminderMinutes: { type: Type.INTEGER, nullable: true },
            recurrence: { type: Type.STRING, enum: ['daily', 'weekly', 'monthly', 'yearly', 'none'], nullable: true },
            recurrenceInterval: { type: Type.INTEGER, nullable: true },
            isAllDay: { type: Type.BOOLEAN, nullable: true },
            events: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  start_time: { type: Type.STRING },
                  end_time: { type: Type.STRING, nullable: true },
                  description: { type: Type.STRING, nullable: true },
                  reminderMinutes: { type: Type.INTEGER, nullable: true },
                  recurrence: { type: Type.STRING, enum: ['daily', 'weekly', 'monthly', 'yearly', 'none'], nullable: true },
                  recurrenceInterval: { type: Type.INTEGER, nullable: true },
                  isAllDay: { type: Type.BOOLEAN, nullable: true }
                }
              },
              nullable: true
            },
            original_query: { type: Type.STRING, nullable: true },
            target_id: { type: Type.STRING, nullable: true },
            confirmation_message: { type: Type.STRING }
          }
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return parsed as AIResponse;

  } catch (error) {
    console.error("AI Service Error:", error);
    
    let errorMessage = "Ошибка соединения";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return {
      action: AIActionType.UNKNOWN,
      confirmation_message: `Извините, возникла ошибка: ${errorMessage}.`
    };
  }
};