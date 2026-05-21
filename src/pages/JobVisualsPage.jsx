import React, { useEffect, useState } from "react";
import { ArrowLeft, Camera, Send, ShieldCheck, X } from "lucide-react";
import { createJob } from "../services/jobsService.js";
import { uploadJobMedia } from "../services/storageService.js";
import { useAuth } from "../hooks/useAuth.js";

export default function JobVisualsPage() {
  const { user } = useAuth();
  const [draft, setDraft] = useState({});
  const [mediaFiles, setMediaFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = sessionStorage.getItem("job_draft");
    if (saved) setDraft(JSON.parse(saved));
  }, []);

  function handleFiles(e) {
    const files = Array.from(e.target.files || []);
    setMediaFiles(prev => [...prev, ...files]);
    files.forEach(f => {
      const reader = new FileReader();
      reader.onload = ev => setPreviews(prev => [...prev, { name: f.name, src: ev.target.result }]);
      reader.readAsDataURL(f);
    });
    e.target.value = "";
  }

  function removeFile(idx) {
    setMediaFiles(prev => prev.filter((_, i) => i !== idx));
    setPreviews(prev => prev.filter((_, i) => i !== idx));
  }

  async function handlePost() {
    if (!user?.id) { window.location.href = "/login"; return; }
    if (!draft.serviceType) { setError("Reprenez depuis l'étape 1."); return; }
    setSubmitting(true);
    setError("");
    try {
      const mediaUrls = [];
      for (const f of mediaFiles) {
        const url = await uploadJobMedia(f, user.id);
        mediaUrls.push(url);
      }
      await createJob({
        clientId: user.id,
        serviceType: draft.serviceType,
        description: draft.description || "",
        location: draft.location || "",
        budgetType: draft.budgetType || "negotiable",
        budgetAmount: draft.budgetAmount || 0,
        mediaUrls
      });
      sessionStorage.removeItem("job_draft");
      window.location.href = "/job-posted";
    } catch (err) {
      setError("Impossible de publier le job. Vérifiez votre connexion.");
      setSubmitting(false);
    }
  }

  return (
    <main className="app-screen job-visuals-screen">
      <header className="job-flow-header visual-flow-header">
        <a href="/post-job-location" aria-label="Retour"><ArrowLeft size={28} /></a>
        <span className="job-flow-brand">Workforce Connect</span>
      </header>

      <section className="visuals-content">
        <div className="job-step-row visuals-step">
          <strong>ÉTAPE 3 SUR 3</strong>
          <span>Photos (facultatif)</span>
        </div>

        {/* Summary of job being posted */}
        {draft.serviceType && (
          <aside style={{ background: "#f1f5f9", borderRadius: 12, padding: "12px 16px", margin: "0 0 16px", fontSize: "0.875rem", color: "#475569" }}>
            <strong style={{ color: "#1e293b" }}>{draft.serviceType}</strong>
            {draft.location && <> · {draft.location}</>}
            {draft.budgetAmount > 0 && <> · {draft.budgetAmount.toLocaleString("fr-CM")} XAF</>}
            {draft.description && <p style={{ marginTop: 4, color: "#64748b" }}>{draft.description.slice(0, 100)}{draft.description.length > 100 ? "…" : ""}</p>}
          </aside>
        )}

        <label className="visual-upload-box" style={{ cursor: "pointer", display: "block" }}>
          <Camera size={52} />
          <span>Ajouter des photos</span>
          <input type="file" accept="image/*,video/*" multiple onChange={handleFiles} style={{ display: "none" }} />
        </label>

        {previews.length > 0 && (
          <div className="visual-preview-grid">
            {previews.map((p, i) => (
              <article key={p.name + i}>
                <img src={p.src} alt={p.name} />
                <button aria-label="Supprimer" type="button" onClick={() => removeFile(i)}>
                  <X size={18} />
                </button>
              </article>
            ))}
          </div>
        )}

        <p className="verified-response-note" style={{ marginTop: 16 }}>
          <ShieldCheck size={24} />
          Les prestataires vérifiés répondent 30% plus vite.
        </p>

        {error && <p className="form-error" role="alert">{error}</p>}

        <button
          className="wide-blue-button post-now-button"
          type="button"
          onClick={handlePost}
          disabled={submitting}
        >
          {submitting ? "Publication…" : <><Send size={24} /> Publier le job maintenant</>}
        </button>
        <a className="save-draft-button" href="/browse">Annuler</a>
      </section>
    </main>
  );
}
