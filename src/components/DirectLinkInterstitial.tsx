// src/components/DirectLinkInterstitial.tsx

"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface DirectLinkInterstitialProps {
  redirectUrl: string;
  profileUrl: string;
}

export default function DirectLinkInterstitial({ redirectUrl, profileUrl }: DirectLinkInterstitialProps) {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = redirectUrl;
    }, 3000);

    const interval = setInterval(() => {
      setCountdown((prevCount) => {
        if (prevCount <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prevCount - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [redirectUrl]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-xl p-8 text-center">
        <div className="w-32 h-32 bg-gray-700 rounded-full mx-auto mb-6 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-gray-400">
           {/* ▼▼▼ この中の path d="..." の部分を修正しました ▼▼▼ */}
           <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-4">リンクを開いています...</h1>
        
        <div className="space-y-4">
          <Link 
            href={`${profileUrl}?from=interstitial`}
            className="block w-full px-4 py-3 text-lg font-semibold text-center text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            プロフィールを見る
          </Link>
        </div>

        <p className="text-gray-400 mt-6">
          {countdown > 0 ? `${countdown}秒後に自動で移動します` : '移動中...'}
        </p>

      </div>
    </div>
  );
}