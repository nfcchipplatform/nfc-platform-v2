// types/next-auth.d.ts

import { DefaultSession, DefaultUser } from "next-auth";
// Roleの型をPrismaからインポートしたいところですが、
// クライアントサイドでも使うため文字列ユニオン型として定義します
type Role = "USER" | "SALON_ADMIN" | "SUPER_ADMIN";

interface User extends DefaultUser {
  id: string;
  username: string | null;
  title: string | null;
  bio: string | null;
  website: string | null;
  twitter: string | null;
  instagram: string | null;
  image: string | null;
  nfcCardId: string | null;
  // ▼▼▼ 以下を追加 ▼▼▼
  role: Role;
  salonId: string | null;
}

declare module "next-auth" {
  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string | null;
    image: string | null;
    // ▼▼▼ 以下を追加 ▼▼▼
    role: Role;
    salonId: string | null;
  }
}