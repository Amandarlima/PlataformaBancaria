import { initialAccount, initialTransactions } from "../data/mock";
import type { Account, Transaction, TransferInput } from "../types/bank";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchAccount(): Promise<Account> {
  await wait(500);
  return { ...initialAccount };
}

export async function fetchTransactions(): Promise<Transaction[]> {
  await wait(700);
  return [...initialTransactions];
}

export async function transferFunds(
  payload: TransferInput,
  currentBalance: number
): Promise<{ transaction: Transaction; newBalance: number }> {
  await wait(900);

  if (payload.value <= 0) {
    throw new Error("O valor deve ser maior que zero.");
  }

  if (payload.value > currentBalance) {
    throw new Error("Saldo insuficiente para realizar a transferencia.");
  }

  const now = new Date().toISOString().slice(0, 10);
  const methodLabelMap = {
    pix: "PIX",
    ted: "TED",
    doc: "DOC",
    interna: "Transferencia interna"
  } as const;
  const methodLabel = methodLabelMap[payload.method];

  return {
    newBalance: currentBalance - payload.value,
    transaction: {
      id: crypto.randomUUID(),
      date: now,
      description: payload.description || `${methodLabel} para ${payload.recipientName}`,
      amount: payload.value,
      type: "saida"
    }
  };
}
