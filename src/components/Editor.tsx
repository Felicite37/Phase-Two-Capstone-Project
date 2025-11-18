"use client";

import { useRef, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { uploadImageToCloudinary } from "@/lib/cloudinary";

// Dynamically import Jodit to avoid SSR issues
const JoditEditor = dynamic(() => import("jodit-react"), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded" />,
});

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export default function Editor({ content, onChange, placeholder }: EditorProps) {
  const editor = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  // Load Jodit CSS dynamically
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/jodit.min.css";
    link.onerror = () => {
      // Fallback: try to load from node_modules
      const fallbackLink = document.createElement("link");
      fallbackLink.rel = "stylesheet";
      // Use a data URL or load from CDN as fallback
      console.warn("Jodit CSS not found at /jodit.min.css");
    };
    document.head.appendChild(link);

    return () => {
      // Cleanup
      const existingLink = document.querySelector('link[href="/jodit.min.css"]');
      if (existingLink) {
        existingLink.remove();
      }
    };
  }, []);

  // Jodit configuration
  const config = {
    readonly: false,
    placeholder: placeholder || "Start writing your story...",
    height: 600,
    toolbar: true,
    spellcheck: true,
    language: "en",
    toolbarButtonSize: "medium",
    toolbarAdaptive: false,
    showCharsCounter: true,
    showWordsCounter: true,
    showXPathInStatusbar: false,
    askBeforePasteHTML: true,
    askBeforePasteFromWord: true,
    defaultActionOnPaste: "insert_as_html",
    buttons: [
      "source",
      "|",
      "bold",
      "italic",
      "underline",
      "|",
      "ul",
      "ol",
      "|",
      "outdent",
      "indent",
      "|",
      "font",
      "fontsize",
      "brush",
      "paragraph",
      "|",
      "image",
      "video",
      "table",
      "link",
      "|",
      "align",
      "undo",
      "redo",
      "|",
      "hr",
      "eraser",
      "copyformat",
      "|",
      "fullsize",
      "selectall",
      "print",
      "|",
      "symbol",
      "fullsize",
      "preview",
      "find",
    ],
    uploader: {
      insertImageAsBase64URI: false,
      imagesExtensions: ["jpg", "png", "jpeg", "gif", "webp"],
      filesHandler: async (files: File[]) => {
        setIsUploading(true);
        try {
          const uploadedImages: string[] = [];

          for (const file of files) {
            // Validate file type
            if (!file.type.startsWith("image/")) {
              throw new Error(`${file.name} is not an image file`);
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
              throw new Error(`${file.name} is too large. Maximum size is 5MB`);
            }

            const result = await uploadImageToCloudinary(file);
            uploadedImages.push(result.secure_url);
          }

          setIsUploading(false);
          return uploadedImages;
        } catch (error) {
          setIsUploading(false);
          console.error("Image upload error:", error);
          alert(error instanceof Error ? error.message : "Failed to upload image");
          return [];
        }
      },
      url: (url: string) => url,
    },
    events: {
      afterPaste: (editor: any) => {
        // Clean up pasted content
        editor.value = editor.value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
      },
    },
  };

  return (
    <div className="relative">
      {isUploading && (
        <div className="absolute top-4 right-4 z-10 bg-blue-500 text-white px-4 py-2 rounded shadow-lg">
          Uploading image...
        </div>
      )}
      <JoditEditor
        ref={editor}
        value={content}
        config={config}
        onBlur={(newContent) => onChange(newContent)}
        onChange={(newContent) => onChange(newContent)}
      />
    </div>
  );
}

