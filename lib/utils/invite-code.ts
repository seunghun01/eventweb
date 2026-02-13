import { randomBytes } from "crypto";

/**
 * 8자리 hex 초대 코드 생성 (약 43억 조합)
 */
export function generateInviteCode(): string {
  return randomBytes(4).toString("hex");
}
