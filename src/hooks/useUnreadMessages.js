import { useEffect, useState } from "react";
import { getUnreadMessageCount } from "../services/chatService.js";
import { supabase } from "../supabaseClient.js";

export function useUnreadMessages(userId) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    getUnreadMessageCount(userId).then(setCount);

    let msgChannel;

    async function setupMsgSubscription() {
      const { data: threads } = await supabase
        .from("jobs")
        .select("id")
        .or(`client_id.eq.${userId},worker_id.eq.${userId}`)
        .not("worker_id", "is", null);

      const ids = (threads ?? []).map(t => t.id);
      if (!ids.length) return;

      msgChannel = supabase
        .channel(`unread:${userId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages", filter: `job_id=in.(${ids.join(",")})` },
          (payload) => {
            if (payload.new?.sender_id !== userId) {
              setCount(c => c + 1);
            }
          }
        )
        .subscribe();
    }

    setupMsgSubscription();

    // When a new thread is created with this user as worker, re-setup subscription
    const jobChannel = supabase
      .channel(`unread_jobs:${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "jobs", filter: `worker_id=eq.${userId}` },
        () => { msgChannel?.unsubscribe(); setupMsgSubscription(); }
      )
      .subscribe();

    return () => {
      msgChannel?.unsubscribe();
      jobChannel.unsubscribe();
    };
  }, [userId]);

  return count;
}
