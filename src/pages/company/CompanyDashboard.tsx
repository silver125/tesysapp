import { useMemo, useState, type CSSProperties } from 'react';
import Layout, { type NavItem } from '../../components/Layout';
import { openProfileSettings } from '../../lib/profileSettingsEvents';
import { useDashboardTab } from '../../hooks/useDashboardTab';
import { useAuth } from '../../context/useAuth';
import { Chip, Mono, WaIcon } from '../../components/ui';
import FirstVisitTip from '../../components/FirstVisitTip';
import ProfilePhotoField from '../../components/ProfilePhotoField';
import { uploadProfileAvatar } from '../../lib/profileAvatar';
import { revokeBlobPreview, validateImageFile } from '../../lib/imageUpload';
import { buildWhatsappLink } from '../../lib/uiHelpers';
import {
  BR_STATES,
  REP_CATEGORIES,
  categoryLabel,
  coverageLabel,
  formatBrands,
  isRepresentativeSearchable,
  parseBrands,
  representativeMissingFields,
} from '../../lib/repProfile';
import type { Lead, Representative } from '../../types';

type Tab = 'leads' | 'profile' | 'account' | 'team';

function IcoPeople(active: boolean) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--accent)' : 'currentColor'} strokeWidth="1.8">
      <circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2.5" />
      <path d="M3.5 19c1.5-3 3.8-4.5 5.5-4.5S13 16 14.5 19" strokeLinecap="round" />
      <path d="M14 14.5c1.2-.4 2.6-.4 3.8.2 1.4.8 2.4 2.4 3.2 4.3" strokeLinecap="round" />
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
function IcoGear(active: boolean) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--accent)' : 'currentColor'} strokeWidth="1.8">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6" strokeLinecap="round" />
    </svg>
  );
}

const NAV_ITEMS: NavItem[] = [
  { key: 'leads', label: 'Interessados', icon: IcoPeople },
  { key: 'profile', label: 'Meu perfil', icon: IcoUser },
  { key: 'account', label: 'Conta', icon: IcoGear },
];

function connectionLabel(status?: Lead['connectionStatus']) {
  if (status === 'approved') return 'Conexão aprovada';
  if (status === 'requested') return 'Aguardando autorização';
  return 'Interesse enviado';
}

function normalizePhone(raw: string) {
  const d = raw.replace(/\D/g, '');
  if (!d) return '';
  return d.startsWith('55') ? d : `55${d}`;
}

