// src/components/VCardButton.tsx

"use client";

interface VCardButtonProps {
  user: {
    name: string | null;
    title: string | null;
    email: string | null;
    website: string | null;
  };
}

export default function VCardButton({ user }: VCardButtonProps) {
  const generateVCard = () => {
    const vCard = `BEGIN:VCARD
VERSION:3.0
N:${user.name || ''}
FN:${user.name || ''}
TITLE:${user.title || ''}
EMAIL:${user.email || ''}
URL:${user.website || ''}
END:VCARD`;

    const blob = new Blob([vCard], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${user.name || 'contact'}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={generateVCard}
      className="inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800"
    >
      連絡先を保存
    </button>
  );
}