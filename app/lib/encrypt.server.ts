import crypto from "node:crypto";
import { config } from "~/lib/config.server";

const ALGORITHM = "aes-256-cbc";
const KEY = Buffer.from(config.ENCRYPTION_SECRET, "utf-8");

export interface EncryptedData {
  iv: Buffer;
  data: string;
}

export function encrypt(value: string): EncryptedData {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(value, "utf8", "base64");
  encrypted += cipher.final("base64");
  return { iv, data: encrypted };
}

export function decrypt(encryptedData: EncryptedData): string {
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, encryptedData.iv);
  let decrypted = decipher.update(encryptedData.data, "base64", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
