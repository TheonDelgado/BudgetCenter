import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import FlyonuiScript from "../components/FlyonuiScript";
import Sidebar from "../components/Sidebar/Sidebar";
import AppProviders from "../context/AppProviders";
import Script from "next/script";



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
      <head>
        <link rel="stylesheet" href="/apexcharts.css" />
      </head>

      <body className="min-h-full">
        <AppProviders>
          <Sidebar>{children}</Sidebar>
        </AppProviders>
        <FlyonuiScript />

        <script src="/lodash.js"></script>
        <script src="/apexcharts.js"></script>
        <Script src="/helper-apexcharts.js" strategy="beforeInteractive" />
        <Script src="/budgetChart.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
