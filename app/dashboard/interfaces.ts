export interface IInvoiceSearchParams {
  searchParams?: Promise<{
    query?: string;
    page?: number;
  }>
}