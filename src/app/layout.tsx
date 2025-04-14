
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <link rel="icon" href="/assets/logo.png" type="image/png" />
                <title>Quản lý dự án</title>
            </head>
            <body>
                    {/* Main Content */}
                    <main className="mainContent">{children}</main>
            </body>
        </html>
    );
}