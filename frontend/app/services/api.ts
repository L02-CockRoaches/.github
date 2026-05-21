const BASE_URL = 'http://localhost:3001/v1';

let authToken: string | null = null;

export const setToken = (token: string | null) => {
  authToken = token;
};

export const getToken = () => {
  return authToken;
};

export const clearToken = () => {
  authToken = null;
};

export interface UserProfile {
  id: number;
  email: string;
  name: string;
}

export interface ScoreRecord {
  id: number;
  value: number;
  accuracy: number;
  timeSpent: number;
  userId: number;
  gameId: number;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  };
}

export const api = {
  async signup(email: string, password: string, name: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await fetch(`${BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });
      const result = await response.json();
      if (!response.ok) {
        return { success: false, error: result.message || 'Đăng ký không thành công' };
      }
      return { success: true, data: result };
    } catch (err: any) {
      return { success: false, error: err.message || 'Lỗi mạng, vui lòng thử lại' };
    }
  },

  async login(email: string, password: string): Promise<{ success: boolean; token?: string; user?: UserProfile; error?: string }> {
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();
      if (!response.ok) {
        return { success: false, error: result.message || 'Đăng nhập không thành công' };
      }
      if (result.access_token) {
        setToken(result.access_token);
        return { success: true, token: result.access_token, user: result.user };
      }
      return { success: false, error: 'Phản hồi từ máy chủ không hợp lệ' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Lỗi mạng, vui lòng thử lại' };
    }
  },

  async getLeaderboard(gameId: number): Promise<{ success: boolean; data?: ScoreRecord[]; error?: string }> {
    try {
      const response = await fetch(`${BASE_URL}/scores/leaderboard?gameId=${gameId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const result = await response.json();
      if (!response.ok) {
        return { success: false, error: result.message || 'Không thể lấy bảng xếp hạng' };
      }
      return { success: true, data: result };
    } catch (err: any) {
      return { success: false, error: err.message || 'Lỗi mạng' };
    }
  },

  async postScore(value: number, accuracy: number, timeSpent: number, gameId: number): Promise<{ success: boolean; data?: ScoreRecord; error?: string }> {
    try {
      if (!authToken) {
        return { success: false, error: 'Bạn cần đăng nhập để lưu điểm số' };
      }
      const response = await fetch(`${BASE_URL}/scores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ value, accuracy, timeSpent, gameId }),
      });
      const result = await response.json();
      if (!response.ok) {
        return { success: false, error: result.message || 'Không thể gửi điểm số' };
      }
      return { success: true, data: result };
    } catch (err: any) {
      return { success: false, error: err.message || 'Lỗi mạng' };
    }
  },

  async getMyHighScores(): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      if (!authToken) {
        return { success: false, error: 'Chưa đăng nhập' };
      }
      const response = await fetch(`${BASE_URL}/scores/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });
      const result = await response.json();
      if (!response.ok) {
        return { success: false, error: result.message || 'Không thể lấy điểm cao cá nhân' };
      }
      return { success: true, data: result };
    } catch (err: any) {
      return { success: false, error: err.message || 'Lỗi mạng' };
    }
  },

  async joinMatchmaking(gameId: number): Promise<{ success: boolean; status?: string; match?: any; error?: string }> {
    try {
      if (!authToken) {
        return { success: false, error: 'Bạn cần đăng nhập để chơi chế độ đối kháng' };
      }
      const response = await fetch(`${BASE_URL}/matchmaking/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ gameId }),
      });
      const result = await response.json();
      if (!response.ok) {
        return { success: false, error: result.message || 'Không thể tham gia hàng chờ' };
      }
      return { success: true, status: result.status, match: result.match };
    } catch (err: any) {
      return { success: false, error: err.message || 'Lỗi kết nối máy chủ' };
    }
  },

  async getMatchmakingStatus(gameId: number, allowBot: boolean): Promise<{ success: boolean; status?: string; match?: any; error?: string }> {
    try {
      if (!authToken) {
        return { success: false, error: 'Chưa đăng nhập' };
      }
      const response = await fetch(`${BASE_URL}/matchmaking/status?gameId=${gameId}&allowBot=${allowBot}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });
      const result = await response.json();
      if (!response.ok) {
        return { success: false, error: result.message || 'Lỗi kiểm tra hàng chờ' };
      }
      return { success: true, status: result.status, match: result.match };
    } catch (err: any) {
      return { success: false, error: err.message || 'Lỗi kết nối' };
    }
  },

  async leaveMatchmaking(): Promise<{ success: boolean; error?: string }> {
    try {
      if (!authToken) {
        return { success: false, error: 'Chưa đăng nhập' };
      }
      const response = await fetch(`${BASE_URL}/matchmaking/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });
      const result = await response.json();
      if (!response.ok) {
        return { success: false, error: result.message || 'Lỗi hủy tìm trận' };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Lỗi mạng' };
    }
  },

  async createRoom(gameId: number, isPrivate: boolean): Promise<{ success: boolean; room?: any; error?: string }> {
    try {
      if (!authToken) {
        return { success: false, error: 'Bạn cần đăng nhập để tạo phòng' };
      }
      const response = await fetch(`${BASE_URL}/matchmaking/room/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ gameId, isPrivate }),
      });
      const result = await response.json();
      if (!response.ok) {
        return { success: false, error: result.message || 'Lỗi tạo phòng' };
      }
      return { success: true, room: result };
    } catch (err: any) {
      return { success: false, error: err.message || 'Lỗi kết nối mạng' };
    }
  },

  async getPublicRooms(): Promise<{ success: boolean; rooms?: any[]; error?: string }> {
    try {
      if (!authToken) {
        return { success: false, error: 'Bạn cần đăng nhập để xem danh sách phòng' };
      }
      const response = await fetch(`${BASE_URL}/matchmaking/rooms`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });
      const result = await response.json();
      if (!response.ok) {
        return { success: false, error: result.message || 'Lỗi lấy danh sách phòng' };
      }
      return { success: true, rooms: result };
    } catch (err: any) {
      return { success: false, error: err.message || 'Lỗi kết nối' };
    }
  },

  async joinRoomByCode(roomId: string): Promise<{ success: boolean; room?: any; error?: string }> {
    try {
      if (!authToken) {
        return { success: false, error: 'Bạn cần đăng nhập để tham gia phòng' };
      }
      const response = await fetch(`${BASE_URL}/matchmaking/room/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ roomId }),
      });
      const result = await response.json();
      if (!response.ok) {
        return { success: false, error: result.message || 'Lỗi vào phòng' };
      }
      return { success: true, room: result.room };
    } catch (err: any) {
      return { success: false, error: err.message || 'Lỗi kết nối' };
    }
  },

  async checkRoomStatus(roomId: string): Promise<{ success: boolean; status?: string; room?: any; match?: any; error?: string }> {
    try {
      if (!authToken) {
        return { success: false, error: 'Chưa đăng nhập' };
      }
      const response = await fetch(`${BASE_URL}/matchmaking/room/status?roomId=${roomId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });
      const result = await response.json();
      if (!response.ok) {
        return { success: false, error: result.message || 'Lỗi lấy trạng thái phòng' };
      }
      return { success: true, status: result.status, room: result.room, match: result.match };
    } catch (err: any) {
      return { success: false, error: err.message || 'Lỗi mạng' };
    }
  },

  async leaveRoom(roomId: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!authToken) {
        return { success: false, error: 'Chưa đăng nhập' };
      }
      const response = await fetch(`${BASE_URL}/matchmaking/room/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ roomId }),
      });
      const result = await response.json();
      if (!response.ok) {
        return { success: false, error: result.message || 'Lỗi hủy phòng' };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Lỗi mạng' };
    }
  }
};
