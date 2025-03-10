'use server';

import {z} from 'zod';
import postgres from "postgres";
import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";

const sql = postgres(process.env.POSTGRES_URL!, {ssl: 'require'});

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});

const CreateInvoiceSchema = FormSchema.omit({id: true, date: true});

const UpdateInvoiceSchema = FormSchema.omit({id: true, date: true});

export async function createInvoice(formData: FormData) {
  const {customerId, amount, status} = CreateInvoiceSchema.parse(
    Object.fromEntries(new Map([...formData])),
  );

  const amountInCents = amount * 100;

  const date = new Date().toISOString().split('T')[0];

  await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `;

  redirectToInvoices();
}

export async function updateInvoice(id: string, formData: FormData) {
  const {customerId, amount, status} = UpdateInvoiceSchema.parse(
    Object.fromEntries(new Map([...formData])),
  );

  const amountInCents = amount * 100;

  await sql`
      UPDATE invoices
      SET customer_id = ${customerId},
          amount      = ${amountInCents},
          status      = ${status}
      WHERE id = ${id}
  `

  redirectToInvoices();
}

export async function deleteInvoice(id: string) {
  await sql`DELETE FROM invoices WHERE id = ${id}`;

  revalidatePath('/dashboard/invoices');
}

function redirectToInvoices() {

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}