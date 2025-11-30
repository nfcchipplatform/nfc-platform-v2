// src/app/dashboard/profile/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/actions/updateProfile";
// ★ Cloudinaryのアップロード機能を追加
import { CldUploadWidget } from 'next-cloudinary';

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [twitter, setTwitter] = useState("");
  const [instagram, setInstagram] = useState("");
  const [image, setImage] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      const user = session.user as any;
      setName(user.name || "");
      setTitle(user.title || "");
      setBio(user.bio || "");
      setWebsite(user.website || "");
      setTwitter(user.twitter || "");
      setInstagram(user.instagram || "");
      setImage(user.image || "");
    }
  }, [status, session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    const imageData = image === "" ? null : image;
    const profileData = { name, title, bio, website, twitter, instagram, image: imageData };
    
    const result = await updateProfile(profileData);

    if (result.success) {
      setSuccess("プロフィールが正常に更新されました！");
      await update();
      router.refresh();
    } else {
      setError(result.error || "プロフィールの更新に失敗しました。");
    }
    setIsLoading(false);
  };

  if (status === "loading") {
    return <div className="text-center p-10">読み込み中...</div>;
  }

  // 環境変数の読み込み
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">プロフィール編集</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-center">{error}</div>}
        {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded text-center">{success}</div>}
        
        <div className="space-y-6">
          {/* 画像アップロードセクション */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">プロフィール写真</label>
            <div className="flex items-center gap-6">
               {/* プレビュー表示 */}
               <div className="relative">
                 {image ? (
                  <img src={image} alt="プレビュー" className="h-24 w-24 rounded-full object-cover border-2 border-gray-200" />
                ) : (
                  <div className="h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center border-2 border-gray-200">
                    <span className="text-gray-400 text-xs">No Image</span>
                  </div>
                )}
               </div>

               {/* Cloudinary アップロードボタン */}
               {cloudName && uploadPreset ? (
                 <CldUploadWidget
                   uploadPreset={uploadPreset}
                   options={{
                     maxFiles: 1,
                     sources: ['local', 'camera'], // PCファイルとカメラのみ許可
                     clientAllowedFormats: ['image'], // 画像のみ
                     multiple: false,
                   }}
                   onSuccess={(result: any) => {
                     // アップロード成功時に画像URLをセット
                     if (result.info && result.info.secure_url) {
                       setImage(result.info.secure_url);
                     }
                   }}
                 >
                   {({ open }) => {
                     return (
                       <button 
                         type="button" // 重要: submitにならないようにする
                         onClick={() => open()}
                         className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 transition-colors"
                       >
                         写真を変更する
                       </button>
                     );
                   }}
                 </CldUploadWidget>
               ) : (
                 <p className="text-red-500 text-xs">
                   エラー: Cloudinaryの設定が見つかりません。<br/>
                   .envファイルを確認してください。
                 </p>
               )}
            </div>
            {image && (
              <button
                type="button"
                onClick={() => setImage("")}
                className="text-xs text-red-500 mt-2 hover:underline"
              >
                写真を削除する
              </button>
            )}
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">名前</label>
            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
          </div>
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">役職・肩書き</label>
            <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
          </div>
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700">自己紹介</label>
            <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"></textarea>
          </div>
          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700">ウェブサイト</label>
            <input type="url" id="website" value={website} onChange={(e) => setWebsite(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" placeholder="https://..." />
          </div>
          <div>
            <label htmlFor="twitter" className="block text-sm font-medium text-gray-700">Twitter</label>
            <input type="url" id="twitter" value={twitter} onChange={(e) => setTwitter(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" placeholder="https://twitter.com/..." />
          </div>
          <div>
            <label htmlFor="instagram" className="block text-sm font-medium text-gray-700">Instagram</label>
            <input type="url" id="instagram" value={instagram} onChange={(e) => setInstagram(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" placeholder="https://instagram.com/..." />
          </div>
        </div>
        <div className="mt-6">
          <button type="submit" disabled={isLoading} className="w-full inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-bold rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400">
            {isLoading ? "保存中..." : "保存する"}
          </button>
        </div>
      </form>
    </div>
  );
}