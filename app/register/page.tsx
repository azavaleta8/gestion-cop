import RegisterForm from "@/components/RegisterForm";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function Register() {
  const session = await getServerSession();

  if (session) {
    redirect("/");
  }

  return (
    <main className="w-full h-svh flex flex-col justify-center items-center">
      <RegisterForm />
    </main>
  );
}