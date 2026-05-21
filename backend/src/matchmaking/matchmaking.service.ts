import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface PlayerInfo {
  id: number;
  name: string;
  email: string;
}

export interface MatchInfo {
  matchId: string;
  players: PlayerInfo[];
  gameId: number;
  seed: number;
  createdAt: Date;
  isBot?: boolean;
}

interface WaitingUser {
  userId: number;
  name: string;
  email: string;
  gameId: number;
  joinedAt: Date;
}

export interface RoomInfo {
  roomId: string;
  creator: PlayerInfo;
  guest?: PlayerInfo;
  isPrivate: boolean;
  gameId: number;
  seed: number;
  status: 'waiting' | 'matched';
  createdAt: Date;
}

@Injectable()
export class MatchmakingService {
  constructor(private prisma: PrismaService) {}

  private waitingQueue: WaitingUser[] = [];
  private activeMatches: Map<string, MatchInfo> = new Map();

  private botOpponents = [
    { id: 9901, name: 'Trần Thị B', email: 'tran.b@bot.com' },
    { id: 9902, name: 'Pro Tracer', email: 'pro.tracer@bot.com' },
    { id: 9903, name: 'AI Sync Hand', email: 'ai.sync@bot.com' },
    { id: 9904, name: 'Hologram Ghost', email: 'hologram.ghost@bot.com' },
    { id: 9905, name: 'Cài Đặt Gamer', email: 'setting.gamer@bot.com' }
  ];

  joinQueue(userId: number, name: string, email: string, gameId: number): { status: string; match: MatchInfo | null } {
    // 1. Check if user is already in an active match
    const existingMatch = this.findActiveMatch(userId);
    if (existingMatch) {
      return { status: 'matched', match: existingMatch };
    }

    // Remove user if already in queue to prevent duplicates
    this.leaveQueue(userId);

    // 2. Try to match with another player in the queue for the same game
    const peerIndex = this.waitingQueue.findIndex(u => u.gameId === gameId && u.userId !== userId);
    if (peerIndex !== -1) {
      const peer = this.waitingQueue.splice(peerIndex, 1)[0];
      const matchId = `match_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const newMatch: MatchInfo = {
        matchId,
        players: [
          { id: peer.userId, name: peer.name, email: peer.email },
          { id: userId, name, email }
        ],
        gameId,
        seed: Math.floor(Math.random() * 1000000),
        createdAt: new Date(),
        isBot: false
      };

      this.activeMatches.set(matchId, newMatch);
      return { status: 'matched', match: newMatch };
    }

    // 3. Add to queue
    const waitingUser: WaitingUser = {
      userId,
      name,
      email,
      gameId,
      joinedAt: new Date()
    };
    this.waitingQueue.push(waitingUser);

    return { status: 'searching', match: null };
  }

  getStatus(userId: number, gameId: number, allowBot: boolean = false): { status: string; match: MatchInfo | null } {
    // Check active matches
    const activeMatch = this.findActiveMatch(userId);
    if (activeMatch) {
      return { status: 'matched', match: activeMatch };
    }

    // Check waiting queue
    const waitingIndex = this.waitingQueue.findIndex(u => u.userId === userId && u.gameId === gameId);
    if (waitingIndex !== -1) {
      const waitingUser = this.waitingQueue[waitingIndex];
      const waitTimeSec = (Date.now() - waitingUser.joinedAt.getTime()) / 1000;

      // If waiting time exceeds 5 seconds and bot is allowed, pair with a bot!
      if (allowBot && waitTimeSec >= 5) {
        this.waitingQueue.splice(waitingIndex, 1);
        const randomBot = this.botOpponents[Math.floor(Math.random() * this.botOpponents.length)];
        const matchId = `match_bot_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

        const botMatch: MatchInfo = {
          matchId,
          players: [
            { id: userId, name: waitingUser.name, email: waitingUser.email },
            { id: randomBot.id, name: randomBot.name, email: randomBot.email }
          ],
          gameId,
          seed: Math.floor(Math.random() * 1000000),
          createdAt: new Date(),
          isBot: true
        };

        this.activeMatches.set(matchId, botMatch);
        return { status: 'matched', match: botMatch };
      }

      return { status: 'searching', match: null };
    }

