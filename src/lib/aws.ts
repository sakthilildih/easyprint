import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import type { User } from "./types";

const region = import.meta.env.VITE_AWS_REGION || "ap-south-1";
const accessKeyId = import.meta.env.VITE_AWS_ACCESS_KEY_ID || "";
const secretAccessKey = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || "";
const bucketName = "easyprintsak";

// Initialize S3 Client
// Note: For MVP, using credentials from env variables. 
// Ensure IAM user has ONLY s3:PutObject permission for this specific bucket.
export const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  maxAttempts: 5, // Aggressive retrying for very low/flaky college networks
});

export async function uploadToS3(file: File, user: User, onProgress?: (percent: number) => void): Promise<string> {
  // Create a URL-safe userId without using % encoding to avoid S3 double-encoding bugs
  const userId = (user.email || "anonymous").replace(/[^a-zA-Z0-9_-]/g, '_');
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const extension = file.name.split('.').pop() || "pdf";
  
  const key = `uploads/${userId}/${timestamp}_${randomStr}.${extension}`;
  
  const projectUrl = window.location.origin;

  let currentPercent = 0;
  
  // Start a simulated smooth progress that slowly creeps up to 95%
  // because the browser Fetch API does not give us byte-by-byte progress until a 5MB chunk finishes.
  const progressInterval = setInterval(() => {
    if (currentPercent < 95) {
      // Slow down the progress as it gets higher (ease-out effect)
      const increment = Math.max(1, (95 - currentPercent) * 0.05);
      currentPercent += increment;
      if (onProgress) onProgress(Math.floor(currentPercent));
    }
  }, 1000);

  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: bucketName,
      Key: key,
      Body: file,
      ContentType: file.type || "application/octet-stream",
      Metadata: {
        userid: userId,
        username: encodeURIComponent(user.name || ""),
        useremail: encodeURIComponent(user.email || ""),
        projecturl: encodeURIComponent(projectUrl),
        uploadedat: timestamp.toString(),
      },
    },
    // 5MB is the absolute minimum chunk size allowed by AWS S3.
    partSize: 5 * 1024 * 1024,
    // Set queueSize to 1 for extremely slow networks! 
    // This forces the app to focus 100% of its bandwidth on a single 5MB chunk at a time, preventing timeouts.
    queueSize: 1, 
  });

  if (onProgress) {
    upload.on("httpUploadProgress", (progress) => {
      if (progress.loaded && progress.total) {
        const realPercent = Math.round((progress.loaded / progress.total) * 100);
        // Only update if the real chunk progress is higher than our faked smooth progress
        if (realPercent > currentPercent) {
          currentPercent = realPercent;
          onProgress(currentPercent);
        }
      }
    });
  }

  try {
    await upload.done();
    clearInterval(progressInterval);
    if (onProgress) onProgress(100);
    return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
  } catch (error) {
    clearInterval(progressInterval);
    console.error("S3 Upload Error:", error);
    throw error;
  }
}
