import { useEffect, useState } from "react";
import { Dashboard } from "./components/Dashboard";
import { Header } from "./components/Header";
import { TransactionsList } from "./components/TransactionsList";
import { TransferForm } from "./components/TransferForm";
import { useBankData } from "./hooks/useBankData";

type Tab = "dashboard" | "transactions" | "transfer";

export default function App() {
  const larguraLayout = "mx-auto w-[min(96vw,1700px)]";
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [modoEscuro, setModoEscuro] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    const savedTheme = window.localStorage.getItem("tema");
    if (savedTheme) {
      return savedTheme === "escuro";
    }
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  });
  const {
    account,
    transactions,
    isLoadingAccount,
    isLoadingTransactions,
    accountError,
    transactionsError,
    loadAccount,
    loadTransactions,
    registerTransfer
  } = useBankData();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", modoEscuro);
    window.localStorage.setItem("tema", modoEscuro ? "escuro" : "claro");
  }, [modoEscuro]);

  if (accountError && !isLoadingAccount && !account) {
    return (
      <main className={`${larguraLayout} flex min-h-screen flex-col items-start justify-center gap-4 p-4`}>
        <h1 className="m-0 text-2xl font-bold text-slate-800 dark:text-slate-100">Nao foi possivel carregar sua conta.</h1>
        <p className="m-0 text-sm text-red-700">{accountError}</p>
        <button
          type="button"
          onClick={() => void loadAccount()}
          className="rounded-xl bg-bank-500 px-4 py-2 font-semibold text-white transition hover:bg-bank-700"
        >
          Tentar novamente
        </button>
      </main>
    );
  }

  if (isLoadingAccount || !account) {
    return (
      <main className={`${larguraLayout} p-4`}>
        <section className="animate-pulse rounded-2xl bg-slate-200 p-6 dark:bg-slate-800">
          <div className="h-8 w-64 rounded-lg bg-slate-300 dark:bg-slate-700" />
          <div className="mt-3 h-5 w-48 rounded-lg bg-slate-300 dark:bg-slate-700" />
        </section>
        <section className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <article key={index} className="h-32 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
          ))}
        </section>
      </main>
    );
  }

  return (
    <main className={`${larguraLayout} flex min-h-screen flex-col gap-4 p-4 pb-8`}>
      <Header
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        bankName={account.bankName}
        customerName={account.customerName}
        modoEscuro={modoEscuro}
        onToggleModoEscuro={() => setModoEscuro((value) => !value)}
      />

      {activeTab === "dashboard" && <Dashboard account={account} transactions={transactions} />}

      {activeTab === "transactions" && (
        <TransactionsList
          transactions={transactions}
          isLoading={isLoadingTransactions}
          error={transactionsError}
          onRetry={loadTransactions}
        />
      )}

      {activeTab === "transfer" && <TransferForm balance={account.balance} onSubmit={registerTransfer} />}
    </main>
  );
}
