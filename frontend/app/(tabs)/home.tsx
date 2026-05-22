import { useState, useEffect } from 'react';
import { Pressable, ScrollView, Text, View, StyleSheet, Switch, TextInput, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, {
  FadeIn,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { api, getToken, clearToken } from '../services/api';

export default function Home() {
  const params = useLocalSearchParams();
  const [activeModal, setActiveModal] = useState<'instructions' | 'leaderboard' | 'practice' | 'settings' | 'auth' | 'profile-info' | 'matchmaking' | null>(null);

  // Matchmaking State
  const [matchmakingStatus, setMatchmakingStatus] = useState<'searching' | 'matched' | 'idle'>('idle');
  const [matchmakingTimer, setMatchmakingTimer] = useState(0);
  const [matchedOpponent, setMatchedOpponent] = useState<{ id: number; name: string; email: string } | null>(null);
  const [matchCountdown, setMatchCountdown] = useState(3);
  
  // Room Multiplayer States
  const [roomMode, setRoomMode] = useState<'menu' | 'quick-match' | 'hosting' | 'joining'>('menu');
  const [roomType, setRoomType] = useState<'public' | 'private'>('public');
  const [currentRoom, setCurrentRoom] = useState<any | null>(null);
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [publicRooms, setPublicRooms] = useState<any[]>([]);
  const [roomError, setRoomError] = useState<string | null>(null);
  const [roomLoading, setRoomLoading] = useState(false);

  // Settings State
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [language, setLanguage] = useState<'EN' | 'VI'>('VI');
  const [leftHanded, setLeftHanded] = useState(false);
  const [difficulty, setDifficulty] = useState<'EASY' | 'NORMAL' | 'HARD'>('NORMAL');

  // Practice State
  const [selectedPracticeCategory, setSelectedPracticeCategory] = useState('CIRCLE_SQUARE');

  // User Authentication State
  const [user, setUser] = useState<{ username: string; email: string } | null>(null);
  
  // Auth Form State
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [nameInput, setNameInput] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Leaderboard State
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);

  const loadLeaderboard = async () => {
    setIsLoadingLeaderboard(true);
    const res = await api.getLeaderboard(2); // gameId = 2: Shape Sorter
    setIsLoadingLeaderboard(false);
    if (res.success && res.data) {
      setLeaderboardData(res.data);
    }
  };

  useEffect(() => {
    if (activeModal === 'leaderboard') {
      loadLeaderboard();
    }
  }, [activeModal]);

  const handleAuthSubmit = async () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    setAuthError('');
    
    if (!usernameInput.trim()) {
      setAuthError(language === 'VI' ? 'Vui lòng nhập Email!' : 'Email is required!');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(usernameInput.trim())) {
      setAuthError(language === 'VI' ? 'Email không hợp lệ!' : 'Invalid email address!');
      return;
    }

    if (authMode === 'register' && !nameInput.trim()) {
      setAuthError(language === 'VI' ? 'Vui lòng nhập họ tên!' : 'Full name is required!');
      return;
    }

    if (!passwordInput) {
      setAuthError(language === 'VI' ? 'Vui lòng nhập mật khẩu!' : 'Password is required!');
      return;
    }
    if (passwordInput.length < 6) {
      setAuthError(language === 'VI' ? 'Mật khẩu phải từ 6 ký tự!' : 'Password must be at least 6 characters!');
      return;
    }

    setIsAuthLoading(true);
    
    if (authMode === 'register') {
      const signupRes = await api.signup(usernameInput.trim(), passwordInput, nameInput.trim());
      if (!signupRes.success) {
        setIsAuthLoading(false);
        setAuthError(signupRes.error || 'Đăng ký thất bại');
        triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
        return;
      }
      
      const loginRes = await api.login(usernameInput.trim(), passwordInput);
      setIsAuthLoading(false);
      if (loginRes.success && loginRes.user) {
        setUser({
          username: loginRes.user.name,
          email: loginRes.user.email
        });
        setUsernameInput('');
        setNameInput('');
        setPasswordInput('');
        setActiveModal(null);
        triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
      } else {
        setAuthMode('login');
        setAuthError(language === 'VI' ? 'Đăng ký thành công, hãy đăng nhập!' : 'Registration successful, please login!');
        setPasswordInput('');
        triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
      }
    } else {
      const res = await api.login(usernameInput.trim(), passwordInput);
      setIsAuthLoading(false);
      if (res.success && res.user) {
        setUser({
          username: res.user.name,
          email: res.user.email
        });
        setUsernameInput('');
        setNameInput('');
        setPasswordInput('');
        setActiveModal(null);
        triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
      } else {
        setAuthError(res.error || 'Đăng nhập thất bại');
        triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    setAuthError('');
    setIsAuthLoading(true);
    
    if (Platform.OS === 'web') {
      const clientId = '860435877394-1p0enmcu2v5u1t72do1kueq5dmr5lhps.apps.googleusercontent.com';
      const redirectUri = window.location.origin + window.location.pathname;
      const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth` +
        `?client_id=${clientId}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=id_token` +
        `&scope=${encodeURIComponent('openid profile email')}` +
        `&nonce=${Math.random().toString(36).substring(2)}`;
      window.location.href = oauthUrl;
      return;
    }

    // Fallback/Mock cho thiết bị di động
    const email = 'player.google@gmail.com';
    const password = 'googleSignInPassword123';
    const name = 'Google Player';
    
    const loginRes = await api.login(email, password);
    if (loginRes.success && loginRes.user) {
      setIsAuthLoading(false);
      setUser({
        username: loginRes.user.name,
        email: loginRes.user.email
      });
      setUsernameInput('');
      setNameInput('');
      setPasswordInput('');
      setActiveModal(null);
      triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      const signupRes = await api.signup(email, password, name);
      if (signupRes.success) {
        const retryLogin = await api.login(email, password);
        setIsAuthLoading(false);
        if (retryLogin.success && retryLogin.user) {
          setUser({
            username: retryLogin.user.name,
            email: retryLogin.user.email
          });
          setUsernameInput('');
          setNameInput('');
          setPasswordInput('');
          setActiveModal(null);
          triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
        } else {
          setIsAuthLoading(false);
          setAuthError('Google sign in failed');
          triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
        }
      } else {
        setIsAuthLoading(false);
        setAuthError('Google signup failed');
        triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
      }
    }
  };

  // Bắt sự kiện Redirect từ Google OAuth Token trên Web
  useEffect(() => {
    if (Platform.OS === 'web') {
      const hash = window.location.hash;
      if (hash && hash.includes('id_token=')) {
        const params = new URLSearchParams(hash.substring(1));
        const idToken = params.get('id_token');
        if (idToken) {
          // Xóa hash trên thanh địa chỉ URL để tránh lặp lại
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
          
          setIsAuthLoading(true);
          setAuthError('');
          setActiveModal('auth');
          
          api.googleLogin(idToken).then(res => {
            setIsAuthLoading(false);
            if (res.success && res.user) {
              setUser({
                username: res.user.name,
                email: res.user.email
              });
              setActiveModal(null);
            } else {
              setAuthError(res.error || 'Đăng nhập Google thất bại');
            }
          }).catch(err => {
            setIsAuthLoading(false);
            setAuthError(err.message || 'Lỗi mạng khi đăng nhập Google');
          });
        }
      }
    }
  }, []);

  const handleLogOut = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    clearToken();
    setUser(null);
    setActiveModal(null);
  };

  const triggerHaptic = (style = Haptics.ImpactFeedbackStyle.Light) => {
    Haptics.impactAsync(style).catch(() => {});
  };

  // Matchmaking & Room polling logic
  useEffect(() => {
    let mainInterval: any;
    let countdownInterval: any;
    let currentTimer = 0;
    let isMatched = false;

    if (activeModal === 'matchmaking') {
      if (roomMode === 'quick-match') {
        setMatchmakingStatus('searching');
        setMatchmakingTimer(0);
        setMatchedOpponent(null);
        setMatchCountdown(3);

        const runMatchmaking = async () => {
          if (isMatched) return;

          currentTimer += 1;
          setMatchmakingTimer(currentTimer);

          const allowBot = currentTimer >= 5;
          const res = await api.getMatchmakingStatus(2, allowBot);

          if (res.success && res.status === 'matched' && res.match) {
            isMatched = true;
            clearInterval(mainInterval);
            triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
            setMatchmakingStatus('matched');

            const opponent = res.match.players.find((p: any) => p.email !== user?.email) || res.match.players[1];
            setMatchedOpponent(opponent);

            let count = 3;
            countdownInterval = setInterval(() => {
              count -= 1;
              setMatchCountdown(count);
              triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
              
              if (count === 0) {
                clearInterval(countdownInterval);
                setActiveModal(null);
                router.push({
                  pathname: '/explore',
                  params: {
                    mode: 'versus',
                    opponentName: opponent.name,
                    opponentEmail: opponent.email,
                    seed: String(res.match.seed),
                    matchId: res.match.matchId,
                    isBot: res.match.isBot ? 'true' : 'false',
                  }
                });
              }
            }, 1000);
          }
        };

        api.joinMatchmaking(2);
        mainInterval = setInterval(runMatchmaking, 1000);

      } else if (roomMode === 'hosting' && currentRoom) {
        setMatchmakingStatus('searching');
        setMatchedOpponent(null);
        setMatchCountdown(3);

        const runRoomPolling = async () => {
          if (isMatched) return;

          const res = await api.checkRoomStatus(currentRoom.roomId);
          if (res.success && res.status === 'matched' && res.match) {
            isMatched = true;
            clearInterval(mainInterval);
            triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
            setMatchmakingStatus('matched');

            const opponent = res.match.players.find((p: any) => p.email !== user?.email) || res.match.players[1];
            setMatchedOpponent(opponent);

            let count = 3;
            countdownInterval = setInterval(() => {
              count -= 1;
              setMatchCountdown(count);
              triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
              
              if (count === 0) {
                clearInterval(countdownInterval);
                setActiveModal(null);
                router.push({
                  pathname: '/explore',
                  params: {
                    mode: 'versus',
                    opponentName: opponent.name,
                    opponentEmail: opponent.email,
                    seed: String(res.match.seed),
                    matchId: res.match.matchId,
                    isBot: 'false',
                  }
                });
              }
            }, 1000);
          }
        };

        mainInterval = setInterval(runRoomPolling, 1500);

      } else if (roomMode === 'joining' && currentRoom) {
        setMatchmakingStatus('searching');
        setMatchedOpponent(null);
        setMatchCountdown(3);

        const runJoinPolling = async () => {
          if (isMatched) return;

          const res = await api.checkRoomStatus(currentRoom.roomId);
          if (res.success && res.status === 'matched' && res.match) {
            isMatched = true;
            clearInterval(mainInterval);
            triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
            setMatchmakingStatus('matched');

            const opponent = res.match.players.find((p: any) => p.email !== user?.email) || res.match.players[0];
            setMatchedOpponent(opponent);

            let count = 3;
            countdownInterval = setInterval(() => {
              count -= 1;
              setMatchCountdown(count);
              triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
              
              if (count === 0) {
                clearInterval(countdownInterval);
                setActiveModal(null);
                router.push({
                  pathname: '/explore',
                  params: {
                    mode: 'versus',
                    opponentName: opponent.name,
                    opponentEmail: opponent.email,
                    seed: String(res.match.seed),
                    matchId: res.match.matchId,
                    isBot: 'false',
                  }
                });
              }
            }, 1000);
          }
        };

        mainInterval = setInterval(runJoinPolling, 1000);
      }
    } else {
      if (roomMode === 'quick-match') {
        api.leaveMatchmaking();
      } else if (roomMode === 'hosting' && currentRoom) {
        api.leaveRoom(currentRoom.roomId);
      }
      setMatchmakingStatus('idle');
      clearInterval(mainInterval);
      clearInterval(countdownInterval);
    }

    return () => {
      clearInterval(mainInterval);
      clearInterval(countdownInterval);
    };
  }, [activeModal, roomMode, currentRoom, user]);

  useEffect(() => {
    if (params && params.triggerMatchmaking === 'true') {
      router.setParams({ triggerMatchmaking: 'false' });
      handleStartMatchmaking();
    }
  }, [params?.triggerMatchmaking]);

  const loadPublicRooms = async () => {
    setRoomLoading(true);
    const res = await api.getPublicRooms();
    setRoomLoading(false);
    if (res.success) {
      setPublicRooms(res.rooms || []);
    }
  };

  const handleCreateRoom = async () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    setRoomLoading(true);
    setRoomError(null);
    const res = await api.createRoom(2, roomType === 'private');
    setRoomLoading(false);
    if (res.success && res.room) {
      setCurrentRoom(res.room);
      setRoomMode('hosting');
    } else {
      setRoomError(res.error || 'Lỗi không thể tạo phòng');
    }
  };

  const handleJoinRoom = async (code: string) => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    if (!code.trim()) {
      setRoomError('Vui lòng nhập mã phòng');
      return;
    }
    setRoomLoading(true);
    setRoomError(null);
    const res = await api.joinRoomByCode(code.trim());
    setRoomLoading(false);
    if (res.success && res.room) {
      setCurrentRoom(res.room);
      setRoomMode('joining');
    } else {
      setRoomError(res.error || 'Không thể tham gia phòng này');
    }
  };

  const handleLeaveRoom = async () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    if (currentRoom) {
      api.leaveRoom(currentRoom.roomId);
    }
    setCurrentRoom(null);
    setRoomMode('menu');
    loadPublicRooms();
  };

  const handleStartMatchmaking = async () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    if (!user) {
      setAuthMode('login');
      setAuthError(language === 'VI' ? 'Hãy đăng nhập để tham gia đấu đối kháng!' : 'Please login to participate in versus mode!');
      setActiveModal('auth');
      return;
    }
    setRoomMode('menu');
    setRoomError(null);
    setRoomCodeInput('');
    loadPublicRooms();
    setActiveModal('matchmaking');
  };

  const handlePlayNow = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    router.replace('/(tabs)/explore');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0B0F12' }}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingVertical: 20, flexGrow: 1 }}
      >
        <View style={{ paddingHorizontal: 20, gap: 24 }}>
          
          {/* Top Row: User Profile Status / Auth button */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="sparkles" size={16} color="#00F2FF" />
              <Text style={{ fontFamily: 'Montserrat_900Black', fontSize: 16, color: '#FFFFFF', letterSpacing: 0.5 }}>
                STITCH SYNC
              </Text>
            </View>
            
            {user ? (
              <Pressable
                onPress={() => { triggerHaptic(); setActiveModal('profile-info'); }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: '#12181B',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: '#202D33',
                }}
              >
                <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 11.5, color: '#00F2FF' }}>
                  {user.username}
                </Text>
                <Ionicons name="person-circle" size={18} color="#00F2FF" />
              </Pressable>
            ) : (
              <Pressable
                onPress={() => { triggerHaptic(); setActiveModal('auth'); }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  backgroundColor: 'rgba(0, 242, 255, 0.08)',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: 'rgba(0, 242, 255, 0.25)',
                }}
              >
                <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 11.5, color: '#00F2FF' }}>
                  ĐĂNG NHẬP
                </Text>
                <Ionicons name="log-in-outline" size={16} color="#00F2FF" />
              </Pressable>
            )}
          </View>
          
          {/* Header Personal Best */}
          <View style={{ alignItems: 'center', marginTop: 10 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                backgroundColor: 'rgba(255, 215, 0, 0.08)',
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                borderWidth: 1.2,
                borderColor: 'rgba(255, 215, 0, 0.25)',
              }}
            >
              <Ionicons name="trophy" size={16} color="#FFD700" />
              <Text
                style={{
                  fontFamily: 'Montserrat_700Bold',
                  fontSize: 12,
                  color: '#FFD700',
                  letterSpacing: 1,
                }}
              >
                {language === 'VI' ? 'KỶ LỤC • PERSONAL BEST' : 'BEST SCORE'} : 2,450 PTS
              </Text>
            </View>
          </View>

          {/* Interactive Holographic Orb Graphic */}
          <View style={{ alignItems: 'center', marginVertical: 10 }}>
            <HolographicOrb />
          </View>

          {/* Primary Action Buttons */}
          <View style={{ paddingHorizontal: 10, gap: 12 }}>
            {/* Solo / Co-op Button */}
            <Pressable
              onPress={handlePlayNow}
              style={({ pressed }) => ({
                opacity: pressed ? 0.9 : 1,
                boxShadow: '0 6px 20px rgba(0, 242, 255, 0.3)',
                borderRadius: 30,
                overflow: 'hidden',
              })}
            >
              <LinearGradient
                colors={['#00F2FF', '#BF00FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  paddingVertical: 18,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                }}
              >
                <Ionicons name="play" size={20} color="#FFFFFF" />
                <Text
                  style={{
                    fontFamily: 'Montserrat_700Bold',
                    color: '#FFFFFF',
                    fontSize: 16,
                    letterSpacing: 1.5,
                  }}
                >
                  {language === 'VI' ? 'CHƠI ĐƠN & CO-OP / PLAY' : 'PLAY SOLO & CO-OP'}
                </Text>
              </LinearGradient>
            </Pressable>

            {/* Matchmaking Button */}
            <Pressable
              onPress={handleStartMatchmaking}
              style={({ pressed }) => ({
                opacity: pressed ? 0.9 : 1,
                boxShadow: '0 6px 20px rgba(255, 75, 43, 0.3)',
                borderRadius: 30,
                overflow: 'hidden',
              })}
            >
              <LinearGradient
                colors={['#FF4B2B', '#FF416C']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  paddingVertical: 18,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                }}
              >
                <Ionicons name="flash" size={20} color="#FFFFFF" />
                <Text
                  style={{
                    fontFamily: 'Montserrat_700Bold',
                    color: '#FFFFFF',
                    fontSize: 16,
                    letterSpacing: 1.5,
                  }}
                >
                  {language === 'VI' ? 'TÌM TRẬN THI ĐẤU / MATCHMAKING' : 'FIND VERSUS MATCH'}
                </Text>
              </LinearGradient>
            </Pressable>
          </View>

          {/* Grid Options Menu (2x2) */}
          <View style={{ gap: 14 }}>
            <View style={{ flexDirection: 'row', gap: 14 }}>
              <MenuCard
                icon="book"
                title={language === 'VI' ? 'Cách Chơi' : 'How to Play'}
                subtitle="Instructions"
                accentColor="#00F2FF"
                onPress={() => {
                  triggerHaptic();
                  setActiveModal('instructions');
                }}
              />
              <MenuCard
                icon="podium"
                title={language === 'VI' ? 'Xếp Hạng' : 'Leaderboard'}
                subtitle="Global ranks"
                accentColor="#BF00FF"
                onPress={() => {
                  triggerHaptic();
                  setActiveModal('leaderboard');
                }}
              />
            </View>
            <View style={{ flexDirection: 'row', gap: 14 }}>
              <MenuCard
                icon="fitness"
                title={language === 'VI' ? 'Luyện Tập' : 'Practice'}
                subtitle="Free training"
                accentColor="#FF007F"
                onPress={() => {
                  triggerHaptic();
                  setActiveModal('practice');
                }}
              />
              <MenuCard
                icon="settings"
                title={language === 'VI' ? 'Cài Đặt' : 'Settings'}
                subtitle="Options"
                accentColor="#707979"
                onPress={() => {
                  triggerHaptic();
                  setActiveModal('settings');
                }}
              />
            </View>
          </View>

        </View>
      </ScrollView>

      {/* --- MODAL OVERLAYS --- */}

      {/* 1. INSTRUCTIONS MODAL */}
      {activeModal === 'instructions' && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={styles.modalBackdrop}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {language === 'VI' ? 'HƯỚNG DẪN CHƠI' : 'HOW TO PLAY'}
              </Text>
              <Pressable onPress={() => { triggerHaptic(); setActiveModal(null); }}>
                <Ionicons name="close" size={24} color="#707979" />
              </Pressable>
            </View>
            
            <ScrollView contentContainerStyle={{ gap: 16 }}>
              {/* Visual Split Screen Diagram */}
              <View style={styles.instructionsVisual}>
                <View style={[styles.canvasHalf, { borderColor: 'rgba(0, 242, 255, 0.4)' }]}>
                  <Text style={[styles.canvasLabel, { color: '#00F2FF' }]}>TAY TRÁI</Text>
                  <View style={[styles.targetShapeShape, { width: 44, height: 44, borderRadius: 22, borderStyle: 'dotted', borderWidth: 2, borderColor: '#00F2FF' }]} />
                </View>
                <View style={[styles.canvasHalf, { borderColor: 'rgba(191, 0, 255, 0.4)' }]}>
                  <Text style={[styles.canvasLabel, { color: '#BF00FF' }]}>TAY PHẢI</Text>
                  <View style={[styles.targetShapeShape, { width: 40, height: 40, borderStyle: 'dotted', borderWidth: 2, borderColor: '#BF00FF' }]} />
                </View>
                <View style={styles.vsBadge}>
                  <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 10, color: '#FFFFFF' }}>00:45</Text>
                </View>
              </View>

              {/* Step list */}
              <View style={{ gap: 12 }}>
                <InstructionStep
                  step="BƯỚC 1"
                  title="Nhìn hình mẫu"
                  desc="Quan sát kỹ hình mẫu hiển thị ở góc trên mỗi phần canvas."
                  color="#00F2FF"
                />
                <InstructionStep
                  step="BƯỚC 2"
                  title="Vẽ bằng hai tay"
                  desc="Sử dụng cả hai tay để vẽ đồng thời hai hình mẫu tương ứng."
                  color="#BF00FF"
                />
                <InstructionStep
                  step="BƯỚC 3"
                  title="Đúng thời gian"
                  desc="Hoàn thành nét vẽ trước khi thanh thời gian đếm ngược kết thúc."
                  color="#FF007F"
                />
                <InstructionStep
                  step="BƯỚC 4"
                  title="Luyện não bộ"
                  desc="Tốc độ tăng dần giúp kích hoạt và đồng bộ hai bán cầu não."
                  color="#00E676"
                />
              </View>
            </ScrollView>

            <Pressable
              onPress={() => { triggerHaptic(); setActiveModal(null); }}
              style={styles.closeBtn}
            >
              <Text style={styles.closeBtnText}>ĐÓNG / CLOSE</Text>
            </Pressable>
          </View>
        </Animated.View>
      )}

      {/* 2. LEADERBOARD MODAL */}
      {activeModal === 'leaderboard' && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={styles.modalBackdrop}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {language === 'VI' ? 'BẢNG XẾP HẠNG' : 'LEADERBOARD'}
              </Text>
              <Pressable onPress={() => { triggerHaptic(); setActiveModal(null); }}>
                <Ionicons name="close" size={24} color="#707979" />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={{ gap: 16 }}>
              {/* Weekly Challenge Banner */}
              <LinearGradient
                colors={['rgba(191, 0, 255, 0.15)', 'rgba(0, 242, 255, 0.15)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.challengeCard}
              >
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={styles.challengeTitle}>WEEKLY CHALLENGE: HEX-SYNC</Text>
                  <Text style={styles.challengeDesc}>Vẽ 50 hình lục giác chuẩn trong vòng 60 giây.</Text>
                </View>
                <View style={styles.challengeAction}>
                  <Text style={styles.challengeTimer}>02D 04H</Text>
                  <Pressable style={styles.challengeBtn} onPress={() => triggerHaptic(Haptics.ImpactFeedbackStyle.Medium)}>
                    <Text style={styles.challengeBtnText}>PLAY</Text>
                  </Pressable>
                </View>
              </LinearGradient>

              {/* Ranks list */}
              <View style={{ gap: 10 }}>
                {isLoadingLeaderboard ? (
                  <Text style={{ color: '#707979', fontFamily: 'Montserrat_500Medium', textAlign: 'center', marginVertical: 20, fontSize: 13 }}>
                    ĐANG TẢI BẢNG XẾP HẠNG...
                  </Text>
                ) : leaderboardData.length > 0 ? (
                  leaderboardData.map((item, index) => {
                    const isCurrentUser = user ? item.user?.email === user.email : false;
                    let rankColor = '#E1E4E6';
                    if (index === 0) rankColor = '#FFD700';
                    else if (index === 1) rankColor = '#C0C0C0';
                    else if (index === 2) rankColor = '#CD7F32';
                    else if (isCurrentUser) rankColor = '#00F2FF';

                    let rankTitle = 'AMATEUR';
                    if (item.value >= 30000) rankTitle = 'GRANDMASTER';
                    else if (item.value >= 15000) rankTitle = 'MASTER';
                    else if (item.value >= 5000) rankTitle = 'ELITE';

                    return (
                      <LeaderboardRow
                        key={item.id || index}
                        rank={index + 1}
                        name={item.user?.name || item.user?.email.split('@')[0] || 'Player'}
                        title={rankTitle}
                        score={item.value.toLocaleString()}
                        color={rankColor}
                        isUser={isCurrentUser}
                      />
                    );
                  })
                ) : (
                  <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                    <Ionicons name="trophy-outline" size={32} color="#707979" style={{ marginBottom: 8 }} />
                    <Text style={{ color: '#707979', fontFamily: 'Montserrat_500Medium', fontSize: 13, textAlign: 'center', lineHeight: 18 }}>
                      Chưa có điểm kỷ lục được ghi nhận.{'\n'}Hãy là người đầu tiên lập kỷ lục!
                    </Text>
                  </View>
                )}
              </View>
            </ScrollView>

            <Pressable
              onPress={() => { triggerHaptic(); setActiveModal(null); }}
              style={styles.closeBtn}
            >
              <Text style={styles.closeBtnText}>ĐÓNG / CLOSE</Text>
            </Pressable>
          </View>
        </Animated.View>
      )}

      {/* 3. PRACTICE MODAL */}
      {activeModal === 'practice' && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={styles.modalBackdrop}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {language === 'VI' ? 'LUYỆN TẬP TỰ DO' : 'PRACTICE MODE'}
              </Text>
              <Pressable onPress={() => { triggerHaptic(); setActiveModal(null); }}>
                <Ionicons name="close" size={24} color="#707979" />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={{ gap: 18 }}>
              <Text style={styles.sectionSubtitle}>
                {language === 'VI' ? 'CHỌN CẶP HÌNH KHỐI' : 'SELECT SHAPE CATEGORY'}
              </Text>

              {/* Grid 2x2 of Practice Categories */}
              <View style={{ gap: 12 }}>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <PracticeCategoryCard
                    id="CIRCLE_SQUARE"
                    title="CIRCLE & SQUARE"
                    desc="Dành cho người mới bắt đầu"
                    shapes={['circle', 'square']}
                    selected={selectedPracticeCategory === 'CIRCLE_SQUARE'}
                    onPress={() => { triggerHaptic(); setSelectedPracticeCategory('CIRCLE_SQUARE'); }}
                  />
                  <PracticeCategoryCard
                    id="DOUBLE_TRIANGLE"
                    title="DOUBLE TRIANGLE"
                    desc="Luyện phản xạ đối xứng"
                    shapes={['triangle', 'triangle']}
                    selected={selectedPracticeCategory === 'DOUBLE_TRIANGLE'}
                    onPress={() => { triggerHaptic(); setSelectedPracticeCategory('DOUBLE_TRIANGLE'); }}
                  />
                </View>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <PracticeCategoryCard
                    id="HEX_PENTA"
                    title="HEX & PENTA"
                    desc="Nâng cao khả năng phối hợp"
                    shapes={['hexagon', 'pentagon']}
                    selected={selectedPracticeCategory === 'HEX_PENTA'}
                    onPress={() => { triggerHaptic(); setSelectedPracticeCategory('HEX_PENTA'); }}
                  />
                  <PracticeCategoryCard
                    id="STAR_DIAMOND"
                    title="STAR & DIAMOND"
                    desc="Cấp độ thử thách não bộ"
                    shapes={['star', 'diamond']}
                    selected={selectedPracticeCategory === 'STAR_DIAMOND'}
                    onPress={() => { triggerHaptic(); setSelectedPracticeCategory('STAR_DIAMOND'); }}
                  />
                </View>
              </View>

              {/* Preview Box */}
              <View style={styles.practicePreviewZone}>
                <Text style={styles.previewTitle}>PREVIEW TRAINING ZONE</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 40, marginTop: 10 }}>
                  <Ionicons name="shapes-outline" size={32} color="#00F2FF" />
                  <Ionicons name="refresh" size={24} color="#707979" style={{ alignSelf: 'center' }} />
                  <Ionicons name="shapes-outline" size={32} color="#BF00FF" />
                </View>
              </View>
            </ScrollView>

            <Pressable
              onPress={() => { triggerHaptic(Haptics.ImpactFeedbackStyle.Medium); setActiveModal(null); router.replace('/(tabs)/explore'); }}
              style={[styles.closeBtn, { backgroundColor: '#00F2FF' }]}
            >
              <Text style={[styles.closeBtnText, { color: '#0B0F12' }]}>BẮT ĐẦU LUYỆN TẬP</Text>
            </Pressable>
          </View>
        </Animated.View>
      )}

      {/* 4. SETTINGS MODAL */}
      {activeModal === 'settings' && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={styles.modalBackdrop}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {language === 'VI' ? 'CÀI ĐẶT HỆ THỐNG' : 'SETTINGS'}
              </Text>
              <Pressable onPress={() => { triggerHaptic(); setActiveModal(null); }}>
                <Ionicons name="close" size={24} color="#707979" />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={{ gap: 20 }}>
              {/* Sound & Haptics Section */}
              <View style={{ gap: 12 }}>
                <Text style={styles.sectionSubtitle}>AUDIO & HAPTICS</Text>
                <View style={styles.settingsRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Ionicons name="volume-high" size={20} color="#00F2FF" />
                    <Text style={styles.settingsLabel}>Âm thanh (Sound Effects)</Text>
                  </View>
                  <Switch
                    value={soundEnabled}
                    onValueChange={(val) => { triggerHaptic(); setSoundEnabled(val); }}
                    trackColor={{ false: '#1D2428', true: '#00F2FF' }}
                    thumbColor={soundEnabled ? '#FFFFFF' : '#707979'}
                  />
                </View>
                <View style={styles.settingsRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Ionicons name="phone-portrait" size={20} color="#BF00FF" />
                    <Text style={styles.settingsLabel}>Rung phản hồi (Haptic Vibe)</Text>
                  </View>
                  <Switch
                    value={vibrationEnabled}
                    onValueChange={(val) => { triggerHaptic(); setVibrationEnabled(val); }}
                    trackColor={{ false: '#1D2428', true: '#BF00FF' }}
                    thumbColor={vibrationEnabled ? '#FFFFFF' : '#707979'}
                  />
                </View>
              </View>

              {/* Preferences Section */}
              <View style={{ gap: 12 }}>
                <Text style={styles.sectionSubtitle}>PREFERENCES</Text>
                <View style={styles.settingsRow}>
                  <Text style={styles.settingsLabel}>Ngôn ngữ / Language</Text>
                  <View style={styles.tabSegments}>
                    <Pressable
                      onPress={() => { triggerHaptic(); setLanguage('EN'); }}
                      style={[styles.segmentBtn, language === 'EN' && styles.segmentBtnActive]}
                    >
                      <Text style={[styles.segmentText, language === 'EN' && styles.segmentTextActive]}>English</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => { triggerHaptic(); setLanguage('VI'); }}
                      style={[styles.segmentBtn, language === 'VI' && styles.segmentBtnActive]}
                    >
                      <Text style={[styles.segmentText, language === 'VI' && styles.segmentTextActive]}>Tiếng Việt</Text>
                    </Pressable>
                  </View>
                </View>
                <View style={styles.settingsRow}>
                  <Text style={styles.settingsLabel}>Chế độ tay / Hand Mode</Text>
                  <View style={styles.tabSegments}>
                    <Pressable
                      onPress={() => { triggerHaptic(); setLeftHanded(false); }}
                      style={[styles.segmentBtn, !leftHanded && styles.segmentBtnActive]}
                    >
                      <Text style={[styles.segmentText, !leftHanded && styles.segmentTextActive]}>Normal</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => { triggerHaptic(); setLeftHanded(true); }}
                      style={[styles.segmentBtn, leftHanded && styles.segmentBtnActive]}
                    >
                      <Text style={[styles.segmentText, leftHanded && styles.segmentTextActive]}>Left-handed</Text>
                    </Pressable>
                  </View>
                </View>
              </View>

              {/* Difficulty Section */}
              <View style={{ gap: 12 }}>
                <Text style={styles.sectionSubtitle}>ĐỘ KHÓ / DIFFICULTY</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <DifficultyCard
                    level="EASY"
                    label="Dễ"
                    selected={difficulty === 'EASY'}
                    color="#00E676"
                    onPress={() => { triggerHaptic(); setDifficulty('EASY'); }}
                  />
                  <DifficultyCard
                    level="NORMAL"
                    label="Vừa"
                    selected={difficulty === 'NORMAL'}
                    color="#00F2FF"
                    onPress={() => { triggerHaptic(); setDifficulty('NORMAL'); }}
                  />
                  <DifficultyCard
                    level="HARD"
                    label="Khó"
                    selected={difficulty === 'HARD'}
                    color="#FF007F"
                    onPress={() => { triggerHaptic(); setDifficulty('HARD'); }}
                  />
                </View>
              </View>

              {/* Danger Zone */}
              <Pressable
                onPress={() => triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy)}
                style={styles.dangerBtn}
              >
                <Text style={styles.dangerBtnText}>Reset Progress (Xóa dữ liệu)</Text>
              </Pressable>
            </ScrollView>

            <Pressable
              onPress={() => { triggerHaptic(); setActiveModal(null); }}
              style={styles.closeBtn}
            >
              <Text style={styles.closeBtnText}>ĐÓNG / CLOSE</Text>
            </Pressable>
          </View>
        </Animated.View>
      )}

      {/* 5. AUTH MODAL (LOGIN / REGISTER) */}
      {activeModal === 'auth' && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={styles.modalBackdrop}
        >
          <View style={[styles.modalContainer, { maxHeight: 520 }]}>
            <View style={styles.modalHeader}>
              <View style={styles.authTabContainer}>
                <Pressable
                  onPress={() => { triggerHaptic(); setAuthMode('login'); setAuthError(''); }}
                  style={[styles.authTabBtn, authMode === 'login' && styles.authTabBtnActive]}
                >
                  <Text style={[styles.authTabLabel, authMode === 'login' && styles.authTabLabelActive]}>
                    ĐĂNG NHẬP
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => { triggerHaptic(); setAuthMode('register'); setAuthError(''); }}
                  style={[styles.authTabBtn, authMode === 'register' && styles.authTabBtnActive]}
                >
                  <Text style={[styles.authTabLabel, authMode === 'register' && styles.authTabLabelActive]}>
                    ĐĂNG KÝ
                  </Text>
                </Pressable>
              </View>
              <Pressable onPress={() => { triggerHaptic(); setActiveModal(null); }}>
                <Ionicons name="close" size={24} color="#707979" />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={{ gap: 18, paddingVertical: 10 }}>
              {authError ? (
                <View style={styles.authErrorContainer}>
                  <Ionicons name="alert-circle" size={16} color="#FF5252" />
                  <Text style={styles.authErrorText}>{authError}</Text>
                </View>
              ) : null}

              {/* Input Fields */}
              <View style={{ gap: 14 }}>
                {authMode === 'register' && (
                  <View style={styles.inputContainer}>
                    <Ionicons name="card-outline" size={18} color="#707979" style={{ marginRight: 10 }} />
                    <TextInput
                      value={nameInput}
                      onChangeText={setNameInput}
                      placeholder="Họ và tên của bạn"
                      placeholderTextColor="#707979"
                      style={styles.textInput}
                      autoCorrect={false}
                    />
                  </View>
                )}

                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={18} color="#707979" style={{ marginRight: 10 }} />
                  <TextInput
                    value={usernameInput}
                    onChangeText={setUsernameInput}
                    placeholder={authMode === 'login' ? "Địa chỉ Email" : "Email đăng ký mới"}
                    placeholderTextColor="#707979"
                    style={styles.textInput}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={18} color="#707979" style={{ marginRight: 10 }} />
                  <TextInput
                    value={passwordInput}
                    onChangeText={setPasswordInput}
                    placeholder="Mật khẩu"
                    placeholderTextColor="#707979"
                    secureTextEntry={!showPassword}
                    style={styles.textInput}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <Pressable onPress={() => { triggerHaptic(); setShowPassword(!showPassword); }} style={{ padding: 4 }}>
                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={18} color="#707979" />
                  </Pressable>
                </View>
              </View>

              {/* Submit Button */}
              <Pressable
                onPress={handleAuthSubmit}
                disabled={isAuthLoading}
                style={({ pressed }) => [
                  styles.authSubmitBtn,
                  pressed && { opacity: 0.9 }
                ]}
              >
                <LinearGradient
                  colors={['#00F2FF', '#BF00FF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.authSubmitGradient}
                >
                  {isAuthLoading ? (
                    <Text style={styles.authSubmitText}>ĐANG XỬ LÝ...</Text>
                  ) : (
                    <Text style={styles.authSubmitText}>
                      {authMode === 'login' ? 'ĐĂNG NHẬP' : 'TẠO TÀI KHOẢN'}
                    </Text>
                  )}
                </LinearGradient>
              </Pressable>

              {/* Divider */}
              <View style={styles.authDivider}>
                <View style={styles.authDividerLine} />
                <Text style={styles.authDividerText}>HOẶC ĐĂNG NHẬP BẰNG</Text>
                <View style={styles.authDividerLine} />
              </View>

              {/* Google Button */}
              <Pressable
                onPress={handleGoogleSignIn}
                disabled={isAuthLoading}
                style={({ pressed }) => [
                  styles.googleSignInBtn,
                  pressed && { backgroundColor: 'rgba(255, 255, 255, 0.08)' }
                ]}
              >
                <Ionicons name="logo-google" size={18} color="#FF5252" style={{ marginRight: 10 }} />
                <Text style={styles.googleSignInText}>Tiếp tục với Google</Text>
              </Pressable>
            </ScrollView>
          </View>
        </Animated.View>
      )}

      {/* 6. PROFILE INFO MODAL (LOG OUT) */}
      {activeModal === 'profile-info' && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={styles.modalBackdrop}
        >
          <View style={[styles.modalContainer, { maxHeight: 300 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>TÀI KHOẢN CỦA BẠN</Text>
              <Pressable onPress={() => { triggerHaptic(); setActiveModal(null); }}>
                <Ionicons name="close" size={24} color="#707979" />
              </Pressable>
            </View>

            <View style={{ alignItems: 'center', gap: 14, paddingVertical: 16 }}>
              <View style={styles.profileAvatarContainer}>
                <Ionicons name="person" size={28} color="#00F2FF" />
              </View>
              
              <View style={{ alignItems: 'center', gap: 4 }}>
                <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 16, color: '#FFFFFF' }}>
                  {user?.username}
                </Text>
                <Text style={{ fontFamily: 'Montserrat_500Medium', fontSize: 12, color: '#707979' }}>
                  {user?.email}
                </Text>
              </View>
            </View>

            <Pressable
              onPress={handleLogOut}
              style={[styles.dangerBtn, { marginTop: 10 }]}
            >
              <Text style={styles.dangerBtnText}>ĐĂNG XUẤT (LOG OUT)</Text>
            </Pressable>
          </View>
        </Animated.View>
      )}

      {/* 7. MATCHMAKING MODAL */}
      {activeModal === 'matchmaking' && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={styles.modalBackdrop}
        >
          <View style={[styles.modalContainer, { minHeight: 380 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {language === 'VI' ? 'ĐẤU ĐỐI KHÁNG' : 'VERSUS BATTLE'}
              </Text>
              {matchmakingStatus === 'searching' && (
                <Pressable onPress={() => { triggerHaptic(); setActiveModal(null); }}>
                  <Ionicons name="close" size={24} color="#707979" />
                </Pressable>
              )}
            </View>

            {matchmakingStatus === 'matched' ? (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 30, paddingVertical: 20 }}>
                {/* Versus Layout */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingHorizontal: 10 }}>
                  {/* Left: Player */}
                  <View style={{ alignItems: 'center', gap: 10, flex: 1 }}>
                    <View style={[styles.profileAvatarContainer, { borderColor: '#00F2FF', backgroundColor: 'rgba(0, 242, 255, 0.08)' }]}>
                      <Ionicons name="person" size={28} color="#00F2FF" />
                    </View>
                    <Text numberOfLines={1} style={{ fontFamily: 'Montserrat_700Bold', fontSize: 14, color: '#FFFFFF', textAlign: 'center' }}>
                      {user?.username}
                    </Text>
                    <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 10, color: '#00F2FF', backgroundColor: 'rgba(0, 242, 255, 0.1)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 }}>
                      YOU
                    </Text>
                  </View>

                  {/* Middle: VS badge */}
                  <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: '#0B0F12', borderWidth: 2, borderColor: '#FF4B2B', alignItems: 'center', justifyContent: 'center', shadowColor: '#FF4B2B', shadowRadius: 10, shadowOpacity: 0.5 }}>
                    <Text style={{ fontFamily: 'Montserrat_900Black', fontSize: 16, color: '#FF4B2B', letterSpacing: 0.5 }}>VS</Text>
                  </View>

                  {/* Right: Opponent */}
                  <View style={{ alignItems: 'center', gap: 10, flex: 1 }}>
                    <View style={[styles.profileAvatarContainer, { borderColor: '#FF416C', backgroundColor: 'rgba(255, 65, 108, 0.08)' }]}>
                      <Ionicons name="flash" size={28} color="#FF416C" />
                    </View>
                    <Text numberOfLines={1} style={{ fontFamily: 'Montserrat_700Bold', fontSize: 14, color: '#FFFFFF', textAlign: 'center' }}>
                      {matchedOpponent?.name}
                    </Text>
                    <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 10, color: '#FF416C', backgroundColor: 'rgba(255, 65, 108, 0.1)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 }}>
                      OPPONENT
                    </Text>
                  </View>
                </View>

                {/* Countdown */}
                <View style={{ alignItems: 'center', gap: 8 }}>
                  <Text style={{ fontFamily: 'Montserrat_900Black', fontSize: 36, color: '#FF4B2B' }}>
                    {matchCountdown}
                  </Text>
                  <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 12, color: '#707979', letterSpacing: 1 }}>
                    {language === 'VI' ? 'ĐANG VÀO TRẬN ĐẤU...' : 'ENTERING THE ARENA...'}
                  </Text>
                </View>
              </View>
            ) : roomMode === 'menu' ? (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 20, paddingBottom: 15 }}>
                {roomError && (
                  <Text style={{ color: '#FF4B2B', fontFamily: 'Montserrat_600SemiBold', fontSize: 12, textAlign: 'center' }}>
                    {roomError}
                  </Text>
                )}

                {/* 1. Quick Match */}
                <View style={{ gap: 8 }}>
                  <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 12, color: '#707979' }}>
                    {language === 'VI' ? '1. ĐẤU NHANH VỚI MỌI NGƯỜI' : '1. QUICK VERSUS BATTLE'}
                  </Text>
                  <Pressable
                    onPress={() => { triggerHaptic(); setRoomMode('quick-match'); }}
                    style={({ pressed }) => [
                      {
                        backgroundColor: '#FF4B2B',
                        paddingVertical: 14,
                        borderRadius: 10,
                        alignItems: 'center',
                        justifyContent: 'center',
                        shadowColor: '#FF4B2B',
                        shadowRadius: 10,
                        shadowOpacity: 0.4,
                        elevation: 4,
                        opacity: pressed ? 0.9 : 1,
                      }
                    ]}
                  >
                    <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#FFFFFF', fontSize: 14, letterSpacing: 0.5 }}>
                      {language === 'VI' ? 'TÌM TRẬN NHANH / QUICK MATCH' : 'START QUICK MATCH'}
                    </Text>
                  </Pressable>
                </View>

                {/* 2. Create Room */}
                <View style={{ gap: 8, borderTopWidth: 1, borderTopColor: '#202D33', paddingTop: 15 }}>
                  <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 12, color: '#707979' }}>
                    {language === 'VI' ? '2. TẠO PHÒNG THÁCH ĐẤU' : '2. CREATE MULTIPLAYER ROOM'}
                  </Text>
                  
                  {/* Public/Private Room Toggle */}
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <Pressable
                      onPress={() => { triggerHaptic(); setRoomType('public'); }}
                      style={{
                        flex: 1,
                        paddingVertical: 10,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: roomType === 'public' ? '#00F2FF' : '#202D33',
                        backgroundColor: roomType === 'public' ? 'rgba(0, 242, 255, 0.08)' : '#12181B',
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ fontFamily: 'Montserrat_700Bold', color: roomType === 'public' ? '#00F2FF' : '#707979', fontSize: 12 }}>
                        {language === 'VI' ? 'PHÒNG TỰ DO' : 'PUBLIC'}
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={() => { triggerHaptic(); setRoomType('private'); }}
                      style={{
                        flex: 1,
                        paddingVertical: 10,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: roomType === 'private' ? '#00F2FF' : '#202D33',
                        backgroundColor: roomType === 'private' ? 'rgba(0, 242, 255, 0.08)' : '#12181B',
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ fontFamily: 'Montserrat_700Bold', color: roomType === 'private' ? '#00F2FF' : '#707979', fontSize: 12 }}>
                        {language === 'VI' ? 'PHÒNG RIÊNG TƯ' : 'PRIVATE'}
                      </Text>
                    </Pressable>
                  </View>

                  <Pressable
                    onPress={handleCreateRoom}
                    disabled={roomLoading}
                    style={({ pressed }) => [
                      {
                        backgroundColor: '#00F2FF',
                        paddingVertical: 12,
                        borderRadius: 10,
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: roomLoading ? 0.6 : (pressed ? 0.9 : 1),
                      }
                    ]}
                  >
                    <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#0B0F12', fontSize: 13 }}>
                      {roomLoading ? '...' : (language === 'VI' ? 'TẠO PHÒNG MỚI' : 'CREATE ROOM')}
                    </Text>
                  </Pressable>
                </View>

                {/* 3. Join Room Code */}
                <View style={{ gap: 8, borderTopWidth: 1, borderTopColor: '#202D33', paddingTop: 15 }}>
                  <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 12, color: '#707979' }}>
                    {language === 'VI' ? '3. VÀO PHÒNG BẰNG MÃ' : '3. ENTER ROOM CODE'}
                  </Text>
                  
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TextInput
                      value={roomCodeInput}
                      onChangeText={(txt) => { setRoomCodeInput(txt); setRoomError(null); }}
                      placeholder={language === 'VI' ? 'Nhập mã 5 số...' : 'Enter 5-digit code...'}
                      placeholderTextColor="#707979"
                      keyboardType="number-pad"
                      maxLength={5}
                      style={{
                        flex: 1,
                        backgroundColor: '#12181B',
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: '#202D33',
                        color: '#FFFFFF',
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                        fontFamily: 'Montserrat_500Medium',
                        fontSize: 13,
                      }}
                    />
                    <Pressable
                      onPress={() => handleJoinRoom(roomCodeInput)}
                      disabled={roomLoading}
                      style={{
                        backgroundColor: '#BF00FF',
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        borderRadius: 8,
                        justifyContent: 'center',
                        alignItems: 'center',
                        opacity: roomLoading ? 0.6 : 1,
                      }}
                    >
                      <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#FFFFFF', fontSize: 12 }}>
                        {language === 'VI' ? 'VÀO PHÒNG' : 'JOIN'}
                      </Text>
                    </Pressable>
                  </View>
                </View>

                {/* 4. Public Rooms List */}
                <View style={{ gap: 8, borderTopWidth: 1, borderTopColor: '#202D33', paddingTop: 15 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 12, color: '#707979' }}>
                      {language === 'VI' ? '4. DANH SÁCH PHÒNG TỰ DO' : '4. PUBLIC ROOMS LOBBY'}
                    </Text>
                    <Pressable onPress={loadPublicRooms} style={{ padding: 4 }}>
                      <Ionicons name="refresh" size={16} color="#00F2FF" />
                    </Pressable>
                  </View>

                  {roomLoading ? (
                    <Text style={{ fontFamily: 'Montserrat_500Medium', fontSize: 12, color: '#707979', textAlign: 'center' }}>
                      Đang tải danh sách...
                    </Text>
                  ) : publicRooms.length === 0 ? (
                    <Text style={{ fontFamily: 'Montserrat_500Medium', fontSize: 12, color: '#707979', textAlign: 'center', fontStyle: 'italic', paddingVertical: 5 }}>
                      {language === 'VI' ? 'Không có phòng tự do nào đang chờ' : 'No public rooms waiting'}
                    </Text>
                  ) : (
                    publicRooms.map((room) => (
                      <View
                        key={room.roomId}
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          backgroundColor: '#12181B',
                          borderRadius: 8,
                          padding: 10,
                          borderWidth: 1,
                          borderColor: '#202D33',
                        }}
                      >
                        <View style={{ gap: 2 }}>
                          <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 13, color: '#FFFFFF' }}>
                            {room.creator?.name}
                          </Text>
                          <Text style={{ fontFamily: 'Montserrat_500Medium', fontSize: 11, color: '#00F2FF' }}>
                            Mã: {room.roomId}
                          </Text>
                        </View>
                        <Pressable
                          onPress={() => handleJoinRoom(room.roomId)}
                          style={{
                            backgroundColor: '#00F2FF',
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 6,
                          }}
                        >
                          <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#0B0F12', fontSize: 11 }}>
                            {language === 'VI' ? 'THAM GIA' : 'JOIN'}
                          </Text>
                        </Pressable>
                      </View>
                    ))
                  )}
                </View>
              </ScrollView>
            ) : roomMode === 'quick-match' ? (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24, paddingVertical: 20 }}>
                {/* Circular pulsing radar indicator */}
                <View style={styles.radarOuter}>
                  <View style={styles.radarMiddle}>
                    <View style={styles.radarInner}>
                      <Ionicons name="scan-outline" size={32} color="#FF4B2B" />
                    </View>
                  </View>
                </View>

                {/* Queue details */}
                <View style={{ alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 18, color: '#FFFFFF' }}>
                    {Math.floor(matchmakingTimer / 60).toString().padStart(2, '0')}:{(matchmakingTimer % 60).toString().padStart(2, '0')}
                  </Text>
                  <Text style={{ fontFamily: 'Montserrat_500Medium', fontSize: 13, color: '#707979' }}>
                    {matchmakingTimer < 2
                      ? (language === 'VI' ? 'Đang kết nối đấu trường...' : 'Connecting to matchmaker...')
                      : matchmakingTimer < 5
                      ? (language === 'VI' ? 'Đang tìm đối thủ xứng tầm...' : 'Searching for opponent...')
                      : (language === 'VI' ? 'Đang tạo phòng đấu với AI...' : 'Creating AI opponent room...')}
                  </Text>
                </View>

                <Pressable
                  onPress={handleLeaveRoom}
                  style={[styles.dangerBtn, { width: '100%', marginTop: 10 }]}
                >
                  <Text style={styles.dangerBtnText}>
                    {language === 'VI' ? 'HỦY TÌM TRẬN / CANCEL' : 'CANCEL MATCHMAKING'}
                  </Text>
                </Pressable>
              </View>
            ) : roomMode === 'hosting' ? (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24, paddingVertical: 20 }}>
                {/* Big Code display */}
                <View style={{ alignItems: 'center', gap: 8 }}>
                  <Text style={{ fontFamily: 'Montserrat_500Medium', fontSize: 12, color: '#707979', letterSpacing: 1 }}>
                    {currentRoom?.isPrivate
                      ? (language === 'VI' ? 'MÃ PHÒNG RIÊNG TƯ' : 'PRIVATE ROOM CODE')
                      : (language === 'VI' ? 'MÃ PHÒNG TỰ DO' : 'PUBLIC ROOM CODE')}
                  </Text>
                  <Text style={{ fontFamily: 'Montserrat_900Black', fontSize: 42, color: '#00F2FF', letterSpacing: 4 }}>
                    {currentRoom?.roomId}
                  </Text>
                </View>

                <View style={{ width: '100%', gap: 12, backgroundColor: '#12181B', padding: 16, borderRadius: 10, borderWidth: 1, borderColor: '#202D33' }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#707979', fontSize: 12 }}>Chủ phòng:</Text>
                    <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#FFFFFF', fontSize: 13 }}>{user?.username}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#707979', fontSize: 12 }}>Khách:</Text>
                    <Text style={{ fontFamily: 'Montserrat_500Medium', color: '#FF416C', fontSize: 13, fontStyle: 'italic' }}>Đang chờ đối thủ tham gia...</Text>
                  </View>
                </View>

                <Pressable
                  onPress={handleLeaveRoom}
                  style={[styles.dangerBtn, { width: '100%' }]}
                >
                  <Text style={styles.dangerBtnText}>
                    {language === 'VI' ? 'HỦY PHÒNG / CANCEL' : 'CANCEL ROOM'}
                  </Text>
                </Pressable>
              </View>
            ) : (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24, paddingVertical: 20 }}>
                {/* Joining Screen */}
                <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 18, color: '#FFFFFF' }}>
                  {language === 'VI' ? 'ĐANG CHỜ CHỦ PHÒNG BẮT ĐẦU...' : 'WAITING FOR HOST TO START...'}
                </Text>
                <Text style={{ fontFamily: 'Montserrat_500Medium', fontSize: 13, color: '#707979' }}>
                  Bạn đã tham gia phòng {currentRoom?.roomId} của {currentRoom?.creator?.name}
                </Text>

                <Pressable
                  onPress={handleLeaveRoom}
                  style={[styles.dangerBtn, { width: '100%', marginTop: 20 }]}
                >
                  <Text style={styles.dangerBtnText}>
                    {language === 'VI' ? 'RỜI PHÒNG / LEAVE' : 'LEAVE ROOM'}
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        </Animated.View>
      )}

    </View>
  );
}

/* --- HOLOGRAPHIC ORB GRAPHIC --- */
function HolographicOrb() {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 12000, easing: Easing.linear }),
      -1,
      false
    );
    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [rotation, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }, { scale: scale.value }],
  }));

  return (
    <View style={styles.orbContainer}>
      {/* Outer Dotted Circle Ring */}
      <Animated.View style={[styles.orbRingOuter, animatedStyle]} />
      {/* Middle Glowing Ring */}
      <View style={styles.orbRingMiddle} />
      {/* Inner Central Ring */}
      <View style={styles.orbRingInner}>
        <LinearGradient
          colors={['rgba(0, 242, 255, 0.1)', 'rgba(191, 0, 255, 0.1)']}
          style={styles.orbFill}
        >
          <Ionicons name="pulse" size={48} color="#00F2FF" style={styles.orbIcon} />
        </LinearGradient>
      </View>

      {/* Floating Hand Touches Indicators */}
      <View style={[styles.handIndicator, { left: -10, borderColor: '#00F2FF', shadowColor: '#00F2FF' }]}>
        <Ionicons name="finger-print" size={18} color="#00F2FF" />
      </View>
      <View style={[styles.handIndicator, { right: -10, borderColor: '#BF00FF', shadowColor: '#BF00FF' }]}>
        <Ionicons name="finger-print" size={18} color="#BF00FF" />
      </View>
    </View>
  );
}

/* --- GRID MENU CARD --- */
function MenuCard({
  icon,
  title,
  subtitle,
  accentColor,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  accentColor: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuCard,
        { borderColor: pressed ? accentColor : '#202D33' },
      ]}
    >
      <View style={[styles.menuCardIconBg, { borderColor: accentColor }]}>
        <Ionicons name={icon} size={20} color={accentColor} />
      </View>
      <View style={{ gap: 2 }}>
        <Text style={styles.menuCardTitle}>{title}</Text>
        <Text style={styles.menuCardSubtitle}>{subtitle}</Text>
      </View>
    </Pressable>
  );
}

/* --- STEP CARD --- */
function InstructionStep({
  step,
  title,
  desc,
  color,
}: {
  step: string;
  title: string;
  desc: string;
  color: string;
}) {
  return (
    <View style={styles.stepCard}>
      <View style={[styles.stepBadge, { backgroundColor: color }]}>
        <Text style={styles.stepBadgeText}>{step}</Text>
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepDesc}>{desc}</Text>
      </View>
    </View>
  );
}

/* --- LEADERBOARD ROW --- */
function LeaderboardRow({
  rank,
  name,
  title,
  score,
  color,
  isUser = false,
}: {
  rank: number;
  name: string;
  title: string;
  score: string;
  color: string;
  isUser?: boolean;
}) {
  return (
    <View style={[styles.rankRow, isUser && styles.rankRowUser]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Text style={[styles.rankNumber, { color }]}>#{rank}</Text>
        <View style={styles.avatarPlaceholder}>
          <Ionicons name="person" size={14} color="#707979" />
        </View>
        <View style={{ gap: 2 }}>
          <Text style={[styles.rankName, isUser && { color: '#00F2FF', fontFamily: 'Montserrat_700Bold' }]}>{name}</Text>
          <Text style={styles.rankTier}>{title}</Text>
        </View>
      </View>
      <Text style={styles.rankScore}>{score} PTS</Text>
    </View>
  );
}

/* --- PRACTICE CATEGORY --- */
function PracticeCategoryCard({
  id,
  title,
  desc,
  shapes,
  selected,
  onPress,
}: {
  id: string;
  title: string;
  desc: string;
  shapes: string[];
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.practiceCard,
        selected && { borderColor: '#00F2FF', backgroundColor: 'rgba(0, 242, 255, 0.03)' },
      ]}
    >
      <Text style={[styles.practiceCardTitle, selected && { color: '#00F2FF' }]}>{title}</Text>
      <Text style={styles.practiceCardDesc}>{desc}</Text>
      <View style={styles.practiceShapesRow}>
        <View style={styles.practiceShapeBullet} />
        <View style={[styles.practiceShapeBullet, { backgroundColor: '#BF00FF' }]} />
      </View>
    </Pressable>
  );
}

/* --- DIFFICULTY CARD --- */
function DifficultyCard({
  level,
  label,
  selected,
  color,
  onPress,
}: {
  level: string;
  label: string;
  selected: boolean;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.diffCard,
        selected && { borderColor: color, backgroundColor: 'rgba(255, 255, 255, 0.02)' },
      ]}
    >
      <Ionicons name={level === 'HARD' ? 'flash' : level === 'NORMAL' ? 'bulb' : 'happy'} size={20} color={selected ? color : '#707979'} />
      <Text style={[styles.diffLevel, selected && { color }]}>{level}</Text>
      <Text style={styles.diffLabel}>{label}</Text>
    </Pressable>
  );
}

/* --- STYLES --- */
const styles = StyleSheet.create({
  // Holographic Orb styles
  orbContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  orbRingOuter: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 242, 255, 0.12)',
    borderStyle: 'dashed',
  },
  orbRingMiddle: {
    position: 'absolute',
    width: 154,
    height: 154,
    borderRadius: 77,
    borderWidth: 1.5,
    borderColor: 'rgba(191, 0, 255, 0.15)',
  },
  orbRingInner: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: 'rgba(0, 242, 255, 0.35)',
    overflow: 'hidden',
    boxShadow: '0 0 20px rgba(0, 242, 255, 0.15)',
  },
  orbFill: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orbIcon: {
    textShadowColor: 'rgba(0, 242, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  handIndicator: {
    position: 'absolute',
    top: '40%',
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    backgroundColor: '#0B0F12',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
  },

  // Grid Menu styles
  menuCard: {
    flex: 1,
    backgroundColor: '#12181B',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#202D33',
    padding: 16,
    gap: 12,
    borderCurve: 'continuous',
  },
  menuCardIconBg: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuCardTitle: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 14.5,
    color: '#FFFFFF',
  },
  menuCardSubtitle: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 11.5,
    color: '#707979',
  },

  // Modal styles
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 8, 10, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%',
    backgroundColor: '#12181B',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#202D33',
    padding: 20,
    gap: 16,
    borderCurve: 'continuous',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#202D33',
    paddingBottom: 12,
  },
  modalTitle: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  closeBtn: {
    backgroundColor: '#202D33',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    borderCurve: 'continuous',
  },
  closeBtnText: {
    fontFamily: 'Montserrat_700Bold',
    color: '#FFFFFF',
    fontSize: 13.5,
    letterSpacing: 1,
  },

  // Instructions Modal styles
  instructionsVisual: {
    height: 120,
    backgroundColor: '#0B0F12',
    borderRadius: 12,
    flexDirection: 'row',
    position: 'relative',
    overflow: 'hidden',
  },
  canvasHalf: {
    flex: 1,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  canvasLabel: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 9,
    letterSpacing: 1,
  },
  targetShapeShape: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  vsBadge: {
    position: 'absolute',
    alignSelf: 'center',
    left: '42%',
    backgroundColor: '#FF007F',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
  },
  stepCard: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  stepBadge: {
    width: 54,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepBadgeText: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 10,
    color: '#FFFFFF',
  },
  stepTitle: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 13.5,
    color: '#FFFFFF',
  },
  stepDesc: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 12,
    color: '#707979',
    lineHeight: 16,
  },

  // Leaderboard styles
  challengeCard: {
    padding: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  challengeTitle: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 11,
    color: '#00F2FF',
    letterSpacing: 0.5,
  },
  challengeDesc: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 11.5,
    color: '#E1E4E6',
    lineHeight: 15,
  },
  challengeAction: {
    alignItems: 'center',
    gap: 6,
  },
  challengeTimer: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 10,
    color: '#FF007F',
  },
  challengeBtn: {
    backgroundColor: '#00F2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  challengeBtnText: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 10,
    color: '#0B0F12',
  },
  rankRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    borderWidth: 1,
    borderColor: '#202D33',
    padding: 12,
    borderRadius: 12,
  },
  rankRowUser: {
    borderColor: '#00F2FF',
    backgroundColor: 'rgba(0, 242, 255, 0.02)',
  },
  rankNumber: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 14,
    width: 24,
  },
  avatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1D2428',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankName: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  rankTier: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 10,
    color: '#707979',
  },
  rankScore: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 12.5,
    color: '#E1E4E6',
  },

  // Practice Mode styles
  sectionSubtitle: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 12,
    color: '#707979',
    letterSpacing: 0.5,
  },
  practiceCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    borderWidth: 1.5,
    borderColor: '#202D33',
    borderRadius: 14,
    padding: 14,
    gap: 8,
    borderCurve: 'continuous',
  },
  practiceCardTitle: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  practiceCardDesc: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 11,
    color: '#707979',
    lineHeight: 14,
  },
  practiceShapesRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  practiceShapeBullet: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#00F2FF',
  },
  practicePreviewZone: {
    backgroundColor: '#0B0F12',
    borderWidth: 1,
    borderColor: '#202D33',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  previewTitle: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 10,
    color: '#707979',
    letterSpacing: 1,
  },

  // Settings styles
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  settingsLabel: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 13.5,
    color: '#FFFFFF',
  },
  tabSegments: {
    flexDirection: 'row',
    backgroundColor: '#0B0F12',
    borderRadius: 8,
    padding: 3,
    borderWidth: 1,
    borderColor: '#202D33',
  },
  segmentBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  segmentBtnActive: {
    backgroundColor: '#202D33',
  },
  segmentText: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 11,
    color: '#707979',
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
  diffCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    borderWidth: 1.5,
    borderColor: '#202D33',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 6,
  },
  diffLevel: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 11,
    color: '#707979',
  },
  diffLabel: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 10.5,
    color: '#707979',
  },
  dangerBtn: {
    borderColor: '#FF5252',
    borderWidth: 1.2,
    backgroundColor: 'rgba(255, 82, 82, 0.05)',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  dangerBtnText: {
    fontFamily: 'Montserrat_700Bold',
    color: '#FF5252',
    fontSize: 12,
  },

  // Auth Styles
  authTabContainer: {
    flexDirection: 'row',
    backgroundColor: '#0B0F12',
    borderRadius: 10,
    padding: 3,
    borderWidth: 1,
    borderColor: '#202D33',
    width: 220,
  },
  authTabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  authTabBtnActive: {
    backgroundColor: '#12181B',
    borderWidth: 1,
    borderColor: '#202D33',
  },
  authTabLabel: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 11,
    color: '#707979',
    letterSpacing: 0.5,
  },
  authTabLabelActive: {
    color: '#00F2FF',
  },
  authErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 82, 82, 0.08)',
    borderColor: 'rgba(255, 82, 82, 0.25)',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    gap: 8,
  },
  authErrorText: {
    flex: 1,
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 12,
    color: '#FF5252',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B0F12',
    borderWidth: 1.5,
    borderColor: '#202D33',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  textInput: {
    flex: 1,
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 13,
    color: '#FFFFFF',
    padding: 0,
  },
  authSubmitBtn: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  authSubmitGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authSubmitText: {
    fontFamily: 'Montserrat_700Bold',
    color: '#FFFFFF',
    fontSize: 13.5,
    letterSpacing: 1,
  },
  authDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 4,
  },
  authDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#202D33',
  },
  authDividerText: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 9.5,
    color: '#707979',
    letterSpacing: 0.5,
  },
  googleSignInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1.5,
    borderColor: '#202D33',
    borderRadius: 12,
    paddingVertical: 12,
  },
  googleSignInText: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  profileAvatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 242, 255, 0.08)',
    borderWidth: 1.5,
    borderColor: '#00F2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radarOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: 'rgba(255, 75, 43, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
  },
  radarMiddle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: 'rgba(255, 75, 43, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 75, 43, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FF4B2B',
  },
});
