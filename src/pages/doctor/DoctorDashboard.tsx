import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import Layout, { type NavItem } from '../../components/Layout';
import { openProfileSettings } from '../../lib/profileSettingsEvents';
import { useDashboardTab } from '../../hooks/useDashboardTab';
import { useAuth } from '../../context/useAuth';
import { Chip, Mono } from '../../components/ui';
import { Sheet } from '../../components/market';
import CompanyAvatar from '../../components/CompanyAvatar';
import FirstVisitTip from '../../components/FirstVisitTip';
import { fetchCompanyLogos } from '../../lib/companyBranding';
import { isSupabaseConfigured } from '../../lib/supabase';
import { connectWithRepresentative } from '../../lib/commercialConnect';
import { formatLeadError } from '../../lib/leadErrors';
import {
  buildRepresentativeProfiles,
  matchesRepresentativeCategory,
  matchesRepresentativeQuery,
  matchesRepresentativeRegion,
  representativeDisplayName,
  representativeOfferSummary,
  representativeRegionFilters,
  type RepresentativeProfile,
} from '../../lib/representatives';
import { BR_STATES, REP_CATEGORIES, categoryLabel } from '../../lib/repProfile';
import type { Lead } from '../../types';

type Tab = 'search' | 'connections' | 'profile';

function IcoSearch(active: boolean) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--accent)' : 'currentColor'} strokeWidth="1.8">
      <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}
function IcoLinks(active: boolean) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--accent)' : 'currentColor'} strokeWidth="1.8">
      <path d="M10 13a5 5 0 0 0 7.07 0l2.12-2.12a5 5 0 0 0-7.07-7.07L10.7 5.23" strokeLinecap="round" />
      <path d="M14 11a5 5 0 0 0-7.07 0L4.8 13.12a5 5 0 0 0 7.07 7.07L13.3 18.77" strokeLinecap="round" />
    </svg>
  );
}
function IcoUser(active: boolean) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--accent)' : 'currentColor'} strokeWidth="1.8">
      <circle cx="12" cy="8" r="3.5" /><path d="M5 19.5c1.8-3.2 4.2-4.8 7-4.8s5.2 1.6 7 4.8" strokeLinecap="round" />
    </svg>
  );
}

const NAV_ITEMS: NavItem[] = [
  { key: 'search', label: 'Buscar', icon: IcoSearch },
  { key: 'connections', label: 'Conexões', icon: IcoLinks },
  { key: 'profile', label: 'Perfil', icon: IcoUser },
];

function connectionLabel(status?: Lead['connectionStatus']) {
  if (status === 'approved') return 'Conexão aprovada';
  if (status === 'requested') return 'Aguardando sua autorização';
  return 'Interesse enviado';
}

function leadForRep(leads: Lead[], repId: string) {
  return leads.find(l =>
    l.intent === 'representative_contact'
    && (l.itemId === repId || (!l.itemId && false)),
  );
}

