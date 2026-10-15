/** Generated placeholder avatar for a username. */
export function avatarFor(username: string): string {
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(username)}`
}
