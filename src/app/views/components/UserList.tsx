// filepath: c:\Users\melic\pbl5\src\app\views\components\UserList.tsx
import React from 'react';

interface User {
    id: number;
    name: string;
}

interface UserListProps {
    users: User[];
}

const UserList: React.FC<UserListProps> = ({ users }) => {
    return (
        <ul>
            {users.map(user => (
                <li key={user.id}>{user.name}</li>
            ))}
        </ul>
    );
};

export default UserList;