export default function DoctorDashboard() {
  const {
    user, events, products, courses, leads, locations,
    representatives: registeredReps, refreshData, approveConnection, addLead,
  } = useAuth();
  const [tab, setTab] = useDashboardTab<Tab>('search', ['search', 'connections', 'profile'] as const);
  const [query, setQuery] = useState('');
  const [stateFilter, setStateFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [companyLogos, setCompanyLogos] = useState<Record<string, string>>({});
  const [openRep, setOpenRep] = useState<RepresentativeProfile | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [approveBusy, setApproveBusy] = useState<string | null>(null);

  useEffect(() => { void refreshData(); }, [tab, refreshData]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const ids = [...new Set(registeredReps.map(r => r.companyId).filter(Boolean))];
    if (ids.length === 0) { setCompanyLogos({}); return; }
    let cancelled = false;
    void fetchCompanyLogos(ids).then(logos => { if (!cancelled) setCompanyLogos(logos); });
    return () => { cancelled = true; };
  }, [registeredReps]);

  const profiles = useMemo(
    () => buildRepresentativeProfiles(events, products, courses, locations, user, registeredReps, companyLogos),
    [events, products, courses, locations, user, registeredReps, companyLogos],
  );

  const regionChips = representativeRegionFilters(profiles);
  const categoryChips: [string, string][] = [
    ['all', 'Todas'],
    ...REP_CATEGORIES.map(c => [c.id, c.label] as [string, string]),
  ];

  const filtered = profiles.filter(rep => {
    if (!matchesRepresentativeQuery(rep, query)) return false;
    if (!matchesRepresentativeCategory(rep, categoryFilter)) return false;
    if (!matchesRepresentativeRegion(rep, stateFilter)) return false;
    if (cityFilter.trim()) {
      const cityQ = cityFilter.trim().toLowerCase();
      if (rep.coversNationally) return true;
      return rep.coverageCities.some(c => c.toLowerCase().includes(cityQ))
        || rep.regionLabel.toLowerCase().includes(cityQ);
    }
    return true;
  });

  const pending = leads.filter(l => l.connectionStatus === 'requested');
  const myConnections = leads.filter(l => l.intent === 'representative_contact');

  async function handleRequestContact(rep: RepresentativeProfile) {
    if (busyId) return;
    const existing = leadForRep(leads, rep.id);
    if (existing) {
      setActionSuccess(connectionLabel(existing.connectionStatus));
      setOpenRep(rep);
      return;
    }
    setBusyId(rep.id);
    setActionError('');
    setActionSuccess('');
    try {
      const result = await connectWithRepresentative({
        id: rep.id,
        companyId: rep.companyId,
        companyName: rep.companyName,
        name: representativeDisplayName(rep),
      }, addLead);
      setActionSuccess(result.message);
      await refreshData();
    } catch (err) {
      setActionError(formatLeadError(err instanceof Error ? err.message : 'Erro ao enviar interesse.'));
    } finally {
      setBusyId(null);
    }
  }

  async function handleApprove(leadId: string) {
    if (!user?.whatsapp) {
      openProfileSettings();
      return;
    }
    if (approveBusy) return;
    setApproveBusy(leadId);
    setActionError('');
    try {
      await approveConnection(leadId);
      await refreshData();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Não foi possível aprovar. Tente novamente.');
    } finally {
      setApproveBusy(null);
    }
  }

  function clearFilters() {
    setQuery('');
    setStateFilter('all');
    setCityFilter('');
    setCategoryFilter('all');
  }

  const hasFilters = Boolean(query || cityFilter || stateFilter !== 'all' || categoryFilter !== 'all');

  return (
    <Layout
      navItems={NAV_ITEMS}
      activeKey={tab}
      onNavChange={k => setTab(k as Tab)}
      notificationCount={pending.length}
      onNotificationClick={() => setTab('connections')}
    >
      {tab === 'search' && (
        <div style={{ paddingBottom: 8 }}>
          <h1 className="tessy-page-title" style={{ marginBottom: 6, fontWeight: 600 }}>
            Buscar<span style={{ color: 'var(--accent)' }}>.</span>
          </h1>
          <p style={{ margin: '0 0 14px', fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.45 }}>
            Encontre representantes de skincare, tecnologias e parcerias que atendem à sua região.
          </p>

          {user?.id && <FirstVisitTip userId={user.id} role="medico" />}

          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Nome, empresa ou marca"
            style={fieldStyle}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
            <select value={stateFilter} onChange={e => setStateFilter(e.target.value)} style={fieldStyle}>
              {regionChips.map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
              {BR_STATES.filter(uf => !regionChips.some(([k]) => k === uf.toLowerCase())).map(uf => (
                <option key={uf} value={uf.toLowerCase()}>{uf}</option>
              ))}
            </select>
            <input
              value={cityFilter}
              onChange={e => setCityFilter(e.target.value)}
              placeholder="Cidade atendida"
              style={fieldStyle}
            />
          </div>

          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginTop: 10, paddingBottom: 4 }}>
            {categoryChips.map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setCategoryFilter(key)}
                style={{
                  flexShrink: 0,
                  minHeight: 40,
                  padding: '8px 14px',
                  borderRadius: 999,
                  border: `1px solid ${categoryFilter === key ? 'var(--accent)' : 'var(--line)'}`,
                  background: categoryFilter === key ? 'rgba(245,130,32,0.12)' : 'var(--card)',
                  color: 'var(--ink)',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {label}
              </button>
            ))}
            {hasFilters && (
              <button type="button" onClick={clearFilters} style={{
                flexShrink: 0, minHeight: 40, padding: '8px 14px', borderRadius: 999,
                border: '1px solid var(--line)', background: 'var(--chip)', color: 'var(--ink-2)',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}>
                Limpar
              </button>
            )}
          </div>

          {actionError && <ErrorBox message={actionError} onRetry={() => setActionError('')} />}
          {actionSuccess && <SuccessBox message={actionSuccess} />}

          {filtered.length === 0 ? (
            <EmptyBox
              title="Nenhum representante encontrado"
              hint="Ajuste filtros ou volte mais tarde. Só aparecem perfis completos com região de atendimento informada."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 14 }}>
              {filtered.map(rep => {
                const lead = leadForRep(leads, rep.id);
                return (
                  <article key={rep.id} className="tessy-panel" style={{ padding: 14 }}>
                    <button
                      type="button"
                      onClick={() => { setOpenRep(rep); setActionError(''); setActionSuccess(''); }}
                      style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                    >
                      <div style={{ display: 'flex', gap: 12 }}>
                        <CompanyAvatar name={representativeDisplayName(rep)} avatarUrl={rep.photoUrl} size={56} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 16, fontWeight: 620, color: 'var(--ink)' }}>{representativeDisplayName(rep)}</div>
                          <div style={{ marginTop: 2, fontSize: 13, color: 'var(--ink-2)' }}>{rep.companyName}</div>
                          {rep.brands.length > 0 && (
                            <div style={{ marginTop: 4, fontSize: 12, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {rep.brands.join(', ')}
                            </div>
                          )}
                          <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {rep.categories.map(c => <Chip key={c} color="var(--accent-ink)">{categoryLabel(c)}</Chip>)}
                            <Chip color="var(--accent)">{rep.regionLabel}</Chip>
                          </div>
                        </div>
                      </div>
                    </button>
                    <button
                      type="button"
                      disabled={busyId === rep.id || Boolean(lead)}
                      onClick={() => { void handleRequestContact(rep); }}
                      style={primaryBtnStyle(busyId === rep.id)}
                    >
                      {lead ? connectionLabel(lead.connectionStatus) : busyId === rep.id ? 'Enviando…' : 'Solicitar contato'}
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === 'connections' && (
        <div>
          <h1 className="tessy-page-title" style={{ marginBottom: 6, fontWeight: 600 }}>
            Conexões<span style={{ color: 'var(--accent)' }}>.</span>
          </h1>
          <p style={{ margin: '0 0 14px', fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.45 }}>
            Acompanhe interesses enviados e autorizações de WhatsApp.
          </p>
          {actionError && <ErrorBox message={actionError} onRetry={() => setActionError('')} />}
          {myConnections.length === 0 ? (
            <EmptyBox title="Nenhuma conexão ainda" hint="Busque um representante e toque em Solicitar contato." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {myConnections.map(lead => (
                <div key={lead.id} className="tessy-panel" style={{ padding: 14 }}>
                  <Mono style={{ fontSize: 10, color: 'var(--accent)', letterSpacing: '0.1em' }}>
                    {connectionLabel(lead.connectionStatus)}
                  </Mono>
                  <div style={{ marginTop: 6, fontSize: 15, fontWeight: 620 }}>{lead.itemName || lead.companyName}</div>
                  <div style={{ marginTop: 2, fontSize: 12.5, color: 'var(--ink-2)' }}>{lead.companyName}</div>
                  {lead.connectionStatus === 'requested' && (
                    <button
                      type="button"
                      disabled={approveBusy === lead.id}
                      onClick={() => { void handleApprove(lead.id); }}
                      style={{ ...primaryBtnStyle(approveBusy === lead.id), marginTop: 12 }}
                    >
                      {approveBusy === lead.id ? 'Aprovando…' : 'Aprovar e liberar WhatsApp'}
                    </button>
                  )}
                  {lead.connectionStatus === 'approved' && (
                    <p style={{ margin: '10px 0 0', fontSize: 12.5, color: 'var(--ink-2)' }}>
                      Você autorizou o contato. A conversa continua no WhatsApp.
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'profile' && (
        <div>
          <h1 className="tessy-page-title" style={{ marginBottom: 6, fontWeight: 600 }}>
            Perfil<span style={{ color: 'var(--accent)' }}>.</span>
          </h1>
          <div className="tessy-panel" style={{ padding: 16, marginTop: 8 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <CompanyAvatar name={user?.name ?? 'Médico'} avatarUrl={user?.avatarUrl} size={64} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 18, fontWeight: 620 }}>{user?.name}</div>
                <div style={{ marginTop: 4, fontSize: 13, color: 'var(--ink-2)' }}>
                  {[user?.specialty, user?.crm && user?.crmState ? `CRM ${user.crm}/${user.crmState}` : null]
                    .filter(Boolean).join(' · ') || 'Médico'}
                </div>
              </div>
            </div>
            {!user?.whatsapp && (
              <p style={{ marginTop: 12, fontSize: 13, color: '#C2410C', lineHeight: 1.4 }}>
                Cadastre seu WhatsApp para poder autorizar contatos.
              </p>
            )}
            <button type="button" onClick={() => openProfileSettings()} style={{ ...primaryBtnStyle(false), marginTop: 14 }}>
              Editar perfil
            </button>
          </div>
        </div>
      )}

      <Sheet open={openRep !== null} onClose={() => setOpenRep(null)}>
        {openRep && (
          <div style={{ padding: '4px 16px 24px' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <CompanyAvatar name={representativeDisplayName(openRep)} avatarUrl={openRep.photoUrl} size={72} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 20, fontWeight: 620 }}>{representativeDisplayName(openRep)}</div>
                <div style={{ marginTop: 4, fontSize: 14, color: 'var(--ink-2)' }}>{openRep.companyName}</div>
              </div>
            </div>
            <div style={{ marginTop: 14, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {openRep.categories.map(c => <Chip key={c} color="var(--accent-ink)">{categoryLabel(c)}</Chip>)}
              <Chip color="var(--accent)">{openRep.regionLabel}</Chip>
            </div>
            {openRep.brands.length > 0 && (
              <p style={{ marginTop: 12, fontSize: 13, color: 'var(--ink)' }}>
                <strong>Marcas:</strong> {openRep.brands.join(', ')}
              </p>
            )}
            {openRep.bio && (
              <p style={{ marginTop: 10, fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.45 }}>{openRep.bio}</p>
            )}
            {representativeOfferSummary(openRep) && (
              <p style={{ marginTop: 8, fontSize: 12.5, color: 'var(--muted)' }}>{representativeOfferSummary(openRep)}</p>
            )}
            {(() => {
              const lead = leadForRep(leads, openRep.id);
              return (
                <>
                  <div style={{ marginTop: 14, padding: '10px 12px', borderRadius: 12, background: 'var(--chip)', fontSize: 13, color: 'var(--ink-2)' }}>
                    Status: {lead ? connectionLabel(lead.connectionStatus) : 'Sem solicitação'}
                  </div>
                  <button
                    type="button"
                    disabled={busyId === openRep.id || Boolean(lead)}
                    onClick={() => { void handleRequestContact(openRep); }}
                    style={{ ...primaryBtnStyle(busyId === openRep.id), marginTop: 14 }}
                  >
                    {lead ? connectionLabel(lead.connectionStatus) : busyId === openRep.id ? 'Enviando…' : 'Solicitar contato'}
                  </button>
                </>
              );
            })()}
            {actionError && <ErrorBox message={actionError} onRetry={() => setActionError('')} />}
            {actionSuccess && <SuccessBox message={actionSuccess} />}
          </div>
        )}
      </Sheet>
    </Layout>
  );
}

const fieldStyle: CSSProperties = {
  width: '100%',
  minHeight: 44,
  padding: '10px 12px',
  borderRadius: 12,
  border: '1px solid var(--line)',
  background: 'var(--card)',
  color: 'var(--ink)',
  fontSize: 14,
  boxSizing: 'border-box',
};

function primaryBtnStyle(disabled: boolean): CSSProperties {
  return {
    marginTop: 12,
    width: '100%',
    minHeight: 46,
    borderRadius: 12,
    border: 'none',
    background: disabled ? 'var(--chip)' : 'var(--accent)',
    color: disabled ? 'var(--muted)' : '#fff',
    fontSize: 14,
    fontWeight: 650,
    cursor: disabled ? 'not-allowed' : 'pointer',
  };
}

function EmptyBox({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="tessy-panel" style={{ padding: 20, marginTop: 14 }}>
      <div style={{ fontSize: 15, fontWeight: 600 }}>{title}</div>
      <p style={{ marginTop: 6, fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.45 }}>{hint}</p>
    </div>
  );
}

function ErrorBox({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div style={{
      marginTop: 12, padding: '12px 14px', borderRadius: 12,
      background: 'rgba(242,92,84,0.08)', border: '1px solid rgba(242,92,84,0.2)',
      color: '#F25C54', fontSize: 13, lineHeight: 1.4,
    }}>
      {message}
      <button type="button" onClick={onRetry} style={{
        display: 'block', marginTop: 8, background: 'none', border: 'none',
        color: '#F25C54', fontWeight: 650, cursor: 'pointer', padding: 0, fontSize: 12,
      }}>
        Fechar / tentar novamente
      </button>
    </div>
  );
}

function SuccessBox({ message }: { message: string }) {
  return (
    <div style={{
      marginTop: 12, padding: '12px 14px', borderRadius: 12,
      background: 'rgba(30,169,124,0.08)', border: '1px solid rgba(30,169,124,0.2)',
      color: '#0F766E', fontSize: 13, lineHeight: 1.4,
    }}>
      {message}
    </div>
  );
}