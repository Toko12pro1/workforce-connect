import React, { useRef, useState } from "react";
import { Heart, MessageCircle, Share2, UserPlus, UserCheck, MapPin, Play } from "lucide-react";
import { toggleLike } from "../services/likesService.js";
import { followUser, unfollowUser, isFollowing } from "../services/followService.js";

export default function FeedCard({ post, isActive, currentUserId, likedInitially = false, onCommentOpen }) {
  const videoRef = useRef(null);
  const [liked, setLiked] = useState(likedInitially);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [following, setFollowing] = useState(false);
  const [paused, setPaused] = useState(false);

  // Play/pause video when card becomes active
  React.useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    if (isActive) {
      vid.play().catch(() => {});
      setPaused(false);
    } else {
      vid.pause();
    }
  }, [isActive]);

  function togglePause() {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) {
      vid.play();
      setPaused(false);
    } else {
      vid.pause();
      setPaused(true);
    }
  }

  async function handleLike() {
    if (!currentUserId) return;
    const next = !liked;
    setLiked(next);
    setLikesCount((c) => c + (next ? 1 : -1));
    const result = await toggleLike(post.id, currentUserId);
    setLiked(result.liked);
    setLikesCount(result.newCount);
  }

  async function handleFollow() {
    if (!currentUserId || !post.workerId) return;
    if (following) {
      await unfollowUser(currentUserId, post.workerId);
      setFollowing(false);
    } else {
      await followUser(currentUserId, post.workerId, "worker");
      setFollowing(true);
    }
  }

  const media = post.primaryMedia;
  const isVideo = post.primaryMediaType === "video";

  return (
    <article className="feed-card">
      {media ? (
        isVideo ? (
          <video
            ref={videoRef}
            className="feed-card-media"
            src={media}
            loop
            muted
            playsInline
            onClick={togglePause}
          />
        ) : (
          <img className="feed-card-media" src={media} alt={post.title} onClick={togglePause} />
        )
      ) : (
        <div className="feed-card-media feed-card-placeholder" />
      )}

      {paused && (
        <div className="feed-card-pause-icon">
          <Play size={48} />
        </div>
      )}

      <div className="feed-card-overlay" />

      <aside className="feed-card-sidebar">
        {post.author?.avatar && (
          <a href={`/profile/${post.workerId}`} className="feed-author-avatar">
            <img src={post.author.avatar} alt={post.author.name} />
          </a>
        )}

        <button
          type="button"
          className={`feed-action-btn feed-action-heart${liked ? " liked" : ""}`}
          onClick={handleLike}
          aria-label="J'aime"
        >
          <Heart size={26} fill={liked ? "#ff3b5c" : "none"} />
          <span>{likesCount}</span>
        </button>

        <button
          type="button"
          className="feed-action-btn"
          onClick={() => onCommentOpen?.(post.id)}
          aria-label="Commenter"
        >
          <MessageCircle size={26} />
          <span>{post.commentsCount}</span>
        </button>

        <button
          type="button"
          className="feed-action-btn"
          aria-label="Partager"
          onClick={() => navigator.share?.({ title: post.title, url: `/feed/${post.id}` })}
        >
          <Share2 size={24} />
        </button>

        {currentUserId && post.workerId !== currentUserId && (
          <button
            type="button"
            className={`feed-action-btn follow-btn${following ? " following" : ""}`}
            onClick={handleFollow}
            aria-label={following ? "Suivi" : "Suivre"}
          >
            {following ? <UserCheck size={22} /> : <UserPlus size={22} />}
          </button>
        )}
      </aside>

      <div className="feed-card-info">
        <a href={`/profile/${post.workerId}`} className="feed-author-name">
          <strong>{post.author?.name ?? "Travailleur"}</strong>
          {post.author?.trade && <span>{post.author.trade}</span>}
        </a>
        {post.author?.location && (
          <p className="feed-author-location">
            <MapPin size={12} />
            {post.author.location}
          </p>
        )}
        <p className="feed-caption">{post.caption}</p>
        <span className="feed-category-badge">{post.category || post.postType}</span>
      </div>
    </article>
  );
}
