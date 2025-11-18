import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  DocumentSnapshot,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "./api";
import { Post } from "@/types";
import { FirebaseError } from "firebase/app";

// Helper function to convert Firestore timestamp to Date
const timestampToDate = (timestamp: unknown): Date => {
  if (timestamp && typeof timestamp === "object" && "toDate" in timestamp) {
    return (timestamp as { toDate: () => Date }).toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  return new Date();
};

// Helper function to convert Post data from Firestore
const firestoreToPost = (
  doc: DocumentSnapshot | QueryDocumentSnapshot
): Post => {
  const data = doc.data();
  if (!data) {
    throw new Error("Document data is undefined");
  }
  return {
    id: doc.id,
    title: data.title || "",
    content: data.content || "",
    excerpt: data.excerpt || "",
    slug: data.slug || doc.id,
    authorId: data.authorId || "",
    published: data.published || false,
    publishedAt: data.publishedAt
      ? timestampToDate(data.publishedAt)
      : undefined,
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
    tags: data.tags || [],
    coverImage: data.coverImage || "",
    readTime: data.readTime || calculateReadTime(data.content || ""),
  };
};

// Calculate read time (average reading speed: 200 words per minute)
const calculateReadTime = (content: string): number => {
  const text = content.replace(/<[^>]*>/g, ""); // Strip HTML tags
  const words = text.split(/\s+/).filter((word) => word.length > 0);
  const minutes = Math.ceil(words.length / 200);
  return minutes;
};

// Generate slug from title
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
};

// Create a new post
export async function createPost(
  postData: Omit<Post, "id" | "slug" | "createdAt" | "updatedAt" | "readTime">
): Promise<Post> {
  try {
    const slug = generateSlug(postData.title);

    // Check if slug already exists
    const existingPost = await getPostBySlug(slug);
    const finalSlug = existingPost ? `${slug}-${Date.now()}` : slug;

    const postRef = await addDoc(collection(db, "posts"), {
      ...postData,
      slug: finalSlug,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      readTime: calculateReadTime(postData.content),
      publishedAt: postData.published ? serverTimestamp() : null,
    });

    const newPost = await getDoc(postRef);
    if (!newPost.exists()) {
      throw new Error("Failed to create post");
    }

    return firestoreToPost(newPost);
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
}

// Get a single post by ID
export async function getPostById(id: string): Promise<Post | null> {
  try {
    const postRef = doc(db, "posts", id);
    const postSnap = await getDoc(postRef);

    if (!postSnap.exists()) {
      return null;
    }

    return firestoreToPost(postSnap);
  } catch (error) {
    if (
      error instanceof FirebaseError &&
      (error.code === "not-found" || error.code === "failed-precondition")
    ) {
      console.warn(
        "⚠️ Firestore not enabled. Please enable Firestore in Firebase Console."
      );
      return null;
    }
    console.error("Error getting post:", error);
    throw error;
  }
}

// Get a single post by slug
export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const q = query(
      collection(db, "posts"),
      where("slug", "==", slug),
      limit(1)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    return firestoreToPost(querySnapshot.docs[0]);
  } catch (error) {
    if (
      error instanceof FirebaseError &&
      (error.code === "not-found" || error.code === "failed-precondition")
    ) {
      console.warn(
        "⚠️ Firestore not enabled. Please enable Firestore in Firebase Console."
      );
      return null;
    }
    console.error("Error getting post by slug:", error);
    throw error;
  }
}

// Get all published posts
export async function getPublishedPosts(limitCount?: number): Promise<Post[]> {
  try {
    let q = query(
      collection(db, "posts"),
      where("published", "==", true),
      orderBy("publishedAt", "desc")
    );

    if (limitCount && limitCount > 0) {
      q = query(q, limit(limitCount));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => firestoreToPost(doc));
  } catch (error) {
    // If Firestore is not enabled, return empty array
    if (
      error instanceof FirebaseError &&
      (error.code === "not-found" || error.code === "failed-precondition")
    ) {
      console.warn(
        "⚠️ Firestore not enabled. Please enable Firestore in Firebase Console."
      );
      return [];
    }
    console.error("Error getting published posts:", error);
    // If orderBy fails (no index), try without it
    try {
      let q = query(collection(db, "posts"), where("published", "==", true));
      if (limitCount && limitCount > 0) {
        q = query(q, limit(limitCount));
      }
      const querySnapshot = await getDocs(q);
      const posts = querySnapshot.docs.map((doc) => firestoreToPost(doc));
      // Sort manually by publishedAt
      return posts.sort((a, b) => {
        const dateA = a.publishedAt || a.createdAt;
        const dateB = b.publishedAt || b.createdAt;
        return dateB.getTime() - dateA.getTime();
      });
    } catch (fallbackError) {
      if (
        fallbackError instanceof FirebaseError &&
        (fallbackError.code === "not-found" ||
          fallbackError.code === "failed-precondition")
      ) {
        console.warn(
          "⚠️ Firestore not enabled. Please enable Firestore in Firebase Console."
        );
        return [];
      }
      console.error("Error getting published posts (fallback):", fallbackError);
      throw error;
    }
  }
}

