import LoginForm from "@/src/components/LoginForm"; // o ruta relativa

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center">
      <LoginForm />
    </main>
  );
}

