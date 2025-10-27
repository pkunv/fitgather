import { env } from "@/env";
import { UploadClient } from "@uploadcare/upload-client";

export const ucClient = new UploadClient({
  publicKey: env.UPLOADCARE_PUBLIC_KEY,
});
