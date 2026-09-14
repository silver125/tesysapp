import { useState } from 'react';
import type { Course, Event, Lead, Product, User } from '../../types';
import { buildWhatsappLink } from '../../lib/uiHelpers';
import { openProfileSettings } from '../../lib/profileSettingsEvents';
import InviteShareCard from '../InviteShareCard';
import './companyOverview.css';

import { connectionStages, type ConnectionFilter } from '../../lib/companyConnections';

type Props = {
  user: User | null;
  contacts: Lead[];
  interests: Lead[];
  events: Event[];
  products: Product[];
  courses: Course[];
  representativeCount: number;
  locationCount: number;
  onConnections: (filter: ConnectionFilter) => void;
  onPublish: () => void;
  onManage: (tab: 'listings' | 'representatives' | 'locations') => void;
  onEvent: (id: string) => void;
  onRequestConnection: (id: string) => Promise<void>;
};

function dateLabel(value: string) {
  const date = new Date(value.length === 10 ? `${value}T12:00:00` : value);
  return Number.isNaN(date.getTime()) ? 'Data não informada' : date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export default function CompanyOverview(props: Props) {
  const { user, contacts, interests, events, products, courses, onConnections, onPublish, onManage } = props;
  const [period, setPeriod] = useState('30');
  const [pendingIds, setPendingIds] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - Number(period));
  const periodInterests = interests.filter(lead => period === 'all' || new Date(lead.createdAt) >= cutoff);
  const uniqueDoctors = new Set(periodInterests.map(lead => lead.doctorId)).size;
  const publications = [
    ...products.map(item => ({ id: item.id, type: 'product', name: item.name, label: item.listingType === 'partnership' ? 'Parceria' : 'Produto' })),
    ...events.map(item => ({ id: item.id, type: 'event', name: item.title, label: 'Evento' })),
    ...courses.map(item => ({ id: item.id, type: 'course', name: item.title, label: 'Workshop' })),
  ].map(item => ({ ...item, count: new Set(periodInterests.filter(lead => lead.itemType === item.type && (lead.itemId ? lead.itemId === item.id : lead.itemName === item.name)).map(lead => lead.doctorId)).size }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'pt-BR'));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcoming = events.filter(event => new Date(`${event.date}T00:00:00`) >= today)
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)).slice(0, 3);
  const priority = [...contacts].filter(lead => lead.connectionStatus !== 'requested')
    .sort((a, b) => Number(a.connectionStatus === 'approved') - Number(b.connectionStatus === 'approved') || b.createdAt.localeCompare(a.createdAt)).slice(0, 4);
  const checklist = [
    { label: 'Logo da empresa', done: Boolean(user?.avatarUrl), action: openProfileSettings },
    { label: 'WhatsApp comercial', done: Boolean(user?.whatsapp), action: openProfileSettings },
    { label: 'Primeira oportunidade publicada', done: publications.length > 0, action: () => publications.length ? onManage('listings') : onPublish() },
    { label: 'Representante cadastrado', done: props.representativeCount > 0, action: () => onManage('representatives') },
  ];
  const done = checklist.filter(step => step.done).length;

  async function request(lead: Lead) {
    if (pendingIds.includes(lead.id)) return;
    setPendingIds(ids => [...ids, lead.id]);
    setError('');
    setNotice('');
    try {
      await props.onRequestConnection(lead.id);
      setNotice(`Pedido enviado para ${lead.doctorName || 'o médico'}. Aguarde a aprovação.`);
    } catch {
      setError('Não foi possível enviar o pedido. Tente novamente.');
    } finally {
      setPendingIds(ids => ids.filter(id => id !== lead.id));
    }
  }

  return <div className="company-overview">
    <header className="co-header">
      <h1>Painel da empresa</h1>
      <p>Acompanhe médicos interessados e dê o próximo passo em cada relacionamento.</p>
      <div className="co-actions">
        <button className="co-primary" onClick={onPublish}>Publicar oportunidade <span aria-hidden="true">↗</span></button>
        <button onClick={() => onManage('listings')}>Gerenciar anúncios</button>
      </div>
    </header>

    <section className="co-section" aria-labelledby="co-connections">
      <div className="co-section-heading"><h2 id="co-connections">Sua rede, em movimento</h2><button className="co-text-button" onClick={() => onConnections('all')}>Ver contatos →</button></div>
      <p className="co-caption">Situação atual dos contatos. Um médico pode ter contatos distintos com representantes.</p>
      <div className="co-stages">
        {connectionStages.map((stage, index) => <button key={stage.key} onClick={() => onConnections(stage.key)} className="co-stage">
          <span className="co-stage-index" aria-hidden="true">0{index + 1}</span>
          <strong>{contacts.filter(lead => (lead.connectionStatus ?? 'none') === stage.key).length}</strong>
          <span className="co-stage-label">{stage.label}</span><small>{stage.hint}</small>
        </button>)}
      </div>
    </section>

    <section className="co-section" aria-labelledby="co-priority">
      <div className="co-section-heading"><h2 id="co-priority">Próximas conversas</h2><button className="co-text-button" onClick={() => onConnections('none')}>Ver novos →</button></div>
      <p className="co-caption">Novos interesses primeiro. O WhatsApp é liberado após a aprovação do médico.</p>
      {error && <p role="alert" className="co-feedback">{error}</p>}
      {notice && <p role="status" className="co-feedback">{notice}</p>}
      {priority.length ? <div className="co-contact-list">{priority.map(lead => {
        const approved = lead.connectionStatus === 'approved';
        const whatsapp = approved ? buildWhatsappLink(lead.doctorWhatsapp, `Olá ${lead.doctorName}, vi seu interesse em ${lead.itemName} na Tessy. Podemos conversar?`) : '';
        return <article className="co-contact" key={lead.id}>
          <div className="co-avatar" aria-hidden="true">{(lead.doctorName || 'M').slice(0, 1)}</div>
          <div className="co-contact-info"><span className="co-status">{approved ? 'Conexão aprovada' : 'Novo interesse'} · {dateLabel(lead.createdAt)}</span><h3>{lead.doctorName || 'Médico'}</h3><p>{lead.doctorSpecialty || 'Especialidade não informada'}</p><p className="co-contact-item">{lead.itemName}</p></div>
          {whatsapp ? <a className="co-contact-action" href={whatsapp} target="_blank" rel="noopener noreferrer">Abrir WhatsApp ↗</a> : approved ? <span className="co-contact-action">WhatsApp não informado</span> : <button className="co-contact-action" disabled={pendingIds.includes(lead.id)} onClick={() => void request(lead)}>{pendingIds.includes(lead.id) ? 'Enviando…' : 'Solicitar conexão →'}</button>}
        </article>;
      })}</div> : <div className="co-empty"><h3>{contacts.length ? 'Pedidos enviados. Próximo passo: aprovação.' : 'Sua próxima conexão começa com uma oportunidade.'}</h3><p>{contacts.length ? 'Acompanhe os pedidos enquanto os médicos avaliam suas solicitações.' : 'Publique um produto, parceria, evento ou workshop. Os médicos interessados aparecerão aqui.'}</p><button onClick={() => contacts.length ? onConnections('requested') : onPublish()}>{contacts.length ? 'Acompanhar pedidos' : 'Criar oportunidade'}</button></div>}
    </section>

    <section className="co-section" aria-labelledby="co-results">
      <div className="co-section-heading"><h2 id="co-results">O que aproxima médicos</h2><label className="co-period">Período<select value={period} onChange={event => setPeriod(event.target.value)}><option value="7">Últimos 7 dias</option><option value="30">Últimos 30 dias</option><option value="90">Últimos 90 dias</option><option value="all">Todo o período</option></select></label></div>
      <div className="co-metrics"><div><strong>{uniqueDoctors}</strong><span>Médicos únicos interessados</span></div><div><strong>{periodInterests.length}</strong><span>Interesses registrados</span></div></div>
      <p className="co-caption">Médicos únicos por anúncio no período selecionado. Um médico pode se interessar por vários anúncios.</p>
      {publications.length ? <ol className="co-ranking">{publications.slice(0, 5).map(item => <li key={`${item.type}-${item.id}`}><div><span>{item.label}</span><h3>{item.name}</h3><div className="co-bar" aria-hidden="true"><i style={{ width: `${item.count / Math.max(1, publications[0].count) * 100}%` }} /></div></div><strong aria-label={`${item.count} médicos interessados`}>{item.count}</strong></li>)}</ol> : <div className="co-empty"><p>Os resultados aparecerão depois que você publicar sua primeira oportunidade.</p><button onClick={onPublish}>Publicar oportunidade</button></div>}
    </section>

    <section className="co-section" aria-labelledby="co-agenda"><div className="co-section-heading"><h2 id="co-agenda">Próximos eventos</h2><span className="co-caption">Em ordem de data</span></div>
      {upcoming.length ? upcoming.map(event => <button className="co-event" key={event.id} onClick={() => props.onEvent(event.id)}><span className="co-event-date">{dateLabel(event.date)}</span><span><strong>{event.title}</strong><small>{event.time || 'Horário a confirmar'} · {event.location}</small><small>{event.registeredCount} de {event.maxParticipants} vagas preenchidas</small></span><span aria-hidden="true">↗</span></button>) : <p className="co-caption">Nenhum evento futuro publicado. Crie uma oportunidade para reunir médicos.</p>}
    </section>

    <section className="co-section" aria-labelledby="co-company"><div className="co-section-heading"><h2 id="co-company">Prepare sua empresa para conectar</h2><span>{done}/{checklist.length}</span></div><progress aria-label="Configuração da empresa" value={done} max={checklist.length} />
      <div className="co-checklist">{checklist.map(step => <button key={step.label} onClick={step.action}><span>{step.label}</span><span>{step.done ? 'Concluído · Editar' : 'Completar →'}</span></button>)}</div>
      <div className="co-actions"><button onClick={() => onManage('representatives')}>Representantes ({props.representativeCount})</button><button onClick={() => onManage('locations')}>Locais ({props.locationCount})</button></div>
    </section>
    <InviteShareCard target="medico" />
  </div>;
}
