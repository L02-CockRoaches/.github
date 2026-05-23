import React from 'react';
import { fireEvent, render, act } from '@testing-library/react-native';

const mockReplace = jest.fn();
const mockPush = jest.fn();
const mockSetParams = jest.fn();

jest.mock('expo-router', () => {
  const React = require('react');

  return {
    Link: ({ children, href, asChild }: any) => {
      if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children, {
          onPress: () => {},
        });
      }
      return children;
    },
    useLocalSearchParams: () => ({}),
    router: {
      push: (...args: unknown[]) => mockPush(...args),
      replace: (...args: unknown[]) => mockReplace(...args),
      setParams: (...args: unknown[]) => mockSetParams(...args),
    },
  };
});

// Mock Haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
}));

// Mock API
jest.mock('@/services/api', () => ({
  api: {
    getLeaderboard: jest.fn().mockResolvedValue({ success: true, data: [{ id: 1, value: 200, user: { name: 'Player 1' } }] }),
    signup: jest.fn().mockResolvedValue({ success: true, data: {} }),
    login: jest.fn().mockResolvedValue({ success: true, user: { name: 'Test User', email: 'test@example.com' } }),
    googleLogin: jest.fn().mockResolvedValue({ success: true, user: { name: 'Google User', email: 'google@example.com' } }),
    joinMatchmaking: jest.fn().mockResolvedValue({ success: true }),
    getMatchmakingStatus: jest.fn().mockResolvedValue({ success: true, status: 'searching' }),
    leaveMatchmaking: jest.fn().mockResolvedValue({ success: true }),
    createRoom: jest.fn().mockResolvedValue({ success: true, room: { roomId: '12345' } }),
    getPublicRooms: jest.fn().mockResolvedValue({ success: true, rooms: [{ roomId: '54321', creator: { name: 'Public Room Host' } }] }),
    joinRoomByCode: jest.fn().mockResolvedValue({ success: true, room: { roomId: '12345' } }),
    checkRoomStatus: jest.fn().mockResolvedValue({ success: true, status: 'waiting' }),
    leaveRoom: jest.fn().mockResolvedValue({ success: true }),
  },
  clearToken: jest.fn(),
}));

import Home from '@/app/(tabs)/home';
import { api } from '@/services/api';

