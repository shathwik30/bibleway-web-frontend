import type { Metadata } from "next";
import ReadChapterClient from "./ReadChapterClient";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://api-bibleway.up.railway.app/api/v1";

type Props = {
  params: Promise<{ bibleId: string; chapterId: string }>;
};

async function fetchPreview(bibleId: string, chapterId: string) {
  try {
    const res = await fetch(
      `${API_BASE_URL}/bible/api-bible/bibles/${bibleId}/chapters/${chapterId}?content-type=html`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { bibleId, chapterId } = await params;
  const data = await fetchPreview(bibleId, chapterId);
  const chapter = data?.data;

  const title = chapter?.reference
    ? `${chapter.reference} — Bibleway`
    : `Read — Bibleway`;

  const description = chapter?.content
    ? chapter.content.replace(/<[^>]*>/g, "").slice(0, 160) + "..."
    : "Read the Bible on Bibleway. Join a community exploring scripture together.";

  const bibleName = chapter?.bible_name || "";

  return {
    title,
    description,
    openGraph: {
      title: chapter?.reference || "Bible Reading",
      description,
      siteName: "Bibleway",
      type: "article",
      ...(bibleName && {
        tags: [bibleName, "Bible", "Scripture"],
      }),
    },
    twitter: {
      card: "summary",
      title: chapter?.reference || "Bible Reading",
      description,
    },
  };
}

export default async function ReadChapterPage({ params }: Props) {
  const { bibleId, chapterId } = await params;

  return <ReadChapterClient bibleId={bibleId} chapterId={chapterId} />;
}
