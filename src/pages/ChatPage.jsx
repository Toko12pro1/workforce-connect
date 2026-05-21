import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCheck,
  MessageCircle,
  Phone,
  Send,
  User
} from "lucide-react";
import { useAuth } from "../hooks/useAuth.js";
import { getMessages, sendMessage, subscribeToMessages, getOrCreateDirectThread, getMyThreads } from "../services/chatService.js";
import { supabase } from "../supabaseClient.js";

function Avatar({ url, name, size = 38 }) {
  if (url) return <img src={url} alt={name} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />;
  const initials = (name || "?").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: "linear-gradient(135deg,#2563eb,#7c3aed)", color: "#fff", fontWeight: 800, fontSize: size * 0.38, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {initials}
    </div>
  );
}

// Conversations list view
function ThreadList({ userId, onOpen }) {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyThreads(userId).then(data => { setThreads(data); setLoading(false); });
  }, [userId]);

  if (loading) return <div className="browse-loading">Chargement…</div>;

  if (threads.length === 0) {
    return (
      <div style={{ padding: "48px 24px", textAlign: "center", color: "#94a3b8" }}>
        <MessageCircle size={44} style={{ opacity: 0.35, marginBottom: 12 }} />
        <p style={{ fontWeight: 600 }}>Aucune conversation</p>
        <p style={{ fontSize: "0.85rem", marginTop: 4 }}>Cliquez sur "Message" depuis le profil d'un travailleur pour démarrer.</p>
        <a href="/browse" className="wide-blue-button" style={{ maxWidth: 220, margin: "16px auto 0", display: "flex", justifyContent: "center" }}>
          Découvrir des pros
        </a>
      </div>
    );
  }

  return (
    <div className="thread-list">
      {threads.map(t => {
        const other = t.client?.id === userId ? t.worker : t.client;
        if (!other) return null;
        return (
          <button key={t.id} type="button" className="thread-row" onClick={() => onOpen(t.id, other)}>
            <Avatar url={other.avatar_url} name={other.name} />
            <div className="thread-row-body">
              <strong>{other.name}</strong>
              <span>{t.service_type === "Message direct" ? "Message direct" : t.service_type}</span>
            </div>
            <small>{new Date(t.created_at).toLocaleDateString("fr-CM")}</small>
          </button>
        );
      })}
    </div>
  );
}

