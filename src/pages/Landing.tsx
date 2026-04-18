import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col text-slate-100">
      <header className="px-5 py-4 flex items-center justify-between border-b border-[#1F2A44]/70 backdrop-blur-sm sticky top-0 z-10 bg-[#0A0F1F]/70">
        <Link to="/" className="flex items-center gap-2">
          <LogoMark />
          <span className="font-bold tracking-tight text-lg">Tessy</span>
        </Link>
        <Link
          to="/entrar"
          className="text-sm font-medium text-slate-200 px-3 py-1.5 rounded-lg border border-[#2B3A5C] hover:border-[#4F8CFF] transition"
        >
          Entrar
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-5 py-12">
        <div className="w-full max-w-md text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-[#4F8CFF]/10 text-[#6FA4FF] border border-[#4F8CFF]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34E178]" />
            Conectando saúde e indústria
          </span>

          <h1 className="mt-6 text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1]">
            Médicos e empresas,
            <br />
            <span className="bg-gradient-to-r from-[#6FA4FF] via-[#8B73FF] to-[#C77BFF] bg-clip-text text-transparent">
              conectados.
            </span>
          </h1>

          <p className="mt-4 text-slate-400 text-base leading-relaxed">
            Descubra eventos, produtos e cursos de empresas parceiras.
            Fale direto com elas pelo WhatsApp, sem burocracia.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <Link
              to="/cadastro"
              className="w-full py-3.5 rounded-xl bg-[#4F8CFF] text-white font-semibold text-sm hover:bg-[#6FA4FF] transition glow"
            >
              Criar conta grátis
            </Link>
            <Link
              to="/entrar"
              className="w-full py-3.5 rounded-xl bg-[#131B2E] border border-[#2B3A5C] text-slate-100 font-semibold text-sm hover:border-[#4F8CFF] transition"
            >
              Já tenho conta
            </Link>
          </div>
        </div>

        <div className="w-full max-w-md mt-12 grid grid-cols-3 gap-3">
          <FeatureCard icon="📅" title="Eventos" desc="Congressos e workshops" />
          <FeatureCard icon="💊" title="Produtos" desc="Catálogo das empresas" />
          <FeatureCard icon="🎓" title="Cursos" desc="Para médicos professores" />
        </div>

        <div className="w-full max-w-md mt-6 p-4 rounded-2xl bg-[#131B2E] border border-[#1F2A44]">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#25D366]/15 flex items-center justify-center text-[#25D366]">
              <WhatsappIcon />
            </div>
            <div>
              <p className="font-semibold text-sm">Contato direto por WhatsApp</p>
              <p className="text-xs text-slate-400 mt-0.5">Clicou? Fala direto com quem decide na empresa.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="px-5 py-5 text-center text-xs text-slate-500 border-t border-[#1F2A44]/70">
        © 2025 Tessy — plataforma para saúde
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="p-3 rounded-xl bg-[#131B2E] border border-[#1F2A44] text-left">
      <div className="text-2xl">{icon}</div>
      <p className="text-sm font-semibold mt-1">{title}</p>
      <p className="text-xs text-slate-400 mt-0.5 leading-tight">{desc}</p>
    </div>
  );
}

function LogoMark() {
  return (
    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4F8CFF] to-[#8B73FF] flex items-center justify-center text-white font-bold shadow-lg shadow-[#4F8CFF]/30">
      T
    </div>
  );
}

function WhatsappIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.889-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.886 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.304-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
    </svg>
  );
}
