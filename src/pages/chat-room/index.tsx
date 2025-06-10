import { MainLayout } from '@/layouts/Mainlayout';
import pageStyles from '@/styles/mainPage.module.css';
import { ChatRoomModular } from '@/modules/chat-room/components';
export default function ChatRoomPage() {
  return (
    <MainLayout title="chat room">
      <div className={pageStyles.pageContainer}>        <div className={pageStyles.pageHeader}>
          <h1 className={pageStyles.pageTitle}></h1>
        </div>
        <ChatRoomModular />
      </div>
    </MainLayout>
  );
}
