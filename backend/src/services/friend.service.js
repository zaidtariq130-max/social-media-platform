const Friendship = require("../models/Friendship");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const { idOf, assertValidId, directKeyOf } = require("../utils/id");
const { emitToUsers } = require("../socket/emitter");
const { FRIEND_STATUS, SOCKET_EVENTS, USER_HIDDEN_FIELDS } = require("../config/constants");
const userService = require("./user.service");
const {
  serializePerson,
  serializeRequest,
  serializeFriend,
} = require("../serializers/friend.serializer");

const POPULATE_USERS = [
  { path: "requester", select: USER_HIDDEN_FIELDS },
  { path: "recipient", select: USER_HIDDEN_FIELDS },
];

const notify = (event, userIds, friendship) =>
  emitToUsers(userIds, event, { requestId: idOf(friendship), status: friendship.status });

/** Loads a request by id, or fails with 404. */
const getRequest = async (requestId) => {
  assertValidId(requestId);
  const friendship = await Friendship.findById(requestId);
  if (!friendship) throw new AppError(404, "Friend request not found");
  return friendship;
};

/** Everyone except me, with my relationship to each of them. */
const listPeople = async (userId, query) => {
  const { users, pagination } = await userService.listUsers(userId, query);

  const keys = users.map((user) => directKeyOf(userId, user._id));
  const friendships = await Friendship.find({ pairKey: { $in: keys } });
  const byKey = new Map(friendships.map((f) => [f.pairKey, f]));

  return {
    people: users.map((user) =>
      serializePerson(user, byKey.get(directKeyOf(userId, user._id)), userId)
    ),
    pagination,
  };
};

const sendRequest = async (userId, recipientId) => {
  if (String(recipientId) === String(userId)) {
    throw new AppError(400, "You can't send a friend request to yourself");
  }
  if (!(await User.exists({ _id: recipientId }))) throw new AppError(404, "User not found");

  const pairKey = directKeyOf(userId, recipientId);
  const existing = await Friendship.findOne({ pairKey });

  let friendship = existing;
  if (!existing) {
    try {
      friendship = await Friendship.create({ requester: userId, recipient: recipientId, pairKey });
    } catch (error) {
      // two requests at the same moment: the unique index lets only one through
      if (error.code === 11000) throw new AppError(409, "A request already exists for this user");
      throw error;
    }
  } else if (existing.status === FRIEND_STATUS.ACCEPTED) {
    throw new AppError(409, "You are already friends");
  } else if (existing.status === FRIEND_STATUS.PENDING) {
    const sentByMe = idOf(existing.requester) === String(userId);
    throw new AppError(
      409,
      sentByMe ? "Friend request already sent" : "This user already sent you a request"
    );
  } else {
    // declined earlier: open it again as a fresh request from me
    existing.requester = userId;
    existing.recipient = recipientId;
    existing.status = FRIEND_STATUS.PENDING;
    existing.respondedAt = null;
    await existing.save();
  }

  notify(SOCKET_EVENTS.FRIEND_REQUEST_NEW, [recipientId], friendship);
  await friendship.populate(POPULATE_USERS);
  return serializeRequest(friendship, userId);
};

/** The receiver accepts or declines a pending request. */
const respondToRequest = async (userId, requestId, action) => {
  const friendship = await getRequest(requestId);

  if (idOf(friendship.recipient) !== String(userId)) {
    throw new AppError(403, "Only the receiver can answer a friend request");
  }
  if (friendship.status !== FRIEND_STATUS.PENDING) {
    throw new AppError(409, "This request was already answered");
  }

  friendship.status = action === "accept" ? FRIEND_STATUS.ACCEPTED : FRIEND_STATUS.DECLINED;
  friendship.respondedAt = new Date();
  await friendship.save();

  notify(SOCKET_EVENTS.FRIEND_REQUEST_UPDATED, [friendship.requester], friendship);
  await friendship.populate(POPULATE_USERS);
  return serializeRequest(friendship, userId);
};

/** The sender takes back a request that is still pending. */
const cancelRequest = async (userId, requestId) => {
  const friendship = await getRequest(requestId);

  if (idOf(friendship.requester) !== String(userId)) {
    throw new AppError(403, "Only the sender can cancel a friend request");
  }
  if (friendship.status !== FRIEND_STATUS.PENDING) {
    throw new AppError(409, "This request was already answered");
  }

  await friendship.deleteOne();
  notify(SOCKET_EVENTS.FRIEND_REQUEST_UPDATED, [friendship.recipient], {
    ...friendship.toObject(),
    status: "cancelled",
  });
};

/** Pending requests: "incoming" (sent to me) or "outgoing" (sent by me). */
const listRequests = async (userId, type) => {
  const filter =
    type === "outgoing"
      ? { requester: userId, status: FRIEND_STATUS.PENDING }
      : { recipient: userId, status: FRIEND_STATUS.PENDING };

  const requests = await Friendship.find(filter).sort({ createdAt: -1 }).populate(POPULATE_USERS);
  return requests.map((friendship) => serializeRequest(friendship, userId));
};

const listFriends = async (userId) => {
  const friendships = await Friendship.find({
    status: FRIEND_STATUS.ACCEPTED,
    $or: [{ requester: userId }, { recipient: userId }],
  })
    .sort({ respondedAt: -1 })
    .populate(POPULATE_USERS);

  return friendships.map((friendship) => serializeFriend(friendship, userId));
};

/** Ends a friendship with `otherUserId`. */
const removeFriend = async (userId, otherUserId) => {
  assertValidId(otherUserId);
  const friendship = await Friendship.findOneAndDelete({
    pairKey: directKeyOf(userId, otherUserId),
    status: FRIEND_STATUS.ACCEPTED,
  });
  if (!friendship) throw new AppError(404, "You are not friends with this user");

  notify(SOCKET_EVENTS.FRIEND_REQUEST_UPDATED, [otherUserId], {
    ...friendship.toObject(),
    status: "removed",
  });
};

/** True when the two users have an accepted friendship. */
const areFriends = async (userId, otherUserId) =>
  Boolean(
    await Friendship.exists({
      pairKey: directKeyOf(userId, otherUserId),
      status: FRIEND_STATUS.ACCEPTED,
    })
  );

/** Throws 403 unless every user in `otherUserIds` is a friend of `userId`. */
const assertAllFriends = async (userId, otherUserIds) => {
  const keys = otherUserIds.map((id) => directKeyOf(userId, id));
  const friends = await Friendship.countDocuments({
    pairKey: { $in: keys },
    status: FRIEND_STATUS.ACCEPTED,
  });
  if (friends !== keys.length) {
    throw new AppError(403, "You can only message your friends. Send a friend request first.");
  }
};

module.exports = {
  areFriends,
  assertAllFriends,
  listPeople,
  sendRequest,
  respondToRequest,
  cancelRequest,
  listRequests,
  listFriends,
  removeFriend,
};
