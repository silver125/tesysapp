import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="px-5 py-4 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">T</div>
          <span className="font-semibold text-slate-800 text-lg">Tessy</span>
        </div>
        <Link to="/entrar" className="text-sm font-medium text-blue-600">Entrar</Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 mx-auto mb-6 flex items-center justify-center text-white text-2xl font-bold">T</div>

          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
            Oportunidades médicas em um só lugar
          </h1>
          <p className="text-slate-500 mt-3 text-base">
            Conecte-se com empresas parceiras, participe de eventos e descubra produtos relevantes para sua prática.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <Link
              to="/cadastro"
              className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition"
            >
              Criar conta
            </Link>
            <Link
              to="/entrar"
              className="w-full py-3.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition"
            >
              Já tenho conta
            </Link>
          </div>

          <p className="text-xs text-slate-400 mt-8">
            Para médicos e empresas do setor de saúde.
          </p>
        </div>
      </main>

      <footer className="px-5 py-5 text-center text-xs text-slate-400 border-t border-slate-100">
        © 2025 Tessy
      </footer>
    </div>
  );
}
