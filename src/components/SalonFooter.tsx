import React from 'react';

interface SalonData {
    name: string;
    location: string | null;
    mapUrl: string | null;
    websiteUrl: string | null;
    logoUrl: string | null;
    primaryColor: string;
}

interface SalonFooterProps {
    salon: SalonData;
}

export default function SalonFooter({ salon }: SalonFooterProps) {
    return (
        <div className="w-full mt-12 pt-8 pb-4 border-t border-gray-200/50 flex flex-col items-center text-center z-10">
            <p className="text-[10px] text-gray-400 mb-4 uppercase tracking-widest">Presented by</p>
            
            <div className="flex items-center gap-4 bg-white/50 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-gray-100 max-w-sm w-full mx-4">
                {/* 店舗画像 */}
                <div className="shrink-0">
                    {salon.logoUrl ? (
                        <img 
                            src={salon.logoUrl} 
                            alt={salon.name} 
                            className="w-12 h-12 rounded-lg object-cover bg-gray-200" 
                        />
                    ) : (
                        <div 
                            className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                            style={{ backgroundColor: salon.primaryColor }}
                        >
                            {salon.name[0]}
                        </div>
                    )}
                </div>

                {/* 店舗情報テキスト */}
                <div className="flex-1 text-left min-w-0">
                    {/* 店舗名 (クリックでHPへ) */}
                    <h4 className="font-bold text-gray-800 truncate text-sm mb-0.5">
                        {salon.websiteUrl ? (
                            <a 
                                href={salon.websiteUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="hover:underline hover:text-indigo-600 transition-colors"
                            >
                                {salon.name}
                            </a>
                        ) : (
                            <span>{salon.name}</span>
                        )}
                    </h4>
                    
                    {/* 地域 (クリックでMapへ) */}
                    {salon.location && (
                        <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                            <span>📍</span>
                            {salon.mapUrl ? (
                                <a 
                                    href={salon.mapUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="hover:underline hover:text-indigo-600 transition-colors"
                                >
                                    {salon.location}
                                </a>
                            ) : (
                                <span>{salon.location}</span>
                            )}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}