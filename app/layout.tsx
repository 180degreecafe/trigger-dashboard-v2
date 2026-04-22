import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trigger Dashboard",
  description: "Customer engagement system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-white">
        <div className="max-w-7xl mx-auto px-4">
          {children}
        </div>
      </body>
    </html>
  );
}
