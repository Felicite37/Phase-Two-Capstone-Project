"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth } from "@/lib/api";
import { onAuthStateChanged } from "firebase/auth";
import Editor from "@/components/Editor";
import { Draft, Post } from "@/types";
import { createPost, getPostById, updatePost } from "@/lib/posts";

export default function WritePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const postId = searchParams.get("id");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPost, setIsLoadingPost] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string>("");
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [currentPost, setCurrentPost] = useState<Post | null>(null);

  // Editor state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [tags, setTags] = useState("");
  const [coverImage, setCoverImage] = useState("");

  // Check authentication and load post if editing
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
        setCurrentUserId(user.uid);
        
        // If editing, load the post
        if (postId) {
          setIsLoadingPost(true);
          try {
            const post = await getPostById(postId);
            if (post) {
              // Check if user owns the post
              if (post.authorId !== user.uid) {
                alert("You don't have permission to edit this post");
                router.push("/");
                return;
              }
              setCurrentPost(post);
              setTitle(post.title);
              setContent(post.content);
              setExcerpt(post.excerpt || "");
              setTags(post.tags?.join(", ") || "");
              setCoverImage(post.coverImage || "");
            } else {
              alert("Post not found");
              router.push("/");
            }
          } catch (error) {
            console.error("Error loading post:", error);
            alert("Failed to load post");
            router.push("/");
          } finally {
            setIsLoadingPost(false);
          }
        } else {
          // Load draft from localStorage if exists
          loadDraft();
        }
      } else {
        router.push("/auth/login");
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [router, postId]);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    if (!isAuthenticated) return;

    const autoSaveInterval = setInterval(() => {
      if (title || content) {
        const draft: Draft = {
          id: `draft-${Date.now()}`,
          title,
          content,
          excerpt,
          tags: tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0),
          coverImage,
          lastSaved: new Date(),
        };
        try {
          localStorage.setItem("current-draft", JSON.stringify(draft));
        } catch (error) {
          console.error("Error auto-saving draft:", error);
        }
      }
    }, 30000); // 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [title, content, excerpt, tags, coverImage, isAuthenticated]);

  // Load draft from localStorage
  const loadDraft = () => {
    try {
      const savedDraft = localStorage.getItem("current-draft");
      if (savedDraft) {
        const draft: Draft = JSON.parse(savedDraft);
        setTitle(draft.title || "");
        setContent(draft.content || "");
        setExcerpt(draft.excerpt || "");
        setTags(draft.tags?.join(", ") || "");
        setCoverImage(draft.coverImage || "");
      }
    } catch (error) {
      console.error("Error loading draft:", error);
    }
  };

  // Save draft to localStorage
  const saveDraft = () => {
    try {
      const draft: Draft = {
        id: `draft-${Date.now()}`,
        title,
        content,
        excerpt,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),
        coverImage,
        lastSaved: new Date(),
      };

      localStorage.setItem("current-draft", JSON.stringify(draft));
      setSaveStatus("Draft saved");
      setTimeout(() => setSaveStatus(""), 2000);
    } catch (error) {
      console.error("Error saving draft:", error);
      setSaveStatus("Failed to save draft");
    }
  };

  // Manual save to localStorage (backup)
  const handleSaveDraftLocal = async () => {
    setIsSaving(true);
    saveDraft();
    setTimeout(() => setIsSaving(false), 500);
  };

  // Publish post
  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) {
      alert("Please add a title and content before publishing");
      return;
    }

    if (!currentUserId) {
      alert("You must be logged in to publish");
      return;
    }

    setIsPublishing(true);
    try {
      const tagsArray = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      let post: Post;

      if (postId && currentPost) {
        // Update existing post
        post = await updatePost(postId, {
          title,
          content,
          excerpt: excerpt || undefined,
          tags: tagsArray,
          coverImage: coverImage || undefined,
          published: true,
        });
      } else {
        // Create new post
        post = await createPost({
          title,
          content,
          excerpt: excerpt || undefined,
          tags: tagsArray,
          coverImage: coverImage || undefined,
          authorId: currentUserId,
          published: true,
        });
      }

      // Clear draft after successful publish
      localStorage.removeItem("current-draft");

      // Redirect to the post page
      router.push(`/posts/${post.slug}`);
    } catch (error) {
      console.error("Error publishing post:", error);
      alert("Failed to publish post. Please try again.");
    } finally {
      setIsPublishing(false);
    }
  };

  // Save as draft (unpublished)
  const handleSaveAsDraft = async () => {
    if (!title.trim() && !content.trim()) {
      alert("Please add some content before saving");
      return;
    }

    if (!currentUserId) {
      alert("You must be logged in to save");
      return;
    }

    setIsSaving(true);
    try {
      const tagsArray = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      if (postId && currentPost) {
        // Update existing post as draft
        await updatePost(postId, {
          title,
          content,
          excerpt: excerpt || undefined,
          tags: tagsArray,
          coverImage: coverImage || undefined,
          published: false,
        });
        setSaveStatus("Draft updated");
      } else {
        // Create new draft
        await createPost({
          title,
          content,
          excerpt: excerpt || undefined,
          tags: tagsArray,
          coverImage: coverImage || undefined,
          authorId: currentUserId,
          published: false,
        });
        setSaveStatus("Draft saved");
      }

      // Also save to localStorage as backup
      saveDraft();
      
      setTimeout(() => setSaveStatus(""), 2000);
    } catch (error) {
      console.error("Error saving draft:", error);
      setSaveStatus("Failed to save draft");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || isLoadingPost) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">
              {postId ? "Edit story" : "Write a new story"}
            </h1>
            <div className="flex gap-2">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                {showPreview ? "Edit" : "Preview"}
              </button>
              <button
                onClick={handleSaveAsDraft}
                disabled={isSaving}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Draft"}
              </button>
              <button
                onClick={handlePublish}
                disabled={isPublishing || !title.trim() || !content.trim()}
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPublishing ? "Publishing..." : "Publish"}
              </button>
            </div>
          </div>
          {saveStatus && (
            <div className="text-sm text-green-600 mb-2">{saveStatus}</div>
          )}
        </div>

        {!showPreview ? (
          <div className="bg-white rounded-lg shadow-sm p-6">
            {/* Title Input */}
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-4xl font-bold mb-4 border-none outline-none placeholder-gray-400"
            />

            {/* Excerpt Input */}
            <input
              type="text"
              placeholder="Excerpt (optional)"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="w-full text-lg mb-4 border-b border-gray-200 pb-2 outline-none placeholder-gray-400"
            />

            {/* Tags Input */}
            <input
              type="text"
              placeholder="Tags (comma-separated)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full mb-4 border-b border-gray-200 pb-2 outline-none placeholder-gray-400"
            />

            {/* Cover Image Input */}
            <input
              type="url"
              placeholder="Cover Image URL (optional)"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="w-full mb-6 border-b border-gray-200 pb-2 outline-none placeholder-gray-400"
            />

            {/* Editor */}
            <Editor content={content} onChange={setContent} />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6">
            {/* Preview */}
            <article className="prose prose-lg max-w-none">
              {coverImage && (
                <img
                  src={coverImage}
                  alt={title}
                  className="w-full h-64 object-cover rounded-lg mb-6"
                />
              )}
              <h1 className="text-4xl font-bold mb-4">{title || "Untitled"}</h1>
              {excerpt && (
                <p className="text-xl text-gray-600 mb-6 italic">{excerpt}</p>
              )}
              {tags && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {tags
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter((tag) => tag.length > 0)
                    .map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                </div>
              )}
              <div
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </article>
          </div>
        )}
      </div>
    </div>
  );
}

