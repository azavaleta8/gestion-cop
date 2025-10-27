import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
      dni: string;
      rolId: number;
    };
  }

  interface User {
    dni: string;
    rolId: number;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    dni: string;
    rolId: number;
  }
}
