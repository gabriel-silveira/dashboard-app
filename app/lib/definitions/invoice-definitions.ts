export type TInvoice = {
  id?: number;
  customer_id: string;
  amount: number;
  status: 'pending' | 'paid' | '';
  date?: Date;
}
