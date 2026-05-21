import React, { useState } from "react";
import {
  ArrowLeft,
  Bell,
  Camera,
  CheckCircle2,
  FileVideo,
  Lightbulb,
  MapPin,
  Star,
  Upload,
  UserRound,
  X
} from "lucide-react";
import BottomNav from "../components/BottomNav.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { createPost } from "../services/portfolioService.js";
import { uploadPortfolioMedia } from "../services/storageService.js";

export default function AddPortfolioPage() {
  const { user } = useAuth();
  const displayName = user?.user_metadata?.name || user?.name || "New User";

  const [postType, setPostType] = useState("Handwork");
  const [category, setCategory] = useState("Installation");
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  function handleMediaChange(event) {
    const nextFiles = Array.from(event.target.files || []).map((file) => ({
      id: `${file.name}-${file.lastModified}`,
      name: file.name,
      type: file.type.startsWith("video") ? "Video" : "Photo",
      file
    }));
    setMediaFiles((prev) => [...prev, ...nextFiles]);
    event.target.value = "";
  }

  function removeMedia(fileId) {
    setMediaFiles((prev) => prev.filter((file) => file.id !== fileId));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!user?.id) {
      setError("Connectez-vous pour publier.");
      return;
    }

    setError("");
    setUploading(true);

    try {
      const uploadedUrls = [];
      for (const mediaFile of mediaFiles) {
        const url = await uploadPortfolioMedia(mediaFile.file, user.id);
        uploadedUrls.push(url);
      }

      await createPost(
        {
          title: title || "My latest handwork",
          caption:
            caption ||
            "A recent project from my handwork portfolio. Message me for jobs, training, or collaboration.",
          category,
          postType,
          workerId: user.id,
          image: uploadedUrls[0] ?? null,
          author: {
            name: displayName,
            service: category === "Training" ? "Trainer and Service Provider" : "Service Provider",
            location: "Bastos, Yaounde",
            rating: "New",
            avatar:
              "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=260&q=80"
          }
        },
        mediaFiles.map((mediaFile) => mediaFile.file)
      );

      window.location.href = "/worker-profile";
    } catch {
      setError("Impossible de publier maintenant. Verifiez Supabase puis reessayez.");
      setUploading(false);
    }
  }

  return (
    <main className="app-screen portfolio-upload-screen">
      <header className="portfolio-upload-header">
        <a href="/worker-dashboard" aria-label="Back to dashboard">
          <ArrowLeft size={28} />
        </a>
        <h1>Create Portfolio Post</h1>
        <a href="/worker-profile" aria-label="Notifications">
          <Bell size={26} />
        </a>
      </header>

      <form className="portfolio-upload-content" onSubmit={handleSubmit}>
        <section className="post-type-panel">
          <h2>What are you posting?</h2>
          <div>
            {["Handwork", "Job Update", "Training"].map((type) => (
              <button
                className={postType === type ? "active" : ""}
                key={type}
                type="button"
                onClick={() => {
                  setPostType(type);
                  if (type === "Training") setCategory("Training");
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </section>

        <div className="media-upload-grid">
          <label className="add-media-box">
            <Camera size={64} />
            <span>Add Media</span>
            <input type="file" accept="image/*,video/*" multiple onChange={handleMediaChange} />
          </label>
          <article className="media-preview-card">
            <img
              src="https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=700&q=82"
              alt="Electrical panel portfolio upload"
            />
            <button type="button" aria-label="Remove uploaded media">
              <X size={24} />
            </button>
          </article>
          {mediaFiles.map((file) => (
            <article className="media-file-chip" key={file.id}>
              {file.type === "Video" ? <FileVideo size={28} /> : <Camera size={28} />}
              <div>
                <strong>{file.type}</strong>
                <span>{file.name}</span>
              </div>
              <button
                type="button"
                aria-label={`Remove ${file.name}`}
                onClick={() => removeMedia(file.id)}
              >
                <X size={18} />
              </button>
            </article>
          ))}
        </div>

        <label className="mock-form-field">
          <span>Post Title</span>
          <input
            placeholder="e.g., Bastos Main Line Repair"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>

        <label className="mock-form-field post-caption-field">
          <span>Write about the work or training</span>
          <textarea
            placeholder="Explain what you made, repaired, taught, or learned..."
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
          ></textarea>
        </label>

        <section className="chip-section" aria-labelledby="category-title">
          <h2 id="category-title">Category</h2>
          <div>
            {["Installation", "Repair", "Maintenance", "Training", "Emergency"].map((cat) => (
              <button
                className={category === cat ? "active" : ""}
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        <article className="post-author-preview">
          <div>
            <UserRound size={24} />
          </div>
          <section>
            <h2>Your info shown under this post</h2>
            <p>
              <strong>{displayName}</strong>
              <span>Service Provider</span>
              <small>
                <MapPin size={14} />
                Bastos, Yaounde
              </small>
            </p>
          </section>
          <span>
            <Star size={15} />
            New
          </span>
        </article>

        <aside className="photo-tips-card">
          <span>
            <Lightbulb size={38} />
          </span>
          <div>
            <h2>Pro Photo Tips</h2>
            <p>
              <CheckCircle2 size={18} />
              Use natural daylight for clear photos.
            </p>
            <p>
              <CheckCircle2 size={18} />
              Show Before and After shots.
            </p>
            <p>
              <CheckCircle2 size={18} />
              Focus on your specific handiwork.
            </p>
          </div>
        </aside>

        <button className="wide-blue-button publish-button" type="submit" disabled={uploading}>
          <Upload size={26} />
          {uploading ? "Publishing..." : "Publish to Profile"}
        </button>
        {error && <p className="form-error" role="alert">{error}</p>}
      </form>

      <BottomNav active="profile" />
    </main>
  );
}
