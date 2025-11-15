import { getPostsByTag, getAllTags } from "@/lib/posts";
import PostCard from "@/components/PostCard";
import Container from "@/components/Container";
import Link from "next/link";
import { notFound } from "next/navigation";

interface TagPageProps {
  params: Promise<{ tag: string }>;
}

// Generate static params for all tags (SSG)
export async function generateStaticParams() {
  try {
    const tags = await getAllTags();
    return tags.map((tag) => ({
      tag: encodeURIComponent(tag),
    }));
  } catch (error) {
    console.error("Error generating static params for tags:", error);
    return [];
  }
}

// Revalidate every 60 seconds (ISR)
export const revalidate = 60;

export default async function TagPage({ params }: TagPageProps) {
  const { tag: encodedTag } = await params;
  const tag = decodeURIComponent(encodedTag);
  const posts = await getPostsByTag(tag);

  // If no posts found, show 404
  if (posts.length === 0) {
    notFound();
  }

  return (
    <Container>
      <div className="py-8">
        <div className="mb-8">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
          >
            ← Back to home
          </Link>
          <h1 className="text-4xl font-bold mb-2">
            Posts tagged: <span className="text-blue-600">#{tag}</span>
          </h1>
          <p className="text-gray-600">
            {posts.length} {posts.length === 1 ? "post" : "posts"} found
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </Container>
  );
}