describe('<Home />', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockPush.mockClear();
    mockSetParams.mockClear();
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  const getSubmitButton = (getAllByText: any) => {
    const elements = getAllByText('ĐĂNG NHẬP');
    const submitBtnText = elements.find((el: any) => {
      let current = el.parent;
      while (current) {
        if (current.type) {
          const typeStr = typeof current.type === 'string'
            ? current.type
            : (current.type.displayName || current.type.name || '');
          if (typeStr.includes('LinearGradient') || typeStr.includes('Gradient') || typeStr.includes('ViewManagerAdapter_ExpoLinearGradient')) {
            return true;
          }
        }
        current = current.parent;
      }
      return false;
    });
    return submitBtnText || elements[elements.length - 1];
  };

  it('renders the home screen content', () => {
    const { getByText } = render(<Home />);

    expect(getByText(/STITCH SYNC/i)).toBeTruthy();
    expect(getByText(/CHƠI ĐƠN & CO-OP/i)).toBeTruthy();
    expect(getByText(/TÌM TRẬN THI ĐẤU/i)).toBeTruthy();
  });

  it('calls navigation when the play button is pressed', () => {
    const { getByText } = render(<Home />);

    fireEvent.press(getByText(/CHƠI ĐƠN & CO-OP/i));

    expect(mockReplace).toHaveBeenCalledWith('/(tabs)/explore');
  });

  it('opens and closes instructions modal', () => {
    const { getByText, queryByText } = render(<Home />);

    // Open
    fireEvent.press(getByText('Cách Chơi'));
    expect(getByText('HƯỚNG DẪN CHƠI')).toBeTruthy();

    // Close
    fireEvent.press(getByText('ĐÓNG / CLOSE'));
    expect(queryByText('HƯỚNG DẪN CHƠI')).toBeNull();
  });

  it('opens and closes settings modal', () => {
    const { getByText, queryByText } = render(<Home />);

    // Open
    fireEvent.press(getByText('Cài Đặt'));
    expect(getByText('CÀI ĐẶT HỆ THỐNG')).toBeTruthy();

    // Close
    fireEvent.press(getByText('ĐÓNG / CLOSE'));
    expect(queryByText('CÀI ĐẶT HỆ THỐNG')).toBeNull();
  });

  it('opens and closes practice modal', () => {
    const { getByText, queryByText } = render(<Home />);

    // Open
    fireEvent.press(getByText('Luyện Tập'));
    expect(getByText('LUYỆN TẬP TỰ DO')).toBeTruthy();

    // Close
    fireEvent.press(getByText('BẮT ĐẦU LUYỆN TẬP'));
    expect(queryByText('LUYỆN TẬP TỰ DO')).toBeNull();
  });

  it('opens and closes leaderboard modal', async () => {
    const { getByText, queryByText } = render(<Home />);

    // Open
    await act(async () => {
      fireEvent.press(getByText('Xếp Hạng'));
    });
    expect(api.getLeaderboard).toHaveBeenCalled();
    expect(getByText('BẢNG XẾP HẠNG')).toBeTruthy();

    // Close
    fireEvent.press(getByText('ĐÓNG / CLOSE'));
    expect(queryByText('BẢNG XẾP HẠNG')).toBeNull();
  });

  it('handles auth modal form validation and login/signup flows', async () => {
    const { getByText, getByPlaceholderText, getAllByText, queryByText } = render(<Home />);

    // Open Auth modal
    fireEvent.press(getByText(/TÌM TRẬN THI ĐẤU/i));
    expect(getAllByText('ĐĂNG KÝ')).toBeTruthy();

    // Click submit empty fields
    fireEvent.press(getSubmitButton(getAllByText));
    expect(getByText('Vui lòng nhập Email!')).toBeTruthy();

    // Type invalid email
    fireEvent.changeText(getByPlaceholderText('Địa chỉ Email'), 'invalid-email');
    fireEvent.press(getSubmitButton(getAllByText));
    expect(getByText('Email không hợp lệ!')).toBeTruthy();

    // Type valid email but empty password
    fireEvent.changeText(getByPlaceholderText('Địa chỉ Email'), 'test@example.com');
    fireEvent.press(getSubmitButton(getAllByText));
    expect(getByText('Vui lòng nhập mật khẩu!')).toBeTruthy();

    // Type short password
    fireEvent.changeText(getByPlaceholderText('Mật khẩu'), '123');
    fireEvent.press(getSubmitButton(getAllByText));
    expect(getByText('Mật khẩu phải từ 6 ký tự!')).toBeTruthy();

    // Type correct password and submit login successfully
    fireEvent.changeText(getByPlaceholderText('Mật khẩu'), 'password123');
    await act(async () => {
      fireEvent.press(getSubmitButton(getAllByText));
    });

    // Modal should be closed now because user state is populated
    expect(queryByText('ĐĂNG KÝ')).toBeNull();

    // Open Profile Info modal to test logout
    fireEvent.press(getByText('Test User'));
    expect(getByText('TÀI KHOẢN CỦA BẠN')).toBeTruthy();

    // Logout
    fireEvent.press(getByText('ĐĂNG XUẤT (LOG OUT)'));
    expect(queryByText('TÀI KHOẢN CỦA BẠN')).toBeNull();

    // Test Google Sign In fallback on mobile environment
    fireEvent.press(getByText(/TÌM TRẬN THI ĐẤU/i));
    await act(async () => {
      fireEvent.press(getByText('Tiếp tục với Google'));
    });
    expect(api.login).toHaveBeenCalled();

    // Now log out Google user
    fireEvent.press(getByText('Test User'));
    fireEvent.press(getByText('ĐĂNG XUẤT (LOG OUT)'));

    // Open Auth modal again to test signup switch
    fireEvent.press(getByText(/TÌM TRẬN THI ĐẤU/i));
    fireEvent.press(getAllByText('ĐĂNG KÝ')[0]); // Click registration tab

    // Click submit signup with empty fields
    fireEvent.press(getByText('TẠO TÀI KHOẢN'));
    expect(getByText('Vui lòng nhập Email!')).toBeTruthy();

    // Type email
    fireEvent.changeText(getByPlaceholderText('Email đăng ký mới'), 'newuser@example.com');
    fireEvent.press(getByText('TẠO TÀI KHOẢN'));
    expect(getByText('Vui lòng nhập họ tên!')).toBeTruthy();

    // Type name
    fireEvent.changeText(getByPlaceholderText('Họ và tên của bạn'), 'New User');
    fireEvent.press(getByText('TẠO TÀI KHOẢN'));
    expect(getByText('Vui lòng nhập mật khẩu!')).toBeTruthy();

    // Type password
    fireEvent.changeText(getByPlaceholderText('Mật khẩu'), 'password123');
    await act(async () => {
      fireEvent.press(getByText('TẠO TÀI KHOẢN'));
    });
  });

  it('handles matchmaking queue and rooms when logged in', async () => {
    const { getByText, getByPlaceholderText, getAllByText, queryByText } = render(<Home />);

    // Log in
    fireEvent.press(getByText(/TÌM TRẬN THI ĐẤU/i));
    fireEvent.changeText(getByPlaceholderText('Địa chỉ Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Mật khẩu'), 'password123');
    await act(async () => {
      fireEvent.press(getSubmitButton(getAllByText));
    });

    // Open Matchmaking modal
    fireEvent.press(getByText(/TÌM TRẬN THI ĐẤU/i));
    expect(getByText('ĐẤU ĐỐI KHÁNG')).toBeTruthy();

    // 1. Quick Match
    fireEvent.press(getByText('TÌM TRẬN NHANH / QUICK MATCH'));
    
    // Advance fake timers so matchmaking interval runs
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(getByText(/HỦY TÌM TRẬN/i)).toBeTruthy();

    // Cancel Quick Match
    await act(async () => {
      fireEvent.press(getByText(/HỦY TÌM TRẬN/i));
      jest.advanceTimersByTime(1000);
    });
    expect(getByText('TÌM TRẬN NHANH / QUICK MATCH')).toBeTruthy();

    // 2. Room Type Toggle
    fireEvent.press(getByText('PHÒNG RIÊNG TƯ'));
    fireEvent.press(getByText('PHÒNG TỰ DO'));

    // 3. Create Room
    await act(async () => {
      fireEvent.press(getByText('TẠO PHÒNG MỚI'));
      jest.advanceTimersByTime(1500);
    });
    expect(api.createRoom).toHaveBeenCalled();

    // Cancel Room Hosting
    await act(async () => {
      fireEvent.press(getByText(/HỦY PHÒNG/i));
      jest.advanceTimersByTime(1500);
    });

    // 4. Join Room by Code
    fireEvent.changeText(getByPlaceholderText(/Nhập mã/i), '12345');
    await act(async () => {
      fireEvent.press(getByText('VÀO PHÒNG'));
      jest.advanceTimersByTime(1000);
    });
    expect(api.joinRoomByCode).toHaveBeenCalled();

    // Cancel Room Join
    await act(async () => {
      fireEvent.press(getByText(/RỜI PHÒNG/i));
      jest.advanceTimersByTime(1000);
    });

    // 5. Refresh Public Rooms List
    const refreshBtn = getByText('refresh');
    await act(async () => {
      fireEvent.press(refreshBtn);
      jest.advanceTimersByTime(1000);
    });
    expect(api.getPublicRooms).toHaveBeenCalled();
  });
});
