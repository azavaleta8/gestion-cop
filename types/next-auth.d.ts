import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
      dni: string;
    };
  }

  interface User {
    dni: string;
    id: string;
    name: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    dni: string;
    id: string;
    name: string;
  }
}
