"use client";

import { salonUnlinkNfc, sendResetMailByAdmin } from "@/actions/salonActions";

type Customer = {
    id: string;
    name: string | null;
    email: string | null;
    username: string | null;
    nfcCardId: string | null;
    image: string | null;
};

export default function CustomerList({ customers }: { customers: Customer[] }) {

    const handleReset = async (email: string) => {
        if(!confirm(`${email} 宛にパスワードリセットメールを送信しますか？`)) return;
        const res = await sendResetMailByAdmin(email);
        if(res?.error) alert(res.error);
        else alert("メールを送信しました！");
    };

    const handleUnlink = async (id: string) => {
        if(!confirm("NFCカードの紐付けを解除しますか？")) return;
        const res = await salonUnlinkNfc(id);
        if(res?.success) alert("解除しました");
        else alert(res?.error);
    };

    return (
        <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left font-bold text-gray-500">顧客名</th>
                        <th className="px-6 py-3 text-left font-bold text-gray-500">連絡先</th>
                        <th className="px-6 py-3 text-left font-bold text-gray-500">NFCカード</th>
                        <th className="px-6 py-3 text-right font-bold text-gray-500">操作</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {customers.map((user) => (
                        <tr key={user.id}>
                            <td className="px-6 py-4">
                                <div className="flex items-center">
                                    <div className="h-8 w-8 rounded-full bg-gray-200 mr-3 overflow-hidden">
                                        {user.image ? <img src={user.image} className="w-full h-full object-cover"/> : null}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900">{user.name}</div>
                                        <div className="text-gray-500 text-xs">@{user.username}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-gray-600">
                                {user.email}
                            </td>
                            <td className="px-6 py-4">
                                {user.nfcCardId ? (
                                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-mono">
                                        {user.nfcCardId}
                                    </span>
                                ) : (
                                    <span className="text-gray-400 text-xs">未連携</span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-right space-x-3">
                                <button 
                                    onClick={() => user.email && handleReset(user.email)}
                                    className="text-indigo-600 hover:underline text-xs"
                                >
                                    PWリセット送信
                                </button>
                                {user.nfcCardId && (
                                    <button 
                                        onClick={() => handleUnlink(user.id)}
                                        className="text-red-500 hover:underline text-xs"
                                    >
                                        NFC解除
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {customers.length === 0 && <div className="p-8 text-center text-gray-400">顧客データがありません</div>}
        </div>
    );
}