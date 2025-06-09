import axios from 'axios';

const API_URL = 'http://localhost:8000/api/chat/'; // chỉnh lại theo BE thật của bạn

export const sendMessageToGemini = async (messages: { role: string; content: string }[]) => {
  const res = await axios.post(API_URL, { messages });
  return res.data;
};
