"use client";

import {
  Button,
  Input,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
} from "@heroui/react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const LoginForm = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();

  const onSubmit = async (data) => {
    // Cuando se implemente lal autenticacion y la bd, se descomenta esta parte y se agrega la funcionalidad
    const { dni, password } = data;
    setLoading(true);
    const res = await signIn("credentials", {
      dni,
      password,
      redirect: false,
    });
    setLoading(false);

    if (res?.error) {
      setError("dni", { message: res?.error });
      return;
    }

    // Successful sign in
    router.push("/home");
  };

  return (
    <Card className="bg-white px-8 py-4 w-[90%] md:w-[420px] h-[65%] flex flex-col justify-between">
      <CardHeader className="flex flex-col gap-4 items-start">
        <h1 className="text-2xl font-black">Iniciar Sesión</h1>
        <p>Ingresa los datos de tu cuenta para iniciar sesión</p>
      </CardHeader>
      <CardBody>
        <form
          id="signinForm"
          onSubmit={handleSubmit(onSubmit)}
          className="h-full flex flex-col gap-6 items-center justify-center"
        >
          <Input
            {...register("dni")}
            variant="underlined"
            label="Cédula de Identidad"
            name="dni"
            isInvalid={!!errors.dni}
            errorMessage={errors.dni?.message}
            isRequired
          />
          <Input
            {...register("password")}
            variant="underlined"
            label="Contraseña"
            type={showPassword ? "text" : "password"}
            name="password"
            isInvalid={!!errors.password}
            errorMessage={errors.password?.message}
            isRequired
            endContent={
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                className="focus:outline-none"
              >
                {showPassword ? (
                  <FaEyeSlash className="text-xl text-gray-500" />
                ) : (
                  <FaEye className="text-xl text-gray-500" />
                )}
              </button>
            }
          />
        </form>
      </CardBody>
      <CardFooter className="flex flex-col gap-4 justify-center">
        <Button
          color="primary"
          type="submit"
          form="signinForm"
          className="w-full py-3 text-lg font-semibold rounded-lg flex justify-center items-center"
          isDisabled={loading}
          isLoading={loading}
        >
          {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
        </Button>
        <p>
          ¿No tienes cuenta?{" "}
          <Link href="/signup" className="underline text-primary">
            Regístrate
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
