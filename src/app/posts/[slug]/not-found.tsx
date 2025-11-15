import Link from "next/link";
import Container from "@/components/Container";

export default function NotFound() {
  return (
    <Container>
      <div className="text-center py-16">
        <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
        <p className="text-gray-600 mb-8">
          The post you're looking for doesn't exist or has been removed.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </Container>
  );
}

