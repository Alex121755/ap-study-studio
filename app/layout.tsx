import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "AP Atlas · 把知识连成理解",
  description: "八门 AP 课程的个人复习、知识关联与项目准备工作台，包含微观与宏观经济学。",
  icons: { icon: "/favicon.svg" },
};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