// Conversation view
function Conversation({ jobId, recipient, currentUser, onBack }) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const threadRef = useRef(null);

  useEffect(() => {
    getMessages(jobId).then(setMessages);
    const channel = subscribeToMessages(jobId, (msg) => {
      setMessages(prev => {
        // avoid duplicate from our own optimistic update
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });
    return () => channel.unsubscribe();
  }, [jobId]);

  useEffect(() => {
    if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [messages]);

  async function handleSubmit(e) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !currentUser || sending) return;
    setSending(true);
    setError("");
    try {
      const msg = await sendMessage(jobId, { senderId: currentUser.id, senderRole: "user", text });
      setMessages(prev => [...prev, msg]);
      setDraft("");
    } catch {
      setError("Impossible d'envoyer le message.");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <header className="chat-header">
        <button type="button" onClick={onBack} aria-label="Retour" style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
          <ArrowLeft size={25} />
        </button>
        <Avatar url={recipient?.avatar_url} name={recipient?.name} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: "1rem", fontWeight: 700, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {recipient?.name || "Conversation"}
          </h1>
          <p style={{ fontSize: "0.75rem", color: "#6b7a99", margin: 0 }}>{recipient?.trade || ""}</p>
        </div>
        {recipient?.phone && (
          <a href={`tel:${recipient.phone}`} aria-label="Appeler" style={{ color: "#2563eb", padding: 4 }}>
            <Phone size={20} />
          </a>
        )}
      </header>

      <section className="chat-thread" ref={threadRef}>
        {messages.length === 0 && (
          <p style={{ textAlign: "center", color: "#94a3b8", padding: "32px 16px", fontSize: "0.875rem" }}>
            Commencez la conversation 👋
          </p>
        )}
        {messages.map(message => {
          const isMe = message.senderId === currentUser?.id;
          return (
            <article className={`message-row ${isMe ? "user-message" : "provider-message"}`} key={message.id}>
              {!isMe && <Avatar url={recipient?.avatar_url} name={recipient?.name} size={32} />}
              <div className={`bubble ${isMe ? "client" : "worker"}`}>
                <p>{message.text}</p>
                <time>{message.time}{isMe && <CheckCheck size={13} />}</time>
              </div>
            </article>
          );
        })}
      </section>

      <form className="chat-composer" onSubmit={handleSubmit}>
        {error && <p className="form-error" role="alert" style={{ width: "100%", margin: "0 0 6px" }}>{error}</p>}
        <input
          placeholder="Écrire un message…"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          disabled={sending}
        />
        <button type="submit" aria-label="Envoyer" disabled={sending || !draft.trim()}>
          <Send size={24} />
        </button>
      </form>
    </>
  );
}

export default function ChatPage() {
  const { user } = useAuth();
  const params = new URLSearchParams(window.location.search);
  const jobIdParam = params.get("jobId");
  const withParam = params.get("with");
  const nameParam = params.get("name");
  const avatarParam = params.get("avatar");

  const [jobId, setJobId] = useState(jobIdParam || null);
  const [recipient, setRecipient] = useState(
    withParam ? { id: withParam, name: decodeURIComponent(nameParam || ""), avatar_url: decodeURIComponent(avatarParam || "") } : null
  );
  const [starting, setStarting] = useState(false);

  // If ?with= is given, find or create thread immediately
  useEffect(() => {
    if (!withParam || !user?.id || jobId) return;
    setStarting(true);
    getOrCreateDirectThread(user.id, withParam).then(tid => {
      setJobId(tid);
      setStarting(false);
    });
  }, [withParam, user?.id]);

  // If ?jobId= is given, load recipient from the job
  useEffect(() => {
    if (!jobIdParam || !user?.id) return;
    supabase
      .from("jobs")
      .select("client_id, worker_id, service_type, client:profiles!jobs_client_id_fkey(id,name,avatar_url,trade,phone), worker:profiles!jobs_worker_id_fkey(id,name,avatar_url,trade,phone)")
      .eq("id", jobIdParam)
      .single()
      .then(({ data }) => {
        if (!data) return;
        const other = data.client?.id === user.id ? data.worker : data.client;
        if (other) setRecipient(other);
      });
  }, [jobIdParam, user?.id]);

  function handleOpen(tid, other) {
    setJobId(tid);
    setRecipient(other);
    window.history.pushState({}, "", `/chat?jobId=${tid}`);
  }

  function handleBack() {
    setJobId(null);
    setRecipient(null);
    window.history.pushState({}, "", "/chat");
  }

  if (!user) {
    return (
      <main className="app-screen chat-screen" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: 32 }}>
        <User size={48} color="#94a3b8" />
        <p>Connectez-vous pour accéder au chat.</p>
        <a href="/login" className="wide-blue-button" style={{ maxWidth: 220 }}>Se connecter</a>
      </main>
    );
  }

  return (
    <main className="app-screen chat-screen" style={{ display: "flex", flexDirection: "column" }}>
      {!jobId && (
        <>
          <header className="chat-header" style={{ justifyContent: "flex-start", gap: 12 }}>
            <a href="/feed" style={{ color: "#1e293b" }}><ArrowLeft size={25} /></a>
            <h1 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>Messages</h1>
          </header>
          {starting
            ? <div className="browse-loading">Démarrage de la conversation…</div>
            : <ThreadList userId={user.id} onOpen={handleOpen} />
          }
        </>
      )}
      {jobId && (
        <Conversation
          jobId={jobId}
          recipient={recipient}
          currentUser={user}
          onBack={handleBack}
        />
      )}
    </main>
  );
}
