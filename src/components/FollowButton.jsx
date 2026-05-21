import React, { useEffect, useState } from "react";
import { UserCheck, UserPlus } from "lucide-react";
import { followUser, unfollowUser, isFollowing } from "../services/followService.js";

export default function FollowButton({ targetId, targetType = "worker", currentUserId }) {
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUserId || !targetId || currentUserId === targetId) {
      setLoading(false);
      return;
    }
    isFollowing(currentUserId, targetId).then((result) => {
      setFollowing(result);
      setLoading(false);
    });
  }, [currentUserId, targetId]);

  async function toggle() {
    if (!currentUserId || loading) return;
    setLoading(true);
    if (following) {
      await unfollowUser(currentUserId, targetId);
      setFollowing(false);
    } else {
      await followUser(currentUserId, targetId, targetType);
      setFollowing(true);
    }
    setLoading(false);
  }

  if (!currentUserId || currentUserId === targetId) return null;

  return (
    <button
      type="button"
      className={`follow-btn${following ? " following" : ""}`}
      onClick={toggle}
      disabled={loading}
      aria-label={following ? "Suivi" : "Suivre"}
    >
      {following ? <UserCheck size={16} /> : <UserPlus size={16} />}
      {following ? "Suivi" : "Suivre"}
    </button>
  );
}
