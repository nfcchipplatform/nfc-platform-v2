"use client";

import { useState } from "react";
import { updateUserRole, updateUserSalon, adminUnlinkNfc, deleteUser } from "@/actions/adminActions";

// 型定義
type UserData = {
  id: string;
  name: string | null;
  username: string | null;
  email: string | null;
  role: string;
  salonId: string | null;
  nfcCardId: string | null;
  image: string | null;
  salon: { name: string } | null;
};

type SalonOption = {
  id: string;
  name: string;
};

export default function UserTable({ users, salons }: { users: UserData[]; salons: SalonOption[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // 汎用処理ラッパー
  const handleAction = async (userId: string, action: () => Promise<any>) => {
    setLoadingId(userId);
    if (!confirm("変更を反映しますか？")) {
        setLoadingId(null);
        return;
    }
    await action();
    setLoadingId(null);
  };

  return (
    <div className="bg-white rounded-xl shadow overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-bold text-gray-500">ユーザー</th>
            <th className="px-4 py-3 text-left font-bold text-gray-500">権限 (Role)</th>
            <th className="px-4 py-3 text-left font-bold text-gray-500">所属店舗</th>
            <th className="px-4 py-3 text-left font-bold text-gray-500">NFCカード</th>
            <th className="px-4 py-3 text-right font-bold text-gray-500">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id} className={loadingId === user.id ? "opacity-50 pointer-events-none" : ""}>
              
              {/* ユーザー情報 */}
              <td className="px-4 py-3">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-3">
                    {user.image ? <img src={user.image} className="h-full w-full object-cover"/> : user.name?.[0]}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{user.name}</div>
                    <div className="text-gray-500 text-xs">@{user.username}</div>
                  </div>
                </div>
              </td>

              {/* 権限変更プルダウン */}
              <td className="px-4 py-3">
                <select 
                    defaultValue={user.role}
                    onChange={(e) => handleAction(user.id, () => updateUserRole(user.id, e.target.value as any))}
                    className={`border rounded px-2 py-1 text-xs font-bold ${
                        user.role === 'SUPER_ADMIN' ? 'bg-red-50 text-red-700 border-red-200' :
                        user.role === 'SALON_ADMIN' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 
                        'bg-gray-50 text-gray-700'
                    }`}
                >
                    <option value="USER">User</option>
                    <option value="SALON_ADMIN">Salon Admin</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </td>

              {/* 店舗変更プルダウン */}
              <td className="px-4 py-3">
                <select
                    defaultValue={user.salonId || "null"}
                    onChange={(e) => handleAction(user.id, () => updateUserSalon(user.id, e.target.value))}
                    className="border rounded px-2 py-1 text-xs max-w-[150px] truncate"
                >
                    <option value="null">-- 所属なし --</option>
                    {salons.map(salon => (
                        <option key={salon.id} value={salon.id}>{salon.name}</option>
                    ))}
                </select>
              </td>

              {/* NFC管理 */}
              <td className="px-4 py-3">
                {user.nfcCardId ? (
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                            {user.nfcCardId}
                        </span>
                        <button 
                            onClick={() => handleAction(user.id, () => adminUnlinkNfc(user.id))}
                            className="text-xs text-red-500 underline hover:text-red-700"
                        >
                            解除
                        </button>
                    </div>
                ) : (
                    <span className="text-gray-400 text-xs">-</span>
                )}
              </td>

              {/* 削除ボタン */}
              <td className="px-4 py-3 text-right">
                <button 
                    onClick={() => {
                        if(confirm("本当にこのユーザーを削除しますか？\nこの操作は取り消せません。")) {
                            handleAction(user.id, () => deleteUser(user.id));
                        }
                    }}
                    className="text-red-600 hover:bg-red-50 px-3 py-1 rounded text-xs font-bold border border-red-200"
                >
                    削除
                </button>
              </td>

            </tr>
          ))}
        </tbody>
      </table>
      {users.length === 0 && <div className="p-8 text-center text-gray-400">ユーザーが見つかりません</div>}
    </div>
  );
}