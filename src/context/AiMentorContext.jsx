import { useState, useCallback, useMemo } from 'react';
import { AiMentorContext } from './aiMentorContextInstance';
import { AI_ROLES, mentorChatTurn } from '../utils/aiService';

export function AiMentorProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeRole, setActiveRole] = useState('tutor');
  const [messages, setMessages] = useState([]);
  const [contextData, setContextData] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);

  // Смена роли
  const switchRole = useCallback((roleId) => {
    setActiveRole(roleId);
  }, []);

  // Отправка сообщения
  const sendMessage = useCallback(
    async (text, customContext = null, roleIdOverride = null) => {
      const currentRole = roleIdOverride || activeRole;
      const ctx = customContext !== null ? customContext : contextData;

      const userMsg = { role: 'user', content: text };
      const updatedHistory = [...messages, userMsg];
      setMessages(updatedHistory);
      setIsLoading(true);

      const res = await mentorChatTurn({
        roleId: currentRole,
        messages: updatedHistory,
        context: ctx,
      });

      if (res.ok) {
        setMessages([...updatedHistory, { role: 'assistant', content: res.message }]);
      } else if (res.code === 'NO_API_KEY') {
        setMessages([
          ...updatedHistory,
          {
            role: 'assistant',
            content: `⚠️ **AI-наставник временно недоступен:** добавьте API-ключ в настройках (кнопка ⚙️ в шапке панели), чтобы активировать живые ответы языковой модели.`,
            isWarning: true,
          },
        ]);
      } else {
        setMessages([
          ...updatedHistory,
          {
            role: 'assistant',
            content: `❌ **Ошибка связи с AI:** ${res.error || 'Не удалось получить ответ'}. Попробуйте повторить запрос.`,
            isError: true,
          },
        ]);
      }

      setIsLoading(false);
    },
    [activeRole, contextData, messages]
  );

  // Открытие виджета с контекстом и опциональной авто-отправкой
  const openMentor = useCallback(
    ({ role = 'tutor', initialMessage = '', context = '', autoSend = false }) => {
      setActiveRole(role);
      if (context) setContextData(context);
      setIsOpen(true);

      if (initialMessage && autoSend) {
        // Отправляем начальное сообщение
        sendMessage(initialMessage, context, role);
      }
    },
    [sendMessage]
  );

  const closeMentor = useCallback(() => {
    setIsOpen(false);
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  const value = useMemo(
    () => ({
      isOpen,
      activeRole,
      messages,
      contextData,
      isLoading,
      showKeyModal,
      setShowKeyModal,
      openMentor,
      closeMentor,
      switchRole,
      sendMessage,
      clearChat,
      roleMeta: AI_ROLES[activeRole] || AI_ROLES.tutor,
    }),
    [
      isOpen,
      activeRole,
      messages,
      contextData,
      isLoading,
      showKeyModal,
      openMentor,
      closeMentor,
      switchRole,
      sendMessage,
      clearChat,
    ]
  );

  return <AiMentorContext.Provider value={value}>{children}</AiMentorContext.Provider>;
}
