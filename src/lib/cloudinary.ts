// Cloudinary configuration and upload utility

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
}

/**
 * Upload image to Cloudinary
 * @param file - File object from input
 * @returns Promise with Cloudinary response containing secure_url
 */
export async function uploadImageToCloudinary(
  file: File
): Promise<CloudinaryUploadResponse> {
  const cloudinaryUrl = process.env.NEXT_PUBLIC_CLOUDINARY_URL;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudinaryUrl || !uploadPreset) {
    throw new Error(
      "Cloudinary configuration missing. Please set NEXT_PUBLIC_CLOUDINARY_URL and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in your .env.local file"
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  try {
    const response = await fetch(cloudinaryUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to upload image");
    }

    const data = await response.json();
    return {
      secure_url: data.secure_url,
      public_id: data.public_id,
      width: data.width,
      height: data.height,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
}

/**
 * Generate optimized image URL from Cloudinary
 */
export function getOptimizedImageUrl(
  publicId: string,
  width?: number,
  quality: number = 80
): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    throw new Error("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set");
  }

  const transformations = [
    `q_${quality}`,
    width ? `w_${width}` : "w_auto",
    "f_auto",
  ].join(",");

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/${publicId}`;
}

