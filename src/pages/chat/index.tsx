'use client';

import { MainLayout } from '@/layouts/Mainlayout';
import Chat from '@/modules/chat/components/Chat';
import pageStyles from '@/styles/mainPage.module.css';

export default function ChatPage() {
  return (
    <MainLayout title="Trò chuyện với Gemini">
      <div className={pageStyles.pageContainer}>
        <div className={pageStyles.pageHeader}>
          <h1 className={pageStyles.pageTitle}>Trò chuyện với Gemini</h1>
        </div>
        <Chat />
      </div>
    </MainLayout>
  );
}
