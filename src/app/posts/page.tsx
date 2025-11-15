import { getPublishedPosts } from "@/lib/posts";
import PostCard from "@/components/PostCard";
import Container from "@/components/Container";
import PostsPagination from "@/components/PostsPagination";

interface PostsPageProps {
  searchParams: Promise<{ page?: string }>;
}

const POSTS_PER_PAGE = 12;

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const { page } = await searchParams;
  const currentPage = parseInt(page || "1", 10);
  const offset = (currentPage - 1) * POSTS_PER_PAGE;

  // Get all posts (we'll paginate client-side for now, or you can implement server-side pagination)
  const allPosts = await getPublishedPosts();
  const totalPosts = allPosts.length;
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
  const posts = allPosts.slice(offset, offset + POSTS_PER_PAGE);

  return (
    <Container>
      <div className="py-8">
        <h1 className="text-4xl font-bold mb-8">All Posts</h1>
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No posts yet. Be the first to publish!</p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-gray-600">
              Showing {offset + 1}-{Math.min(offset + POSTS_PER_PAGE, totalPosts)} of {totalPosts} posts
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
            {totalPages > 1 && (
              <PostsPagination
                currentPage={currentPage}
                totalPages={totalPages}
              />
            )}
          </>
        )}
      </div>
    </Container>
  );
}
