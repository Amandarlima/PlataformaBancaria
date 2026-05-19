import type { Account, Transaction } from "../types/bank";

export const initialAccount: Account = {
  bankName: "Banco Hemera",
  customerName: "Amanda Ribas",
  agency: "0102",
  accountNumber: "12345-6",
  balance: 4850.75
};

export const initialTransactions: Transaction[] = [
  { id: "1",
    date: "2026-05-22",
    description: "Financiamento Carro",
    amount: 3.178,
    type: "saida"
  },
  {
    id: "2",
    date: "2026-05-15",
    description: "Salario - Desenvolvimento Tech ",
    amount: 6200,
    type: "entrada"
  },
  {
    id: "3",
    date: "2026-05-16",
    description: "Supermercado Piraquara",
    amount: 412.9,
    type: "saida"
  },
  {
    id: "4",
    date: "2026-05-17",
    description: "Assinatura de internet fibra",
    amount: 119.99,
    type: "saida"
  },
  {
    id: "5",
    date: "2026-05-16",
    description: "Jantar - Restaurante Sato",
    amount: 137.4,
    type: "saida"
  },
  {
    id: "6",
    date: "2026-05-18",
    description: "Pix recebido - Joao",
    amount: 250,
    type: "entrada"
  },
  {
    id: "7",
    date: "2026-05-18",
    description: "Pix - Banca da Jo",
    amount: 45.40,
    type: "saida"
  },
  {
    id: "8",
    date: "2026-05-05",
    description: "Pix - Faculdade Positivo",
    amount: 1300,
    type: "saida"
  },
  {
    id: "9",
    date: "2026-05-03",
    description: "combustivel",
    amount: 230.2,
    type: "saida"
  },



];
