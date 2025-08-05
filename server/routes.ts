import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

import { insertMessageSchema, insertChatRoomSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {

  // Authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.user || !req.user.claims || !req.user.claims.sub) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // Auth routes
  app.get('/api/login', (req, res) => {
    // Redirect to home page
    res.redirect('/');
  });

  app.post('/api/signup', async (req, res) => {
    try {
      const { username, email, firstName, lastName } = req.body;
      
      if (!username || !email) {
        return res.status(400).json({ message: "Username and email are required" });
      }

      // Create user in database
      const user = await storage.createUser({
        username,
        email,
        firstName,
        lastName,
        profileImageUrl: null,
        level: 1,
        isOnline: true,
        status: null
      });

      res.json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // For demo purposes, create a default user
      const defaultUser = {
        id: 'demo-user',
        username: 'DemoUser',
        email: 'demo@example.com',
        firstName: 'Demo',
        lastName: 'User',
        profileImageUrl: null,
        level: 1,
        isOnline: true,
        status: null,
        country: null,
        gender: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      let user = await storage.getUser('demo-user');
      
      // If user doesn't exist, create them
      if (!user) {
        user = await storage.createUser(defaultUser);
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User routes
  app.put('/api/user/status', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { isOnline, status } = req.body;
      
      const user = await storage.updateUserStatus(userId, isOnline, status);
      res.json(user);
    } catch (error) {
      console.error("Error updating user status:", error);
      res.status(500).json({ message: "Failed to update user status" });
    }
  });

  // Friend routes
  app.get('/api/friends', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const friends = await storage.getFriends(userId);
      res.json(friends);
    } catch (error) {
      console.error("Error fetching friends:", error);
      res.status(500).json({ message: "Failed to fetch friends" });
    }
  });

  app.post('/api/friends/:friendId', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { friendId } = req.params;
      
      const friendship = await storage.addFriend(userId, friendId);
      res.json(friendship);
    } catch (error) {
      console.error("Error adding friend:", error);
      res.status(500).json({ message: "Failed to add friend" });
    }
  });

  app.get('/api/friend-requests', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const requests = await storage.getFriendRequests(userId);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching friend requests:", error);
      res.status(500).json({ message: "Failed to fetch friend requests" });
    }
  });

  app.put('/api/friend-requests/:requestId/accept', requireAuth, async (req: any, res) => {
    try {
      const { requestId } = req.params;
      const friendship = await storage.acceptFriendRequest(requestId);
      res.json(friendship);
    } catch (error) {
      console.error("Error accepting friend request:", error);
      res.status(500).json({ message: "Failed to accept friend request" });
    }
  });

  // Message routes
  app.get('/api/messages/direct/:friendId', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { friendId } = req.params;
      
      const messages = await storage.getDirectMessages(userId, friendId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching direct messages:", error);
      res.status(500).json({ message: "Failed to fetch direct messages" });
    }
  });

  app.get('/api/messages/room/:roomId', async (req: any, res) => {
    try {
      const { roomId } = req.params;
      const messages = await storage.getRoomMessages(roomId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching room messages:", error);
      res.status(500).json({ message: "Failed to fetch room messages" });
    }
  });

  app.post('/api/messages', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const messageData = { ...req.body, senderId: userId };
      
      const result = insertMessageSchema.safeParse(messageData);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid message data",
          error: fromZodError(result.error).toString()
        });
      }
      
      const message = await storage.sendMessage(result.data);
      res.json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Chat room routes
  app.get('/api/rooms', async (req: any, res) => {
    try {
      const rooms = await storage.getChatRooms();
      res.json(rooms);
    } catch (error) {
      console.error("Error fetching chat rooms:", error);
      res.status(500).json({ message: "Failed to fetch chat rooms" });
    }
  });

  app.get('/api/rooms/user', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const rooms = await storage.getUserRooms(userId);
      res.json(rooms);
    } catch (error) {
      console.error("Error fetching user rooms:", error);
      res.status(500).json({ message: "Failed to fetch user rooms" });
    }
  });

  app.post('/api/rooms', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const roomData = { 
        ...req.body, 
        createdBy: userId,
        category: req.body.category || "OFFICIAL ROOM"
      };
      
      const result = insertChatRoomSchema.safeParse(roomData);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid room data",
          error: fromZodError(result.error).toString()
        });
      }
      
      const room = await storage.createChatRoom(result.data);
      res.json(room);
    } catch (error) {
      console.error("Error creating chat room:", error);
      res.status(500).json({ message: "Failed to create chat room" });
    }
  });

  app.post('/api/rooms/:roomId/join', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { roomId } = req.params;
      
      const member = await storage.joinRoom(userId, roomId);
      res.json(member);
    } catch (error) {
      console.error("Error joining room:", error);
      res.status(500).json({ message: "Failed to join room" });
    }
  });

  app.get('/api/rooms/:roomId/members', async (req: any, res) => {
    try {
      const { roomId } = req.params;
      const members = await storage.getRoomMembers(roomId);
      res.json(members);
    } catch (error) {
      console.error("Error fetching room members:", error);
      res.status(500).json({ message: "Failed to fetch room members" });
    }
  });

  // Post routes
  app.get("/api/posts", async (req, res) => {
    try {
      const posts = await storage.getPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  app.post("/api/posts", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { content, mediaUrl, mediaType, videoDuration } = req.body;
      
      // Validate video duration
      if (mediaType === 'video' && videoDuration > 16) {
        return res.status(400).json({ message: "Video duration cannot exceed 16 seconds" });
      }
      
      const post = await storage.createPost({
        userId,
        content,
        mediaUrl,
        mediaType,
        videoDuration,
      });
      res.json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  app.post("/api/posts/:postId/like", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { postId } = req.params;
      const like = await storage.likePost(userId, postId);
      res.json(like);
    } catch (error) {
      console.error("Error liking post:", error);
      res.status(500).json({ message: "Failed to like post" });
    }
  });

  app.delete("/api/posts/:postId/like", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { postId } = req.params;
      await storage.unlikePost(userId, postId);
      res.json({ message: "Post unliked" });
    } catch (error) {
      console.error("Error unliking post:", error);
      res.status(500).json({ message: "Failed to unlike post" });
    }
  });

  app.get("/api/posts/:postId/comments", async (req, res) => {
    try {
      const { postId } = req.params;
      const comments = await storage.getPostComments(postId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post("/api/posts/:postId/comments", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { postId } = req.params;
      const { content } = req.body;
      const comment = await storage.addComment({
        postId,
        userId,
        content,
      });
      res.json(comment);
    } catch (error) {
      console.error("Error adding comment:", error);
      res.status(500).json({ message: "Failed to add comment" });
    }
  });

  app.post("/api/posts/:postId/share", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { postId } = req.params;
      const share = await storage.sharePost(userId, postId);
      res.json(share);
    } catch (error) {
      console.error("Error sharing post:", error);
      res.status(500).json({ message: "Failed to share post" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
