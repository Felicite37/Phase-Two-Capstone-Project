"use client";
import { useState } from "react";
import Container from "@/components/Container";
import Editor from "@/components/Editor";

export default function CreatePost() {
  const [title, setTitle] = useState(""); // post title
  const [content, setContent] = useState(""); // post content

  const handlePublish = () => {
    console.log("Post Title:", title);
    console.log("Post Content:", content);
    alert("Post published (mock)!");
    setTitle(""); // clear title
    setContent(""); // clear content
  };

  return (
    <Container>
      <h1 className="text-3xl font-bold mb-6">Create New Post</h1>

      <div className="space-y-4">
        {/* Title Input */}
        <input
          type="text"
          placeholder="Post Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 border rounded-md"
        />

        {/* Rich Text Editor */}
        <Editor value={content} onChange={setContent} />

        {/* Publish Button */}
        <button
          onClick={handlePublish}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Publish
        </button>
      </div>

      {/* Preview Section */}
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-2">Preview</h2>
        <div
          className="p-4 border rounded-md bg-gray-50"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </Container>
  );
}
