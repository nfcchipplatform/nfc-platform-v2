// src/lib/auth.ts

// ... (importsは変更なし)
import { AuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("メールアドレスとパスワードは必須です");
        }
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user || !user.hashedPassword) {
          throw new Error("無効な認証情報です");
        }
        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );
        if (!isCorrectPassword) {
          throw new Error("無効な認証情報です");
        }
        return user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.sub = user.id;
        // ▼ ログイン初期処理：DBから値をとってトークンに入れる
        token.role = (user as any).role; 
        token.salonId = (user as any).salonId;
      }
      
      // ▼ セッション更新時（update()を呼んだ時）の再取得処理
      if (trigger === "update" && token.sub) {
        const dbUser = await prisma.user.findUnique({ where: { id: token.sub as string } });
        if (dbUser) {
          token.nfcCardId = dbUser.nfcCardId;
          token.role = dbUser.role;     // [NEW]
          token.salonId = dbUser.salonId; // [NEW]
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        // ▼ DBアクセスを減らすため、基本はtokenから値をセットする形でもOKですが、
        // 確実性を重視して再度DBを見る実装のままとします（既存コード維持）
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
        });

        if (dbUser) {
          session.user.id = dbUser.id;
          session.user.name = dbUser.name;
          session.user.email = dbUser.email;
          session.user.image = dbUser.image;
          (session.user as any).username = dbUser.username;
          (session.user as any).title = dbUser.title;
          (session.user as any).bio = dbUser.bio;
          (session.user as any).website = dbUser.website;
          (session.user as any).twitter = dbUser.twitter;
          (session.user as any).instagram = dbUser.instagram;
          (session.user as any).nfcCardId = dbUser.nfcCardId;
          // ▼▼▼ 以下を追加 ▼▼▼
          (session.user as any).role = dbUser.role;
          (session.user as any).salonId = dbUser.salonId;
        }
      }
      return session;
    },
  },
  session: { 
    strategy: "jwt" 
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};