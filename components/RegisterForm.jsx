"use client";

import {
  Button,
  Input,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
} from "@heroui/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const RegisterForm = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dni: data.dni,
          password: data.password,
          name: data.name,
        }),
      });
      setLoading(false);

      if (res.ok) {
        Swal.fire({
          title: "¡Registro exitoso!",
          text: "",
          icon: "success",
          confirmButtonText: "Continuar",
        });
        router.push("/signin");
      } else {
        Swal.fire({
          title: "Error",
          text: "Ocurrió un error al registrar el usuario",
          icon: "error",
          confirmButtonText: "Continuar",
        });
      }
    } catch (e) {
      setLoading(false);
      // Log the error for debugging
      // eslint-disable-next-line no-console
      console.error("register error", e);
      Swal.fire({ title: "Error", text: "Ocurrió un error", icon: "error" });
    }
  };

  return (
    <Card className="px-8 py-4 w-[80%] md:w-[420px] h-[70%] flex flex-col justify-between">
      <CardHeader className="flex flex-col gap-4 items-start">
        <h1 className="text-2xl font-black">Registrarse</h1>
        <p>Crea una cuenta para acceder</p>
      </CardHeader>
      <CardBody>
        <form
          id="registerForm"
          onSubmit={handleSubmit(onSubmit)}
          className="h-full flex flex-col gap-6 items-center justify-center"
        >
          <Input
            {...register("name", { required: "El nombre es obligatorio" })}
            variant="underlined"
            label="Nombre"
            name="name"
            isInvalid={!!errors.name}
            errorMessage={errors.name?.message}
            isRequired
          />
          <Input
            {...register("dni", { required: "La cédula es obligatoria" })}
            variant="underlined"
            label="Cédula de Identidad"
            name="dni"
            isInvalid={!!errors.dni}
            errorMessage={errors.dni?.message}
            isRequired
          />
          <Input
            {...register("email", { required: "El correo es obligatorio" })}
            variant="underlined"
            label="Correo electrónico"
            name="email"
            isInvalid={!!errors.email}
            errorMessage={errors.email?.message}
            isRequired
          />
          <Input
            {...register("password", {
              required: "La contraseña es obligatoria",
            })}
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
      <CardFooter className="flex flex-col gap-8 justify-center">
        <Button
          className="w-full py-3 text-lg font-semibold rounded-lg flex justify-center items-center"
          color="primary"
          type="submit"
          form="registerForm"
          isLoading={loading}
        >
          {loading ? "Registrando..." : "Registrar"}
        </Button>
        <p>
          ¿Ya tienes cuenta?{" "}
          <Link href="/signin" className="underline text-primary">
            Inicia sesión
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default RegisterForm;
