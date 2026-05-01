import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
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
});

export async function uploadToS3(file: File, user: User, onProgress?: (percent: number) => void): Promise<string> {
  // Create a URL-safe userId without using % encoding to avoid S3 double-encoding bugs
  const userId = (user.email || "anonymous").replace(/[^a-zA-Z0-9_-]/g, '_');
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const extension = file.name.split('.').pop() || "pdf";
  
  const key = `uploads/${userId}/${timestamp}_${randomStr}.${extension}`;
  
  const projectUrl = window.location.origin;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: new Uint8Array(await file.arrayBuffer()), // Convert File to buffer for AWS SDK
    ContentType: file.type,
    // Add required metadata
    Metadata: {
      userid: userId,
      username: encodeURIComponent(user.name || ""),
      useremail: encodeURIComponent(user.email || ""),
      projecturl: encodeURIComponent(projectUrl),
      uploadedat: timestamp.toString(),
    },
  });

  // Since standard PutObjectCommand doesn't emit progress events natively in the same way 
  // as Firebase or XHR, we will just call onProgress(0) before and onProgress(100) after 
  // for this MVP. A more complex setup using @aws-sdk/lib-storage Upload would be needed 
  // for byte-level tracking.
  if (onProgress) onProgress(0);
  
  await s3Client.send(command);
  
  if (onProgress) onProgress(100);

  // Construct and return the public S3 URL
  return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
}
