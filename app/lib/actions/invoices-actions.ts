'use server';

import {z} from 'zod';
import postgres from "postgres";
import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";

export type State = {
  errors?: {
    customer_id?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

const sql = postgres(process.env.POSTGRES_URL!, {ssl: 'require'});

const FormSchema = z.object({
  id: z.string(),
  customer_id: z.string({message: 'Please select a customer.'}),
  amount: z.coerce.number().gt(0, {message: 'Please enter an amount greater than $0.'}),
  status: z.enum(['pending', 'paid'], {message: 'Please select an invoice status.'}),
  date: z.string(),
});

const InvoiceSchema = FormSchema.omit({id: true, date: true});

export async function createInvoice(prevState: State, formData: FormData) {
  const validatedFields = InvoiceSchema.safeParse(
    Object.fromEntries(new Map([...formData])),
  );

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }

  const {customer_id, amount, status} = validatedFields.data;

  const amountInCents = amount * 100;

  const date = new Date().toISOString().split('T')[0];

  try {
    await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customer_id}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    console.error(error);

    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }

  redirectToInvoices();

  return {
    message: 'Invoice created successfully.',
  };
}

export async function updateInvoice(id: number, prevState: State, formData: FormData) {
  const validatedFields = InvoiceSchema.safeParse(
    Object.fromEntries(new Map([...formData])),
  );

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }

  const {customer_id, amount, status} = validatedFields.data;

  const amountInCents = amount * 100;

  try {
    await sql`
        UPDATE invoices
        SET customer_id = ${customer_id},
            amount      = ${amountInCents},
            status      = ${status}
        WHERE id = ${id}
    `;
  } catch (error) {
    console.error(error);

    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }

  redirectToInvoices();

  return {
    message: `Invoice #${id} updated successfully.`,
  };
}

export async function deleteInvoice(id: string) {
  try {
    await sql`DELETE
              FROM invoices
              WHERE id = ${id}`;
  } catch (error) {
    console.error(error);
  }

  revalidatePath('/dashboard/invoices');
}

function redirectToInvoices() {
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}