function fmtPhone(raw: string) {
  const d = raw.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export default function CompanyDashboard() {
  const {
    user, leads, representatives,
    addRepresentative, updateRepresentative, deleteRepresentative,
    requestConnection, refreshData,
  } = useAuth();
  const myReps = useMemo(
    () => representatives.filter(r => r.companyId === user?.id),
    [representatives, user?.id],
  );
  const primaryRep = myReps[0] ?? null;
  const defaultTab: Tab = 'leads';
  const [tab, setTab] = useDashboardTab<Tab>(defaultTab, ['leads', 'profile', 'account', 'team'] as const);

  const myLeads = useMemo(
    () => leads
      .filter(l => l.companyId === user?.id && l.intent === 'representative_contact')
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [leads, user?.id],
  );
  const newCount = myLeads.filter(l => (l.connectionStatus ?? 'none') === 'none').length;

  const [busyLeadId, setBusyLeadId] = useState<string | null>(null);
  const [leadError, setLeadError] = useState('');

  async function handleRequestConnection(leadId: string) {
    if (busyLeadId) return;
    setBusyLeadId(leadId);
    setLeadError('');
    try {
      await requestConnection(leadId);
      await refreshData();
    } catch (err) {
      setLeadError(err instanceof Error ? err.message : 'Não foi possível pedir autorização. Tente novamente.');
    } finally {
      setBusyLeadId(null);
    }
  }

  return (
    <Layout
      navItems={NAV_ITEMS}
      activeKey={tab === 'team' ? 'profile' : tab}
      onNavChange={k => setTab(k as Tab)}
      notificationCount={newCount}
      onNotificationClick={() => setTab('leads')}
    >
      {tab === 'leads' && (
        <div>
          <h1 className="tessy-page-title" style={{ marginBottom: 6, fontWeight: 600 }}>
            Interessados<span style={{ color: 'var(--accent)' }}>.</span>
          </h1>
          <p style={{ margin: '0 0 14px', fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.45 }}>
            Médicos que pediram contato com seus representantes.
          </p>

          {user?.id && <FirstVisitTip userId={user.id} role="empresa" />}

          {(!primaryRep || !isRepresentativeSearchable(primaryRep)) && (
            <button
              type="button"
              className="tessy-panel"
              onClick={() => setTab('profile')}
              style={{ width: '100%', textAlign: 'left', padding: 14, marginBottom: 12, cursor: 'pointer' }}
            >
              <div style={{ fontSize: 14, fontWeight: 650, color: 'var(--accent-ink)' }}>Complete seu perfil para aparecer na busca</div>
              <div style={{ marginTop: 4, fontSize: 12.5, color: 'var(--ink-2)' }}>
                Toque em Meu perfil e preencha o que falta.
              </div>
            </button>
          )}

          {leadError && (
            <div style={errorBox}>
              {leadError}
              <button type="button" onClick={() => setLeadError('')} style={linkBtn}>Fechar</button>
            </div>
          )}

          {myLeads.length === 0 ? (
            <div className="tessy-panel" style={{ padding: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>Nenhum interesse ainda</div>
              <p style={{ marginTop: 6, fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.45 }}>
                Quando um médico solicitar contato, o pedido aparece aqui com o nome do representante escolhido.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {myLeads.map(lead => {
                const status = lead.connectionStatus ?? 'none';
                const wa = lead.doctorWhatsapp ? buildWhatsappLink(lead.doctorWhatsapp) : '';
                const repName = lead.itemName || 'Representante';
                return (
                  <div key={lead.id} className="tessy-panel" style={{ padding: 14 }}>
                    <Mono style={{ fontSize: 10, color: 'var(--accent)', letterSpacing: '0.1em' }}>
                      {connectionLabel(status)}
                    </Mono>
                    <div style={{ marginTop: 6, fontSize: 16, fontWeight: 620 }}>{lead.doctorName}</div>
                    <div style={{ marginTop: 2, fontSize: 12.5, color: 'var(--ink-2)' }}>
                      {lead.doctorSpecialty || 'Especialidade não informada'}
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <Chip color="var(--accent-ink)">Rep.: {repName}</Chip>
                    </div>
                    {status === 'none' && (
                      <button
                        type="button"
                        disabled={busyLeadId === lead.id}
                        onClick={() => { void handleRequestConnection(lead.id); }}
                        style={primaryBtn(busyLeadId === lead.id)}
                      >
                        {busyLeadId === lead.id ? 'Enviando…' : 'Pedir autorização para conversar'}
                      </button>
                    )}
                    {status === 'requested' && (
                      <p style={{ margin: '12px 0 0', fontSize: 13, color: 'var(--ink-2)' }}>
                        Aguardando o médico aprovar o WhatsApp.
                      </p>
                    )}
                    {status === 'approved' && wa && (
                      <a href={wa} target="_blank" rel="noreferrer" style={{ ...primaryBtn(false), display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, textDecoration: 'none' }}>
                        <WaIcon size={16} /> Abrir WhatsApp
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === 'profile' && (
        <RepProfileTab
          companyId={user?.id ?? ''}
          companyName={user?.company ?? user?.name ?? ''}
          companyWhatsapp={user?.whatsapp}
          primaryRep={primaryRep}
          repCount={myReps.length}
          onSaved={async () => { await refreshData(); }}
          onOpenTeam={() => setTab('team')}
          addRepresentative={addRepresentative}
          updateRepresentative={updateRepresentative}
        />
      )}

      {tab === 'team' && (
        <TeamTab
          reps={myReps}
          companyId={user?.id ?? ''}
          companyName={user?.company ?? user?.name ?? ''}
          companyWhatsapp={user?.whatsapp}
          onBack={() => setTab('profile')}
          addRepresentative={addRepresentative}
          updateRepresentative={updateRepresentative}
          deleteRepresentative={deleteRepresentative}
          onChanged={async () => { await refreshData(); }}
        />
      )}

      {tab === 'account' && (
        <div>
          <h1 className="tessy-page-title" style={{ marginBottom: 6, fontWeight: 600 }}>
            Conta<span style={{ color: 'var(--accent)' }}>.</span>
          </h1>
          <div className="tessy-panel" style={{ padding: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 620 }}>{user?.company ?? user?.name}</div>
            <div style={{ marginTop: 4, fontSize: 13, color: 'var(--ink-2)' }}>{user?.email}</div>
            {user?.whatsapp && (
              <div style={{ marginTop: 8, fontSize: 13, color: '#25D366', display: 'flex', gap: 6, alignItems: 'center' }}>
                <WaIcon size={14} /> {user.whatsapp}
              </div>
            )}
            <button type="button" onClick={() => openProfileSettings()} style={{ ...primaryBtn(false), marginTop: 14 }}>
              Editar dados da conta
            </button>
            {myReps.length > 1 && (
              <button type="button" onClick={() => setTab('team')} style={{ ...secondaryBtn, marginTop: 10 }}>
                Gerenciar equipe ({myReps.length} representantes)
              </button>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}

function RepProfileTab({
  companyId,
  companyName,
  companyWhatsapp,
  primaryRep,
  repCount,
  onSaved,
  onOpenTeam,
  addRepresentative,
  updateRepresentative,
}: {
  companyId: string;
  companyName: string;
  companyWhatsapp?: string;
  primaryRep: Representative | null;
  repCount: number;
  onSaved: () => Promise<void>;
  onOpenTeam: () => void;
  addRepresentative: (data: Omit<Representative, 'id' | 'createdAt'>) => Promise<void>;
  updateRepresentative: (id: string, patch: Partial<Omit<Representative, 'id' | 'createdAt' | 'companyId'>>) => Promise<void>;
}) {
  return (
    <div>
      <h1 className="tessy-page-title" style={{ marginBottom: 6, fontWeight: 600 }}>
        Meu perfil<span style={{ color: 'var(--accent)' }}>.</span>
      </h1>
      <p style={{ margin: '0 0 14px', fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.45 }}>
        Complete o perfil do representante para aparecer na busca dos médicos. Não é preciso cadastrar produto, evento ou local.
      </p>
      <RepEditor
        companyId={companyId}
        companyName={companyName}
        companyWhatsapp={companyWhatsapp}
        initial={primaryRep}
        onSaved={onSaved}
        addRepresentative={addRepresentative}
        updateRepresentative={updateRepresentative}
      />
      <button type="button" onClick={onOpenTeam} style={{ ...secondaryBtn, marginTop: 12 }}>
        {repCount > 1 ? `Equipe (${repCount})` : '+ Adicionar outro representante'}
      </button>
    </div>
  );
}

function TeamTab({
  reps,
  companyId,
  companyName,
  companyWhatsapp,
  onBack,
  addRepresentative,
  updateRepresentative,
  deleteRepresentative,
  onChanged,
}: {
  reps: Representative[];
  companyId: string;
  companyName: string;
  companyWhatsapp?: string;
  onBack: () => void;
  addRepresentative: (data: Omit<Representative, 'id' | 'createdAt'>) => Promise<void>;
  updateRepresentative: (id: string, patch: Partial<Omit<Representative, 'id' | 'createdAt' | 'companyId'>>) => Promise<void>;
  deleteRepresentative: (id: string) => Promise<void>;
  onChanged: () => Promise<void>;
}) {
  const [editingId, setEditingId] = useState<string | 'new' | null>(null);
  const editing = editingId === 'new' ? null : reps.find(r => r.id === editingId) ?? null;

  return (
    <div>
      <button type="button" onClick={onBack} style={{ ...secondaryBtn, marginBottom: 12, width: 'auto' }}>← Voltar</button>
      <h1 className="tessy-page-title" style={{ marginBottom: 6, fontWeight: 600 }}>
        Equipe<span style={{ color: 'var(--accent)' }}>.</span>
      </h1>
      <p style={{ margin: '0 0 14px', fontSize: 13, color: 'var(--ink-2)' }}>
        Área secundária para gerenciar vários representantes da mesma conta.
      </p>
      {editingId === null ? (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {reps.map(rep => {
              const missing = representativeMissingFields(rep);
              return (
                <button
                  key={rep.id}
                  type="button"
                  className="tessy-panel"
                  onClick={() => setEditingId(rep.id)}
                  style={{ padding: 14, textAlign: 'left', cursor: 'pointer' }}
                >
                  <div style={{ fontSize: 15, fontWeight: 620 }}>{rep.name}</div>
                  <div style={{ marginTop: 4, fontSize: 12, color: 'var(--ink-2)' }}>
                    {coverageLabel(rep)} · {missing.length === 0 ? 'Visível na busca' : `Faltam ${missing.length} campos`}
                  </div>
                </button>
              );
            })}
          </div>
          <button type="button" onClick={() => setEditingId('new')} style={{ ...primaryBtn(false), marginTop: 12 }}>
            + Novo representante
          </button>
        </>
      ) : (
        <RepEditor
          companyId={companyId}
          companyName={companyName}
          companyWhatsapp={companyWhatsapp}
          initial={editing}
          onSaved={async () => { setEditingId(null); await onChanged(); }}
          onDelete={editing ? async () => {
            await deleteRepresentative(editing.id);
            setEditingId(null);
            await onChanged();
          } : undefined}
          addRepresentative={addRepresentative}
          updateRepresentative={updateRepresentative}
        />
      )}
    </div>
  );
}

function RepEditor({
  companyId,
  companyName,
  companyWhatsapp,
  initial,
  onSaved,
  onDelete,
  addRepresentative,
  updateRepresentative,
}: {
  companyId: string;
  companyName: string;
  companyWhatsapp?: string;
  initial: Representative | null;
  onSaved: () => Promise<void>;
  onDelete?: () => Promise<void>;
  addRepresentative: (data: Omit<Representative, 'id' | 'createdAt'>) => Promise<void>;
  updateRepresentative: (id: string, patch: Partial<Omit<Representative, 'id' | 'createdAt' | 'companyId'>>) => Promise<void>;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [brands, setBrands] = useState(initial?.brands ?? '');
  const [categories, setCategories] = useState<string[]>(initial?.categories ?? []);
  const [bio, setBio] = useState(initial?.bio ?? '');
  const [homeCity, setHomeCity] = useState(initial?.homeCity ?? initial?.city ?? '');
  const [homeState, setHomeState] = useState(initial?.homeState ?? initial?.state ?? '');
  const [coversNationally, setCoversNationally] = useState(Boolean(initial?.coversNationally));
  const [coverageStates, setCoverageStates] = useState<string[]>(initial?.coverageStates ?? []);
  const [coverageCities, setCoverageCities] = useState((initial?.coverageCities ?? []).join(', '));
  const [whatsapp, setWhatsapp] = useState(fmtPhone((initial?.whatsapp || companyWhatsapp || '').replace(/^55/, '')));
  const [photoPreview, setPhotoPreview] = useState(initial?.photoUrl ?? '');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const draft = {
    name,
    photoUrl: photoPreview || initial?.photoUrl,
    companyName,
    categories,
    brands,
    bio,
    coversNationally,
    coverageStates,
    whatsapp: normalizePhone(whatsapp),
  };
  const missing = representativeMissingFields(draft);

  function toggleCategory(id: string) {
    setCategories(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  }
  function toggleState(uf: string) {
    setCoverageStates(prev => prev.includes(uf) ? prev.filter(s => s !== uf) : [...prev, uf]);
  }

  function handlePhoto(file: File | null) {
    if (photoPreview.startsWith('blob:')) revokeBlobPreview(photoPreview);
    if (!file) {
      setPhotoFile(null);
      setPhotoPreview('');
      return;
    }
    const validation = validateImageFile(file);
    if (validation) {
      setPhotoError(validation);
      return;
    }
    setPhotoError('');
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSave() {
    if (missing.length) {
      setError(`Complete: ${missing.map(m => m.label).join(', ')}.`);
      return;
    }
    setSaving(true);
    setError('');
    try {
      let photoUrl = initial?.photoUrl;
      if (photoFile) photoUrl = await uploadProfileAvatar(photoFile, companyId);
      const payload: Omit<Representative, 'id' | 'createdAt'> = {
        companyId,
        companyName,
        name: name.trim(),
        brands: formatBrands(parseBrands(brands)),
        categories,
        bio: bio.trim(),
        homeCity: homeCity.trim() || undefined,
        homeState: homeState.trim() || undefined,
        city: homeCity.trim() || undefined,
        state: homeState.trim() || undefined,
        coversNationally,
        coverageStates: coversNationally ? [] : coverageStates,
        coverageCities: coversNationally ? [] : coverageCities.split(/[,;/]+/).map(s => s.trim()).filter(Boolean),
        whatsapp: normalizePhone(whatsapp),
        photoUrl,
        specialty: categories.map(categoryLabel).join(' · '),
      };
      if (initial) await updateRepresentative(initial.id, payload);
      else await addRepresentative(payload);
      await onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar perfil.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="tessy-panel" style={{ padding: 16 }}>
      {missing.length > 0 ? (
        <div style={{
          marginBottom: 14, padding: '12px 14px', borderRadius: 12,
          background: 'rgba(245,130,32,0.08)', border: '1px solid rgba(245,130,32,0.2)',
        }}>
          <div style={{ fontSize: 13, fontWeight: 650, color: 'var(--accent-ink)' }}>
            Perfil incompleto — ainda não aparece na busca
          </div>
          <div style={{ marginTop: 6, fontSize: 12.5, color: 'var(--ink-2)' }}>
            Falta: {missing.map(m => m.label).join(', ')}.
          </div>
        </div>
      ) : (
        <div style={{
          marginBottom: 14, padding: '12px 14px', borderRadius: 12,
          background: 'rgba(30,169,124,0.08)', border: '1px solid rgba(30,169,124,0.2)',
          fontSize: 13, color: '#0F766E', fontWeight: 600,
        }}>
          Perfil completo — visível para médicos na busca
        </div>
      )}

      <ProfilePhotoField
        label="Foto"
        preview={photoPreview}
        onChange={handlePhoto}
        onValidationError={msg => setPhotoError(msg ?? '')}
        error={photoError || undefined}
      />

      <label style={labelStyle}>Nome</label>
      <input value={name} onChange={e => setName(e.target.value)} style={fieldStyle} placeholder="Seu nome profissional" />

      <label style={labelStyle}>Empresa</label>
      <input value={companyName} disabled style={{ ...fieldStyle, opacity: 0.75 }} />

      <label style={labelStyle}>Marcas representadas</label>
      <input value={brands} onChange={e => setBrands(e.target.value)} style={fieldStyle} placeholder="Ex: Round Lab, Torriden, d'Alba" />

      <label style={labelStyle}>Categorias</label>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
        {REP_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            type="button"
            onClick={() => toggleCategory(cat.id)}
            style={{
              minHeight: 40, padding: '8px 14px', borderRadius: 999, cursor: 'pointer',
              border: `1px solid ${categories.includes(cat.id) ? 'var(--accent)' : 'var(--line)'}`,
              background: categories.includes(cat.id) ? 'rgba(245,130,32,0.12)' : 'var(--card)',
              fontSize: 12, fontWeight: 600, color: 'var(--ink)',
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <label style={labelStyle}>O que você oferece</label>
      <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} style={{ ...fieldStyle, minHeight: 88, resize: 'vertical' }} placeholder="Descrição curta para o médico" />

      <label style={labelStyle}>Onde você mora (opcional)</label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 88px', gap: 8 }}>
        <input value={homeCity} onChange={e => setHomeCity(e.target.value)} style={fieldStyle} placeholder="Cidade" />
        <select value={homeState} onChange={e => setHomeState(e.target.value)} style={fieldStyle}>
          <option value="">UF</option>
          {BR_STATES.map(uf => <option key={uf} value={uf}>{uf}</option>)}
        </select>
      </div>

      <label style={labelStyle}>Regiões de atendimento</label>
      <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10, fontSize: 13, color: 'var(--ink)' }}>
        <input type="checkbox" checked={coversNationally} onChange={e => setCoversNationally(e.target.checked)} />
        Atendimento nacional
      </label>
      {!coversNationally && (
        <>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8, maxHeight: 140, overflowY: 'auto' }}>
            {BR_STATES.map(uf => (
              <button
                key={uf}
                type="button"
                onClick={() => toggleState(uf)}
                style={{
                  minHeight: 36, minWidth: 44, padding: '6px 10px', borderRadius: 10, cursor: 'pointer',
                  border: `1px solid ${coverageStates.includes(uf) ? 'var(--accent)' : 'var(--line)'}`,
                  background: coverageStates.includes(uf) ? 'rgba(245,130,32,0.12)' : 'var(--card)',
                  fontSize: 12, fontWeight: 600,
                }}
              >
                {uf}
              </button>
            ))}
          </div>
          <input
            value={coverageCities}
            onChange={e => setCoverageCities(e.target.value)}
            style={fieldStyle}
            placeholder="Cidades atendidas (opcional, separadas por vírgula)"
          />
        </>
      )}

      <label style={labelStyle}>WhatsApp profissional</label>
      <input value={whatsapp} onChange={e => setWhatsapp(fmtPhone(e.target.value))} style={fieldStyle} placeholder="(11) 99999-9999" />

      {error && <div style={{ ...errorBox, marginTop: 12 }}>{error}</div>}

      <button type="button" disabled={saving} onClick={() => { void handleSave(); }} style={{ ...primaryBtn(saving), marginTop: 14 }}>
        {saving ? 'Salvando…' : initial ? 'Salvar perfil' : 'Criar perfil'}
      </button>
      {onDelete && (
        <button
          type="button"
          disabled={deleting}
          onClick={() => {
            if (!confirm('Excluir este representante?')) return;
            setDeleting(true);
            void onDelete().finally(() => setDeleting(false));
          }}
          style={{ ...secondaryBtn, marginTop: 8, color: '#F25C54' }}
        >
          {deleting ? 'Excluindo…' : 'Excluir representante'}
        </button>
      )}
    </div>
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
  marginBottom: 10,
};

const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 650,
  color: 'var(--ink-2)',
  marginBottom: 6,
  marginTop: 4,
};

function primaryBtn(disabled: boolean): CSSProperties {
  return {
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

const secondaryBtn: CSSProperties = {
  width: '100%',
  minHeight: 44,
  borderRadius: 12,
  border: '1px solid var(--line)',
  background: 'var(--card)',
  color: 'var(--ink)',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
};

const errorBox: CSSProperties = {
  padding: '12px 14px',
  borderRadius: 12,
  background: 'rgba(242,92,84,0.08)',
  border: '1px solid rgba(242,92,84,0.2)',
  color: '#F25C54',
  fontSize: 13,
  lineHeight: 1.4,
  marginBottom: 12,
};

const linkBtn: CSSProperties = {
  display: 'block',
  marginTop: 8,
  background: 'none',
  border: 'none',
  color: '#F25C54',
  fontWeight: 650,
  cursor: 'pointer',
  padding: 0,
  fontSize: 12,
};
