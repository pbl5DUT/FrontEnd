'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './Chat.module.css';
import { sendMessageToGemini } from '../services/ChatService';

export default function Chat() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await sendMessageToGemini(newMessages);
      setMessages([...newMessages, { role: 'assistant', content: res.reply }]);
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: '❌ Lỗi gọi API!' }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div className={styles.chatBox}>
      <div className={styles.messages}>
        {messages.map((m, idx) => (
          <div key={idx} className={m.role === 'user' ? styles.user : styles.bot}>
            <b>{m.role === 'user' ? 'Bạn' : 'Gemini'}:</b> {m.content}
          </div>
        ))}
        {loading && <div className={styles.bot}>⏳ Đang trả lời...</div>}
        <div ref={messagesEndRef} />
      </div>
      <div className={styles.inputArea}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nhập câu hỏi..."
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
        />
        <button onClick={handleSend} disabled={loading}>
          Gửi
        </button>
      </div>
    </div>
  );
}
