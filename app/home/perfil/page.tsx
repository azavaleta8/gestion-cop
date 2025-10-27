"use client";
import { useSession } from "next-auth/react";

const ProfilePage = () => {
  const { data: session } = useSession();
  return (
    <div className="text-center">
      <img
        src="/avatar.png"
        alt="Avatar"
        className="w-24 h-24 rounded-full mx-auto mb-4"
      />
      <h3 className="text-xl font-semibold">
        {session?.user?.name || "Usuario"}
      </h3>
      <p className="text-gray-500">
        {session?.user?.dni || "Correo electrónico"}
      </p>
    </div>
  );
};

export default ProfilePage;
