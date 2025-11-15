import { getPublishedPosts } from "@/lib/posts";
import PostCard from "@/components/PostCard";
import Container from "@/components/Container";

export default async function PostsPage() {
  const posts = await getPublishedPosts();

  return (
    <Container>
      <div className="py-8">
        <h1 className="text-4xl font-bold mb-8">All Posts</h1>
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No posts yet. Be the first to publish!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}

