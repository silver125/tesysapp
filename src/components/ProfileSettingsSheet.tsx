import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { Sheet } from './market';
import { Mono, WaIcon } from './ui';
import ProfilePhotoField from './ProfilePhotoField';
import { uploadProfileAvatar } from '../lib/profileAvatar';
import { OPEN_DELETE_ACCOUNT_EVENT, OPEN_PROFILE_SETTINGS_EVENT, openHelp } from '../lib/profileSettingsEvents';

const SPECIALTIES = [
  'Nutrologia', 'Endocrinologia', 'Dermatologia', 'Cirurgia Plástica',
  'Cardiologia', 'Oncologia', 'Neurologia', 'Ortopedia',
  'Pediatria', 'Gastroenterologia', 'Ginecologia', 'Oftalmologia',
  'Psiquiatria', 'Reumatologia', 'Urologia', 'Pneumologia',
  'Clínica Médica', 'Outra',
];

const BR_STATES = [
  'SP', 'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ',
  'RN', 'RS', 'RO', 'RR', 'SC', 'SE', 'TO',
];

function fmtPhone(raw: string) {
  const d = raw.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function displayPhone(raw?: string) {
  const digits = (raw ?? '').replace(/\D/g, '');
  const national = digits.startsWith('55') && digits.length > 11 ? digits.slice(2) : digits;
  return fmtPhone(national);
}

function normalizePhone(raw: string) {
  const d = raw.replace(/\D/g, '');
  if (!d) return '';
  return d.startsWith('55') ? d : `55${d}`;
}

type SheetMode = 'edit' | 'delete' | null;

export default function ProfileSettingsSheet() {
  const { user, updateProfile, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<SheetMode>(null);
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [crm, setCrm] = useState('');
  const [crmState, setCrmState] = useState('');
  const [phone, setPhone] = useState('');
  const [privateOnly, setPrivateOnly] = useState(true);
  const [photoPreview, setPhotoPreview] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    function openEdit() {
      if (!user) return;
      setError('');
      setName(user.name ?? '');
      setCompany(user.company ?? user.name ?? '');
      setSpecialty(user.specialty ?? '');
      setCrm(user.crm ?? '');
      setCrmState(user.crmState ?? '');
      setPhone(displayPhone(user.whatsapp));
      setPrivateOnly(user.whatsappConnectionOnly !== false);
      setPhotoPreview(user.avatarUrl ?? '');
      setPhotoFile(null);
      setRemovePhoto(false);
      setMode('edit');
    }
    function openDelete() {
      setError('');
      setMode('delete');
    }
    window.addEventListener(OPEN_PROFILE_SETTINGS_EVENT, openEdit);
    window.addEventListener(OPEN_DELETE_ACCOUNT_EVENT, openDelete);
    return () => {
      window.removeEventListener(OPEN_PROFILE_SETTINGS_EVENT, openEdit);
      window.removeEventListener(OPEN_DELETE_ACCOUNT_EVENT, openDelete);
    };
  }, [user]);

  function close() {
    if (saving || deleting) return;
    setMode(null);
    setError('');
  }

  function handlePhotoChange(file: File | null) {
    if (!file) {
      setPhotoFile(null);
      setPhotoPreview('');
      setRemovePhoto(true);
      return;
    }
    setPhotoFile(file);
    setRemovePhoto(false);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    setError('');
    try {
      const normalized = normalizePhone(phone);
      if (phone.trim() && normalized.replace(/^55/, '').length < 10) {
        throw new Error('Informe um WhatsApp brasileiro com DDD.');
      }

      if (user.role === 'empresa') {
        const trimCompany = company.trim();
        if (trimCompany.length < 2) throw new Error('Informe o nome da empresa.');
        let avatarUrl: string | null | undefined;
        if (removePhoto) avatarUrl = null;
        else if (photoFile) avatarUrl = await uploadProfileAvatar(photoFile, user.id);
        await updateProfile({
          name: trimCompany,
          company: trimCompany,
          whatsapp: normalized || undefined,
          ...(avatarUrl !== undefined ? { avatarUrl } : {}),
        });
      } else {
        const trimName = name.trim();
        if (trimName.length < 2) throw new Error('Informe seu nome.');
        let avatarUrl: string | null | undefined;
        if (removePhoto) avatarUrl = null;
        else if (photoFile) avatarUrl = await uploadProfileAvatar(photoFile, user.id);
        await updateProfile({
          name: trimName,
          specialty: specialty || undefined,
          crm: crm.trim() || undefined,
          crmState: crmState || undefined,
          whatsapp: normalized || undefined,
          whatsappConnectionOnly: privateOnly,
          ...(avatarUrl !== undefined ? { avatarUrl } : {}),
        });
      }
      close();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar o perfil.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setError('');
    try {
      await deleteAccount();
      close();
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível excluir a conta.');
    } finally {
      setDeleting(false);
    }
  }

  const fieldLabel: React.CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: 9,
    color: 'var(--muted)',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    marginBottom: 4,
  };

  const fieldInput: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 10,
    background: 'var(--bg)',
    border: '1px solid var(--line)',
    color: 'var(--ink)',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <Sheet open={mode !== null} onClose={close}>
      <div style={{ padding: '4px 16px 20px' }}>
        {mode === 'edit' && user && (
          <>
            <Mono style={{ fontSize: 10, color: 'var(--accent)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              {user.role === 'empresa' ? 'Perfil comercial' : 'Perfil médico'}
            </Mono>
            <h2 style={{ marginTop: 8, fontSize: 24, fontWeight: 560, letterSpacing: 0 }}>
              Editar perfil<span style={{ color: 'var(--accent)' }}>.</span>
            </h2>
            <p style={{ marginTop: 6, fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.45 }}>
              {user.role === 'empresa'
                ? 'Nome e WhatsApp visíveis para médicos interessados.'
                : 'Dados usados para recomendações e aprovação de contatos comerciais.'}
            </p>

            <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <ProfilePhotoField
                label={user.role === 'empresa' ? 'Logo ou foto da empresa' : 'Foto de perfil'}
                preview={photoPreview}
                onChange={handlePhotoChange}
              />

              {user.role === 'empresa' ? (
                <div>
                  <div style={fieldLabel}>Nome da empresa</div>
                  <input value={company} onChange={e => setCompany(e.target.value)} style={fieldInput} placeholder="Nome da empresa" />
                </div>
              ) : (
                <>
                  <div>
                    <div style={fieldLabel}>Nome</div>
                    <input value={name} onChange={e => setName(e.target.value)} style={fieldInput} placeholder="Seu nome" />
                  </div>
                  <div>
                    <div style={fieldLabel}>Especialidade</div>
                    <select value={specialty} onChange={e => setSpecialty(e.target.value)} style={fieldInput}>
                      <option value="">Selecione</option>
                      {SPECIALTIES.map(item => <option key={item} value={item}>{item}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 88px', gap: 10 }}>
                    <div>
                      <div style={fieldLabel}>CRM</div>
                      <input value={crm} onChange={e => setCrm(e.target.value)} style={fieldInput} placeholder="123456" />
                    </div>
                    <div>
                      <div style={fieldLabel}>UF</div>
                      <select value={crmState} onChange={e => setCrmState(e.target.value)} style={fieldInput}>
                        <option value="">UF</option>
                        {BR_STATES.map(item => <option key={item} value={item}>{item}</option>)}
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div>
                <div style={fieldLabel}>WhatsApp</div>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#25D366', display: 'flex' }}>
                    <WaIcon size={14} />
                  </span>
                  <input
                    value={phone}
                    onChange={e => setPhone(fmtPhone(e.target.value))}
                    style={{ ...fieldInput, paddingLeft: 32, borderColor: '#25D366' }}
                    placeholder="(11) 99999-9999"
                    type="tel"
                  />
                </div>
              </div>

              {user.role === 'medico' && (
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.4 }}>
                  <input
                    type="checkbox"
                    checked={privateOnly}
                    onChange={e => setPrivateOnly(e.target.checked)}
                    style={{ marginTop: 3 }}
                  />
                  <span>Mostrar WhatsApp apenas para empresas com conexão aprovada.</span>
                </label>
              )}
            </div>
          </>
        )}

        {mode === 'delete' && (
          <>
            <Mono style={{ fontSize: 10, color: '#F25C54', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              Zona de risco
            </Mono>
            <h2 style={{ marginTop: 8, fontSize: 24, fontWeight: 560, letterSpacing: 0 }}>
              Excluir conta<span style={{ color: 'var(--accent)' }}>?</span>
            </h2>
            <p style={{ marginTop: 6, fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.45 }}>
              Isso remove seu perfil, publicações e dados associados. Esta ação não pode ser desfeita.
            </p>
          </>
        )}

        {error && (
          <div style={{
            marginTop: 16,
            padding: '10px 12px',
            borderRadius: 12,
            background: 'rgba(242,92,84,0.08)',
            border: '1px solid rgba(242,92,84,0.18)',
            color: '#F25C54',
            fontSize: 12.5,
            lineHeight: 1.4,
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button
            type="button"
            onClick={() => {
              close();
              openHelp();
            }}
            disabled={saving || deleting}
            style={{
              width: '100%',
              height: 40,
              borderRadius: 11,
              border: '1px solid rgba(74,168,255,0.22)',
              background: 'rgba(74,168,255,0.08)',
              color: 'var(--accent-ink)',
              fontSize: 13,
              fontWeight: 560,
              cursor: saving || deleting ? 'not-allowed' : 'pointer',
              marginBottom: 4,
            }}
          >
            Como funciona a Tessy
          </button>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          <button
            type="button"
            onClick={close}
            disabled={saving || deleting}
            style={{
              flex: 1,
              height: 48,
              borderRadius: 12,
              border: '1px solid var(--line)',
              background: 'var(--chip)',
              color: 'var(--ink-2)',
              fontSize: 14,
              fontWeight: 560,
              cursor: saving || deleting ? 'not-allowed' : 'pointer',
            }}
          >
            Cancelar
          </button>
          {mode === 'edit' ? (
            <button
              type="button"
              onClick={() => { void handleSave(); }}
              disabled={saving}
              style={{
                flex: 2,
                height: 48,
                borderRadius: 12,
                border: 'none',
                background: 'var(--accent)',
                color: '#fff',
                fontSize: 14,
                fontWeight: 560,
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.72 : 1,
              }}
            >
              {saving ? 'Salvando…' : 'Salvar perfil'}
            </button>
          ) : mode === 'delete' ? (
            <button
              type="button"
              onClick={() => { void handleDelete(); }}
              disabled={deleting}
              style={{
                flex: 2,
                height: 48,
                borderRadius: 12,
                border: 'none',
                background: '#F25C54',
                color: '#fff',
                fontSize: 14,
                fontWeight: 560,
                cursor: deleting ? 'not-allowed' : 'pointer',
                opacity: deleting ? 0.72 : 1,
              }}
            >
              {deleting ? 'Excluindo…' : 'Excluir conta'}
            </button>
          ) : null}
        </div>
      </div>
    </Sheet>
  );
}
