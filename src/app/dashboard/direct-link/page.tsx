// src/app/dashboard/direct-link/page.tsx
"use client";
import { useState, useEffect } from "react";
import { getDirectLinkSettings, updateDirectLink } from "@/actions/updateDirectLink";

export default function DirectLinkPage() {
  const [enabled, setEnabled] = useState(false);
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    getDirectLinkSettings().then(res => {
      if (res.success && res.settings) {
        setEnabled(res.settings.directLinkEnabled);
        setUrl(res.settings.directLinkUrl || "");
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");
    
    // enabledがfalseの場合は、urlに空文字列を渡す
    const result = await updateDirectLink(enabled, url); 
    
    if (result.success) {
      setSuccess("設定を保存しました！");
    } else {
      setError(result.error || "保存に失敗しました。");
    }
    setIsLoading(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">ダイレクトリンク設定</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md max-w-2xl">
        {error && <p className="mb-4 text-red-500">{error}</p>}
        {success && <p className="mb-4 text-green-500">{success}</p>}
        <div className="flex items-center justify-between mb-4">
          <label htmlFor="enabled" className="text-lg font-medium text-gray-700">機能を有効にする</label>
          <button type="button" onClick={() => setEnabled(!enabled)} className={`${enabled ? 'bg-indigo-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out`}>
            <span className={`${enabled ? 'translate-x-5' : 'translate-x-0'} inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
          </button>
        </div>
        {enabled && (
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700">リダイレクト先URL</label>
            <input type="url" id="url" value={url} onChange={(e) => setUrl(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" placeholder="https://..." />
          </div>
        )}
        <div className="mt-6">
          <button type="submit" disabled={isLoading} className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400">
            {isLoading ? "保存中..." : "保存する"}
          </button>
        </div>
      </form>
    </div>
  );
}