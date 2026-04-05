export interface FeedItem {
  id: string;
  author: string;
  authorId: string;
  authorPhoto: string | null;
  time: string;
  rawDate: string;
  title: string;
  content: string;
  image: string | undefined;
  media: { id?: string; file: string; media_type: string; order?: number }[];
  likes: number;
  prayers: number | undefined;
  comments: number;
  type: "post" | "prayer";
  userReaction: string | null;
  is_boosted: boolean;
}

export function mapFeedItem(p: Record<string, any>, type: "post" | "prayer"): FeedItem {
  return {
    id: p.id,
    author: p.author?.full_name || "Anonymous",
    authorId: p.author?.id,
    authorPhoto: p.author?.profile_photo,
    time: new Date(p.created_at).toLocaleDateString(),
    rawDate: p.created_at,
    title: p.title,
    content: type === "post" ? p.text_content : p.description,
    image: p.media?.[0]?.file,
    media: p.media || [],
    likes: p.reaction_count ?? 0,
    prayers: type === "prayer" ? (p.reaction_count ?? 0) : undefined,
    comments: p.comment_count ?? 0,
    type,
    userReaction: p.user_reaction || null,
    is_boosted: p.is_boosted || false,
  };
}
