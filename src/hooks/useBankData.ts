import { useCallback, useEffect, useRef, useState } from "react";
import { fetchAccount, fetchTransactions, transferFunds } from "../services/bankService";
import type { Account, Transaction, TransferInput } from "../types/bank";

export function useBankData() {
  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingAccount, setIsLoadingAccount] = useState(true);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);
  const accountRef = useRef<Account | null>(null);

  useEffect(() => {
    accountRef.current = account;
  }, [account]);

  const loadAccount = useCallback(async () => {
    try {
      setIsLoadingAccount(true);
      const nextAccount = await fetchAccount();
      setAccount(nextAccount);
      setAccountError(null);
    } catch (err) {
      setAccountError(err instanceof Error ? err.message : "Erro ao carregar conta.");
    } finally {
      setIsLoadingAccount(false);
    }
  }, []);

  const loadTransactions = useCallback(async () => {
    try {
      setIsLoadingTransactions(true);
      const nextTransactions = await fetchTransactions();
      setTransactions(nextTransactions);
      setTransactionsError(null);
    } catch (err) {
      setTransactionsError(err instanceof Error ? err.message : "Erro ao carregar transacoes.");
    } finally {
      setIsLoadingTransactions(false);
    }
  }, []);

  useEffect(() => {
    void loadAccount();
    void loadTransactions();
  }, [loadAccount, loadTransactions]);

  const registerTransfer = useCallback(
    async (payload: TransferInput) => {
      const currentAccount = accountRef.current;
      if (!currentAccount) {
        throw new Error("Conta indisponivel no momento.");
      }

      const result = await transferFunds(payload, currentAccount.balance);
      setAccount((current) => {
        if (!current) {
          return current;
        }
        return { ...current, balance: current.balance - payload.value };
      });
      setTransactions((current) => [result.transaction, ...current]);
    },
    []
  );

  return {
    account,
    transactions,
    isLoadingAccount,
    isLoadingTransactions,
    accountError,
    transactionsError,
    loadAccount,
    loadTransactions,
    registerTransfer
  };
}
