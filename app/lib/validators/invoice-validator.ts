import {TInvoice} from "@/app/lib/definitions/invoice-definitions";

export function validateForm(formData: TInvoice) {
  let hasErrors = false;

  const errors: Partial<Record<"customer_id" | "amount" | "status", string>> = {};

  if (!formData.customer_id) {
    errors.customer_id = "Selecione um cliente.";
    hasErrors = true;
  }

  if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
    errors.amount = "Amount deve ser um número positivo.";
    hasErrors = true;
  }

  if (!formData.status) {
    errors.status = "Escolha um status.";
    hasErrors = true;
  }

  return { errors, hasErrors };
}
