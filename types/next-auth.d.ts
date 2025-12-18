import { DefaultSession, DefaultUser } from "next-auth";
import { UserRole } from "./lib/types";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: UserRole;
      profile_completed: boolean;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: UserRole;
    profile_completed: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    profile_completed: boolean;
  }
}
