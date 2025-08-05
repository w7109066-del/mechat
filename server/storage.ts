import {
  users,
  messages,
  chatRooms,
  friendships,
  roomMembers,
  posts,
  postLikes,
  postComments,
  postShares,
  type User,
  type UpsertUser,
  type Message,
  type InsertMessage,
  type ChatRoom,
  type InsertChatRoom,
  type Friendship,
  type InsertFriendship,
  type RoomMember,
  type Post,
  type InsertPost,
  type PostLike,
  type InsertPostLike,
  type PostComment,
  type InsertPostComment,
  type PostShare,
  type InsertPostShare,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, sql } from "drizzle-orm";
import crypto from "crypto";

// Interface for storage operations
export interface IStorage {
  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserStatus(userId: string, isOnline: boolean, status?: string): Promise<User>;

  // Friend operations
  getFriends(userId: string): Promise<User[]>;
  addFriend(userId: string, friendId: string): Promise<Friendship>;
  getFriendRequests(userId: string): Promise<Friendship[]>;
  acceptFriendRequest(friendshipId: string): Promise<Friendship>;

  // Message operations
  getDirectMessages(userId: string, friendId: string): Promise<Message[]>;
  getRoomMessages(roomId: string): Promise<Message[]>;
  sendMessage(message: InsertMessage): Promise<Message>;

  // Room operations
  getChatRooms(): Promise<ChatRoom[]>;
  getUserRooms(userId: string): Promise<ChatRoom[]>;
  createChatRoom(room: InsertChatRoom): Promise<ChatRoom>;
  joinRoom(userId: string, roomId: string): Promise<RoomMember>;
  getRoomMembers(roomId: string): Promise<User[]>;

  // Post operations
  getPosts(): Promise<(Post & { user: User; likesCount: number; commentsCount: number; sharesCount: number; isLiked: boolean })[]>;
  getPostsByUser(userId: string): Promise<Post[]>;
  createPost(post: InsertPost): Promise<Post>;
  likePost(userId: string, postId: string): Promise<PostLike>;
  unlikePost(userId: string, postId: string): Promise<void>;
  getPostComments(postId: string): Promise<(PostComment & { user: User })[]>;
  addComment(comment: InsertPostComment): Promise<PostComment>;
  sharePost(userId: string, postId: string): Promise<PostShare>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: [users.id, users.email],
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserStatus(userId: string, isOnline: boolean, status?: string): Promise<User> {
    const updateData: any = { isOnline, updatedAt: new Date() };
    if (status !== undefined) {
      updateData.status = status;
    }

    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Friend operations
  async getFriends(userId: string): Promise<User[]> {
    const friends = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        username: users.username,
        country: users.country,
        gender: users.gender,
        level: users.level,
        isOnline: users.isOnline,
        status: users.status,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(friendships)
      .innerJoin(users, eq(users.id, friendships.friendId))
      .where(and(
        eq(friendships.userId, userId),
        eq(friendships.status, "accepted")
      ));

    return friends;
  }

  async addFriend(userId: string, friendId: string): Promise<Friendship> {
    const [friendship] = await db
      .insert(friendships)
      .values({
        userId,
        friendId,
        status: "pending",
      })
      .returning();
    return friendship;
  }

  async getFriendRequests(userId: string): Promise<Friendship[]> {
    return await db
      .select()
      .from(friendships)
      .where(and(
        eq(friendships.friendId, userId),
        eq(friendships.status, "pending")
      ));
  }

  async acceptFriendRequest(friendshipId: string): Promise<Friendship> {
    const [friendship] = await db
      .update(friendships)
      .set({ status: "accepted" })
      .where(eq(friendships.id, friendshipId))
      .returning();
    return friendship;
  }

  // Message operations
  async getDirectMessages(userId: string, friendId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(
        and(
          or(
            and(eq(messages.senderId, userId), eq(messages.recipientId, friendId)),
            and(eq(messages.senderId, friendId), eq(messages.recipientId, userId))
          ),
          sql`${messages.roomId} IS NULL`
        )
      )
      .orderBy(messages.createdAt);
  }

  async getRoomMessages(roomId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.roomId, roomId))
      .orderBy(messages.createdAt);
  }

  async sendMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values(message)
      .returning();
    return newMessage;
  }

  // Room operations
  async getChatRooms(): Promise<ChatRoom[]> {
    return await db
      .select()
      .from(chatRooms)
      .where(eq(chatRooms.isPrivate, false))
      .orderBy(desc(chatRooms.createdAt));
  }

  async getUserRooms(userId: string): Promise<ChatRoom[]> {
    return await db
      .select({
        id: chatRooms.id,
        name: chatRooms.name,
        description: chatRooms.description,
        category: chatRooms.category,
        isPrivate: chatRooms.isPrivate,
        createdBy: chatRooms.createdBy,
        createdAt: chatRooms.createdAt,
      })
      .from(roomMembers)
      .innerJoin(chatRooms, eq(chatRooms.id, roomMembers.roomId))
      .where(eq(roomMembers.userId, userId));
  }

  async createChatRoom(room: InsertChatRoom): Promise<ChatRoom> {
    const [newRoom] = await db
      .insert(chatRooms)
      .values(room)
      .returning();

    // Add creator as member
    await db.insert(roomMembers).values({
      roomId: newRoom.id,
      userId: room.createdBy,
    });

    return newRoom;
  }

  async joinRoom(userId: string, roomId: string): Promise<RoomMember> {
    const [member] = await db
      .insert(roomMembers)
      .values({
        roomId,
        userId,
      })
      .returning();
    return member;
  }

  async getRoomMembers(roomId: string): Promise<User[]> {
    return await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        username: users.username,
        country: users.country,
        gender: users.gender,
        level: users.level,
        isOnline: users.isOnline,
        status: users.status,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(roomMembers)
      .innerJoin(users, eq(users.id, roomMembers.userId))
      .where(eq(roomMembers.roomId, roomId));
  }

  // Post operations
  async getPosts(): Promise<(Post & { user: User; likesCount: number; commentsCount: number; sharesCount: number; isLiked: boolean })[]> {
    const result = await db
      .select({
        id: posts.id,
        userId: posts.userId,
        content: posts.content,
        mediaUrl: posts.mediaUrl,
        mediaType: posts.mediaType,
        videoDuration: posts.videoDuration,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          username: users.username,
          isOnline: users.isOnline,
          status: users.status,
          level: users.level,
          country: users.country,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
        likesCount: sql<number>`CAST(COUNT(DISTINCT ${postLikes.id}) AS INTEGER)`,
        commentsCount: sql<number>`CAST(COUNT(DISTINCT ${postComments.id}) AS INTEGER)`,
        sharesCount: sql<number>`CAST(COUNT(DISTINCT ${postShares.id}) AS INTEGER)`,
        isLiked: sql<boolean>`FALSE`,
      })
      .from(posts)
      .innerJoin(users, eq(users.id, posts.userId))
      .leftJoin(postLikes, eq(postLikes.postId, posts.id))
      .leftJoin(postComments, eq(postComments.postId, posts.id))
      .leftJoin(postShares, eq(postShares.postId, posts.id))
      .groupBy(posts.id, users.id)
      .orderBy(desc(posts.createdAt));

    return result as any;
  }

  async getPostsByUser(userId: string): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .where(eq(posts.userId, userId))
      .orderBy(desc(posts.createdAt));
  }

  async createPost(postData: InsertPost): Promise<Post> {
    const [post] = await db
      .insert(posts)
      .values(postData)
      .returning();
    return post;
  }

  async likePost(userId: string, postId: string): Promise<PostLike> {
    const [like] = await db
      .insert(postLikes)
      .values({ userId, postId })
      .returning();
    return like;
  }

  async unlikePost(userId: string, postId: string): Promise<void> {
    await db
      .delete(postLikes)
      .where(and(eq(postLikes.userId, userId), eq(postLikes.postId, postId)));
  }

  async getPostComments(postId: string): Promise<(PostComment & { user: User })[]> {
    const result = await db
      .select({
        id: postComments.id,
        postId: postComments.postId,
        userId: postComments.userId,
        content: postComments.content,
        createdAt: postComments.createdAt,
        updatedAt: postComments.updatedAt,
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          username: users.username,
          isOnline: users.isOnline,
          status: users.status,
          level: users.level,
          country: users.country,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
      })
      .from(postComments)
      .innerJoin(users, eq(users.id, postComments.userId))
      .where(eq(postComments.postId, postId))
      .orderBy(postComments.createdAt);

    return result as any;
  }

  async addComment(commentData: InsertPostComment): Promise<PostComment> {
    const [comment] = await db
      .insert(postComments)
      .values(commentData)
      .returning();
    return comment;
  }

  async sharePost(userId: string, postId: string): Promise<PostShare> {
    const [share] = await db
      .insert(postShares)
      .values({ userId, postId })
      .returning();
    return share;
  }
}

