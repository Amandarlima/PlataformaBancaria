import { useMemo, useState } from "react";
import type { Transaction, TransactionType } from "../types/bank";

interface TransactionsListProps {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => Promise<void>;
}

const dateFmt = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });
const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function TransactionsList({ transactions, isLoading, error, onRetry }: TransactionsListProps) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<"todos" | TransactionType>("todos");

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch = t.description.toLowerCase().includes(search.toLowerCase());
      const matchesType = type === "todos" ? true : t.type === type;
      return matchesSearch && matchesType;
    });
  }, [transactions, search, type]);

  return (
    <section className="rounded-2xl bg-white p-4 shadow dark:bg-slate-900 sm:p-5">
      <h2 className="mt-0 text-lg">Extrato de transacoes</h2>
      <p className="mb-4 mt-1 text-xs text-slate-500 dark:text-slate-400">
        {filtered.length} registro(s) exibido(s) de {transactions.length} movimentacao(oes)
      </p>

      <div className="mb-4 grid gap-3 md:grid-cols-[2fr,1fr]">
        <input
          type="text"
          placeholder="Buscar por descricao"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-xl border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value as "todos" | TransactionType)}
          className="rounded-xl border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
        >
          <option value="todos">Todos os tipos</option>
          <option value="entrada">Entrada</option>
          <option value="saida">Saida</option>
        </select>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="h-10 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950/40">
          <p className="m-0 text-sm text-red-700">Erro ao carregar: {error}</p>
          <button
            type="button"
            onClick={() => void onRetry()}
            className="mt-3 rounded-lg bg-red-600 px-3 py-1 text-xs font-semibold text-white"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {!isLoading && !error && filtered.length === 0 && (
        <p className="text-slate-500 dark:text-slate-400">Nenhuma transacao encontrada.</p>
      )}

      {!isLoading && !error && filtered.length > 0 && (
        <div className="space-y-2">
          <div className="grid gap-2 md:hidden">
            {filtered.map((t) => (
              <article key={t.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                <div className="flex items-center justify-between gap-2">
                  <p className="m-0 text-xs text-slate-500 dark:text-slate-400">{dateFmt.format(new Date(t.date))}</p>
                  <p
                    className={`m-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      t.type === "entrada"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                        : "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                    }`}
                  >
                    {t.type}
                  </p>
                </div>
                <p className="mb-0 mt-2 text-sm font-medium break-words">{t.description}</p>
                <p className={`mb-0 mt-2 text-sm font-semibold ${t.type === "entrada" ? "text-emerald-600" : "text-rose-600"}`}>
                  {t.type === "entrada" ? "+" : "-"} {brl.format(t.amount)}
                </p>
              </article>
            ))}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left dark:border-slate-700">
                  <th className="pb-2 pr-2">Data</th>
                  <th className="pb-2 pr-2">Descricao</th>
                  <th className="pb-2 pr-2">Tipo</th>
                  <th className="pb-2 pr-2">Valor</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-2 pr-2 whitespace-nowrap">{dateFmt.format(new Date(t.date))}</td>
                    <td className="py-2 pr-2 break-words">{t.description}</td>
                    <td className="py-2 pr-2 whitespace-nowrap">{t.type}</td>
                    <td className={`py-2 pr-2 font-semibold whitespace-nowrap ${t.type === "entrada" ? "text-emerald-600" : "text-rose-600"}`}>
                      {t.type === "entrada" ? "+" : "-"} {brl.format(t.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
