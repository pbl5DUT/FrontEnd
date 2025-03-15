// filepath: c:\Users\melic\pbl5\src\app\views\pages\listUser\page.tsx
import { UserController } from "../../../controllers/userController";
import UserList from "../../components/UserList";

export default function ListUserPage() {
    const users = UserController.getUserList();
    return (
        <div>
            <UserList users={users} />
        </div>
    );
}