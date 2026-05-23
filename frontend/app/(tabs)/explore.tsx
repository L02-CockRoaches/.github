import { api, getToken } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

type GameState = 'get-ready' | 'playing' | 'success' | 'mismatch' | 'game-over';

interface Point {
  x: number;
  y: number;
}

// Per-round shape configurations
interface RoundShapeConfig {
  leftLabel: string;
  leftGuide: string;
  rightLabel: string;
  rightGuide: string;
}

const ROUND_SHAPES: RoundShapeConfig[] = [
  { leftLabel: 'Vẽ hình Tròn',     leftGuide: 'Vẽ đường tròn khép kín',      rightLabel: 'Vẽ hình Vuông nghiêng', rightGuide: 'Vẽ hình vuông nghiêng' },
  { leftLabel: 'Vẽ hình Oval',     leftGuide: 'Vẽ hình bầu dục khép kín',   rightLabel: 'Vẽ hình Tam giác',      rightGuide: 'Vẽ hình tam giác khép kín' },
  { leftLabel: 'Vẽ hình Tròn lớn', leftGuide: 'Vẽ đường tròn lớn khép kín', rightLabel: 'Vẽ hình Chữ nhật',      rightGuide: 'Vẽ hình chữ nhật khép kín' },
];

/** Equilateral triangle outline built from 3 rotated View lines. */
function TriangleOutline({ size, color }: { size: number; color: string }) {
  const h = size * Math.sqrt(3) / 2;
  const line = { position: 'absolute' as const, height: 2, backgroundColor: color };
  return (
    <View style={{ width: size, height: h }}>
      <View style={[line, { left: 0, top: h - 2, width: size }]} />
      <View style={[line, { left: -(size / 4), top: h / 2 - 1, width: size, transform: [{ rotate: '-60deg' }] }]} />
      <View style={[line, { left: size / 4,    top: h / 2 - 1, width: size, transform: [{ rotate: '60deg'  }] }]} />
    </View>
  );
}

