"use client";

import { useState } from "react";
import { CldUploadWidget } from "next-cloudinary";
import { updateSalonSettings } from "@/actions/salonConfigActions";
import { useRouter } from "next/navigation";

export default function SalonSettingsForm({ salon }: { salon: any }) {
  const router = useRouter();
  const [logoUrl, setLogoUrl] = useState(salon.logoUrl || "");
  const [isLoading, setIsLoading] = useState(false);

  // Cloudinary設定
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    // CloudinaryのURLはstate管理しているので手動で追加
    formData.set("logoUrl", logoUrl);

    const res = await updateSalonSettings(formData);
    
    if (res.success) {
      alert("設定を保存しました！");
      router.refresh();
    } else {
      alert(res.error || "エラーが発生しました");
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-8">
      
      {/* 1. 基本情報 */}
      <div>
        <h3 className="font-bold text-gray-700 border-b pb-2 mb-4">基本情報</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">店舗名</label>
            <input name="name" defaultValue={salon.name} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">地域・住所表記</label>
            <input name="location" defaultValue={salon.location || ""} className="w-full border rounded px-3 py-2" placeholder="例: 東京都昭島市" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Google Map URL</label>
            <input name="mapUrl" defaultValue={salon.mapUrl || ""} className="w-full border rounded px-3 py-2 text-sm" placeholder="https://goo.gl/maps/..." />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Webサイト URL</label>
            <input name="websiteUrl" defaultValue={salon.websiteUrl || ""} className="w-full border rounded px-3 py-2 text-sm" placeholder="https://..." />
          </div>
        </div>
      </div>

      {/* 2. デザイン設定 */}
      <div>
        <h3 className="font-bold text-gray-700 border-b pb-2 mb-4">デザイン・カラー</h3>
        <p className="text-xs text-gray-400 mb-4">
            ここで設定した色は、あなたの店舗に所属する全ユーザーのプロフィール画面（フッターやアイコン枠など）に適用されます。
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">メインカラー (Primary)</label>
            <div className="flex items-center gap-2">
                <input name="primaryColor" type="color" defaultValue={salon.primaryColor} className="h-10 w-20 cursor-pointer" />
                <span className="text-xs text-gray-400">フッター背景や強調表示に使用</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">アクセントカラー (Accent)</label>
            <div className="flex items-center gap-2">
                <input name="accentColor" type="color" defaultValue={salon.accentColor} className="h-10 w-20 cursor-pointer" />
                <span className="text-xs text-gray-400">アイコンの枠線などに使用</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. ロゴ画像 */}
      <div>
        <h3 className="font-bold text-gray-700 border-b pb-2 mb-4">店舗ロゴ</h3>
        <div className="flex items-center gap-6">
            <div className="shrink-0">
                {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-24 h-24 object-contain bg-gray-50 border rounded-lg" />
                ) : (
                    <div className="w-24 h-24 bg-gray-100 border rounded-lg flex items-center justify-center text-gray-400 text-xs">No Logo</div>
                )}
            </div>
            
            <div>
                {cloudName && uploadPreset ? (
                    <CldUploadWidget
                        uploadPreset={uploadPreset}
                        options={{ maxFiles: 1, clientAllowedFormats: ['image'] }}
                        onSuccess={(result: any) => {
                            if (result.info?.secure_url) setLogoUrl(result.info.secure_url);
                        }}
                    >
                        {({ open }) => (
                            <button type="button" onClick={() => open()} className="bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm font-bold hover:bg-gray-300">
                                画像をアップロード
                            </button>
                        )}
                    </CldUploadWidget>
                ) : (
                    <p className="text-red-500 text-xs">Cloudinary設定がありません</p>
                )}
                <p className="text-xs text-gray-400 mt-2">※背景透過のPNG画像を推奨します</p>
                {logoUrl && (
                    <button type="button" onClick={() => setLogoUrl("")} className="text-red-500 text-xs underline mt-2">
                        削除する
                    </button>
                )}
            </div>
        </div>
      </div>

      <div className="pt-4 border-t">
        <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400">
            {isLoading ? "保存中..." : "設定を保存する"}
        </button>
      </div>
    </form>
  );
}