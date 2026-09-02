import { useContext } from 'react';
import { AiMentorContext } from '../context/aiMentorContextInstance';

export function useAiMentor() {
  const ctx = useContext(AiMentorContext);
  if (!ctx) {
    throw new Error('useAiMentor must be used within AiMentorProvider');
  }
  return ctx;
}
