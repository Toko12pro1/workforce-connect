import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import FeedCard from "../components/FeedCard.jsx";
import CommentDrawer from "../components/CommentDrawer.jsx";
import { getPostById } from "../services/feedService.js";
import { useAuth } from "../hooks/useAuth.js";

export default function FeedPostDetailPage({ id }) {
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [commentsOpen, setCommentsOpen] = useState(false);

  useEffect(() => {
    if (id) getPostById(id).then(setPost);
  }, [id]);

  if (!post) {
    return (
      <main className="app-screen feed-screen">
        <div className="feed-loading-state">Chargement…</div>
      </main>
    );
  }

  return (
    <main className="app-screen feed-screen">
      <a href="/feed" className="feed-back-btn" aria-label="Retour">
        <ArrowLeft size={26} />
      </a>
      <div className="feed-scroll-container">
        <div className="feed-card-wrapper">
          <FeedCard
            post={post}
            isActive={true}
            currentUserId={user?.id}
            onCommentOpen={() => setCommentsOpen(true)}
          />
        </div>
      </div>
      <CommentDrawer
        postId={post.id}
        isOpen={commentsOpen}
        onClose={() => setCommentsOpen(false)}
      />
    </main>
  );
}
