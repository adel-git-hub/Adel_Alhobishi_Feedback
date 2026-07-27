import 'next-auth';
import { Role } from '@prisma/client';

declare module 'next-auth' {
  interface User {
    role: Role;
    branchId: string | null;
    departmentId: string | null;
  }
  interface Session {
    user: User & {
      id: string;
      role: Role;
      branchId: string | null;
      departmentId: string | null;
    };
  }
}
