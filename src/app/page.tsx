import { getPublishedPosts, getAllTags } from "@/lib/posts";
import PostCard from "@/components/PostCard";
import Container from "@/components/Container";
import Link from "next/link";

export default async function Home() {
  const latestPosts = await getPublishedPosts(6); // Get latest 6 posts
  const allTags = await getAllTags();

  return (
    <Container>
      <div className="py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Welcome to Medium Clone</h1>
          <p className="text-lg text-gray-600">
            Your platform to read and publish articles.
          </p>
        </div>

        {/* Popular Tags */}
        {allTags.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Popular Tags</h2>
            <div className="flex flex-wrap gap-2">
              {allTags.slice(0, 10).map((tag) => (
                <Link
                  key={tag}
                  href={`/tags/${encodeURIComponent(tag)}`}
                  className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors text-sm"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Latest Posts */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Latest Stories</h2>
            <Link
              href="/posts"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              View all →
            </Link>
          </div>

          {latestPosts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <p className="text-gray-500 text-lg mb-4">No posts yet.</p>
              <Link
                href="/write"
                className="inline-block px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Write your first story
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
