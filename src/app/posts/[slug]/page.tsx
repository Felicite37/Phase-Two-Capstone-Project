import { getPostBySlug, getPublishedPosts } from "@/lib/posts";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import DeletePostButton from "@/components/DeletePostButton";
import EditPostButton from "@/components/EditPostButton";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

// Generate static params for published posts (SSG)
export async function generateStaticParams() {
  try {
    const posts = await getPublishedPosts();
    return posts.map((post) => ({
      slug: post.slug,
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

// Revalidate every 60 seconds (ISR)
export const revalidate = 60;

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post || !post.published) {
    notFound();
  }

  const formatDate = (date: Date | undefined) => {
    if (!date) return "";
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return "";
    }
  };

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      {/* Cover Image */}
      {post.coverImage && (
        <div className="relative w-full h-64 md:h-96 mb-8 rounded-lg overflow-hidden">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            priority
          />
        </div>
      )}

      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags?.map((tag, index) => (
            <Link
              key={index}
              href={`/posts?tag=${tag}`}
              className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full hover:bg-blue-200 transition-colors"
            >
              #{tag}
            </Link>
          ))}
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{post.title}</h1>
        {post.excerpt && (
          <p className="text-xl text-gray-600 mb-6 italic">{post.excerpt}</p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-gray-600">
            {post.author && (
              <span className="font-medium">
                {post.author.displayName || post.author.email}
              </span>
            )}
            <span>{formatDate(post.publishedAt || post.createdAt)}</span>
            {post.readTime && <span>• {post.readTime} min read</span>}
          </div>
          <div className="flex gap-2">
            <EditPostButton postId={post.id} authorId={post.authorId} />
            <DeletePostButton postId={post.id} authorId={post.authorId} />
          </div>
        </div>
      </header>

      {/* Content */}
      <div
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </article>
  );
}
