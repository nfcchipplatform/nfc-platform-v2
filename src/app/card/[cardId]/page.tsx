// src/app/card/[cardId]/page.tsx

import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";

const prisma = new PrismaClient();

interface CardPageProps {
  params: {
    cardId: string;
  };
}

// このページは動的にレンダリングされる必要があるため強制
export const dynamic = 'force-dynamic';

export default async function CardPage({ params }: CardPageProps) {
  const { cardId } = params;

  // 1. データベースでこのカードIDを持つユーザーを探す
  const userWithCard = await prisma.user.findUnique({
    where: { nfcCardId: cardId },
  });

  // ---------------------------------------------------------
  // パターンA：すでに誰かのカードとして登録されている場合
  // ---------------------------------------------------------
  if (userWithCard) {
    // ログイン中のユーザー情報を取得
    const session = await getServerSession(authOptions);

    // もし「自分のカード」を自分で読み込んだなら、ダッシュボードへ案内
    if (session?.user?.id === userWithCard.id) {
      redirect('/dashboard');
    } 
    
    // 他人のカード（または未ログイン）なら、その人の公開プロフィールへ転送
    // これがあなたの求めている「紐付けされたユーザーのページに飛ばす」処理です
    redirect(`/${userWithCard.username}`);
  }

  // ---------------------------------------------------------
  // パターンB：まだ誰のものでもないカードの場合
  // ---------------------------------------------------------
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="p-8 bg-white rounded-xl shadow-lg w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-2 text-gray-800">NFCカードを有効化</h1>
        <p className="text-sm text-gray-500 mb-6 font-mono bg-gray-100 py-1 px-2 rounded inline-block">
          ID: {cardId}
        </p>
        <p className="text-gray-600 mb-8">
          このカードはまだ登録されていません。<br/>
          あなたのアカウントに紐付けますか？
        </p>
        
        <div className="space-y-6">
          {/* ログインボタン */}
          <div>
            <Link 
              href={`/login?cardId=${cardId}`}
              className="block w-full px-6 py-4 text-lg font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-md"
            >
              既存アカウントでログインして紐付け
            </Link>
            <p className="text-xs text-gray-500 mt-2">
              すでにアカウントをお持ちの方はこちら
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">または</span>
            </div>
          </div>

          {/* 新規登録ボタン */}
          <div>
            <Link 
              href={`/register?cardId=${cardId}`}
              className="block w-full px-6 py-3 text-base font-semibold text-gray-700 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 transition-colors"
            >
              新しくアカウントを作成して紐付け
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}