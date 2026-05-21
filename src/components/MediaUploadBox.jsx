import React, { useRef, useState } from "react";
import { Camera, FileVideo, X } from "lucide-react";

export default function MediaUploadBox({ onFiles, accept = "image/*,video/*", maxFiles = 5, label = "Ajouter des médias" }) {
  const [previews, setPreviews] = useState([]);
  const inputRef = useRef(null);

  function handleChange(e) {
    const selected = Array.from(e.target.files || []).slice(0, maxFiles - previews.length);
    if (!selected.length) return;

    const next = selected.map((file) => ({
      id: `${file.name}-${file.lastModified}`,
      name: file.name,
      isVideo: file.type.startsWith("video"),
      url: URL.createObjectURL(file),
      file
    }));

    const updated = [...previews, ...next].slice(0, maxFiles);
    setPreviews(updated);
    onFiles(updated.map((p) => p.file));
    e.target.value = "";
  }

  function remove(id) {
    const updated = previews.filter((p) => p.id !== id);
    setPreviews(updated);
    onFiles(updated.map((p) => p.file));
  }

  return (
    <div className="media-upload-grid">
      {previews.length < maxFiles && (
        <label className="add-media-box">
          <Camera size={48} />
          <span>{label}</span>
          <input ref={inputRef} type="file" accept={accept} multiple onChange={handleChange} />
        </label>
      )}
      {previews.map((p) => (
        <div className="media-preview-item" key={p.id}>
          {p.isVideo ? (
            <video src={p.url} className="media-thumb" muted />
          ) : (
            <img src={p.url} className="media-thumb" alt={p.name} />
          )}
          {p.isVideo && (
            <span className="media-type-badge">
              <FileVideo size={12} /> Vidéo
            </span>
          )}
          <button type="button" aria-label={`Supprimer ${p.name}`} onClick={() => remove(p.id)}>
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
