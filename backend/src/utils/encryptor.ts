import crypto from "crypto";

const ALGO = "aes-256-gcm";
const KEY = Buffer.from(process.env.ENCRYPTION_KEY!, "base64");

if (KEY.length !== 32) {
  throw new Error("ENCRYPTION_KEY must be 32 bytes base64 encoded");
}

export const encrypt = (text: string) => {
  const iv = crypto.randomBytes(12); 
  const cipher = crypto.createCipheriv(ALGO, KEY, iv);

  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag(); 

  return [
    iv.toString("hex"),
    encrypted.toString("hex"),
    authTag.toString("hex"),
  ].join(":");
};

export const decrypt = (hash: string | null | undefined): string => {
  if (!hash || typeof hash !== "string") {
    return "";
  }
  const [ivHex, encryptedHex, tagHex] = hash.split(":");
  if (!ivHex || !encryptedHex || !tagHex) {
    return "";
  }
  const iv = Buffer.from(ivHex, "hex");
  const encrypted = Buffer.from(encryptedHex, "hex");
  const authTag = Buffer.from(tagHex, "hex");

  const decipher = crypto.createDecipheriv(ALGO, KEY, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
};
