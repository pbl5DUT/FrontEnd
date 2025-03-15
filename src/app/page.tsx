import type { Metadata } from "next";
import "./globals.css";
import Page from "./views/pages/listUser/page"; 

export const metadata: Metadata = {
  title: "PBL5 App",
  description: "A Next.js project",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Page />
        {children}
      </body>
    </html>
  );
}