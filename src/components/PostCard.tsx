import Link from "next/link";
import Image from "next/image";
import { Post } from "@/types";
import { formatDistanceToNow } from "date-fns";

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const formatDate = (date: Date | undefined) => {
    if (!date) return "";
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return "";
    }
  };

  return (
    <article className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <Link href={`/posts/${post.slug}`}>
        {post.coverImage && (
          <div className="relative w-full h-48 md:h-64">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}
        <div className="p-6">
          <div className="flex flex-wrap gap-2 mb-3">
            {post.tags?.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
          <h2 className="text-2xl font-bold mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
          )}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-4">
              {post.author && (
                <span className="font-medium">{post.author.displayName || post.author.email}</span>
              )}
              <span>{formatDate(post.publishedAt || post.createdAt)}</span>
            </div>
            {post.readTime && (
              <span>{post.readTime} min read</span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}

