import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Camera,
  FileVideo,
  Hammer,
  Info,
  Paintbrush,
  Pencil,
  Search,
  UploadCloud,
  Wrench,
  X
} from "lucide-react";

const services = [
  { name: "Plumber", icon: Hammer },
  { name: "Electrician", icon: Wrench },
  { name: "Painter", icon: Paintbrush },
  { name: "Carpenter", icon: Pencil },
  { name: "Tailor", icon: Pencil },
  { name: "Mechanic", icon: Wrench },
  { name: "Barber", icon: Pencil },
  { name: "Cleaner", icon: UploadCloud }
];

export default function JobDetailsPage() {
  const [serviceSearch, setServiceSearch] = useState("");
  const [selectedService, setSelectedService] = useState("Plumber");
  const [description, setDescription] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);

  const filteredServices = useMemo(() => {
    const search = serviceSearch.trim().toLowerCase();
    if (!search) {
      return services;
    }

    return services.filter((service) => service.name.toLowerCase().includes(search));
  }, [serviceSearch]);
  const canUseCustomService =
    serviceSearch.trim() &&
    !services.some((service) => service.name.toLowerCase() === serviceSearch.trim().toLowerCase());

  function handleMediaChange(event, type) {
    const nextFiles = Array.from(event.target.files || []).map((file) => ({
      id: `${type}-${file.name}-${file.lastModified}`,
      name: file.name,
      type
    }));

    setMediaFiles((currentFiles) => [...currentFiles, ...nextFiles]);
    event.target.value = "";
  }

  function removeMedia(fileId) {
    setMediaFiles((currentFiles) => currentFiles.filter((file) => file.id !== fileId));
  }

  return (
    <main className="app-screen job-details-screen">
      <header className="job-flow-header job-details-header">
        <a href="/browse" aria-label="Back to browse">
          <ArrowLeft size={28} />
        </a>
        <a href="/browse" className="job-flow-brand">
          Workforce Connect
        </a>
        <a href="/worker-dashboard" aria-label="Notifications">
          <Bell size={22} />
        </a>
      </header>

      <section className="job-details-content">
        <div className="job-step-row details-step">
          <strong>STEP 1 OF 3</strong>
          <span>Details</span>
          <i>
            <b></b>
          </i>
        </div>

        <section className="details-intro">
          <h1>Post a New Job</h1>
          <p>Describe the task so we can match you with the right pro.</p>
          <h2>What service do you need?</h2>
        </section>

        <label className="service-search-field">
          <Search size={24} />
          <input
            type="search"
            placeholder="Search your service field..."
            value={serviceSearch}
            onChange={(event) => setServiceSearch(event.target.value)}
          />
        </label>

        <div className="service-choice-grid">
          {filteredServices.map(({ name, icon: Icon }) => (
            <button
              className={selectedService === name ? "active" : ""}
              key={name}
              type="button"
              onClick={() => setSelectedService(name)}
            >
              <Icon size={32} />
              <span>{name}</span>
            </button>
          ))}
          {canUseCustomService && (
            <button
              className={selectedService === serviceSearch.trim() ? "active custom-service-button" : "custom-service-button"}
              type="button"
              onClick={() => setSelectedService(serviceSearch.trim())}
            >
              <Pencil size={32} />
              <span>Use "{serviceSearch.trim()}"</span>
            </button>
          )}
          {!filteredServices.length && !canUseCustomService && (
            <p className="empty-service-result">No service found.</p>
          )}
        </div>

        <label className="job-description-field">
          <span>Explain the job</span>
          <textarea
            maxLength="500"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="e.g. My kitchen sink is leaking from the main pipe. I need someone to come look at it this afternoon..."
          ></textarea>
          <b>{description.length} / 500</b>
        </label>

        <p className="specific-tip">
          <Info size={25} />
          Be specific about the problem to get better quotes.
        </p>

        <section className="details-photo-section">
          <h2>Add photos or videos</h2>
          <p>Upload clear photos or a short video so providers can understand the job.</p>
          <div>
            <label className="details-add-photo">
              <Camera size={45} />
              Add photo
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(event) => handleMediaChange(event, "Photo")}
              />
            </label>
            <label className="details-add-photo video-upload">
              <FileVideo size={45} />
              Add video
              <input
                type="file"
                accept="video/*"
                multiple
                onChange={(event) => handleMediaChange(event, "Video")}
              />
            </label>
            {mediaFiles.map((file) => (
              <article key={file.id}>
                <span>{file.type}</span>
                <strong>{file.name}</strong>
                <button
                  aria-label={`Remove ${file.name}`}
                  type="button"
                  onClick={() => removeMedia(file.id)}
                >
                  <X size={18} />
                </button>
              </article>
            ))}
          </div>
        </section>
      </section>

      <footer className="details-next-footer">
        <a href="/post-job-location">
          Next: Schedule & Budget
          <ArrowRight size={29} />
        </a>
      </footer>
    </main>
  );
}
