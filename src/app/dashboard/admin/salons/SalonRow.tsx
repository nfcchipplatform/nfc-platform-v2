"use client";

import { useState } from "react";

interface Salon {
  id: string;
  name: string;
  slug: string;
  salonCode: string | null;
  location: string | null;
  createdAt: Date;
  _count: { users: number };
}

interface SalonRowProps {
  salon: Salon;
  updateSalon: (formData: FormData) => Promise<void>;
  deleteSalon: (formData: FormData) => Promise<void>;
}

export default function SalonRow({ salon, updateSalon, deleteSalon }: SalonRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: salon.name,
    slug: salon.slug,
    salonCode: salon.salonCode || "",
    location: salon.location || "",
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: salon.name,
      slug: salon.slug,
      salonCode: salon.salonCode || "",
      location: salon.location || "",
    });
  };

  const handleDelete = async () => {
    if (!confirm(`本当に「${salon.name}」を削除しますか？\n顧客数: ${salon._count.users}名`)) {
      return;
    }

    const formData = new FormData();
    formData.append("id", salon.id);
    
    try {
      await deleteSalon(formData);
      window.location.reload();
    } catch (error) {
      alert("削除に失敗しました");
    }
  };

  if (isEditing) {
    return (
      <tr className="bg-blue-50">
        <td colSpan={5} className="px-6 py-4">
          <form
            action={async (formData: FormData) => {
              formData.append("id", salon.id);
              await updateSalon(formData);
              window.location.reload();
            }}
            className="flex flex-wrap gap-4 items-end"
          >
            <input type="hidden" name="id" value={salon.id} />
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">店舗名</label>
              <input
                name="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border rounded px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">ID (Slug)</label>
              <input
                name="slug"
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="border rounded px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">店舗コード</label>
              <input
                name="salonCode"
                type="text"
                value={formData.salonCode}
                onChange={(e) => setFormData({ ...formData, salonCode: e.target.value })}
                className="border rounded px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">地域</label>
              <input
                name="location"
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="border rounded px-3 py-2 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 text-white font-bold px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
              >
                保存
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-200 text-gray-800 font-bold px-4 py-2 rounded text-sm hover:bg-gray-300 transition-colors"
              >
                キャンセル
              </button>
            </div>
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{salon.name}</div>
        <div className="text-xs text-gray-500">{salon.location || "-"}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 font-mono bg-gray-100 inline-block px-2 py-0.5 rounded">
          {salon.salonCode || "-"}
        </div>
        <div className="text-xs text-gray-500 mt-1">{salon.slug}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {salon._count.users} 名
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(salon.createdAt).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <div className="flex gap-2">
          <button
            onClick={handleEdit}
            className="text-blue-600 hover:text-blue-800 font-bold"
          >
            編集
          </button>
          <button
            onClick={handleDelete}
            className="text-red-600 hover:text-red-800 font-bold"
          >
            削除
          </button>
        </div>
      </td>
    </tr>
  );
}

