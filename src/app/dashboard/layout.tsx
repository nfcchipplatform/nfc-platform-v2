// src/app/dashboard/layout.tsx

"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react"; // [NEW] session取得用

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession(); // [NEW]

  const isActive = (path: string) => pathname === path;

  // 基本メニュー
  const menuItems = [
    { name: "ダッシュボード", path: "/dashboard" },
    { name: "プロフィール編集", path: "/dashboard/profile" },
    { name: "マイフィンガー設定", path: "/dashboard/favorites" },
    { name: "ダイレクトリンク", path: "/dashboard/direct-link" },
    { name: "アカウント設定", path: "/dashboard/settings" },
  ];

  // [NEW] スーパー管理者用メニュー
  const superAdminItems = [
    { name: "🏢 全店舗管理 (Super)", path: "/dashboard/admin/salons" },
    { name: "👥 全ユーザー管理 (Super)", path: "/dashboard/admin/users" },
  ];

  // [NEW] 店舗管理者用メニュー (仮)
  const salonAdminItems = [
    { name: "🏠 自店舗管理", path: "/dashboard/salon" },
    { name: "🎫 カード在庫管理", path: "/dashboard/salon/cards" },
  ];

  const role = (session?.user as any)?.role;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      
      {/* スマホ用ヘッダー (省略...既存コード維持) */}
      <div className="md:hidden bg-gray-900 text-white p-4 flex justify-between items-center sticky top-0 z-50 shadow-md">
         {/* ...既存と同じ... */}
         <Link href="/dashboard" className="text-xl font-bold">PONNU</Link>
         <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 focus:outline-none">
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             {isMenuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
           </svg>
         </button>
      </div>

      {/* スマホメニュー (省略...ロジックはPCと同じにするため後述のPCサイドバーを参照) */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-800 text-white w-full sticky top-16 z-40 shadow-lg">
           {/* ...既存コードのメニュー展開部分をPC版と同じロジックに修正してください... */}
        </div>
      )}

      {/* PC用サイドバー */}
      <aside className="hidden md:flex w-64 bg-gray-900 text-white p-6 flex-col shrink-0 min-h-screen sticky top-0 h-screen overflow-y-auto">
        <div className="mb-10">
          <Link href="/dashboard" className="text-2xl font-bold tracking-wider">
            PONNU
          </Link>
          {/* 権限バッジ表示 */}
          {role === 'SUPER_ADMIN' && <span className="text-[10px] bg-red-600 px-2 py-0.5 rounded ml-2">ADMIN</span>}
          {role === 'SALON_ADMIN' && <span className="text-[10px] bg-indigo-600 px-2 py-0.5 rounded ml-2">SALON</span>}
        </div>
        
        <nav className="flex-grow space-y-8">
          {/* 1. 一般メニュー */}
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase mb-2 px-2">Personal</p>
            <ul className="space-y-1">
                {menuItems.map((item) => (
                <li key={item.path}>
                    <Link 
                    href={item.path} 
                    className={`block px-3 py-2 rounded text-sm transition-colors ${isActive(item.path) ? "bg-gray-800 text-white font-bold" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`}
                    >
                    {item.name}
                    </Link>
                </li>
                ))}
            </ul>
          </div>

          {/* 2. スーパー管理者メニュー */}
          {role === 'SUPER_ADMIN' && (
              <div>
                <p className="text-xs text-red-400 font-bold uppercase mb-2 px-2">Administration</p>
                <ul className="space-y-1">
                    {superAdminItems.map((item) => (
                    <li key={item.path}>
                        <Link 
                        href={item.path} 
                        className={`block px-3 py-2 rounded text-sm transition-colors ${isActive(item.path) ? "bg-red-900/30 text-red-100 font-bold" : "text-gray-400 hover:bg-red-900/20 hover:text-white"}`}
                        >
                        {item.name}
                        </Link>
                    </li>
                    ))}
                </ul>
              </div>
          )}

          {/* 3. 店舗管理者メニュー */}
          {(role === 'SALON_ADMIN' || role === 'SUPER_ADMIN') && (
              <div>
                <p className="text-xs text-indigo-400 font-bold uppercase mb-2 px-2">Salon Management</p>
                <ul className="space-y-1">
                    {salonAdminItems.map((item) => (
                    <li key={item.path}>
                        <Link 
                        href={item.path} 
                        className={`block px-3 py-2 rounded text-sm transition-colors ${isActive(item.path) ? "bg-indigo-900/30 text-indigo-100 font-bold" : "text-gray-400 hover:bg-indigo-900/20 hover:text-white"}`}
                        >
                        {item.name}
                        </Link>
                    </li>
                    ))}
                </ul>
              </div>
          )}
        </nav>

        <div className="mt-auto pt-6 border-t border-gray-700">
           <p className="text-xs text-gray-500">&copy; 2025 PONNU</p>
        </div>
      </aside>

      {/* メインコンテンツエリア (既存維持) */}
      <main className="flex-1 flex flex-col w-full min-h-screen overflow-hidden">
        <div className="flex-grow p-4 md:p-8">
           {children}
        </div>
        <footer className="py-6 flex justify-center items-center space-x-6 text-xs text-gray-500">
            <Link href="https://ponnu.net/privacy-policy.pdf" className="hover:text-gray-800 hover:underline transition-colors">プライバシーポリシー</Link>
            <span className="text-gray-300">|</span>
            <Link href="https://ponnu.net/terms-of-service.pdf" className="hover:text-gray-800 hover:underline transition-colors">利用規約</Link>
        </footer>
      </main>
    </div>
  );
}