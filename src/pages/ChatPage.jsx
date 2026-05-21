import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CheckCheck,
  Handshake,
  ImagePlus,
  MapPin,
  MoreVertical,
  Paperclip,
  Phone,
  PlayCircle,
  Send,
  ShieldCheck
} from "lucide-react";
import { useAuth } from "../hooks/useAuth.js";
import { getMessages, sendMessage, subscribeToMessages } from "../services/chatService.js";

const quickReplies = ["Share location", "Send photo", "Confirm price"];

export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const threadRef = useRef(null);

  const params = new URLSearchParams(window.location.search);
  const jobId = params.get("jobId");

  useEffect(() => {
    getMessages(jobId).then(setMessages);

    if (!jobId) return;

    const channel = subscribeToMessages(jobId, (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => channel.unsubscribe();
  }, [jobId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleSubmit(event) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || !user || !jobId) return;

    setError("");
    try {
      const msg = await sendMessage(jobId, {
        senderId: user.id,
        senderRole: "user",
        text
      });
      setMessages((prev) => [...prev, msg]);
      setDraft("");
    } catch {
      setError("Impossible d'envoyer le message.");
    }
  }

  function sendQuickReply(reply) {
    setDraft(reply);
  }

  return (
    <main className="app-screen chat-screen">
      <header className="chat-header">
        <a href="/worker-profile" aria-label="Back to profile">
          <ArrowLeft size={25} />
        </a>
        <img
          src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=180&q=80"
          alt="Moussa the Plumber"
        />
        <div>
          <h1>Moussa the Plumber</h1>
          <p>
            Online
            <span>Verified provider</span>
          </p>
        </div>
        <div className="chat-header-actions">
          <a href="tel:+237000000000" aria-label="Call Moussa">
            <Phone size={22} />
          </a>
          <button type="button" aria-label="More chat options">
            <MoreVertical size={22} />
          </button>
        </div>
      </header>

      <section className="chat-thread" ref={threadRef}>
        <article className="chat-job-card">
          <span>
            <BriefcaseBusiness size={24} />
          </span>
          <div>
            <strong>Kitchen sink leak repair</strong>
            <p>
              <MapPin size={14} />
              Bastos, Yaounde
            </p>
          </div>
          <b>Active</b>
        </article>

        <span className="chat-day">Today</span>
        {!jobId && (
          <p className="browse-empty">Ouvrez une conversation depuis un job pour charger les messages Supabase.</p>
        )}

        {messages.map((message) => {
          if (message.type === "status" && message.status === "price") {
            return (
              <aside className="price-agreed-card" key={message.id}>
                <span>
                  <Handshake size={28} />
                </span>
                <div>
                  <strong>Price Agreed</strong>
                  <p>Fixed rate of $85.00 for gasket replacement and labor.</p>
                </div>
              </aside>
            );
          }

          if (message.type === "status" && message.status === "started") {
            return (
              <aside className="job-started-card" key={message.id}>
                <span>
                  <PlayCircle size={30} />
                </span>
                <div>
                  <strong>Job Started</strong>
                  <p>Work officially commenced at 10:40 AM</p>
                </div>
              </aside>
            );
          }

          const isUser = message.sender === "user";

          return (
            <article
              className={`message-row ${isUser ? "user-message" : "provider-message"}`}
              key={message.id}
            >
              {!isUser && (
                <img
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=180&q=80"
                  alt="Moussa the Plumber"
                />
              )}
              <div
                className={`bubble ${isUser ? "client" : "worker"} ${message.image ? "image-bubble" : ""}`}
              >
                {message.image && <img src={message.image} alt="Job photo" />}
                <p>{message.text}</p>
                <time>
                  {message.time}
                  {isUser && <CheckCheck size={14} />}
                </time>
              </div>
            </article>
          );
        })}

        <p className="chat-trust-note">
          <ShieldCheck size={16} />
          Keep job updates, photos, and payment agreement inside this chat.
        </p>
      </section>

      <form className="chat-composer" onSubmit={handleSubmit}>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="quick-replies" aria-label="Quick replies">
          {quickReplies.map((reply) => (
            <button key={reply} type="button" onClick={() => sendQuickReply(reply)}>
              {reply}
            </button>
          ))}
        </div>
        <button type="button" aria-label="Attach file">
          <Paperclip size={24} />
        </button>
        <button type="button" aria-label="Attach photo">
          <ImagePlus size={24} />
        </button>
        <input
          placeholder="Type a message..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          disabled={!jobId || !user}
        />
        <button type="submit" aria-label="Send message" disabled={!jobId || !user || !draft.trim()}>
          <Send size={27} />
        </button>
      </form>
    </main>
  );
}
