interface HeaderProps {
  activeTab: "dashboard" | "transactions" | "transfer";
  onChangeTab: (tab: "dashboard" | "transactions" | "transfer") => void;
  bankName: string;
  customerName: string;
  modoEscuro: boolean;
  onToggleModoEscuro: () => void;
}

const tabs: Array<{ id: HeaderProps["activeTab"]; label: string }> = [
  { id: "dashboard", label: "Resumo" },
  { id: "transactions", label: "Extrato" },
  { id: "transfer", label: "Transferir" }
];

const dateFmt = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });

export function Header({
  activeTab,
  onChangeTab,
  bankName,
  customerName,
  modoEscuro,
  onToggleModoEscuro
}: HeaderProps) {
  const firstName = customerName.split(" ")[0];
  const today = dateFmt.format(new Date());

  return (
    <header className="rounded-2xl bg-bank-900 p-5 text-white shadow-lg dark:bg-slate-900">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="m-0 text-xl font-bold">{bankName} | Banco digital</h1>
          <small className="text-slate-300">Ola, {firstName}. Atualizado em {today}</small>
        </div>

        <button
          type="button"
          onClick={onToggleModoEscuro}
          aria-label={modoEscuro ? "Ativar modo claro" : "Ativar modo escuro"}
          className="relative h-10 w-24 rounded-full border border-white/25 bg-white/10 p-1 transition hover:bg-white/20"
        >
          <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-slate-200">
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
              <path d="M21 12.79A9 9 0 0 1 11.21 3a1 1 0 0 0-1.2-1.2A10 10 0 1 0 22.2 13.99a1 1 0 0 0-1.2-1.2z" />
            </svg>
          </span>
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-amber-300">
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
              <path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.8 1.42-1.42zm10.45 14.32l1.79 1.8 1.41-1.42-1.8-1.79-1.4 1.41zM1 13h3v-2H1v2zm19 0h3v-2h-3v2zm-8 8h2v-3h-2v3zm0-19h2V1h-2v3zm7.24 2.84l1.41-1.41-1.79-1.8-1.42 1.42 1.8 1.79zM4.22 19.78l1.42 1.42 1.79-1.8-1.41-1.41-1.8 1.79zM12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12z" />
            </svg>
          </span>
          <span
            className={`absolute top-1 h-8 w-8 rounded-full bg-white shadow-md transition-all duration-300 ${
              modoEscuro ? "left-1" : "left-[3.6rem]"
            }`}
          />
        </button>
      </div>

      <nav className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChangeTab(tab.id)}
            className={`w-full rounded-xl px-2 py-2 text-center text-sm font-semibold transition sm:w-auto sm:px-4 ${
              activeTab === tab.id
                ? "bg-white text-bank-900"
                : "bg-bank-700 text-white hover:bg-bank-500"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </header>
  );
}
