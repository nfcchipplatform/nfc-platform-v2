// src/components/FollowButton.tsx

"use client";

import { useState, useTransition } from 'react';
import { followUser, unfollowUser } from '@/actions/followActions';

interface FollowButtonProps {
    targetUserId: string;
    isFollowingInitial: boolean;
}

export default function FollowButton({ targetUserId, isFollowingInitial }: FollowButtonProps) {
    const [isFollowing, setIsFollowing] = useState(isFollowingInitial);
    const [isPending, startTransition] = useTransition();

    const handleFollowToggle = () => {
        startTransition(async () => {
            if (isFollowing) {
                const result = await unfollowUser(targetUserId);
                if (result.success) {
                    setIsFollowing(false);
                } else {
                    alert(`エラー: ${result.error}`);
                }
            } else {
                const result = await followUser(targetUserId);
                if (result.success) {
                    setIsFollowing(true);
                } else {
                    alert(`エラー: ${result.error}`);
                }
            }
        });
    };

    const buttonClass = isFollowing
        ? "inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg border border-gray-300 hover:bg-gray-200 disabled:opacity-50 transition-colors"
        : "inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors";

    return (
        <button
            onClick={handleFollowToggle}
            disabled={isPending}
            className={buttonClass}
        >
            {isPending
                ? (isFollowing ? "解除中..." : "送信中...")
                : (isFollowing ? "フォロー中" : "フォローする")}
        </button>
    );
}