import { useMemo, useState } from "react";
import type { TransferInput, TransferMethod } from "../types/bank";

interface TransferFormProps {
  balance: number;
  onSubmit: (payload: TransferInput) => Promise<void>;
}

const initialState: TransferInput = {
  method: "pix",
  destinationBank: "",
  destinationAccount: "",
  pixKey: "",
  recipientName: "",
  value: 0,
  description: ""
};

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

const decimalFmt = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const quickValues = [50, 150, 300];
const methodOptions: Array<{ id: TransferMethod; label: string; subtitle: string }> = [
  { id: "pix", label: "PIX", subtitle: "Instantaneo, 24h" },
  { id: "ted", label: "TED", subtitle: "Mesmo dia util" },
  { id: "doc", label: "DOC", subtitle: "Compensa no proximo dia" },
  { id: "interna", label: "Entre contas", subtitle: "Mesma instituicao" }
];

export function TransferForm({ balance, onSubmit }: TransferFormProps) {
  const [form, setForm] = useState<TransferInput>(initialState);
  const [valueInput, setValueInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const update = <K extends keyof TransferInput>(field: K, value: TransferInput[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const methodDescription = useMemo(() => {
    const currentMethod = methodOptions.find((option) => option.id === form.method);
    return currentMethod?.subtitle ?? "";
  }, [form.method]);

  const validate = () => {
    if (!form.recipientName.trim() || !form.description.trim()) {
      return "Preencha todos os campos obrigatorios.";
    }

    if (form.method === "pix" && !form.pixKey.trim()) {
      return "Informe a chave PIX do favorecido.";
    }

    if (form.method !== "pix" && !form.destinationAccount.trim()) {
      return "Informe a conta de destino.";
    }

    if (form.method !== "pix" && form.method !== "interna" && !form.destinationBank.trim()) {
      return "Informe o banco de destino.";
    }

    if (form.value <= 0) {
      return "O valor deve ser maior que zero.";
    }
    if (form.value > balance) {
      return "Saldo insuficiente para esta transferencia.";
    }
    return null;
  };

  const handleValueChange = (rawValue: string) => {
    const digits = rawValue.replace(/\D/g, "");
    const parsedValue = digits ? Number(digits) / 100 : 0;

    update("value", parsedValue);
    setValueInput(parsedValue === 0 ? "" : decimalFmt.format(parsedValue));
  };

  const applyQuickValue = (value: number) => {
    update("value", value);
    setValueInput(decimalFmt.format(value));
    setError(null);
  };

  const handleMethodChange = (method: TransferMethod) => {
    setForm((prev) => ({
      ...prev,
      method,
      destinationBank: method === "interna" ? "Banco Hemera" : prev.destinationBank,
      pixKey: method === "pix" ? prev.pixKey : "",
      destinationAccount: method === "pix" ? "" : prev.destinationAccount
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccess(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await onSubmit(form);
      setSuccess("Transferencia realizada com sucesso.");
      setForm(initialState);
      setValueInput("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao transferir.");
    } finally {
      setSubmitting(false);
    }
  };

  const projectedBalance = balance - form.value;

  return (
    <section className="rounded-2xl bg-white p-6 shadow dark:bg-slate-900">
      <div className="mb-6 flex flex-col gap-3">
        <h2 className="m-0 text-2xl font-semibold">Transferencia</h2>
        <p className="m-0 text-sm text-slate-600 dark:text-slate-400">
          Escolha a modalidade, informe os dados do favorecido e confirme o valor.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr,1fr]">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <fieldset className="grid gap-2 rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
            <legend className="px-2 text-sm font-semibold text-slate-700 dark:text-slate-200">Forma de transferencia</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {methodOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleMethodChange(option.id)}
                  className={`rounded-xl border px-3 py-3 text-left transition ${
                    form.method === option.id
                      ? "border-bank-500 bg-bank-50 text-bank-900 dark:border-bank-100 dark:bg-bank-900/40 dark:text-white"
                      : "border-slate-300 hover:border-bank-400 dark:border-slate-700 dark:hover:border-bank-300"
                  }`}
                >
                  <p className="m-0 text-sm font-semibold">{option.label}</p>
                  <p className="m-0 mt-1 text-xs text-slate-500 dark:text-slate-400">{option.subtitle}</p>
                </button>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-3 lg:grid-cols-2">
            <input
              type="text"
              placeholder="Nome do favorecido"
              value={form.recipientName}
              onChange={(e) => update("recipientName", e.target.value)}
              className="rounded-xl border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />

            {form.method === "pix" ? (
              <input
                type="text"
                placeholder="Chave PIX (CPF, email, telefone ou aleatoria)"
                value={form.pixKey}
                onChange={(e) => update("pixKey", e.target.value)}
                className="rounded-xl border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            ) : (
              <input
                type="text"
                placeholder="Conta de destino (agencia e conta)"
                value={form.destinationAccount}
                onChange={(e) => update("destinationAccount", e.target.value)}
                className="rounded-xl border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            )}
          </div>

          {form.method !== "pix" && (
            <input
              type="text"
              placeholder={form.method === "interna" ? "Banco Hemera" : "Banco de destino"}
              value={form.method === "interna" ? "Banco Hemera" : form.destinationBank}
              disabled={form.method === "interna"}
              onChange={(e) => update("destinationBank", e.target.value)}
              className="rounded-xl border border-slate-300 px-3 py-2 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:disabled:bg-slate-800"
            />
          )}

          <div className="grid gap-3 lg:grid-cols-[1.5fr,1fr]">
            <input
              type="text"
              inputMode="numeric"
              placeholder="Valor (R$)"
              value={valueInput}
              onChange={(e) => handleValueChange(e.target.value)}
              className="rounded-xl border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
            <div className="flex flex-wrap gap-2">
              {quickValues.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => applyQuickValue(value)}
                  className="rounded-lg border border-bank-500 px-3 py-1 text-xs font-semibold text-bank-700 transition hover:bg-bank-50 dark:border-bank-100 dark:text-bank-100 dark:hover:bg-bank-900/40"
                >
                  {brl.format(value)}
                </button>
              ))}
            </div>
          </div>

          <textarea
            placeholder="Descricao da transferencia"
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            className="min-h-24 rounded-xl border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />

          {error && <p className="m-0 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 dark:bg-red-950/40">{error}</p>}
          {success && <p className="m-0 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 dark:bg-emerald-950/40">{success}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-bank-500 px-4 py-3 font-semibold text-white transition hover:bg-bank-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {submitting ? "Processando transferencia..." : "Confirmar transferencia"}
          </button>
        </form>

        <aside className="h-fit rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/40">
          <h3 className="m-0 text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">Resumo da operacao</h3>
          <div className="mt-4 grid gap-2 text-sm">
            <p className="m-0 text-slate-600 dark:text-slate-400">Modalidade</p>
            <p className="m-0 font-semibold">{methodOptions.find((option) => option.id === form.method)?.label}</p>

            <p className="m-0 mt-2 text-slate-600 dark:text-slate-400">Prazo</p>
            <p className="m-0 font-semibold">{methodDescription}</p>

            <p className="m-0 mt-2 text-slate-600 dark:text-slate-400">Saldo atual</p>
            <p className="m-0 font-semibold">{brl.format(balance)}</p>

            <p className="m-0 mt-2 text-slate-600 dark:text-slate-400">Saldo apos envio</p>
            <p className={`m-0 font-semibold ${projectedBalance >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {brl.format(projectedBalance)}
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
