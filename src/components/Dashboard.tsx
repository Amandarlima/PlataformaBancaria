import type { Account, Transaction } from "../types/bank";
import { MonthlyFlowChart } from "./MonthlyFlowChart";

interface DashboardProps {
  account: Account;
  transactions: Transaction[];
}

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

export function Dashboard({ account, transactions }: DashboardProps) {
  const latestDescriptions = transactions.slice(0, 2).map((t) => t.description);

  return (
    <section className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <article className="rounded-2xl bg-white p-5 shadow dark:bg-slate-900">
          <h3 className="m-0 text-sm text-slate-500 dark:text-slate-400">Cliente</h3>
          <p className="mb-0 mt-2 text-lg font-bold">{account.customerName}</p>
        </article>
        <article className="rounded-2xl bg-white p-5 shadow dark:bg-slate-900">
          <h3 className="m-0 text-sm text-slate-500 dark:text-slate-400">Conta principal</h3>
          <p className="mb-0 mt-2 text-lg font-bold">
            Ag. {account.agency} | Cc. {account.accountNumber}
          </p>
        </article>
        <article className="rounded-2xl bg-white p-5 shadow dark:bg-slate-900">
          <h3 className="m-0 text-sm text-slate-500 dark:text-slate-400">Saldo disponivel</h3>
          <p className="mb-0 mt-2 text-lg font-bold text-emerald-600">{brl.format(account.balance)}</p>
        </article>
      </div>

      <article className="rounded-2xl bg-white p-5 shadow dark:bg-slate-900">
        <h3 className="m-0 text-sm text-slate-500 dark:text-slate-400">Ultimas movimentacoes observadas</h3>
        <p className="m-0 mt-2 text-sm text-slate-700 dark:text-slate-300">
          {latestDescriptions.length > 0
            ? latestDescriptions.join("  |  ")
            : "Sem movimentacoes registradas no momento."}
        </p>
      </article>

      <MonthlyFlowChart transactions={transactions} />
    </section>
  );
}