// Get all posts by author
export async function getPostsByAuthor(authorId: string): Promise<Post[]> {
  try {
    const q = query(
      collection(db, "posts"),
      where("authorId", "==", authorId),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => firestoreToPost(doc));
  } catch (error) {
    console.error("Error getting posts by author:", error);
    throw error;
  }
}

// Get all posts (including drafts) - for admin/author
export async function getAllPosts(limitCount?: number): Promise<Post[]> {
  try {
    let q = query(collection(db, "posts"), orderBy("createdAt", "desc"));

    if (limitCount) {
      q = query(q, limit(limitCount));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => firestoreToPost(doc));
  } catch (error) {
    console.error("Error getting all posts:", error);
    throw error;
  }
}

// Update a post
export async function updatePost(
  id: string,
  updates: Partial<Omit<Post, "id" | "createdAt" | "readTime">>
): Promise<Post> {
  try {
    const postRef = doc(db, "posts", id);

    const updateData: Record<string, unknown> = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    // If title changed, update slug
    if (updates.title) {
      updateData.slug = generateSlug(updates.title);
    }

    // If content changed, update read time
    if (updates.content) {
      updateData.readTime = calculateReadTime(updates.content);
    }

    // If publishing, set publishedAt
    if (updates.published === true) {
      updateData.publishedAt = serverTimestamp();
    }

    await updateDoc(postRef, updateData);

    const updatedPost = await getDoc(postRef);
    if (!updatedPost.exists()) {
      throw new Error("Post not found after update");
    }

    return firestoreToPost(updatedPost);
  } catch (error) {
    console.error("Error updating post:", error);
    throw error;
  }
}

// Delete a post (hard delete)
export async function deletePost(id: string): Promise<void> {
  try {
    const postRef = doc(db, "posts", id);
    await deleteDoc(postRef);
  } catch (error) {
    console.error("Error deleting post:", error);
    throw error;
  }
}

// Soft delete a post (mark as deleted)
export async function softDeletePost(id: string): Promise<void> {
  try {
    await updatePost(id, { published: false });
  } catch (error) {
    console.error("Error soft deleting post:", error);
    throw error;
  }
}

// Get posts by tag
export async function getPostsByTag(
  tag: string,
  limitCount?: number
): Promise<Post[]> {
  try {
    let q = query(
      collection(db, "posts"),
      where("published", "==", true),
      where("tags", "array-contains", tag),
      orderBy("publishedAt", "desc")
    );

    if (limitCount && limitCount > 0) {
      q = query(q, limit(limitCount));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => firestoreToPost(doc));
  } catch (error) {
    console.error("Error getting posts by tag:", error);
    // Fallback: get all posts and filter client-side
    try {
      const allPosts = await getPublishedPosts();
      const filtered = allPosts
        .filter((post) => post.tags?.includes(tag))
        .sort((a, b) => {
          const dateA = a.publishedAt || a.createdAt;
          const dateB = b.publishedAt || b.createdAt;
          return dateB.getTime() - dateA.getTime();
        });
      return limitCount ? filtered.slice(0, limitCount) : filtered;
    } catch (fallbackError) {
      console.error("Error getting posts by tag (fallback):", fallbackError);
      throw error;
    }
  }
}

// Get all unique tags from published posts
export async function getAllTags(): Promise<string[]> {
  try {
    const posts = await getPublishedPosts();
    const tagSet = new Set<string>();
    posts.forEach((post) => {
      post.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  } catch (error) {
    console.error("Error getting all tags:", error);
    return [];
  }
}

// Search posts (client-side search)
export async function searchPosts(
  query: string,
  limitCount?: number
): Promise<Post[]> {
  try {
    const allPosts = await getPublishedPosts();
    const searchTerm = query.toLowerCase().trim();

    if (!searchTerm) {
      return limitCount ? allPosts.slice(0, limitCount) : allPosts;
    }

    const filtered = allPosts.filter((post) => {
      const titleMatch = post.title.toLowerCase().includes(searchTerm);
      const contentMatch = post.content.toLowerCase().includes(searchTerm);
      const excerptMatch = post.excerpt?.toLowerCase().includes(searchTerm);
      const tagMatch = post.tags?.some((tag) =>
        tag.toLowerCase().includes(searchTerm)
      );

      return titleMatch || contentMatch || excerptMatch || tagMatch;
    });

    return limitCount ? filtered.slice(0, limitCount) : filtered;
  } catch (error) {
    console.error("Error searching posts:", error);
    throw error;
  }
}
