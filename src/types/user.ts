// src/types/user.ts

export interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  title: string | null;
  bio: string | null;
  website: string | null;
  twitter: string | null;
  instagram: string | null;
  image: string | null; // ▼▼▼ この行を追加してください ▼▼▼
}