import { Test, TestingModule } from '@nestjs/testing';
import { MatchmakingService } from './matchmaking.service';
import { PrismaService } from '../prisma/prisma.service';

describe('MatchmakingService', () => {
  let service: MatchmakingService;

  beforeEach(async () => {
    const prismaMock = {};

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchmakingService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<MatchmakingService>(MatchmakingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Queue and Matchmaking', () => {
    it('should join queue and return searching if no peer', () => {
      const res = service.joinQueue(1, 'User 1', 'u1@test.com', 101);
      expect(res.status).toBe('searching');
      expect(res.match).toBeNull();
    });

    it('should pair two users of same gameId in queue', () => {
      service.joinQueue(1, 'User 1', 'u1@test.com', 101);
      const res = service.joinQueue(2, 'User 2', 'u2@test.com', 101);

      expect(res.status).toBe('matched');
      expect(res.match).toBeDefined();
      expect(res.match?.players).toHaveLength(2);
      expect(res.match?.players.map(p => p.id)).toContain(1);
      expect(res.match?.players.map(p => p.id)).toContain(2);
    });

    it('should not pair users of different gameId', () => {
      service.joinQueue(1, 'User 1', 'u1@test.com', 101);
      const res = service.joinQueue(2, 'User 2', 'u2@test.com', 102);

      expect(res.status).toBe('searching');
      expect(res.match).toBeNull();
    });

    it('should return matched status if user is already in active match', () => {
      service.joinQueue(1, 'User 1', 'u1@test.com', 101);
      service.joinQueue(2, 'User 2', 'u2@test.com', 101);

      const res = service.joinQueue(1, 'User 1', 'u1@test.com', 101);
      expect(res.status).toBe('matched');
      expect(res.match?.players.map(p => p.id)).toContain(1);
    });

    it('should return status correctly (idle, searching, matched)', () => {
      // Idle
      expect(service.getStatus(1, 101).status).toBe('idle');

      // Searching
      service.joinQueue(1, 'User 1', 'u1@test.com', 101);
      expect(service.getStatus(1, 101).status).toBe('searching');

      // Matched
      service.joinQueue(2, 'User 2', 'u2@test.com', 101);
      expect(service.getStatus(1, 101).status).toBe('matched');
    });

    it('should leave queue successfully', () => {
      service.joinQueue(1, 'User 1', 'u1@test.com', 101);
      expect(service.leaveQueue(1)).toBe(true);
      expect(service.leaveQueue(1)).toBe(false);
    });

    it('should clean old matches', () => {
      service.joinQueue(1, 'User 1', 'u1@test.com', 101);
      const res = service.joinQueue(2, 'User 2', 'u2@test.com', 101);
      const match = res.match;
      expect(match).toBeDefined();

      if (match) {
        // Mock createdAt to be 2 hours ago
        match.createdAt = new Date(Date.now() - 2 * 60 * 60 * 1000);
      }

      service.cleanOldMatches();
      expect(service.getStatus(1, 101).status).toBe('idle');
    });

    it('should pair user with bot if allowed and waiting time >= 5s', async () => {
      service.joinQueue(1, 'User 1', 'u1@test.com', 101);

      // Mock joinedAt of waiting user to be 6 seconds ago
      const queue = (service as any).waitingQueue;
      expect(queue).toHaveLength(1);
      queue[0].joinedAt = new Date(Date.now() - 6 * 1000);

      const statusRes = service.getStatus(1, 101, true);
      expect(statusRes.status).toBe('matched');
      expect(statusRes.match?.isBot).toBe(true);
      expect(statusRes.match?.players[0].id).toBe(1);
      expect(statusRes.match?.players[1].id).toBeGreaterThanOrEqual(9901);
    });

    it('should not pair user with bot if waiting time < 5s', () => {
      service.joinQueue(1, 'User 1', 'u1@test.com', 101);
      const statusRes = service.getStatus(1, 101, true);
      expect(statusRes.status).toBe('searching');
    });
  });

  describe('Room Management', () => {
    it('should create room successfully', () => {
      const room = service.createRoom(1, 'Creator', 'c@test.com', 101, false);
      expect(room.roomId).toBeDefined();
      expect(room.creator.id).toBe(1);
      expect(room.isPrivate).toBe(false);
      expect(room.status).toBe('waiting');
    });

    it('should return public rooms and ignore private ones', () => {
      service.createRoom(1, 'C1', 'c1@test.com', 101, false);
      service.createRoom(2, 'C2', 'c2@test.com', 101, true); // Private

      const publicRooms = service.getPublicRooms();
      expect(publicRooms).toHaveLength(1);
      expect(publicRooms[0].creator.id).toBe(1);
    });

    it('should allow joining a waiting room', () => {
      const room = service.createRoom(1, 'Creator', 'c@test.com', 101, false);
      const res = service.joinRoom(2, 'Guest', 'g@test.com', room.roomId);

      expect(res.success).toBe(true);
      expect(res.room?.status).toBe('matched');
      expect(res.room?.guest?.id).toBe(2);
    });

    it('should not allow joining non-existing room', () => {
      const res = service.joinRoom(2, 'Guest', 'g@test.com', '99999');
      expect(res.success).toBe(false);
      expect(res.error).toContain('Không tìm thấy phòng');
    });

    it('should not allow joining already matched room', () => {
      const room = service.createRoom(1, 'Creator', 'c@test.com', 101, false);
      service.joinRoom(2, 'Guest 1', 'g1@test.com', room.roomId);

      const res = service.joinRoom(3, 'Guest 2', 'g2@test.com', room.roomId);
      expect(res.success).toBe(false);
      expect(res.error).toContain('đã bắt đầu hoặc đã đầy');
    });

    it('should not allow joining own room', () => {
      const room = service.createRoom(1, 'Creator', 'c@test.com', 101, false);
      const res = service.joinRoom(1, 'Creator', 'c@test.com', room.roomId);

      expect(res.success).toBe(false);
      expect(res.error).toContain('không thể tham gia phòng do chính mình tạo');
    });

    it('should return room status correctly', () => {
      // Not found
      expect(service.getRoomStatus('99999').status).toBe('not_found');

      // Waiting
      const room = service.createRoom(1, 'Creator', 'c@test.com', 101, false);
      expect(service.getRoomStatus(room.roomId).status).toBe('waiting');

      // Matched
      service.joinRoom(2, 'Guest', 'g@test.com', room.roomId);
      const matchedRes = service.getRoomStatus(room.roomId);
      expect(matchedRes.status).toBe('matched');
      expect(matchedRes.match).toBeDefined();
    });

    it('should handle leaveRoom', () => {
      const room = service.createRoom(1, 'Creator', 'c@test.com', 101, false);

      // Non-creator leaving returns false
      expect(service.leaveRoom(room.roomId, 2)).toBe(false);

      // Creator leaving deletes the room
      expect(service.leaveRoom(room.roomId, 1)).toBe(true);
      expect(service.getRoomStatus(room.roomId).status).toBe('not_found');

      // Leaving non-existing room returns false
      expect(service.leaveRoom('99999', 1)).toBe(false);
    });

    it('should clean old rooms (older than 10 minutes)', () => {
      const room = service.createRoom(1, 'Creator', 'c@test.com', 101, false);

      // Mock room to be 15 minutes old
      const rooms = (service as any).rooms;
      const roomVal = rooms.get(room.roomId);
      roomVal.createdAt = new Date(Date.now() - 15 * 60 * 1000);

      // Triggers cleanOldRooms
      service.getPublicRooms();

      expect(service.getRoomStatus(room.roomId).status).toBe('not_found');
    });
  });
});