    return { status: 'idle', match: null };
  }

  leaveQueue(userId: number): boolean {
    const initialLength = this.waitingQueue.length;
    this.waitingQueue = this.waitingQueue.filter(u => u.userId !== userId);
    return this.waitingQueue.length < initialLength;
  }

  private findActiveMatch(userId: number): MatchInfo | null {
    for (const match of this.activeMatches.values()) {
      if (match.players.some(p => p.id === userId)) {
        return match;
      }
    }
    return null;
  }

  cleanOldMatches() {
    const ONE_HOUR = 60 * 60 * 1000;
    const now = Date.now();
    for (const [id, match] of this.activeMatches.entries()) {
      if (now - match.createdAt.getTime() > ONE_HOUR) {
        this.activeMatches.delete(id);
      }
    }
  }

  // Room Management
  private rooms: Map<string, RoomInfo> = new Map();

  createRoom(userId: number, name: string, email: string, gameId: number, isPrivate: boolean): RoomInfo {
    this.cleanOldRooms();
    let roomId = Math.floor(10000 + Math.random() * 90000).toString();
    while (this.rooms.has(roomId)) {
      roomId = Math.floor(10000 + Math.random() * 90000).toString();
    }

    const room: RoomInfo = {
      roomId,
      creator: { id: userId, name, email },
      isPrivate,
      gameId,
      seed: Math.floor(Math.random() * 1000000),
      status: 'waiting',
      createdAt: new Date(),
    };

    this.rooms.set(roomId, room);
    return room;
  }

  getPublicRooms(): RoomInfo[] {
    this.cleanOldRooms();
    return Array.from(this.rooms.values()).filter(
      (r) => !r.isPrivate && r.status === 'waiting'
    );
  }

  joinRoom(userId: number, name: string, email: string, roomId: string): { success: boolean; room?: RoomInfo; error?: string } {
    const room = this.rooms.get(roomId);
    if (!room) {
      return { success: false, error: 'Không tìm thấy phòng hoặc mã phòng không hợp lệ!' };
    }

    if (room.status === 'matched') {
      return { success: false, error: 'Phòng đấu đã bắt đầu hoặc đã đầy!' };
    }

    if (room.creator.id === userId) {
      return { success: false, error: 'Bạn không thể tham gia phòng do chính mình tạo!' };
    }

    room.guest = { id: userId, name, email };
    room.status = 'matched';

    // Register this room match into activeMatches
    const matchId = `room_${roomId}_${Date.now()}`;
    const match: MatchInfo = {
      matchId,
      players: [room.creator, room.guest],
      gameId: room.gameId,
      seed: room.seed,
      createdAt: new Date(),
      isBot: false,
    };
    this.activeMatches.set(matchId, match);

    return { success: true, room };
  }

  getRoomStatus(roomId: string): { status: string; room: RoomInfo | null; match?: MatchInfo } {
    const room = this.rooms.get(roomId);
    if (!room) {
      return { status: 'not_found', room: null };
    }

    if (room.status === 'matched') {
      let foundMatch: MatchInfo | undefined;
      for (const [key, val] of this.activeMatches.entries()) {
        if (key.startsWith(`room_${roomId}_`)) {
          foundMatch = val;
          break;
        }
      }
      return { status: 'matched', room, match: foundMatch };
    }

    return { status: 'waiting', room };
  }

  leaveRoom(roomId: string, userId: number): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;
    if (room.creator.id === userId) {
      this.rooms.delete(roomId);
      return true;
    }
    return false;
  }

  private cleanOldRooms() {
    const TEN_MINUTES = 10 * 60 * 1000;
    const now = Date.now();
    for (const [id, room] of this.rooms.entries()) {
      if (now - room.createdAt.getTime() > TEN_MINUTES) {
        this.rooms.delete(id);
      }
    }
  }
}
