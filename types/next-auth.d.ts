// types/next-auth.d.ts (最終修正版)

import { DefaultSession, DefaultUser } from "next-auth";

// PrismaのUserモデルと一致するように、NextAuthのUser型を拡張
interface User extends DefaultUser {
  id: string;
  username: string | null;
  title: string | null;
  bio: string | null;
  website: string | null;
  twitter: string | null;
  instagram: string | null;
  image: string | null; // ▼▼▼ この行を追加してください ▼▼▼
  nfcCardId: string | null; // ▼▼▼ この行を追加 ▼▼▼

}

declare module "next-auth" {
  // Sessionオブジェクトのuserプロパティを、上で拡張したUser型で上書き
  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  // JWTトークンにも必要なプロパティを追加
  interface JWT {
    id: string;
    username: string | null;
    image: string | null; // ▼▼▼ この行を追加してください ▼▼▼
  }
}