// Create storage instance
const dbStorage = new DatabaseStorage();

export const storage = {
  async createUser(userData: Omit<any, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const [user] = await db.insert(users).values({
      id: crypto.randomUUID(), // Generate UUID for the user ID
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      profileImageUrl: userData.profileImageUrl,
      username: userData.username,
      country: userData.country,
      gender: userData.gender,
      level: userData.level || 1,
      isOnline: userData.isOnline || true,
      status: userData.status,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    return user;
  },

  // Delegate to DatabaseStorage methods
  getUser: (id: string) => dbStorage.getUser(id),
  upsertUser: (user: UpsertUser) => dbStorage.upsertUser(user),
  updateUserStatus: (userId: string, isOnline: boolean, status?: string) => dbStorage.updateUserStatus(userId, isOnline, status),
  getFriends: (userId: string) => dbStorage.getFriends(userId),
  addFriend: (userId: string, friendId: string) => dbStorage.addFriend(userId, friendId),
  getFriendRequests: (userId: string) => dbStorage.getFriendRequests(userId),
  acceptFriendRequest: (friendshipId: string) => dbStorage.acceptFriendRequest(friendshipId),
  getDirectMessages: (userId: string, friendId: string) => dbStorage.getDirectMessages(userId, friendId),
  getRoomMessages: (roomId: string) => dbStorage.getRoomMessages(roomId),
  sendMessage: (message: InsertMessage) => dbStorage.sendMessage(message),
  getChatRooms: () => dbStorage.getChatRooms(),
  getUserRooms: (userId: string) => dbStorage.getUserRooms(userId),
  createChatRoom: (room: InsertChatRoom) => dbStorage.createChatRoom(room),
  joinRoom: (userId: string, roomId: string) => dbStorage.joinRoom(userId, roomId),
  getRoomMembers: (roomId: string) => dbStorage.getRoomMembers(roomId),
  getPosts: () => dbStorage.getPosts(),
  getPostsByUser: (userId: string) => dbStorage.getPostsByUser(userId),
  createPost: (post: InsertPost) => dbStorage.createPost(post),
  likePost: (userId: string, postId: string) => dbStorage.likePost(userId, postId),
  unlikePost: (userId: string, postId: string) => dbStorage.unlikePost(userId, postId),
  getPostComments: (postId: string) => dbStorage.getPostComments(postId),
  addComment: (comment: InsertPostComment) => dbStorage.addComment(comment),
  sharePost: (userId: string, postId: string) => dbStorage.sharePost(userId, postId),
};

