// Converts Friendship documents into the JSON the frontend expects.
const { RELATIONSHIP, FRIEND_STATUS } = require("../config/constants");
const { idOf } = require("../utils/id");
const { serializeUser } = require("./user.serializer");

/** How `userId` relates to the other person of this pair (`friendship` may be null). */
const relationshipOf = (friendship, userId) => {
  if (!friendship) return { status: RELATIONSHIP.NONE };

  if (friendship.status === FRIEND_STATUS.ACCEPTED) {
    return { status: RELATIONSHIP.FRIENDS, requestId: idOf(friendship) };
  }
  if (friendship.status === FRIEND_STATUS.PENDING) {
    const sentByMe = idOf(friendship.requester) === String(userId);
    return {
      status: sentByMe ? RELATIONSHIP.REQUEST_SENT : RELATIONSHIP.REQUEST_RECEIVED,
      requestId: idOf(friendship),
    };
  }
  // declined: nobody is waiting for anything, so the pair is free to try again
  return { status: RELATIONSHIP.NONE };
};

/** The other person of a friendship, from the point of view of `userId` (needs populated users). */
const otherUserOf = (friendship, userId) =>
  idOf(friendship.requester) === String(userId) ? friendship.recipient : friendship.requester;

/** A user in the "People" list, with the relationship attached. */
const serializePerson = (user, friendship, userId) => ({
  ...serializeUser(user),
  relationship: relationshipOf(friendship, userId),
});

/** A pending request in the Requests tab. */
const serializeRequest = (friendship, userId) => ({
  id: idOf(friendship),
  status: friendship.status,
  direction: idOf(friendship.requester) === String(userId) ? "outgoing" : "incoming",
  createdAt: friendship.createdAt,
  user: serializeUser(otherUserOf(friendship, userId)),
});

/** A friend in the Friends tab. */
const serializeFriend = (friendship, userId) => ({
  ...serializeUser(otherUserOf(friendship, userId)),
  friendshipId: idOf(friendship),
  friendsSince: friendship.respondedAt || friendship.updatedAt,
});

module.exports = {
  relationshipOf,
  otherUserOf,
  serializePerson,
  serializeRequest,
  serializeFriend,
};
