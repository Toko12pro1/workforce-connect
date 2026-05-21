import React, { useEffect, useRef, useState } from "react";
import FeedCard from "./FeedCard.jsx";
import CommentDrawer from "./CommentDrawer.jsx";
import { getLikedPostIds } from "../services/likesService.js";
import { useAuth } from "../hooks/useAuth.js";

export default function FeedSection({ posts, loading, onLoadMore }) {
  const { user } = useAuth();
  const [activeIndex, setActiveIndex] = useState(0);
  const [likedIds, setLikedIds] = useState([]);
  const [commentPostId, setCommentPostId] = useState(null);
  const containerRef = useRef(null);
  const cardRefs = useRef([]);

  useEffect(() => {
    if (user?.id) {
      getLikedPostIds(user.id).then(setLikedIds);
    }
  }, [user?.id]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.dataset.index);
            setActiveIndex(idx);
            if (idx >= posts.length - 2) onLoadMore?.();
          }
        });
      },
      { root: container, threshold: 0.6 }
    );

    cardRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [posts.length, onLoadMore]);

  if (loading && posts.length === 0) {
    return (
      <div className="feed-scroll-container">
        <div className="feed-loading-state">Chargement du fil…</div>
      </div>
    );
  }

  return (
    <>
      <div className="feed-scroll-container" ref={containerRef}>
        {posts.map((post, i) => (
          <div
            key={post.id}
            data-index={i}
            ref={(el) => (cardRefs.current[i] = el)}
            className="feed-card-wrapper"
          >
            <FeedCard
              post={post}
              isActive={i === activeIndex}
              currentUserId={user?.id}
              likedInitially={likedIds.includes(post.id)}
              onCommentOpen={setCommentPostId}
            />
          </div>
        ))}
        {loading && <div className="feed-loading-more">…</div>}
      </div>

      <CommentDrawer
        postId={commentPostId}
        isOpen={!!commentPostId}
        onClose={() => setCommentPostId(null)}
      />
    </>
  );
}
