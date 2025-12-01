// src/app/dashboard/layout.tsx

"use client"; // スマホメニューの開閉状態管理のために必要

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  // 現在のページかどうか判定する関数
  const isActive = (path: string) => pathname === path;

  // メニュー項目のリスト
  const menuItems = [
    { name: "ダッシュボード", path: "/dashboard" },
    { name: "プロフィール編集", path: "/dashboard/profile" },
    { name: "お気に入り設定", path: "/dashboard/favorites" },
    { name: "ダイレクトリンク", path: "/dashboard/direct-link" },
    { name: "アカウント設定", path: "/dashboard/settings" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      
      {/* --- スマホ用ヘッダー (MD以上で非表示) --- */}
      <div className="md:hidden bg-gray-900 text-white p-4 flex justify-between items-center sticky top-0 z-50 shadow-md">
        <Link href="/dashboard" className="text-xl font-bold">
          PONNU
        </Link>
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 focus:outline-none"
        >
          {/* ハンバーガーアイコン */}
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* --- スマホ用ドロップダウンメニュー --- */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-800 text-white w-full sticky top-16 z-40 shadow-lg">
          <nav className="flex flex-col p-4 space-y-2">
            {menuItems.map((item) => (
              <Link 
                key={item.path} 
                href={item.path}
                onClick={() => setIsMenuOpen(false)} // クリックしたら閉じる
                className={`block p-3 rounded transition-colors ${
                  isActive(item.path) ? "bg-indigo-600 font-bold" : "hover:bg-gray-700"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* --- PC用サイドバー (MD以上で表示) --- */}
      <aside className="hidden md:flex w-64 bg-gray-900 text-white p-6 flex-col shrink-0 min-h-screen sticky top-0 h-screen overflow-y-auto">
        <div className="mb-10">
          <Link href="/dashboard" className="text-2xl font-bold tracking-wider">
            PONNU
          </Link>
        </div>
        <nav className="flex-grow">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link 
                  href={item.path} 
                  className={`block p-3 rounded transition-colors ${
                    isActive(item.path) ? "bg-indigo-600 font-bold shadow-md" : "hover:bg-gray-800 text-gray-300 hover:text-white"
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-auto pt-6 border-t border-gray-700">
           <p className="text-xs text-gray-500">&copy; 2025 NFC Platform</p>
        </div>
      </aside>

      {/* --- メインコンテンツ --- */}
      <main className="flex-1 p-4 md:p-8 w-full overflow-hidden">
        {children}
      </main>
    </div>
  );
}