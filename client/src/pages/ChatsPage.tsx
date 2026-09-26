import { useEffect, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { apiFetch, getAuthToken, socketUrl } from '../lib/api';
import { useAuth } from '../lib/auth';
import type { Conversation, Message } from '../lib/types';

export function ChatsPage() {
  const { profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [active, setActive] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function loadConversations() {
    const data = await apiFetch<{ conversations: Conversation[] }>('/api/conversations');
    setConversations(data.conversations);
    return data.conversations;
  }

  useEffect(() => { loadConversations().catch(() => setError('No se pudieron cargar tus chats')); }, []);

  useEffect(() => {
    const userId = Number(searchParams.get('userId'));
    if (!Number.isInteger(userId) || userId <= 0) return;
    apiFetch<{ id: number }>('/api/conversations', { method: 'POST', body: JSON.stringify({ userId }) })
      .then(async ({ id }) => {
        const list = await loadConversations();
        setActive(list.find((item) => item.id === id) ?? null);
        setSearchParams({}, { replace: true });
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'No se pudo iniciar el chat'));
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (!active) { setMessages([]); return; }
    apiFetch<{ messages: Message[] }>(`/api/conversations/${active.id}/messages`).then((data) => setMessages(data.messages)).catch(() => setError('No se pudieron cargar los mensajes'));
  }, [active]);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;
    const socket = io(socketUrl, { auth: { token } });
    socket.on('message:new', (event: { conversationId: number; message: Message }) => {
      loadConversations().catch(() => undefined);
      if (event.conversationId === active?.id) {
        setMessages((current) => current.some((message) => message.id === event.message.id) ? current : [...current, event.message]);
      }
    });
    return () => {
      socket.disconnect();
    };
  }, [active]);

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!active || !text.trim()) return;
    try {
      const message = await apiFetch<Message>(`/api/conversations/${active.id}/messages`, { method: 'POST', body: JSON.stringify({ text: text.trim() }) });
      setMessages((current) => [...current, message]);
      setText('');
      loadConversations();
    } catch (err) { setError(err instanceof Error ? err.message : 'No se pudo enviar el mensaje'); }
  }

  async function blockActiveUser() {
    if (!active || !window.confirm(`¿Bloquear a ${active.otherUser.name}? No podrán enviarse mensajes.`)) return;
    try {
      await apiFetch(`/api/blocks/${active.otherUser.userId}`, { method: 'POST' });
      setActive(null);
      setMessages([]);
    } catch (err) { setError(err instanceof Error ? err.message : 'No se pudo bloquear a la persona'); }
  }

  async function reportActiveUser() {
    if (!active) return;
    const reason = window.prompt('Contanos brevemente el motivo del reporte');
    if (!reason?.trim()) return;
    try {
      await apiFetch(`/api/reports/${active.otherUser.userId}`, { method: 'POST', body: JSON.stringify({ reason: reason.trim() }) });
      setError('Gracias. Recibimos tu reporte.');
    } catch (err) { setError(err instanceof Error ? err.message : 'No se pudo enviar el reporte'); }
  }

  if (!profile) return null;
  return <section className="flex h-full min-h-0 flex-col bg-stone-50">
    <div className="border-b border-stone-200 bg-white px-4 py-4"><h1 className="text-lg font-semibold text-stone-900">Chats</h1></div>
    {error && <p className="mx-4 mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
    <div className="flex min-h-0 flex-1">
      <aside className={`${active ? 'hidden sm:block' : 'block'} w-full shrink-0 overflow-y-auto border-r border-stone-200 bg-white sm:w-80`}>
        {conversations.length ? conversations.map((conversation) => <button key={conversation.id} onClick={() => setActive(conversation)} className={`flex w-full items-center gap-3 border-b border-stone-100 px-4 py-3 text-left ${active?.id === conversation.id ? 'bg-brand-50' : ''}`}><Avatar name={conversation.otherUser.name} src={conversation.otherUser.avatarUrl} /><span className="min-w-0"><strong className="block truncate text-sm text-stone-900">{conversation.otherUser.name}</strong><span className="block truncate text-xs text-stone-500">{conversation.lastMessage?.text ?? conversation.otherUser.headline ?? 'Decile hola'}</span></span></button>) : <p className="p-6 text-center text-sm text-stone-500">Cuando hables con alguien desde el mapa, el chat aparece acá.</p>}
      </aside>
      <main className={`${active ? 'flex' : 'hidden sm:flex'} min-w-0 flex-1 flex-col`}>
        {active ? <><header className="flex items-center gap-2 border-b border-stone-200 bg-white px-4 py-3"><Button variant="ghost" className="sm:hidden" onClick={() => setActive(null)}>Volver</Button><Avatar name={active.otherUser.name} src={active.otherUser.avatarUrl} /><p className="min-w-0 flex-1 truncate font-semibold text-stone-900">{active.otherUser.name}</p><Button variant="ghost" className="px-2 py-2 text-xs" onClick={reportActiveUser}>Reportar</Button><Button variant="ghost" className="px-2 py-2 text-xs text-red-700" onClick={blockActiveUser}>Bloquear</Button></header><div className="flex-1 space-y-3 overflow-y-auto p-4">{messages.map((message) => <div key={message.id} className={`flex ${message.senderUserId === profile.userId ? 'justify-end' : 'justify-start'}`}><p className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${message.senderUserId === profile.userId ? 'bg-brand-700 text-white' : 'bg-white text-stone-800 shadow-sm'}`}>{message.text}</p></div>)}</div><form onSubmit={send} className="flex gap-2 border-t border-stone-200 bg-white p-3"><input value={text} onChange={(event) => setText(event.target.value)} maxLength={2000} placeholder="Escribí un mensaje" className="min-w-0 flex-1 rounded-xl border border-stone-300 px-3 py-2 text-sm outline-none focus:border-brand-600" /><Button type="submit">Enviar</Button></form></> : <p className="m-auto text-sm text-stone-500">Elegí una conversación.</p>}
      </main>
    </div>
  </section>;
}
