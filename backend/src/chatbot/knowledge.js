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
After logging in, the left sidebar has: Home, Messages, Friends, Profile and Logout. A red number on Friends shows how many friend requests are waiting for you. The arrow button on the sidebar edge collapses or expands it. After login a short "Welcome" screen appears for about 3 seconds and then opens Home.

ACCOUNT
- Sign up needs a username, an email and a password.
- Username: 3 to 30 characters. It must be unique and is not case-sensitive ("Ali" and "ali" are the same name).
- Email: must be a valid email address and not used by another account.
- Password: 8 to 72 characters. The sign up form also asks you to type the password again in \"Confirm password\"; if the two do not match you see \"Passwords do not match\".
- Log in with your EMAIL and password (not your username).
- You stay signed in automatically for up to about 7 days. If the session expires you are sent back to the login page. You can be logged in on several devices at once. Logout (bottom of the sidebar) ends the session on that device.
- Too many login or signup attempts in a short time are temporarily blocked with the message "Too many attempts. Please try again later." Waiting about 15 minutes and trying again fixes it.
- The Profile page shows your username, your email and three real counts: Posts (your posts), Friends (your friends) and Requests (friend requests waiting for you). The short bio text on Profile is fixed placeholder text and cannot be edited.
- The round Facebook, Google and LinkedIn buttons on the login and signup pages do nothing yet. Use email and password.
- Profile pictures (avatars) are generated automatically from your username.
- Passwords are stored securely hashed. Nobody, including this assistant, can see a user's password, and a user should never share it with anyone.

HOME (FEED) AND POSTS
- Home shows posts from all users in one feed, newest first (the latest 50 posts). Each post shows the author's username and the time. Emails are never shown on posts.
- To post: type in the box at the top of Home and press \"Create Post\". A post is text only, cannot be empty, and can be up to 5000 characters.
- You can edit or delete ONLY your own posts. The Edit and Delete buttons are shown on every post, but on someone else's post they only give the error \"You can only edit/delete your own post\". Editing puts the text back into the box at the top; press \"Update Post\" to save it. Cancel stops editing. A character counter shows while you type.
- Deleting a post removes it for everyone.

FRIENDS
- Open Friends from the sidebar. It has three tabs: People, Requests and Friends.
- People: search users by username. Next to each person you see one of these: \"Add friend\" (sends a friend request), \"Cancel request\" (you already sent one), \"Accept\" and \"Deny\" (they sent you one), or a \"Friends\" label (you are already friends).
- Requests: \"Received\" shows requests sent to you with Accept and Deny buttons. \"Sent\" shows your pending requests with a \"Cancel request\" button. The red number on the Requests tab (and on Friends in the sidebar) is how many received requests are waiting.
- Friends: your friends list. The \"Remove\" button next to a friend ends the friendship. After that you cannot message each other until you are friends again.
- Friends is the only place to add or remove friends. There is no Message button on the Friends page; chats are started from Messages.

MESSAGES (CHAT)
- Open Messages from the sidebar. The conversation list has folders: Primary, Groups and Blocked. The top of the list shows your @username and a search box. Online friends appear as small pictures above the folders; tap one to open that chat.
- There is no add-user button at the top of the list anymore. A chat only shows in the list after it has messages. The New Message window opens from the buttons inside the list: \"Start a new conversation\" (when you have no chats yet), \"Create a group\" (in the Groups folder when you have no groups yet) and \"New Message\" (shown when you type a name into the search box and no chat matches, with the Primary folder open).
- To start a chat: open Messages, type your friend's name in the search box above the list, and when \"No chats found\" appears press \"New Message\". If you have no chats yet, press \"Start a new conversation\" instead. In the New Message window there are three tabs: Suggested (your friends, with a search box and a \"Message\" button), @username (type a friend's exact username, with or without the @), and Group Chat.
- Friends: you can only message people who are your friends. Open Friends in the sidebar, press \"Add friend\" on a user in the People tab, and wait for them to press Accept in their Requests tab (they can also press Deny). Once accepted, both of you can chat normally from Messages. If someone removes you as a friend, the chat stops until you are friends again. There are no separate message requests.
- Group chats: choose \"Group Chat\" in the New Message window, add people, and optionally name the group (up to 60 characters; the default name is \"Group Chat\"). A group can have up to 50 other members. Everyone you add to a group must be your friend. Groups start immediately.
- A message can be up to 2000 characters and cannot be empty. Type in the \"Message\" box at the bottom. While the box is empty the button next to it is a heart that sends a heart message; once you type, it becomes the Send button.
- Messages arrive in real time. You can see when someone is typing and whether they are online. Messages show a status: sent, delivered or read.
- Delete a message: use the delete icon on the message and choose \"delete for everyone\" (only the sender can do this; it disappears for all) or \"delete for me\" (hides it only for you).
- Open the chat's Details panel (info button in the chat header) for: Mute notifications, Clear chat, and Block or Unblock (one-to-one chats only).
- Clear chat hides the old messages for YOU only and the chat disappears from your list. The other person still has the messages. To chat again, start it from New Message as above.
- There is no \"Delete conversation\" or \"Remove contact\" in Messages anymore. To stop someone from messaging you, Block them; to end the friendship, use Remove in Friends > Friends.
- Block: once a chat is blocked, nobody can send messages in it. The blocked chat appears in your Blocked folder, and the bottom of that chat shows \"You blocked this user.\" with an Unblock button and a \"Delete chat\" button (which works like Clear chat).
- On a message you can add emoji reactions: double-click the message and pick heart, laugh, wow, sad or thumbs up. Reactions and the Mute notifications switch currently only work on your own screen and are not saved, so they can disappear after you refresh and the other person may not see them.

NOT AVAILABLE (do not say these exist; if asked, say they are not available in ${APP_NAME} right now)
- Password reset / "Forgot your password?". The link on the login page does not do anything yet, so there is no self-service way to reset a password inside the app.
- Likes, comments, sharing or reposting posts. Posts are text only.
- Photos, videos, files or voice messages in posts or in chats.
- Following people, followers or following counts (the Profile counts are Posts, Friends and Requests only).
- Editing your username, email, password or bio; uploading a profile picture; deleting your account.
- Deleting a whole conversation or removing a contact from Messages. Clear chat (only for you), Block, and Remove in Friends are the available options.
- Logging in with Facebook, Google or LinkedIn. Those buttons do not work yet.
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
- Cannot send a message in a chat: either you are not friends with that person (send a friend request from Friends, or accept theirs in the Requests tab; if you removed them, add them again) or the chat is blocked (Unblock it in Details).
- Can't find how to start a new chat: there is no add-user button at the top of the list. Type the friend's name in the chat list search box and press \"New Message\" when no chat matches, or press \"Start a new conversation\" if the list is empty.
- Can't find someone to message: only friends appear in Suggested. Find the person in Friends > People and send a friend request first. "No user found with that username" means that username does not exist; check the spelling. You cannot start a chat with yourself.
- Messages or feed not updating, or logged out unexpectedly: refresh the page, check the internet connection, and log in again if asked.
- A post or message is rejected as too long: posts max 5000 characters, messages max 2000.
- "Something went wrong" or server errors: try again in a minute; the service may be temporarily busy.
`.trim();

module.exports = { PLATFORM_KNOWLEDGE };
