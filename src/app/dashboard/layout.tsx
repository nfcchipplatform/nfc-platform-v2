// src/app/dashboard/layout.tsx (一時的なデバッグ用コード)

import Link from "next/link";
// getServerSession と redirect を一時的にコメントアウト
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// import { redirect } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  // ▼▼▼ ここを React.ReactNode に修正しました ▼▼▼
  children: React.ReactNode;
}) {
  // セッションチェックを一時的に無効化
  // const session = await getServerSession(authOptions);
  // if (!session) {
  //   redirect("/login");
  // }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-gray-800 text-white p-4 flex flex-col">
        <div className="mb-8">
          <Link href="/dashboard" className="text-2xl font-bold text-white">
            My Dashboard
          </Link>
        </div>
        <nav className="flex-grow">
          <ul>
            <li className="mb-2">
              <Link href="/dashboard" className="block p-2 rounded hover:bg-gray-700">
                ダッシュボード
              </Link>
            </li>
            <li className="mb-2">
              <Link href="/dashboard/profile" className="block p-2 rounded hover:bg-gray-700">
                プロフィール編集
              </Link>
            </li>
            <li className="mb-2">
              <Link href="/dashboard/favorites" className="block p-2 rounded hover:bg-gray-700">
                お気に入り設定
              </Link>
            </li>
            <li className="mb-2">
              <Link href="/dashboard/direct-link" className="block p-2 rounded hover:bg-gray-700">
                ダイレクトリンク設定
              </Link>
            </li>
            <li className="mb-2 border-t border-gray-700 mt-4 pt-4">
              <Link href="/dashboard/settings" className="block p-2 rounded hover:bg-gray-700">
                アカウント設定
              </Link>
            </li>
          </ul>
        </nav>
        <div>
           <p className="text-sm text-gray-400">&copy; 2025 nfc-platform</p>
        </div>
      </aside>
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}