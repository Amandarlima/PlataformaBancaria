export type TransactionType = "entrada" | "saida";
export type TransferMethod = "pix" | "ted" | "doc" | "interna";

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
}

export interface Account {
  bankName: string;
  customerName: string;
  agency: string;
  accountNumber: string;
  balance: number;
}

export interface TransferInput {
  method: TransferMethod;
  destinationBank: string;
  destinationAccount: string;
  pixKey: string;
  recipientName: string;
  value: number;
  description: string;
}
