import LoginForm from "@/components/LoginForm";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function Signin() {
    const session = await getServerSession();

    if (session) {
        redirect("/home");
    }

    return (
        <main className="w-full h-svh flex flex-col justify-center items-center">
            <LoginForm />
        </main>
    );
}
