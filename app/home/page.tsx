"use client";

export default function Dashboard({ children }: { children: React.ReactNode }) {

  return (
    <main className="flex flex-col">
      <div className="flex h-[calc(100vh-74px)] overflow-hidden relative">
        {/* Contenido principal del perfil */}
        <div className="flex flex-1 justify-center items-start p-10 overflow-auto">
          {children}
        </div>
      </div>
    </main>
  );
}