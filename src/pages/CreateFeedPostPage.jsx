import React, { useState } from "react";
import { ArrowLeft, Upload } from "lucide-react";
import BottomNav from "../components/BottomNav.jsx";
import MediaUploadBox from "../components/MediaUploadBox.jsx";
import TradeChipGrid from "../components/TradeChipGrid.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { createFeedPost } from "../services/feedService.js";
import { uploadFeedMedia } from "../services/storageService.js";

export default function CreateFeedPostPage() {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [postType, setPostType] = useState("Handwork");
  const [category, setCategory] = useState("");
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user?.id) {
      setError("Connectez-vous pour publier.");
      return;
    }
    setError("");
    setSubmitting(true);

    try {
      const mediaUrls = [];
      const mediaTypes = [];
      for (const f of files) {
        const url = await uploadFeedMedia(f, user.id);
        mediaUrls.push(url);
        mediaTypes.push(f.type.startsWith("video") ? "video" : "image");
      }

      await createFeedPost({
        worker_id: user.id,
        title: title || "Mon travail",
        caption,
        post_type: postType,
        category,
        media_urls: mediaUrls,
        media_types: mediaTypes
      }, files);

      window.location.href = "/feed";
    } catch (err) {
      const msg = err?.message || err?.error_description || String(err);
      setError(`Erreur: ${msg}`);
      console.error("publish error:", err);
      setSubmitting(false);
    }
  }

  return (
    <main className="app-screen portfolio-upload-screen">
      <header className="portfolio-upload-header">
        <a href="/feed" aria-label="Retour au fil">
          <ArrowLeft size={28} />
        </a>
        <h1>Publier ma compétence</h1>
        <span />
      </header>

      <form className="portfolio-upload-content" onSubmit={handleSubmit}>
        <section className="post-type-panel">
          <h2>Type de publication</h2>
          <div>
            {["Handwork", "Job Update", "Training"].map((t) => (
              <button
                key={t}
                type="button"
                className={postType === t ? "active" : ""}
                onClick={() => setPostType(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </section>

        <MediaUploadBox onFiles={setFiles} accept="image/*,video/*" maxFiles={5} label="Ajouter photos / vidéos" />

        <label className="mock-form-field">
          <span>Titre du post</span>
          <input
            placeholder="ex: Réparation tableau électrique complet"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>

        <label className="mock-form-field post-caption-field">
          <span>Décris ton travail</span>
          <textarea
            placeholder="Explique ce que tu as fait, réparé, construit ou enseigné…"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={4}
          />
        </label>

        <TradeChipGrid selected={category} onChange={setCategory} />

        <button className="wide-blue-button publish-button" type="submit" disabled={submitting}>
          <Upload size={22} />
          {submitting ? "Publication…" : "Publier"}
        </button>
        {error && <p className="form-error" role="alert">{error}</p>}
      </form>

      <BottomNav active="post" mode="worker" />
    </main>
  );
}
