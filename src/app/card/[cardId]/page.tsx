// src/app/card/[cardId]/page.tsx

import { PrismaClient } from "@prisma/client";
import Link from "next/link";

const prisma = new PrismaClient();

interface CardPageProps {
  params: {
    cardId: string;
  };
}

export const dynamic = 'force-dynamic';

export default async function CardPage({ params }: CardPageProps) {
  const { cardId } = params;

  const userWithCard = await prisma.user.findUnique({
    where: { nfcCardId: cardId },
    select: {
      id: true,
      name: true,
      image: true,
    },
  });

  if (userWithCard) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="p-8 bg-white rounded-xl shadow-lg w-full max-w-md text-center">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">
            {userWithCard.name || "Unknown"} のネイル
          </h1>
          {userWithCard.image ? (
            <img
              src={userWithCard.image}
              alt={userWithCard.name || "Nail"}
              className="w-32 h-32 rounded-full object-cover mx-auto bg-gray-100"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-100 mx-auto flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
        </div>
      </div>
    );
  }

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