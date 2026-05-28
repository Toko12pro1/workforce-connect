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
import {
  getMessages,
  sendMessage,
  subscribeToMessages,
  getOrCreateDirectThread,
  getMyThreads,
  markThreadRead
} from "../services/chatService.js";
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

function formatThreadTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `${diffMins} min`;
  if (diffMins < 1440) return d.toLocaleTimeString("fr-CM", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("fr-CM");
}

// Conversations list view
function ThreadList({ userId, onOpen }) {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!userId) return;

    let msgChannel, jobChannel;

    async function bootstrap() {
      const data = await getMyThreads(userId);
      setThreads(data);
      setLoading(false);

      const ids = data.map(t => t.id);
      if (!ids.length) return;

      // Subscribe to new messages in existing threads
      msgChannel = supabase
        .channel(`tl_msgs:${userId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages", filter: `job_id=in.(${ids.join(",")})` },
          (payload) => {
            const msg = payload.new;
            setThreads(prev => {
              const updated = prev.map(t => {
                if (t.id !== msg.job_id) return t;
                return {
                  ...t,
                  lastMessage: { text: msg.text, sender_id: msg.sender_id, created_at: msg.created_at },
                  unreadCount: msg.sender_id !== userId ? (t.unreadCount ?? 0) + 1 : (t.unreadCount ?? 0)
                };
              });
              return [...updated].sort((a, b) =>
                new Date(b.lastMessage?.created_at ?? b.created_at) -
                new Date(a.lastMessage?.created_at ?? a.created_at)
              );
            });
          }
        )
        .subscribe();
    }

    bootstrap();

    // Subscribe to new threads started with this user (as worker)
    jobChannel = supabase
      .channel(`tl_jobs:${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "jobs", filter: `worker_id=eq.${userId}` },
        async () => {
          // New thread — re-load and re-subscribe
          msgChannel?.unsubscribe();
          const fresh = await getMyThreads(userId);
          setThreads(fresh);
          const ids = fresh.map(t => t.id);
          if (!ids.length) return;
          msgChannel = supabase
            .channel(`tl_msgs:${userId}_r`)
            .on(
              "postgres_changes",
              { event: "INSERT", schema: "public", table: "messages", filter: `job_id=in.(${ids.join(",")})` },
              (payload) => {
                const msg = payload.new;
                setThreads(prev => {
                  const updated = prev.map(t => {
                    if (t.id !== msg.job_id) return t;
                    return {
                      ...t,
                      lastMessage: { text: msg.text, sender_id: msg.sender_id, created_at: msg.created_at },
                      unreadCount: msg.sender_id !== userId ? (t.unreadCount ?? 0) + 1 : (t.unreadCount ?? 0)
                    };
                  });
                  return [...updated].sort((a, b) =>
                    new Date(b.lastMessage?.created_at ?? b.created_at) -
                    new Date(a.lastMessage?.created_at ?? a.created_at)
                  );
                });
              }
            )
            .subscribe();
        }
      )
      .subscribe();

    return () => {
      msgChannel?.unsubscribe();
      jobChannel?.unsubscribe();
    };
  }, [userId]);

  function handleOpen(t, other) {
    // Reset unread count for this thread in local state
    setThreads(prev => prev.map(th => th.id === t.id ? { ...th, unreadCount: 0 } : th));
    onOpen(t.id, other);
  }

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

  const filtered = threads.filter(t => {
    if (!search.trim()) return true;
    const other = t.client?.id === userId ? t.worker : t.client;
    return other?.name?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="thread-list">
      <div className="thread-list-search">
        <input
          type="search"
          placeholder="Rechercher une conversation…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      {filtered.map(t => {
        const other = t.client?.id === userId ? t.worker : t.client;
        if (!other) return null;
        const lastText = t.lastMessage?.text
          ? (t.lastMessage.sender_id === userId ? `Vous: ${t.lastMessage.text}` : t.lastMessage.text)
          : "Démarrer la conversation";
        return (
          <button key={t.id} type="button" className={`thread-row${t.unreadCount > 0 ? " unread" : ""}`} onClick={() => handleOpen(t, other)}>
            <Avatar url={other.avatar_url} name={other.name} size={52} />
            <div className="thread-row-body">
              <strong>{other.name}</strong>
              <span className={t.unreadCount > 0 ? "thread-preview-unread" : ""}>{lastText}</span>
            </div>
            <div className="thread-row-meta">
              <small style={{ color: t.unreadCount > 0 ? "#25d366" : undefined }}>{formatThreadTime(t.lastMessage?.created_at ?? t.created_at)}</small>
              {t.unreadCount > 0 && (
                <span className="thread-unread-badge" style={{ background: "#25d366" }}>{t.unreadCount > 9 ? "9+" : t.unreadCount}</span>
              )}
            </div>
          </button>
        );
      })}
      {filtered.length === 0 && search && (
        <p style={{ textAlign: "center", color: "#94a3b8", padding: "32px 16px", fontSize: "0.85rem" }}>Aucun résultat pour "{search}"</p>
      )}
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
    if (!jobId) return;
    getMessages(jobId).then(setMessages);
    // Mark as read when opening conversation
    markThreadRead(currentUser?.id);

    const channel = subscribeToMessages(jobId, (msg) => {
      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });
    return () => channel.unsubscribe();
  }, [jobId]);

  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleSubmit(e) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !currentUser || sending) return;
    setSending(true);
    setError("");
    // Optimistic update
    const optimistic = { id: `opt_${Date.now()}`, senderId: currentUser.id, text, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    setMessages(prev => [...prev, optimistic]);
    setDraft("");
    try {
      const msg = await sendMessage(jobId, { senderId: currentUser.id, senderRole: "user", text });
      // Replace optimistic with real message
      setMessages(prev => prev.map(m => m.id === optimistic.id ? msg : m));
    } catch {
      setMessages(prev => prev.filter(m => m.id !== optimistic.id));
      setDraft(text);
      setError("Impossible d'envoyer le message.");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <header className="chat-header">
        <button type="button" onClick={onBack} aria-label="Retour" style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
          <ArrowLeft size={22} />
        </button>
        <Avatar url={recipient?.avatar_url} name={recipient?.name} size={40} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: "1rem", fontWeight: 700, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {recipient?.name || "Conversation"}
          </h1>
          <p style={{ fontSize: "0.72rem", margin: 0 }}>En ligne</p>
        </div>
        {recipient?.phone && (
          <a href={`tel:${recipient.phone}`} aria-label="Appeler" style={{ padding: 8 }}>
            <Phone size={20} />
          </a>
        )}
      </header>

      <section className="chat-thread" ref={threadRef}>
        {messages.length === 0 && (
          <p style={{ textAlign: "center", color: "#667781", background: "rgba(255,255,255,.7)", borderRadius: 12, padding: "10px 20px", fontSize: "0.82rem", justifySelf: "center", marginTop: 16 }}>
            Commencez la conversation 👋
          </p>
        )}
        {messages.map(message => {
          const isMe = message.senderId === currentUser?.id;
          return (
            <article className={`message-row ${isMe ? "user-message" : "provider-message"}`} key={message.id}>
              {!isMe && <Avatar url={recipient?.avatar_url} name={recipient?.name} size={28} />}
              <div className={`bubble ${isMe ? "client" : "worker"}`}>
                <p>{message.text}</p>
                <time>{message.time}{isMe && <CheckCheck size={12} style={{ marginLeft: 4, opacity: 0.6, color: "#53bdeb" }} />}</time>
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
          autoFocus
        />
        <button type="submit" aria-label="Envoyer" disabled={sending || !draft.trim()}>
          <Send size={22} />
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
  const [threadError, setThreadError] = useState("");

  // If ?with= is given, find or create thread immediately
  useEffect(() => {
    if (!withParam || !user?.id || jobId) return;
    setStarting(true);
    setThreadError("");
    getOrCreateDirectThread(user.id, withParam).then(tid => {
      if (tid) setJobId(tid);
      setStarting(false);
    }).catch(err => {
      setThreadError("Impossible d'ouvrir la conversation. Vérifiez votre connexion et réessayez.");
      console.error("Thread error:", err.message);
      setStarting(false);
    });
  }, [withParam, user?.id]);

  // If ?jobId= is given, load recipient from the job
  useEffect(() => {
    if (!jobIdParam || !user?.id) return;
    supabase
      .from("jobs")
      .select("client_id, worker_id, client:profiles!jobs_client_id_fkey(id,name,avatar_url,trade,phone), worker:profiles!jobs_worker_id_fkey(id,name,avatar_url,trade,phone)")
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
            <a href="/feed"><ArrowLeft size={22} /></a>
            <h1 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>Messages</h1>
          </header>
          {starting
            ? <div className="browse-loading">Démarrage de la conversation…</div>
            : threadError
              ? (
                <div style={{ padding: "32px 24px", textAlign: "center", color: "#ef4444" }}>
                  <p style={{ fontWeight: 600, marginBottom: 12 }}>{threadError}</p>
                  <button
                    type="button"
                    className="wide-blue-button"
                    style={{ maxWidth: 220, margin: "0 auto" }}
                    onClick={() => {
                      setThreadError("");
                      setStarting(true);
                      getOrCreateDirectThread(user.id, withParam).then(tid => {
                        if (tid) setJobId(tid);
                        else setThreadError("Impossible d'ouvrir la conversation. Vérifiez votre connexion et réessayez.");
                        setStarting(false);
                      });
                    }}
                  >
                    Réessayer
                  </button>
                </div>
              )
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
