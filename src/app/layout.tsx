import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";

export const metadata = {
  title: "Medium Clone",
  description: "A publishing platform built with Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-800">
        <Header />
        <main className="max-w-4xl mx-auto py-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
