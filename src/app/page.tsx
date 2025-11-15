import { getPublishedPosts } from "@/lib/posts";
import PostCard from "@/components/PostCard";
import Container from "@/components/Container";
import Link from "next/link";

export default async function Home() {
  const posts = await getPublishedPosts(6); // Get latest 6 posts

  return (
    <Container>
      <div className="py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Welcome to Medium Clone</h1>
          <p className="text-lg text-gray-600">
            Your platform to read and publish articles.
          </p>
        </div>

        {posts.length === 0 ? (
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
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
            {posts.length >= 6 && (
              <div className="text-center">
                <Link
                  href="/posts"
                  className="inline-block px-6 py-3 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  View all posts
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </Container>
  );
}
