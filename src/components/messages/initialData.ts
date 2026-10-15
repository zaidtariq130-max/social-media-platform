import type { MessageUser } from "../../types/messages"
import { avatarFor } from "../../utils/avatar"

/** Fallback current user, used only when no logged-in user id is available. */
export const CURRENT_USER: MessageUser = {
  id: "me",
  username: "you",
  name: "You",
  avatar: avatarFor("you"),
  isOnline: true,
}
