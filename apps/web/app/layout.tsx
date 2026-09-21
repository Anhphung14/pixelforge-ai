import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
	title: 'PixelForge AI',
	description:
		"PixelForge AI is a cutting-edge platform that leverages artificial intelligence to generate stunning pixel art and retro-style graphics. Whether you're a game developer, digital artist, or hobbyist, PixelForge AI provides the tools you need to create unique and captivating pixel art with ease.",
	icons: {
		icon: '/favicon.svg',
		apple: '/logo-mark.svg',
	},
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
		<html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
			<body className="min-h-full flex flex-col">{children}</body>
		</html>
	);
}
