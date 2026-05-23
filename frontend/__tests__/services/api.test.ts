import { api, setToken, getToken, clearToken } from '@/services/api';

describe('API Service', () => {
  beforeEach(() => {
    clearToken();
    jest.restoreAllMocks();
  });

  describe('Token management', () => {
    it('should set, get and clear token', () => {
      expect(getToken()).toBeNull();
      setToken('test-token');
      expect(getToken()).toBe('test-token');
      clearToken();
      expect(getToken()).toBeNull();
    });
  });

  describe('signup', () => {
    it('should signup successfully', async () => {
      const mockResponse = { message: 'Đăng ký thành công', userId: 1 };
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const res = await api.signup('test@example.com', 'password123', 'Test User');
      expect(res).toEqual({ success: true, data: mockResponse });
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/signup'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'test@example.com', password: 'password123', name: 'Test User' }),
        })
      );
    });

    it('should handle signup error response', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: jest.fn().mockResolvedValue({ message: 'Email đã tồn tại' }),
      });

      const res = await api.signup('test@example.com', 'password123', 'Test User');
      expect(res).toEqual({ success: false, error: 'Email đã tồn tại' });
    });

    it('should handle signup network error', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network Error'));

      const res = await api.signup('test@example.com', 'password123', 'Test User');
      expect(res).toEqual({ success: false, error: 'Network Error' });
    });
  });

  describe('login', () => {
    it('should login successfully and set token', async () => {
      const mockResponse = { access_token: 'valid-token', user: { id: 1, email: 'test@example.com', name: 'Test' } };
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const res = await api.login('test@example.com', 'password123');
      expect(res).toEqual({ success: true, token: 'valid-token', user: mockResponse.user });
      expect(getToken()).toBe('valid-token');
    });

    it('should handle login error response', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: jest.fn().mockResolvedValue({ message: 'Sai mật khẩu' }),
      });

      const res = await api.login('test@example.com', 'password123');
      expect(res).toEqual({ success: false, error: 'Sai mật khẩu' });
      expect(getToken()).toBeNull();
    });

    it('should handle login invalid response format', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      });

      const res = await api.login('test@example.com', 'password123');
      expect(res).toEqual({ success: false, error: 'Phản hồi từ máy chủ không hợp lệ' });
    });

    it('should handle login network error', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network Error'));

      const res = await api.login('test@example.com', 'password123');
      expect(res).toEqual({ success: false, error: 'Network Error' });
    });
  });

  describe('googleLogin', () => {
    it('should login with Google successfully and set token', async () => {
      const mockResponse = { access_token: 'google-token', user: { id: 1, email: 'google@example.com', name: 'Google User' } };
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const res = await api.googleLogin('google-id-token');
      expect(res).toEqual({ success: true, token: 'google-token', user: mockResponse.user });
      expect(getToken()).toBe('google-token');
    });

    it('should handle google login error response', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: jest.fn().mockResolvedValue({ message: 'Token không hợp lệ' }),
      });

      const res = await api.googleLogin('invalid-token');
      expect(res).toEqual({ success: false, error: 'Token không hợp lệ' });
    });

    it('should handle google login invalid response format', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      });

      const res = await api.googleLogin('google-id-token');
      expect(res).toEqual({ success: false, error: 'Phản hồi từ máy chủ không hợp lệ' });
    });

    it('should handle google login network error', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Connection timeout'));

      const res = await api.googleLogin('token');
      expect(res).toEqual({ success: false, error: 'Connection timeout' });
    });
  });

  describe('getLeaderboard', () => {
    it('should fetch leaderboard successfully', async () => {
      const mockData = [{ id: 1, value: 100, accuracy: 0.9, timeSpent: 30, userId: 1, gameId: 1, createdAt: '' }];
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockData),
      });

      const res = await api.getLeaderboard(1);
      expect(res).toEqual({ success: true, data: mockData });
    });

    it('should handle fetch leaderboard error', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: jest.fn().mockResolvedValue({ message: 'Error fetching' }),
      });

      const res = await api.getLeaderboard(1);
      expect(res).toEqual({ success: false, error: 'Error fetching' });
    });

    it('should handle fetch leaderboard network error', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
      const res = await api.getLeaderboard(1);
      expect(res).toEqual({ success: false, error: 'Network error' });
    });
  });

  describe('postScore', () => {
    it('should fail if user is not logged in', async () => {
      const res = await api.postScore(100, 0.9, 30, 1);
      expect(res).toEqual({ success: false, error: 'Bạn cần đăng nhập để lưu điểm số' });
    });

    it('should post score successfully when logged in', async () => {
      setToken('valid-token');
      const mockResponse = { id: 1, value: 100, accuracy: 0.9, timeSpent: 30, userId: 1, gameId: 1, createdAt: '' };
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const res = await api.postScore(100, 0.9, 30, 1);
      expect(res).toEqual({ success: true, data: mockResponse });
    });

    it('should handle post score failure', async () => {
      setToken('valid-token');
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: jest.fn().mockResolvedValue({ message: 'Failed to post score' }),
      });

      const res = await api.postScore(100, 0.9, 30, 1);
      expect(res).toEqual({ success: false, error: 'Failed to post score' });
    });

    it('should handle post score network error', async () => {
      setToken('valid-token');
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
      const res = await api.postScore(100, 0.9, 30, 1);
      expect(res).toEqual({ success: false, error: 'Network error' });
    });
  });

  describe('getMyHighScores', () => {
    it('should fail if not logged in', async () => {
      const res = await api.getMyHighScores();
      expect(res).toEqual({ success: false, error: 'Chưa đăng nhập' });
    });

    it('should fetch personal high scores when logged in', async () => {
      setToken('valid-token');
      const mockData = [{ id: 1, value: 150 }];
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockData),
      });

      const res = await api.getMyHighScores();
      expect(res).toEqual({ success: true, data: mockData });
    });

    it('should handle getMyHighScores failure response', async () => {
      setToken('valid-token');
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: jest.fn().mockResolvedValue({ message: 'Error retrieving scores' }),
      });
      const res = await api.getMyHighScores();
      expect(res).toEqual({ success: false, error: 'Error retrieving scores' });
    });

    it('should handle getMyHighScores network error', async () => {
      setToken('valid-token');
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
      const res = await api.getMyHighScores();
      expect(res).toEqual({ success: false, error: 'Network error' });
    });
  });

  describe('Matchmaking APIs', () => {
    it('joinMatchmaking should fail if not logged in', async () => {
      const res = await api.joinMatchmaking(1);
      expect(res).toEqual({ success: false, error: 'Bạn cần đăng nhập để chơi chế độ đối kháng' });
    });

    it('joinMatchmaking should join queue successfully', async () => {
      setToken('valid-token');
      const mockRes = { status: 'searching', match: null };
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockRes),
      });

      const res = await api.joinMatchmaking(1);
      expect(res).toEqual({ success: true, status: 'searching', match: null });
    });

    it('joinMatchmaking should handle failure response', async () => {
      setToken('valid-token');
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: jest.fn().mockResolvedValue({ message: 'Matchmaking failed' }),
      });
      const res = await api.joinMatchmaking(1);
      expect(res).toEqual({ success: false, error: 'Matchmaking failed' });
    });

    it('joinMatchmaking should handle network error', async () => {
      setToken('valid-token');
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
      const res = await api.joinMatchmaking(1);
      expect(res).toEqual({ success: false, error: 'Network error' });
    });

    it('getMatchmakingStatus should fail if not logged in', async () => {
      const res = await api.getMatchmakingStatus(1, true);
      expect(res).toEqual({ success: false, error: 'Chưa đăng nhập' });
    });

    it('getMatchmakingStatus should check status when logged in', async () => {
      setToken('valid-token');
      const mockRes = { status: 'matched', match: { roomId: 'room123' } };
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockRes),
      });

      const res = await api.getMatchmakingStatus(1, true);
      expect(res).toEqual({ success: true, status: 'matched', match: mockRes.match });
    });

    it('getMatchmakingStatus should handle failure response', async () => {
      setToken('valid-token');
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: jest.fn().mockResolvedValue({ message: 'Status check failed' }),
      });
      const res = await api.getMatchmakingStatus(1, true);
      expect(res).toEqual({ success: false, error: 'Status check failed' });
    });

    it('getMatchmakingStatus should handle network error', async () => {
      setToken('valid-token');
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
      const res = await api.getMatchmakingStatus(1, true);
      expect(res).toEqual({ success: false, error: 'Network error' });
    });

    it('leaveMatchmaking should fail if not logged in', async () => {
      const res = await api.leaveMatchmaking();
      expect(res).toEqual({ success: false, error: 'Chưa đăng nhập' });
    });

    it('leaveMatchmaking should leave queue when logged in', async () => {
      setToken('valid-token');
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true }),
      });

      const res = await api.leaveMatchmaking();
      expect(res).toEqual({ success: true });
    });

    it('leaveMatchmaking should handle failure response', async () => {
      setToken('valid-token');
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: jest.fn().mockResolvedValue({}),
      });
      const res = await api.leaveMatchmaking();
      expect(res).toEqual({ success: false, error: 'Lỗi hủy tìm trận' });
    });

    it('leaveMatchmaking should handle network error', async () => {
      setToken('valid-token');
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
      const res = await api.leaveMatchmaking();
      expect(res).toEqual({ success: false, error: 'Network error' });
    });
  });

  describe('Room matchmaking APIs', () => {
    it('createRoom should fail if not logged in', async () => {
      const res = await api.createRoom(1, false);
      expect(res).toEqual({ success: false, error: 'Bạn cần đăng nhập để tạo phòng' });
    });

    it('createRoom should create room when logged in', async () => {
      setToken('valid-token');
      const mockRoom = { roomId: 'room-1' };
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockRoom),
      });

      const res = await api.createRoom(1, false);
      expect(res).toEqual({ success: true, room: mockRoom });
    });

    it('createRoom should handle failure response', async () => {
      setToken('valid-token');
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: jest.fn().mockResolvedValue({ message: 'Failed to create' }),
      });
      const res = await api.createRoom(1, false);
      expect(res).toEqual({ success: false, error: 'Failed to create' });
    });

    it('createRoom should handle network error', async () => {
      setToken('valid-token');
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
      const res = await api.createRoom(1, false);
      expect(res).toEqual({ success: false, error: 'Network error' });
    });

    it('getPublicRooms should fail if not logged in', async () => {
      const res = await api.getPublicRooms();
      expect(res).toEqual({ success: false, error: 'Bạn cần đăng nhập để xem danh sách phòng' });
    });

    it('getPublicRooms should return public rooms when logged in', async () => {
      setToken('valid-token');
      const mockRooms = [{ roomId: 'room-1' }];
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockRooms),
      });

      const res = await api.getPublicRooms();
      expect(res).toEqual({ success: true, rooms: mockRooms });
    });

    it('getPublicRooms should handle failure response', async () => {
      setToken('valid-token');
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: jest.fn().mockResolvedValue({ message: 'Failed to fetch rooms' }),
      });
      const res = await api.getPublicRooms();
      expect(res).toEqual({ success: false, error: 'Failed to fetch rooms' });
    });

    it('getPublicRooms should handle network error', async () => {
      setToken('valid-token');
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
      const res = await api.getPublicRooms();
      expect(res).toEqual({ success: false, error: 'Network error' });
    });

    it('joinRoomByCode should fail if not logged in', async () => {
      const res = await api.joinRoomByCode('room-1');
      expect(res).toEqual({ success: false, error: 'Bạn cần đăng nhập để tham gia phòng' });
    });

    it('joinRoomByCode should join a room when logged in', async () => {
      setToken('valid-token');
      const mockRoom = { roomId: 'room-1' };
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ room: mockRoom }),
      });

      const res = await api.joinRoomByCode('room-1');
      expect(res).toEqual({ success: true, room: mockRoom });
    });

    it('joinRoomByCode should handle failure response', async () => {
      setToken('valid-token');
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: jest.fn().mockResolvedValue({ message: 'Failed to join' }),
      });
      const res = await api.joinRoomByCode('room-1');
      expect(res).toEqual({ success: false, error: 'Failed to join' });
    });

    it('joinRoomByCode should handle network error', async () => {
      setToken('valid-token');
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
      const res = await api.joinRoomByCode('room-1');
      expect(res).toEqual({ success: false, error: 'Network error' });
    });

    it('checkRoomStatus should fail if not logged in', async () => {
      const res = await api.checkRoomStatus('room-1');
      expect(res).toEqual({ success: false, error: 'Chưa đăng nhập' });
    });

    it('checkRoomStatus should return room status when logged in', async () => {
      setToken('valid-token');
      const mockRes = { status: 'matched', room: { id: 'r1' }, match: {} };
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockRes),
      });

      const res = await api.checkRoomStatus('room-1');
      expect(res).toEqual({ success: true, status: 'matched', room: mockRes.room, match: mockRes.match });
    });

    it('checkRoomStatus should handle failure response', async () => {
      setToken('valid-token');
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: jest.fn().mockResolvedValue({ message: 'Failed status' }),
      });
      const res = await api.checkRoomStatus('room-1');
      expect(res).toEqual({ success: false, error: 'Failed status' });
    });

    it('checkRoomStatus should handle network error', async () => {
      setToken('valid-token');
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
      const res = await api.checkRoomStatus('room-1');
      expect(res).toEqual({ success: false, error: 'Network error' });
    });

    it('leaveRoom should fail if not logged in', async () => {
      const res = await api.leaveRoom('room-1');
      expect(res).toEqual({ success: false, error: 'Chưa đăng nhập' });
    });

    it('leaveRoom should exit room when logged in', async () => {
      setToken('valid-token');
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      });

      const res = await api.leaveRoom('room-1');
      expect(res).toEqual({ success: true });
    });

    it('leaveRoom should handle failure response', async () => {
      setToken('valid-token');
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: jest.fn().mockResolvedValue({ message: 'Failed to leave' }),
      });
      const res = await api.leaveRoom('room-1');
      expect(res).toEqual({ success: false, error: 'Failed to leave' });
    });

    it('leaveRoom should handle network error', async () => {
      setToken('valid-token');
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
      const res = await api.leaveRoom('room-1');
      expect(res).toEqual({ success: false, error: 'Network error' });
    });
  });
});