export default function Explore() {
  const params = useLocalSearchParams();
  const isVersusMode = params.mode === 'versus';
  const opponentName = (params.opponentName as string) || 'Đối thủ';

  const [gameState, setGameState] = useState<GameState>('get-ready');
  const [countdown, setCountdown] = useState(3);
  const [timer, setTimer] = useState(10);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const currentShape = ROUND_SHAPES[(round - 1) % ROUND_SHAPES.length];
  const [streak, setStreak] = useState(0);
  const [accuracy, setAccuracy] = useState(96);
  
  // Opponent States for Versus Mode
  const [opponentScore, setOpponentScore] = useState(0);
  const [opponentAccuracy, setOpponentAccuracy] = useState(92);
  const [opponentStatus, setOpponentStatus] = useState<'drawing' | 'done'>('drawing');
  const [surrendered, setSurrendered] = useState(false);
  const [opponentSurrendered, setOpponentSurrendered] = useState(false);
  const [rematchStatus, setRematchStatus] = useState<'idle' | 'sending' | 'accepted'>('idle');

  // Drawing states
  const [leftLines, setLeftLines] = useState<Point[]>([]);
  const [rightLines, setRightLines] = useState<Point[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  // Layout refs
  const leftCanvasRef = useRef<View>(null);
  const rightCanvasRef = useRef<View>(null);
  const splitContainerRef = useRef<View>(null);
  const containerPageX = useRef(0);
  const containerPageY = useRef(0);
  const containerWidth = useRef(0);

  // Multi-touch simultaneous drawing tracking refs
  const isLeftActive = useRef(false);
  const isRightActive = useRef(false);
  const overlappedTouch = useRef(false);
  // Prevent validateDrawing from being called more than once per round
  const hasValidated = useRef(false);
  // Stable refs for callbacks — kept in sync via useEffect after function declarations below
  const timerRef = useRef(10);
  const handleOpponentSurrenderRef = useRef<(() => void) | null>(null);
  const handleRoundTimeoutRef = useRef<(() => void) | null>(null);
  const validateDrawingRef = useRef<(() => void) | null>(null);

  const triggerHaptic = (style = Haptics.ImpactFeedbackStyle.Light) => {
    Haptics.impactAsync(style).catch(() => {});
  };

  const handleSurrender = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
    setScore(0);
    setSurrendered(true);
    setGameState('game-over');
    if (getToken()) {
      api.postScore(0, 0, 45, 2);
    }
  };

  const handleOpponentSurrender = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    setOpponentScore(0);
    setOpponentSurrendered(true);
    setGameState('game-over');
    if (getToken()) {
      api.postScore(score, accuracy / 100, 45, 2);
    }
  };

  // 1. Get Ready Countdown Timer
  useEffect(() => {
    if (gameState !== 'get-ready') return;
    
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setGameState('playing');
          setTimer(10);
          setLeftLines([]);
          setRightLines([]);
          // Reset multi-touch refs for the new round
          overlappedTouch.current = false;
          isLeftActive.current = false;
          isRightActive.current = false;
          hasValidated.current = false;
          return 0;
        }
        triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState, round]);

  // 2. Core Gameplay Countdown Timer
  useEffect(() => {
    if (gameState !== 'playing' || isPaused) return;

    const interval = setInterval(() => {
      // Simulate 1.5% chance per second of opponent surrendering in versus mode!
      if (isVersusMode && Math.random() < 0.015) {
        clearInterval(interval);
        handleOpponentSurrenderRef.current?.();
        return;
      }

      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleRoundTimeoutRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState, isPaused, isVersusMode]);

  // 3. Versus Mode: Opponent Drawing Simulation Loop
  useEffect(() => {
    if (!isVersusMode || gameState !== 'playing' || isPaused) return;

    // Reset opponent state for the round
    setRightLines([]);
    setOpponentStatus('drawing');

    // Build opponent drawing path based on current round
    const cx = 100;
    const cy = 130;

    const interp = (p1: Point, p2: Point, count: number): Point[] => {
      const pts: Point[] = [];
      for (let i = 0; i <= count; i++) {
        const t = i / count;
        pts.push({
          x: p1.x + (p2.x - p1.x) * t + (Math.random() - 0.5) * 3,
          y: p1.y + (p2.y - p1.y) * t + (Math.random() - 0.5) * 3,
        });
      }
      return pts;
    };

    let fullPath: Point[];

    if (round === 2) {
      // Triangle (equilateral)
      const s = 100;
      const h = s * Math.sqrt(3) / 2;
      const top        = { x: cx,         y: cy - h / 2 };
      const bottomLeft  = { x: cx - s / 2, y: cy + h / 2 };
      const bottomRight = { x: cx + s / 2, y: cy + h / 2 };
      fullPath = [...interp(top, bottomRight, 10), ...interp(bottomRight, bottomLeft, 10), ...interp(bottomLeft, top, 10)];
    } else if (round === 3) {
      // Rectangle
      const rw = 120, rh = 80;
      const tl = { x: cx - rw / 2, y: cy - rh / 2 };
      const tr = { x: cx + rw / 2, y: cy - rh / 2 };
      const br = { x: cx + rw / 2, y: cy + rh / 2 };
      const bl = { x: cx - rw / 2, y: cy + rh / 2 };
      fullPath = [...interp(tl, tr, 10), ...interp(tr, br, 6), ...interp(br, bl, 10), ...interp(bl, tl, 6)];
    } else {
      // Round 1: Tilted square (diamond)
      const size = 55;
      const v1 = { x: cx,        y: cy - size };
      const v2 = { x: cx + size, y: cy        };
      const v3 = { x: cx,        y: cy + size };
      const v4 = { x: cx - size, y: cy        };
      fullPath = [...interp(v1, v2, 8), ...interp(v2, v3, 8), ...interp(v3, v4, 8), ...interp(v4, v1, 8)];
    }

    let currentIdx = 0;
    const drawInterval = setInterval(() => {
      if (currentIdx >= fullPath.length) {
        clearInterval(drawInterval);
        setOpponentStatus('done');
        // Add round score increment for the opponent
        setOpponentScore((prev) => prev + 2300 + Math.floor(Math.random() * 300));
        return;
      }

      setRightLines((prev) => [...prev, fullPath[currentIdx]]);
      currentIdx += 1;
    }, 130);

    return () => clearInterval(drawInterval);
  }, [gameState, isVersusMode, isPaused, round]);

  // 4. Versus Mode: Fast-forward round if opponent is done and user has already drawn
  useEffect(() => {
    if (!isVersusMode || gameState !== 'playing' || opponentStatus !== 'done' || isPaused) return;

    if (leftLines.length > 8) {
      validateDrawingRef.current?.();
    }
  }, [opponentStatus, leftLines.length, gameState, isVersusMode, isPaused]);

  // Unified multi-touch handler on the parent container
  const handleSplitContainerLayout = () => {
    splitContainerRef.current?.measure((_x, _y, width, _height, pageX, pageY) => {
      containerPageX.current = pageX;
      containerPageY.current = pageY;
      containerWidth.current = width;
    });
  };

  const handleParentResponderMove = (e: any) => {
    if (gameState !== 'playing' || isPaused) return;
    const nativeEvent = e.nativeEvent;
    const midPageX = containerPageX.current + containerWidth.current / 2;

    // On native: use touches array (multi-touch). On web (mouse): fall back to pageX/pageY.
    const pointers: { pageX: number; pageY: number }[] =
      nativeEvent.touches && nativeEvent.touches.length > 0
        ? Array.from(nativeEvent.touches)
        : nativeEvent.pageX != null
          ? [{ pageX: nativeEvent.pageX, pageY: nativeEvent.pageY }]
          : [];

    let latestLeft: Point | null = null;
    let latestRight: Point | null = null;
    let hasLeft = false;
    let hasRight = false;

    for (const pointer of pointers) {
      const localX = pointer.pageX - containerPageX.current;
      const localY = pointer.pageY - containerPageY.current;
      if (isNaN(localX) || isNaN(localY)) continue;
      if (pointer.pageX < midPageX) {
        hasLeft = true;
        latestLeft = { x: localX, y: localY };
      } else if (!isVersusMode) {
        hasRight = true;
        latestRight = { x: localX - containerWidth.current / 2, y: localY };
      }
    }

    if (hasLeft) isLeftActive.current = true;
    if (hasRight) isRightActive.current = true;
    // On web (mouse), a single cursor can only be on one side at a time —
    // treat any drawing activity as "simultaneous" so the game is still playable.
    if (hasLeft && hasRight) overlappedTouch.current = true;
    if (Platform.OS === 'web' && (hasLeft || hasRight)) overlappedTouch.current = true;

    if (latestLeft) setLeftLines((prev) => [...prev.slice(-40), latestLeft!]);
    if (latestRight) setRightLines((prev) => [...prev.slice(-40), latestRight!]);
  };

  const handleTouchEnd = () => {
    if (isVersusMode) {
      if (leftLines.length > 8) {
        validateDrawing();
      }
    } else {
      if (leftLines.length > 8 && rightLines.length > 8) {
        validateDrawing();
      }
    }
  };

  const validateDrawing = () => {
    // Guard: only validate once per round
    if (hasValidated.current) return;
    hasValidated.current = true;

    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);

    // Chơi đơn yêu cầu phải vẽ đồng thời cả 2 tay cùng lúc
    if (!isVersusMode && !overlappedTouch.current) {
      setGameState('mismatch');
      setStreak(0);
      setAccuracy((prev) => Math.max(70, prev - 6));
      return;
    }

    const isSuccess = Math.random() > 0.15; // 85% success rate simulation

    if (isSuccess) {
      setGameState('success');
      setScore((prev) => prev + 2500 + timerRef.current * 100);
      setStreak((prev) => prev + 1);
    } else {
      setGameState('mismatch');
      setStreak(0);
      setAccuracy((prev) => Math.max(70, prev - 4));
    }

    if (isVersusMode) {
      const opponentSuccess = Math.random() > 0.20; // 80% success rate
      if (opponentSuccess) {
        setOpponentAccuracy((prev) => Math.min(100, prev + Math.floor(Math.random() * 2)));
      } else {
        setOpponentAccuracy((prev) => Math.max(65, prev - Math.floor(Math.random() * 5)));
      }
    }
  };

  const handleRoundTimeout = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
    setGameState('mismatch');
    setStreak(0);
    setAccuracy((prev) => Math.max(70, prev - 6));
    if (isVersusMode) {
      setOpponentAccuracy((prev) => Math.max(65, prev - 4));
    }
  };

  // Sync all stable callback refs and timerRef after every render
  useEffect(() => { timerRef.current = timer; }, [timer]);
  useEffect(() => { handleRoundTimeoutRef.current = handleRoundTimeout; });
  useEffect(() => { validateDrawingRef.current = validateDrawing; });

  const handleNextRound = () => {
    triggerHaptic();
    if (round >= 3) {
      setGameState('game-over');
      // Submit score to NestJS database if logged in
      if (getToken()) {
        // gameId = 2: Shape Sorter
        api.postScore(score, accuracy / 100, 45, 2).then((res) => {
          if (res.success) {
            console.log('Score saved to NestJS database successfully:', res.data);
          } else {
            console.warn('Failed to save score:', res.error);
          }
        });
      }
    } else {
      setRound((prev) => prev + 1);
      setGameState('get-ready');
    }
  };

  const handleRestartGame = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    setRound(1);
    setScore(0);
    setStreak(0);
    setAccuracy(96);
    setOpponentScore(0);
    setOpponentAccuracy(92);
    setSurrendered(false);
    setOpponentSurrendered(false);
    setRematchStatus('idle');
    setGameState('get-ready');
  };

  const handleRematch = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    setRematchStatus('sending');
    setTimeout(() => {
      setRematchStatus('accepted');
      setTimeout(() => {
        handleRestartGame();
      }, 1000);
    }, 1500);
  };

  const handleGoHome = () => {
    triggerHaptic();
    router.replace('/(tabs)/home');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0B0F12' }}>
      
      {/* --- 1. GET READY STATE --- */}
      {gameState === 'get-ready' && (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.fullscreenCentered}>
          <Text style={styles.readyTitle}>Get Ready!</Text>
          <Text style={styles.readySubTitle}>Chuẩn bị vẽ song song hai hình!</Text>

          <View style={styles.readyVisualContainer}>
            {/* Left Box Preview */}
            <View style={[styles.readyBoxHalf, { borderColor: '#00E5FF' }]}>
              {round === 2
                ? <View style={[styles.readyShapeDotted, { borderRadius: 20, height: 40, borderColor: '#00E5FF' }]} />
                : <View style={[styles.readyShapeDotted, { borderRadius: 30, borderColor: '#00E5FF' }]} />
              }
              <Text style={[styles.readyBoxLabel, { color: '#00E5FF' }]}>
                {isVersusMode ? 'BẠN (YOU)' : 'TAY TRÁI'}
              </Text>
              <Text style={styles.readyBoxDesc}>{currentShape.leftLabel}</Text>
            </View>

            {/* Right Box Preview */}
            <View style={[styles.readyBoxHalf, { borderColor: '#E040FB' }]}>
              {round === 2
                ? <View style={{ marginVertical: 10 }}><TriangleOutline size={48} color="rgba(224, 64, 251, 0.8)" /></View>
                : round === 3
                ? <View style={[styles.readyShapeDotted, { borderRadius: 0, height: 38, borderColor: '#E040FB' }]} />
                : <View style={[styles.readyShapeDotted, { transform: [{ rotate: '45deg' }], borderColor: '#E040FB' }]} />
              }
              <Text style={[styles.readyBoxLabel, { color: '#E040FB' }]}>
                {isVersusMode ? opponentName.toUpperCase() : 'TAY PHẢI'}
              </Text>
              <Text style={styles.readyBoxDesc}>{currentShape.rightLabel}</Text>
            </View>
          </View>

          {/* Large Countdown circle */}
          <View style={styles.countdownCircle}>
            <Text style={styles.countdownText}>{countdown}</Text>
          </View>
        </Animated.View>
      )}

      {/* --- 2. GAMEPLAY STATE --- */}
      {gameState === 'playing' && (
        <View style={{ flex: 1 }}>
          {/* Top Panel (Score, Timer, Pause) */}
          <View style={styles.gameTopBar}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Pressable onPress={() => { triggerHaptic(); setIsPaused(true); }} style={styles.pauseBtn}>
                <Ionicons name="pause" size={16} color="#FFFFFF" />
              </Pressable>

              {isVersusMode && (
                <Pressable
                  onPress={handleSurrender}
                  style={{
                    backgroundColor: 'rgba(255, 65, 108, 0.15)',
                    borderColor: '#FF416C',
                    borderWidth: 1,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 10, color: '#FF416C' }}>
                    ĐẦU HÀNG
                  </Text>
                </Pressable>
              )}
            </View>
            
            <View style={styles.timerDisplay}>
              <Text style={styles.timerText}>00:{timer < 10 ? `0${timer}` : timer}</Text>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.scoreLabel}>ROUND {round}/3</Text>
              <Text style={styles.scoreVal}>{score} PTS</Text>
            </View>
          </View>

          {/* Split Screen Canvas */}
          <View
            ref={splitContainerRef}
            onLayout={handleSplitContainerLayout}
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => true}
            onResponderMove={handleParentResponderMove}
            onResponderRelease={() => {
              isLeftActive.current = false;
              isRightActive.current = false;
              handleTouchEnd();
            }}
            onResponderTerminate={() => {
              isLeftActive.current = false;
              isRightActive.current = false;
            }}
            style={styles.splitScreenContainer}
          >
            {/* Left Screen Canvas */}
            <View
              ref={leftCanvasRef}
              style={[styles.canvasContainerHalf, { borderRightWidth: 1, borderRightColor: '#202D33' }]}
            >
              {/* Target Outline Shape */}
              {round === 2
                ? <View style={[styles.targetShapeDotted, { width: 160, height: 110, borderRadius: 55, borderColor: 'rgba(0, 229, 255, 0.15)' }]} />
                : round === 3
                ? <View style={[styles.targetShapeDotted, { width: 160, height: 160, borderRadius: 80, borderColor: 'rgba(0, 229, 255, 0.15)' }]} />
                : <View style={[styles.targetShapeDotted, { width: 140, height: 140, borderRadius: 70, borderColor: 'rgba(0, 229, 255, 0.15)' }]} />
              }
              <Text style={[styles.canvasHandIndicator, { color: '#00E5FF' }]}>
                {isVersusMode ? 'BẠN (YOU)' : 'TAY TRÁI (LEFT)'}
              </Text>
              <Text style={styles.canvasShapeGuide}>{currentShape.leftGuide}</Text>

              {/* Render points */}
              {leftLines.map((pt, i) => {
                if (!pt || pt.x === undefined || pt.y === undefined || isNaN(pt.x) || isNaN(pt.y)) return null;
                return (
                  <View
                    key={i}
                    style={[
                      styles.drawingDot,
                      { left: pt.x - 4, top: pt.y - 4, backgroundColor: '#00E5FF', shadowColor: '#00E5FF' },
                    ]}
                  />
                );
              })}
            </View>

            {/* Right Screen Canvas */}
            <View
              ref={rightCanvasRef}
              style={styles.canvasContainerHalf}
            >
              {/* Target Outline Shape */}
              {round === 2
                ? <View style={{ position: 'absolute' }}><TriangleOutline size={110} color="rgba(224, 64, 251, 0.15)" /></View>
                : round === 3
                ? <View style={[styles.targetShapeDotted, { width: 150, height: 100, borderRadius: 4, borderColor: 'rgba(224, 64, 251, 0.15)' }]} />
                : <View style={[styles.targetShapeDotted, { width: 130, height: 130, borderRadius: 4, transform: [{ rotate: '45deg' }], borderColor: 'rgba(224, 64, 251, 0.15)' }]} />
              }
              <Text style={[styles.canvasHandIndicator, { color: '#E040FB' }]}>
                {isVersusMode ? opponentName.toUpperCase() : 'TAY PHẢI (RIGHT)'}
              </Text>
              <Text style={styles.canvasShapeGuide}>
                {isVersusMode ? 'Đang vẽ đối ứng...' : currentShape.rightGuide}
              </Text>

              {/* Render points */}
              {rightLines.map((pt, i) => {
                if (!pt || pt.x === undefined || pt.y === undefined || isNaN(pt.x) || isNaN(pt.y)) return null;
                return (
                  <View
                    key={i}
                    style={[
                      styles.drawingDot,
                      { left: pt.x - 4, top: pt.y - 4, backgroundColor: '#E040FB', shadowColor: '#E040FB' },
                    ]}
                  />
                );
              })}
            </View>
          </View>

          {/* Reset / Submit guide banner at the bottom */}
          <View style={styles.gameFooterBar}>
            <Text style={styles.footerTipText}>
              {isVersusMode
                ? (leftLines.length > 0
                  ? 'Nhấc ngón tay khi hoàn thành vẽ hình tròn của bạn.'
                  : 'Hãy vẽ hình tròn thật nhanh và chính xác hơn đối thủ!')
                : (leftLines.length > 0 || rightLines.length > 0
                  ? 'Nhấc ngón tay để hệ thống quét và đối chiếu hình dạng.'
                  : 'Chạm vẽ đồng thời bằng hai tay để kích thích não bộ.')}
            </Text>
          </View>

          {/* Pause Modal Overlay */}
          {isPaused && (
            <Animated.View entering={FadeIn} style={styles.pauseOverlay}>
              <View style={styles.pauseMenu}>
                <Text style={styles.pauseMenuTitle}>TẠM DỪNG GAME</Text>
                
                <Pressable
                  onPress={() => { triggerHaptic(); setIsPaused(false); }}
                  style={[styles.pauseMenuBtn, { backgroundColor: '#00F2FF' }]}
                >
                  <Text style={[styles.pauseMenuBtnText, { color: '#0B0F12' }]}>TIẾP TỤC CHƠI</Text>
                </Pressable>

                <Pressable
                  onPress={handleRestartGame}
                  style={styles.pauseMenuBtn}
                >
                  <Text style={styles.pauseMenuBtnText}>CHƠI LẠI TRẬN NÀY</Text>
                </Pressable>

                <Pressable
                  onPress={handleGoHome}
                  style={[styles.pauseMenuBtn, { borderColor: '#FF5252', borderWidth: 1 }]}
                >
                  <Text style={[styles.pauseMenuBtnText, { color: '#FF5252' }]}>THOÁT RA MENU</Text>
                </Pressable>
              </View>
            </Animated.View>
          )}
        </View>
      )}

      {/* --- 3. SUCCESS / PERFECT SYNC STATE --- */}
      {gameState === 'success' && (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.fullscreenCentered}>
          <Ionicons name="checkmark-circle" size={80} color="#00E676" style={styles.successIcon} />
          
          <Text style={styles.successTitle}>PERFECT SYNC!</Text>
          <Text style={styles.successSubTitle}>ĐỒNG BỘ HOÀN HẢO!</Text>

          <View style={styles.successScoreCard}>
            <Text style={styles.cardHeader}>ĐIỂM SỐ ROUND {round}</Text>
            <Text style={styles.cardMainScore}>+2,850 PTS</Text>
            <View style={styles.cardMetrics}>
              <Text style={styles.metricText}>Độ chính xác: 98%</Text>
              <Text style={styles.metricText}>Streak: {streak} rounds 🔥</Text>
            </View>
          </View>

          <Pressable
            onPress={handleNextRound}
            style={styles.gameActionButton}
          >
            <LinearGradient
              colors={['#00F2FF', '#BF00FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.btnGradient}
            >
              <Text style={styles.btnActionText}>TIẾP TỤC</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      )}

      {/* --- 4. MISMATCH STATE --- */}
      {gameState === 'mismatch' && (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.fullscreenCentered}>
          <Ionicons name="close-circle" size={80} color="#FF5252" style={styles.errorIcon} />
          
          <Text style={styles.errorTitle}>Mismatch!</Text>
          <Text style={styles.errorSubTitle}>KHÔNG TRÙNG KHỚP!</Text>

          {/* Contextual Tip Banner */}
          <View style={styles.errorTipCard}>
            <Ionicons name="bulb" size={24} color="#FFD700" />
            <Text style={styles.errorTipText}>
              {!isVersusMode && !overlappedTouch.current
                ? 'Lỗi: Bạn phải chạm và vẽ đồng thời bằng cả 2 tay cùng một lúc!'
                : 'Hãy đảm bảo Tay Phải vẽ góc nhọn của hình vuông khớp với vị trí mẫu.'}
            </Text>
          </View>

          <Pressable
            onPress={handleNextRound}
            style={styles.gameActionButton}
          >
            <LinearGradient
              colors={['#00F2FF', '#BF00FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.btnGradient}
            >
              <Text style={styles.btnActionText}>TIẾP TỤC VÒNG KẾ</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      )}

      {/* --- 5. GAME OVER STATE --- */}
      {gameState === 'game-over' && (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.fullscreenCentered}>
          <Text style={styles.gameOverTitle}>GAME OVER</Text>
          <Text style={styles.gameOverSub}>HOÀN THÀNH TẬP LUYỆN</Text>

          {/* Scoreboard panel */}
          {isVersusMode ? (
            <View style={[styles.gameOverPanel, { gap: 16 }]}>
              {/* Victory / Defeat Header */}
              <View style={{ alignItems: 'center', marginBottom: 8 }}>
                <Text style={{
                  fontFamily: 'Montserrat_900Black',
                  fontSize: 24,
                  color: surrendered
                    ? '#FF5252'
                    : opponentSurrendered
                    ? '#00E676'
                    : (score > opponentScore ? '#00E676' : score < opponentScore ? '#FF5252' : '#FFD700'),
                  textShadowColor: surrendered
                    ? 'rgba(255, 82, 82, 0.4)'
                    : opponentSurrendered
                    ? 'rgba(0, 230, 118, 0.4)'
                    : (score > opponentScore ? 'rgba(0, 230, 118, 0.4)' : score < opponentScore ? 'rgba(255, 82, 82, 0.4)' : 'rgba(255, 215, 0, 0.4)'),
                  textShadowRadius: 8,
                  textAlign: 'center',
                }}>
                  {surrendered
                    ? 'BẠN ĐÃ ĐẦU HÀNG / DEFEAT'
                    : opponentSurrendered
                    ? 'ĐỐI THỦ ĐẦU HÀNG / VICTORY'
                    : (score > opponentScore
                      ? 'CHIẾN THẮNG! / VICTORY'
                      : score < opponentScore
                      ? 'THẤT BẠI / DEFEAT'
                      : 'HOÀ NHAU / DRAW')}
                </Text>
                <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 11, color: '#707979', marginTop: 4 }}>
                  ĐẤU ĐỐI KHÁNG • VS {opponentName.toUpperCase()}
                </Text>
              </View>

              {/* Head-to-head stats */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingHorizontal: 10 }}>
                {/* You */}
                <View style={{ alignItems: 'center', gap: 6, flex: 1 }}>
                  <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 12, color: '#00F2FF', letterSpacing: 0.5 }}>BẠN (YOU)</Text>
                  <Text style={{ fontFamily: 'Montserrat_900Black', fontSize: 26, color: '#FFFFFF' }}>{score}</Text>
                  <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 12, color: '#707979' }}>{accuracy}% ACC</Text>
                </View>

                {/* VS divider */}
                <View style={{ height: 50, width: 1.5, backgroundColor: '#202D33' }} />

                {/* Opponent */}
                <View style={{ alignItems: 'center', gap: 6, flex: 1 }}>
                  <Text numberOfLines={1} style={{ fontFamily: 'Montserrat_700Bold', fontSize: 12, color: '#FF416C', letterSpacing: 0.5 }}>
                    {opponentName.toUpperCase()}
                  </Text>
                  <Text style={{ fontFamily: 'Montserrat_900Black', fontSize: 26, color: '#FFFFFF' }}>{opponentScore}</Text>
                  <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 12, color: '#707979' }}>{opponentAccuracy}% ACC</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.gameOverPanel}>
              <Text style={styles.panelLabel}>FINAL SCORE</Text>
              <Text style={styles.panelScoreVal}>{score} PTS</Text>

              <View style={styles.panelStatsRow}>
                <View style={styles.panelStatCell}>
                  <Ionicons name="flash" size={16} color="#00F2FF" />
                  <Text style={styles.pStatVal}>{streak}</Text>
                  <Text style={styles.pStatLbl}>BEST STREAK</Text>
                </View>
                <View style={[styles.panelStatCell, { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#202D33' }]}>
                  <Ionicons name="disc" size={16} color="#FF007F" />
                  <Text style={styles.pStatVal}>{accuracy}%</Text>
                  <Text style={styles.pStatLbl}>ACCURACY</Text>
                </View>
                <View style={styles.panelStatCell}>
                  <Ionicons name="trophy" size={16} color="#FFD700" />
                  <Text style={styles.pStatVal}>#1</Text>
                  <Text style={styles.pStatLbl}>TIER RANK</Text>
                </View>
              </View>
            </View>
          )}

          {/* Replay action */}
          <View style={{ gap: 14, width: '100%', paddingHorizontal: 40, marginTop: 12 }}>
            {isVersusMode ? (
              <>
                {rematchStatus === 'idle' ? (
                  <>
                    <Pressable
                      onPress={handleRematch}
                      style={{ borderRadius: 28, overflow: 'hidden' }}
                    >
                      <LinearGradient
                        colors={['#BF00FF', '#00F2FF']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{ paddingVertical: 16, alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#FFFFFF', fontSize: 15, letterSpacing: 1 }}>
                          THÁCH ĐẤU LẠI ĐỐI THỦ CŨ
                        </Text>
                      </LinearGradient>
                    </Pressable>

                    <Pressable
                      onPress={() => {
                        triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
                        router.replace({ pathname: '/(tabs)/home', params: { triggerMatchmaking: 'true' } });
                      }}
                      style={{ borderRadius: 28, overflow: 'hidden' }}
                    >
                      <LinearGradient
                        colors={['#FF4B2B', '#FF416C']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{ paddingVertical: 16, alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#FFFFFF', fontSize: 15, letterSpacing: 1 }}>
                          TÌM TRẬN THI ĐẤU MỚI
                        </Text>
                      </LinearGradient>
                    </Pressable>
                  </>
                ) : (
                  <View style={{
                    paddingVertical: 18,
                    backgroundColor: '#12181B',
                    borderColor: '#202D33',
                    borderWidth: 1.5,
                    borderRadius: 28,
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}>
                    <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#00F2FF', fontSize: 14 }}>
                      {rematchStatus === 'sending'
                        ? `Đang gửi lời mời thách đấu lại cho ${opponentName}...`
                        : 'Lời mời thách đấu đã được chấp nhận!'}
                    </Text>
                    <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#707979', fontSize: 11 }}>
                      {rematchStatus === 'sending' ? 'Đang đợi phản hồi...' : 'Trận đấu bắt đầu sau giây lát...'}
                    </Text>
                  </View>
                )}
              </>
            ) : (
              <Pressable
                onPress={handleRestartGame}
                style={{ borderRadius: 28, overflow: 'hidden' }}
              >
                <LinearGradient
                  colors={['#00F2FF', '#BF00FF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ paddingVertical: 16, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#FFFFFF', fontSize: 15, letterSpacing: 1 }}>
                    CHƠI LẠI TRẬN MỚI
                  </Text>
                </LinearGradient>
              </Pressable>
            )}

            <Pressable
              onPress={handleGoHome}
              style={{
                borderColor: '#202D33',
                borderWidth: 1.5,
                paddingVertical: 14,
                borderRadius: 28,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#707979', fontSize: 14 }}>QUAY VỀ MENU CHÍNH</Text>
            </Pressable>
          </View>
        </Animated.View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  fullscreenCentered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#0B0F12',
  },
  
  // Get Ready style
  readyTitle: {
    fontFamily: 'Montserrat_900Black',
    fontSize: 32,
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  readySubTitle: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 14,
    color: '#707979',
    marginTop: 6,
    marginBottom: 30,
  },
  readyVisualContainer: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
    maxWidth: 360,
    marginBottom: 40,
  },
  readyBoxHalf: {
    flex: 1,
    backgroundColor: '#12181B',
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 12,
    borderCurve: 'continuous',
  },
  readyShapeDotted: {
    width: 60,
    height: 60,
    borderWidth: 2.5,
    borderStyle: 'dashed',
    marginVertical: 10,
  },
  readyBoxLabel: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  readyBoxDesc: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  countdownCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 2,
    borderColor: '#202D33',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
  },
  countdownText: {
    fontFamily: 'Montserrat_900Black',
    fontSize: 38,
    color: '#00F2FF',
  },

  // Gameplay Styles
  gameTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#202D33',
    backgroundColor: '#0B0F12',
  },
  pauseBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#12181B',
    borderWidth: 1.2,
    borderColor: '#202D33',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerDisplay: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1.2,
    borderColor: '#202D33',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  timerText: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 14,
    color: '#FF007F',
    letterSpacing: 0.5,
  },
  scoreLabel: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 10,
    color: '#707979',
    letterSpacing: 0.5,
  },
  scoreVal: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 14.5,
    color: '#FFFFFF',
  },
  splitScreenContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  canvasContainerHalf: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#0B0F12',
    justifyContent: 'center',
    alignItems: 'center',
  },
  canvasHandIndicator: {
    position: 'absolute',
    top: 24,
    fontFamily: 'Montserrat_700Bold',
    fontSize: 11,
    letterSpacing: 1,
  },
  canvasShapeGuide: {
    position: 'absolute',
    top: 44,
    fontFamily: 'Montserrat_500Medium',
    fontSize: 11,
    color: '#707979',
  },
  targetShapeDotted: {
    borderWidth: 2,
    borderStyle: 'dashed',
    position: 'absolute',
  },
  drawingDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
  },
  gameFooterBar: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: '#0B0F12',
    borderTopWidth: 1,
    borderTopColor: '#202D33',
    alignItems: 'center',
  },
  footerTipText: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 11.5,
    color: '#707979',
    textAlign: 'center',
  },

  // Pause overlay
  pauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 8, 10, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  pauseMenu: {
    width: 280,
    backgroundColor: '#12181B',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#202D33',
    padding: 24,
    gap: 14,
    alignItems: 'center',
  },
  pauseMenuTitle: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 15,
    color: '#FFFFFF',
    marginBottom: 10,
    letterSpacing: 1,
  },
  pauseMenuBtn: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderColor: '#202D33',
    borderWidth: 1.5,
  },
  pauseMenuBtnText: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 12.5,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },

  // Success screen
  successIcon: {
    textShadowColor: 'rgba(0, 230, 118, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    marginBottom: 20,
  },
  successTitle: {
    fontFamily: 'Montserrat_900Black',
    fontSize: 28,
    color: '#00E676',
    letterSpacing: 1.5,
  },
  successSubTitle: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 14,
    color: '#707979',
    marginTop: 4,
  },
  successScoreCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#12181B',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#202D33',
    padding: 20,
    marginVertical: 30,
    alignItems: 'center',
    gap: 8,
  },
  cardHeader: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 11,
    color: '#707979',
    letterSpacing: 0.5,
  },
  cardMainScore: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 32,
    color: '#00E676',
  },
  cardMetrics: {
    flexDirection: 'row',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: '#202D33',
    paddingTop: 12,
    width: '100%',
    justifyContent: 'center',
  },
  metricText: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 11.5,
    color: '#E1E4E6',
  },
  gameActionButton: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 24,
    overflow: 'hidden',
  },
  btnGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnActionText: {
    fontFamily: 'Montserrat_700Bold',
    color: '#FFFFFF',
    fontSize: 14,
    letterSpacing: 1,
  },

  // Mismatch Screen styles
  errorIcon: {
    textShadowColor: 'rgba(255, 82, 82, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    marginBottom: 20,
  },
  errorTitle: {
    fontFamily: 'Montserrat_900Black',
    fontSize: 28,
    color: '#FF5252',
    letterSpacing: 1.5,
  },
  errorSubTitle: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 14,
    color: '#707979',
    marginTop: 4,
  },
  errorTipCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: 'rgba(255, 215, 0, 0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.25)',
    padding: 16,
    marginVertical: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  errorTipText: {
    flex: 1,
    fontFamily: 'Montserrat_500Medium',
    fontSize: 12,
    color: '#E1E4E6',
    lineHeight: 16,
  },

  // Game Over screen
  gameOverTitle: {
    fontFamily: 'Montserrat_900Black',
    fontSize: 36,
    color: '#FF5252',
    letterSpacing: 2,
    textShadowColor: 'rgba(255, 82, 82, 0.3)',
    textShadowRadius: 10,
  },
  gameOverSub: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 13.5,
    color: '#707979',
    marginTop: 6,
    letterSpacing: 1,
  },
  gameOverPanel: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#12181B',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#202D33',
    padding: 24,
    alignItems: 'center',
    marginVertical: 30,
    borderCurve: 'continuous',
  },
  panelLabel: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 11,
    color: '#707979',
    letterSpacing: 1.5,
  },
  panelScoreVal: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 40,
    color: '#FFFFFF',
    marginVertical: 10,
  },
  panelStatsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#202D33',
    paddingTop: 16,
    marginTop: 10,
    width: '100%',
  },
  panelStatCell: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  pStatVal: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 2,
  },
  pStatLbl: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 8,
    color: '#707979',
    letterSpacing: 0.5,
  },
});
