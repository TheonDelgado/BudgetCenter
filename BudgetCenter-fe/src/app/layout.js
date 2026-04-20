import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import FlyonuiScript from "../components/FlyonuiScript";
import Sidebar from "../components/Sidebar/Sidebar";
import AppProviders from "../context/AppProviders";



const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "BudgetCenter",
  description: "Budgeting Application created by Theon Delgado",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <AppProviders>
          <Sidebar>{children}</Sidebar>
        </AppProviders>
        <FlyonuiScript />
      </body>
    </html>
  );
}
