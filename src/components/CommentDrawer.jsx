import React, { useEffect, useRef, useState } from "react";
import { Send, X } from "lucide-react";
import { getComments, addComment, subscribeToComments } from "../services/commentsService.js";
import { useAuth } from "../hooks/useAuth.js";

export default function CommentDrawer({ postId, isOpen, onClose }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const listRef = useRef(null);

  useEffect(() => {
    if (!postId || !isOpen) return;
    getComments(postId).then(setComments);

    const channel = subscribeToComments(postId, (comment) => {
      setComments((prev) => [...prev, comment]);
    });
    return () => channel.unsubscribe();
  }, [postId, isOpen]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [comments]);

  async function handleSubmit(e) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !user) return;
    setDraft("");
    setError("");
    try {
      const comment = await addComment(postId, user.id, text);
      setComments((prev) => [...prev, comment]);
    } catch {
      setDraft(text);
      setError("Impossible d'envoyer le commentaire.");
    }
  }

  return (
    <div className={`comment-drawer${isOpen ? " open" : ""}`} role="dialog" aria-label="Commentaires">
      <div className="comment-drawer-handle" />
      <header>
        <h2>Commentaires</h2>
        <button type="button" onClick={onClose} aria-label="Fermer">
          <X size={22} />
        </button>
      </header>

      <div className="comment-list" ref={listRef}>
        {comments.length === 0 && (
          <p className="comment-empty">Aucun commentaire. Soyez le premier !</p>
        )}
        {comments.map((c) => (
          <div className="comment-item" key={c.id}>
            <div className="comment-avatar">
              {c.author?.avatar_url ? (
                <img src={c.author.avatar_url} alt={c.author.name} />
              ) : (
                <span>{c.author?.name?.[0] ?? "?"}</span>
              )}
            </div>
            <div>
              <strong>{c.author?.name ?? "Utilisateur"}</strong>
              <p>{c.text}</p>
              <time>{c.relativeTime}</time>
            </div>
          </div>
        ))}
      </div>

      <form className="comment-composer" onSubmit={handleSubmit}>
        {error && <p className="form-error" role="alert">{error}</p>}
        <input
          placeholder="Ajouter un commentaire…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          disabled={!user}
        />
        <button type="submit" aria-label="Envoyer" disabled={!draft.trim() || !user}>
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}
