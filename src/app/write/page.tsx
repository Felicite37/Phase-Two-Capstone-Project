"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/api";
import { onAuthStateChanged } from "firebase/auth";
import Editor from "@/components/Editor";
import { Draft } from "@/types";

export default function WritePage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string>("");

  // Editor state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [tags, setTags] = useState("");
  const [coverImage, setCoverImage] = useState("");

  // Check authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        // Load draft from localStorage if exists
        loadDraft();
      } else {
        router.push("/auth/login");
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

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

  // Manual save
  const handleSaveDraft = async () => {
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

    setIsPublishing(true);
    try {
      // TODO: Replace with actual API call in Lab 4
      const postData = {
        title,
        content,
        excerpt,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),
        coverImage,
        published: true,
      };

      console.log("Publishing post:", postData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Clear draft after successful publish
      localStorage.removeItem("current-draft");

      // Redirect to home or post page
      router.push("/");
    } catch (error) {
      console.error("Error publishing post:", error);
      alert("Failed to publish post. Please try again.");
    } finally {
      setIsPublishing(false);
    }
  };

  if (isLoading) {
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
            <h1 className="text-2xl font-bold">Write a new story</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                {showPreview ? "Edit" : "Preview"}
              </button>
              <button
                onClick={handleSaveDraft}
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

