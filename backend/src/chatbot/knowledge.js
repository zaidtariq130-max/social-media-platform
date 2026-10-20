/**
 * Everything the chatbot is allowed to know about the platform.
 *
 * RULES FOR EDITING THIS FILE
 *  - Only write things that are TRUE in the current product. The bot treats this as its only source of truth.
 *  - When a feature ships (or is removed), update this file; no other chatbot code needs to change.
 *  - Keep the "NOT AVAILABLE" section honest: it is what stops the bot from inventing features.
 */
const { APP_NAME } = require("./config");

const PLATFORM_KNOWLEDGE = `
ABOUT ${APP_NAME}
${APP_NAME} is a web-based social media and chat app. People sign up, publish text posts that appear in a shared feed, and send real-time messages to each other (one-to-one and group chats).
After logging in, the left sidebar has: Home, Messages, Profile and Logout. The arrow button on the sidebar edge collapses or expands it. After login a short "Welcome" screen appears for about 3 seconds and then opens Home.

ACCOUNT
- Sign up needs a username, an email and a password.
- Username: 3 to 30 characters. It must be unique and is not case-sensitive ("Ali" and "ali" are the same name).
- Email: must be a valid email address and not used by another account.
- Password: 8 to 72 characters.
- Log in with your EMAIL and password (not your username).
- You stay signed in automatically for up to about 7 days. If the session expires you are sent back to the login page. You can be logged in on several devices at once. Logout (bottom of the sidebar) ends the session on that device.
- Too many login or signup attempts in a short time are temporarily blocked with the message "Too many attempts. Please try again later." Waiting about 15 minutes and trying again fixes it.
- The Profile page shows your username and email.
- Profile pictures (avatars) are generated automatically from your username.
- Passwords are stored securely hashed. Nobody, including this assistant, can see a user's password, and a user should never share it with anyone.

HOME (FEED) AND POSTS
- Home shows posts from all users in one feed, newest first. Each post shows the author's username and the time. Emails are never shown on posts.
- To post: type in the box at the top of Home and press the create/post button. A post is text only, cannot be empty, and can be up to 5000 characters.
- You can edit or delete ONLY your own posts. Use the Edit and Delete buttons on your post. Editing puts the text back into the box at the top; save to update it. Cancel stops editing.
- Deleting a post removes it for everyone.

MESSAGES (CHAT)
- Open Messages from the sidebar. The conversation list has folders: Primary, Groups, Blocked and Requests.
- To start a chat press the "New Message / Add User" button. There are three tabs: Suggested (browse or search people), @username (type someone's exact username, with or without the @), and Group Chat.
- Message requests: when you start a one-to-one chat, the other person receives it as a request in their Requests folder. Until they press Accept, only the person who sent the request can write; the other person cannot reply. After they accept, both can chat normally.
- Group chats: choose "Group Chat", add people, and optionally name the group (up to 60 characters; the default name is "Group Chat"). A group can have up to 50 other members. Groups start immediately with no request step.
- A message can be up to 2000 characters and cannot be empty.
- Messages arrive in real time. You can see when someone is typing and whether they are online. Messages show a status: sent, delivered or read.
- Delete a message: use the delete icon on the message and choose "delete for everyone" (only the sender can do this; it disappears for all) or "delete for me" (hides it only for you).
- Open the chat's Details panel (info button in the chat header) for: Clear chat, Block or Unblock, Delete conversation, and Mute notifications.
- Clear chat hides the old messages for YOU only. The other person still has them.
- Delete conversation removes the whole chat for BOTH people and cannot be undone.
- Block: once a chat is blocked, nobody can send messages in it. The blocked chat appears in your Blocked folder, and you can Unblock it from the same place.
- On a message you can add emoji reactions (heart, laugh, wow, sad, thumbs up). Reactions and the Mute notifications switch currently only work on your own screen and are not saved, so they can disappear after you refresh and the other person may not see them.

NOT AVAILABLE (do not say these exist; if asked, say they are not available in ${APP_NAME} right now)
- Password reset / "Forgot your password?". The link on the login page does not do anything yet, so there is no self-service way to reset a password inside the app.
- Likes, comments, sharing or reposting posts. Posts are text only.
- Photos, videos, files or voice messages in posts or in chats.
- Following people or follower counts. The Followers and Following numbers on the Profile page are placeholders, not real data.
- Editing your username, email or password; uploading a profile picture; deleting your account.
- A report-user or report-post button (blocking in Messages is the available safety tool).
- Voice or video calls, stories, hashtags, post search, notification settings that are saved on the server.
- A support email, phone number, website or help center. You do not know of any, so never make one up.
- Prices, paid plans, subscriptions or ads. You do not know of any.
- A separate mobile app. ${APP_NAME} is used in the web browser, and you do not know of any other version.

WHAT YOU (THE ASSISTANT) CANNOT DO
- You cannot see anyone's account, posts, chats or private data, and you cannot perform actions for the user (send messages, delete posts, change settings, unblock, reset passwords). You can only explain how the user can do things themselves.

COMMON PROBLEMS AND FIXES
- "Login failed / Invalid email or password": log in with the EMAIL (not the username), check the password for typos and caps lock, and make sure you have signed up. If blocked for "Too many attempts", wait about 15 minutes. If the password is forgotten, say honestly that password reset is not available yet.
- "Username already taken" or "Email already registered": pick a different username, or log in if you already have an account with that email. Usernames are not case-sensitive.
- Signup error about length: username 3 to 30 characters, password 8 to 72 characters.
- Cannot reply in a chat: either the chat is still a message request you have not accepted (open it in Requests and press Accept) or the chat is blocked (Unblock it in Details).
- Can't find someone: use the @username tab with their exact username. "No user found with that username" means that username does not exist; check the spelling. You cannot start a chat with yourself.
- Messages or feed not updating, or logged out unexpectedly: refresh the page, check the internet connection, and log in again if asked.
- A post or message is rejected as too long: posts max 5000 characters, messages max 2000.
- "Something went wrong" or server errors: try again in a minute; the service may be temporarily busy.
`.trim();

module.exports = { PLATFORM_KNOWLEDGE };
