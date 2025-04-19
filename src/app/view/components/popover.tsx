'use client';

import { ReactNode } from 'react';
import styles from './popover.module.css';

interface PopoverProps {
    children: ReactNode; // Nội dung bên trong Popover
    onClose: () => void; // Hàm đóng Popover
}

export default function Popover({ children, onClose }: PopoverProps) {
    return (
        <div className={styles.overlay}>
            <div className={styles.popover}>
                <button className={styles.closeButton} onClick={onClose}>
                    ✖
                </button>
                <div className={styles.content}>{children}</div>
            </div>
        </div>
    );
}