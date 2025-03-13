"use client";

import { useState } from "react";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";

import { lusitana } from '@/app/ui/fonts';
import {
  AtSymbolIcon,
  KeyIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { authenticate } from "@/app/lib/actions/account-actions";
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from '../button';

export default function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || '/dashboard';
  const [errorMessage, formAction, isPending] = useActionState(authenticate, undefined);

  // Estado para armazenar erros do formulário
  const [formErrors, setFormErrors] = useState<{ email?: string; password?: string }>({});
  const [formData, setFormData] = useState({ email: "", password: "" });

  // Função de validação dinâmica
  const validateField = (name: string, value: string) => {
    let error = "";

    if (name === "email") {
      if (!value) {
        error = "O email é obrigatório.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        error = "Digite um email válido.";
      }
    }

    if (name === "password") {
      if (!value) {
        error = "A senha é obrigatória.";
      } else if (value.length < 6) {
        error = "A senha deve ter pelo menos 6 caracteres.";
      }
    }

    setFormErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
  };

  // Captura os valores do formulário e valida em tempo real
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData({ ...formData, [name]: value });

    // Validação dinâmica conforme o usuário digita
    validateField(name, value);
  };

  // Validação antes do envio
  const validateForm = () => {
    validateField("email", formData.email);
    validateField("password", formData.password);
    return Object.values(formErrors).every((error) => !error);
  };

  // Intercepta o envio do formulário para validar antes de submeter
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!validateForm()) {
      e.preventDefault();
    }
  };

  return (
    <form action={formAction} className="space-y-3" onSubmit={handleSubmit}>
      <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
        <h1 className={`${lusitana.className} mb-3 text-2xl`}>
          Please log in to continue.
        </h1>

        <div className="w-full">
          {/* Campo de Email */}
          <div>
            <label className="mb-3 mt-5 block text-xs font-medium text-gray-900" htmlFor="email">
              Email
            </label>

            <div className="relative">
              <input
                className="peer block w-full rounded-md border py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email address"
              />
              <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>

            {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
          </div>

          {/* Campo de Senha */}
          <div className="mt-4">
            <label className="mb-3 mt-5 block text-xs font-medium text-gray-900" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
              />
              <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>

            {formErrors.password && <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>}
          </div>
        </div>

        <input type="hidden" name="redirectTo" value={callbackUrl} />

        {/* Botão de login */}
        <Button className="mt-4 w-full" aria-disabled={isPending}>
          Log in <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
        </Button>

        {/* Mensagem de erro do servidor */}
        <div className="flex h-8 items-end space-x-1">
          {errorMessage && (
            <>
              <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
              <p className="text-sm text-red-500">{errorMessage}</p>
            </>
          )}
        </div>
      </div>
    </form>
  );
}
