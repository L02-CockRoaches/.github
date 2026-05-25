import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View, StatusBar } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
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

export default function OnboardingScreen() {
  const [showSplash, setShowSplash] = useState(true);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('CONNECTING TO NEURAL PATHWAYS...');

  // Splash Screen progress simulation
  useEffect(() => {
    if (!showSplash) return;

    let currentProgress = 0;
    const interval = setInterval(() => {
      let increment = 1;

      if (currentProgress < 30) {
        increment = 3;
      } else if (currentProgress < 75) {
        increment = 2;
      }

      currentProgress = Math.min(100, currentProgress + increment);
      setProgress(currentProgress);

      // Dynamic text updates
      if (currentProgress < 25) {
        setStatusText('CONNECTING TO NEURAL PATHWAYS...');
      } else if (currentProgress < 50) {
        setStatusText('CALIBRATING HEMISPHERES...');
      } else if (currentProgress < 75) {
        setStatusText('SYNCHRONIZING LEFT & RIGHT BRAIN...');
      } else if (currentProgress < 95) {
        setStatusText('OPTIMIZING HAND-EYE COHERENCE...');
      } else {
        setStatusText('READY!');
      }

      if (currentProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          setShowSplash(false);
        }, 500);
      }
    }, 35);

    return () => clearInterval(interval);
  }, [showSplash]);

  const handleStartPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    router.replace('/(tabs)/home');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0B0F12' }}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F12" />

      {showSplash ? (
        /* --- SPLASH SCREEN VIEW --- */
        <Animated.View
          key="splash"
          exiting={FadeOut.duration(400)}
          style={{
            flex: 1,
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 60,
            paddingHorizontal: 24,
          }}
        >
          {/* Top spacer to keep central content centered */}
          <View style={{ height: 40 }} />

          {/* Logo & Slogan Column */}
          <View style={{ alignItems: 'center', gap: 32, width: '100%' }}>
            <SplashLogo />

            <View style={{ alignItems: 'center', gap: 12 }}>
              <Text
                selectable
                style={{
                  fontFamily: 'Montserrat_900Black',
                  fontSize: 38,
                  color: '#00F2FF',
                  textAlign: 'center',
                  textShadowColor: 'rgba(0, 242, 255, 0.45)',
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 15,
                }}
              >
                GameTwoShape
              </Text>
              
              <Text
                selectable
                style={{
                  fontFamily: 'Montserrat_600SemiBold',
                  fontSize: 11,
                  color: '#A0A5A8',
                  letterSpacing: 2,
                  textAlign: 'center',
                  marginTop: 4,
                }}
              >
                TRAIN YOUR BRAIN, BOTH SIDES AT ONCE
              </Text>
              
              <Text
                selectable
                style={{
                  fontFamily: 'Montserrat_400Regular_Italic',
                  fontSize: 14,
                  color: '#707979',
                  textAlign: 'center',
                  marginTop: 2,
                }}
              >
                Kích thích hai bán cầu, hoàn hảo đôi tay
              </Text>
            </View>
          </View>

          {/* Progress Bar & Status Text */}
          <View style={{ alignItems: 'center', gap: 16, width: '100%' }}>
            {/* Progress track */}
            <View
              style={{
                width: 260,
                height: 4,
                backgroundColor: '#1B2428',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              {/* Animated active bar */}
              <View
                style={{
                  width: `${progress}%`,
                  height: '100%',
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                <LinearGradient
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  colors={['#00F2FF', '#BF00FF']}
                  style={{
                    width: 260,
                    height: '100%',
                  }}
                />
              </View>
            </View>

            <Text
              selectable
              style={{
                fontFamily: 'Montserrat_700Bold',
                fontSize: 10,
                color: '#707979',
                letterSpacing: 1.5,
                textAlign: 'center',
              }}
            >
              {statusText}
            </Text>
          </View>
        </Animated.View>
      ) : (
        /* --- ONBOARDING SCREEN VIEW --- */
        <Animated.View
          key="onboarding"
          entering={FadeIn.duration(600)}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            contentContainerStyle={{ flexGrow: 1, paddingVertical: 48 }}
          >
            <View
              style={{
                flex: 1,
                paddingHorizontal: 24,
                justifyContent: 'space-between',
                gap: 40,
              }}
            >
              {/* Title Header */}
              <View style={{ alignItems: 'center', gap: 12, marginTop: 10 }}>
                {/* Team Badge */}
                <View
                  style={{
                    backgroundColor: 'rgba(0, 242, 255, 0.08)',
                    paddingHorizontal: 14,
                    paddingVertical: 6,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: 'rgba(0, 242, 255, 0.2)',
                  }}
                >
                  <Text
                    style={{
                      fontFamily: 'Montserrat_700Bold',
                      fontSize: 10,
                      color: '#00F2FF',
                      letterSpacing: 1,
                    }}
                  >
                    L02-COCKROACHES
                  </Text>
                </View>

                <Text
                  selectable
                  style={{
                    fontFamily: 'Montserrat_900Black',
                    fontSize: 42,
                    color: '#00F2FF',
                    textAlign: 'center',
                    textShadowColor: 'rgba(0, 242, 255, 0.3)',
                    textShadowOffset: { width: 0, height: 0 },
                    textShadowRadius: 12,
                  }}
                >
                  GameTwoShape
                </Text>

                <Text
                  selectable
                  style={{
                    fontFamily: 'Montserrat_600SemiBold',
                    fontSize: 16,
                    color: '#E1E4E6',
                    textAlign: 'center',
                    lineHeight: 22,
                  }}
                >
                  Train your brain, both sides at once.
                </Text>

                <Text
                  selectable
                  style={{
                    fontFamily: 'Montserrat_400Regular_Italic',
                    fontSize: 13,
                    color: '#707979',
                    textAlign: 'center',
                    paddingHorizontal: 10,
                  }}
                >
                  Bài tập luyện não bộ bằng cách vẽ hai hình khác nhau cùng lúc để tăng khả năng tập trung và phối hợp hai tay.
                </Text>
              </View>

              {/* Features List */}
              <View style={{ gap: 16 }}>
                <OnboardingFeature
                  emoji="🎮"
                  title="Core Gameplay"
                  subtitle="Vẽ đồng thời 2 hình khác nhau trong thời gian giới hạn"
                  accentColor="#00F2FF"
                />
                <OnboardingFeature
                  emoji="🧠"
                  title="Brain Training"
                  subtitle="Luyện chia đôi sự chú ý và phản xạ phối hợp bán cầu não"
                  accentColor="#BF00FF"
                />
                <OnboardingFeature
                  emoji="🏆"
                  title="Challenge Loop"
                  subtitle="Tăng độ khó, tích điểm, phá kỷ lục cá nhân của bạn"
                  accentColor="#FF007F"
                />
              </View>

              {/* CTA Section */}
              <View style={{ gap: 16, width: '100%' }}>
                <View
                  style={{
                    borderRadius: 14,
                    overflow: 'hidden',
                    boxShadow: '0 4px 15px rgba(0, 242, 255, 0.25)',
                    borderCurve: 'continuous',
                  }}
                >
                  <Pressable
                    onPress={handleStartPress}
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.9 : 1,
                    })}
                  >
                    <LinearGradient
                      colors={['#00F2FF', '#BF00FF']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{
                        paddingVertical: 16,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text
                        selectable
                        style={{
                          color: '#FFFFFF',
                          fontFamily: 'Montserrat_700Bold',
                          fontSize: 16,
                          letterSpacing: 1.2,
                        }}
                      >
                        BẮT ĐẦU TẬP LUYỆN
                      </Text>
                    </LinearGradient>
                  </Pressable>
                </View>

                <Text
                  selectable
                  style={{
                    textAlign: 'center',
                    fontFamily: 'Montserrat_500Medium',
                    color: '#707979',
                    fontSize: 11,
                    letterSpacing: 0.5,
                  }}
                >
                  L02-CockRoaches · Mobile Development
                </Text>
              </View>
            </View>
          </ScrollView>
        </Animated.View>
      )}
    </View>
  );
}

/* --- SPLASH LOGO COMPONENT --- */
function SplashLogo() {
  const cyanRotation = useSharedValue(0);
  const purpleRotation = useSharedValue(0);
  const trianglePulse = useSharedValue(0);
  const squareScale = useSharedValue(1);

  useEffect(() => {
    cyanRotation.value = withRepeat(
      withTiming(360, { duration: 5000, easing: Easing.linear }),
      -1,
      false
    );
    purpleRotation.value = withRepeat(
      withTiming(-360, { duration: 5000, easing: Easing.linear }),
      -1,
      false
    );
    trianglePulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    squareScale.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [cyanRotation, purpleRotation, squareScale, trianglePulse]);

  const cyanStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${cyanRotation.value}deg` }],
  }));

  const purpleStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${purpleRotation.value}deg` }],
  }));

  const leftTriangleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: trianglePulse.value * 6 }],
  }));

  const rightTriangleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -trianglePulse.value * 6 }],
  }));

  const squareStyle = useAnimatedStyle(() => ({
    transform: [{ scale: squareScale.value }],
  }));

  return (
    <View
      style={{
        width: 220,
        height: 220,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
      }}
    >
      {/* Background glowing particles/sparkles */}
      <View style={{ position: 'absolute', top: 40, left: 30, width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#00F2FF', opacity: 0.6 }} />
      <View style={{ position: 'absolute', top: 50, right: 35, width: 2, height: 2, borderRadius: 1, backgroundColor: '#FFF', opacity: 0.5 }} />
      <View style={{ position: 'absolute', bottom: 45, left: 40, width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#BF00FF', opacity: 0.6 }} />
      <View style={{ position: 'absolute', bottom: 55, right: 30, width: 2, height: 2, borderRadius: 1, backgroundColor: '#FF007F', opacity: 0.5 }} />
      <View style={{ position: 'absolute', top: 110, left: 10, width: 2, height: 2, borderRadius: 1, backgroundColor: '#FFF', opacity: 0.4 }} />
      <View style={{ position: 'absolute', top: 90, right: 15, width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#00F2FF', opacity: 0.4 }} />

      {/* Cyan outer arc (top-left) */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: 130,
            height: 130,
            borderRadius: 65,
            borderWidth: 4.5,
            borderColor: 'transparent',
            borderTopColor: '#00F2FF',
            borderLeftColor: '#00F2FF',
          },
          cyanStyle,
        ]}
      />

      {/* Purple outer arc (bottom-right) */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: 144,
            height: 144,
            borderRadius: 72,
            borderWidth: 4.5,
            borderColor: 'transparent',
            borderBottomColor: '#BF00FF',
            borderRightColor: '#BF00FF',
            transform: [{ rotate: '45deg' }],
          },
          purpleStyle,
        ]}
      />

      {/* Left Triangle (pointing right) */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            left: 20,
            width: 0,
            height: 0,
            borderTopWidth: 8,
            borderTopColor: 'transparent',
            borderBottomWidth: 8,
            borderBottomColor: 'transparent',
            borderLeftWidth: 12,
            borderLeftColor: '#00F2FF',
          },
          leftTriangleStyle,
        ]}
      />

      {/* Right Triangle (pointing left) */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            right: 20,
            width: 0,
            height: 0,
            borderTopWidth: 8,
            borderTopColor: 'transparent',
            borderBottomWidth: 8,
            borderBottomColor: 'transparent',
            borderRightWidth: 12,
            borderRightColor: '#BF00FF',
          },
          rightTriangleStyle,
        ]}
      />

      {/* Central Rounded Square */}
      <Animated.View
        style={[
          {
            width: 64,
            height: 64,
            borderRadius: 16,
            borderWidth: 2,
            borderColor: '#BF00FF',
            backgroundColor: '#0B0F12',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: '0 0 15px rgba(191, 0, 255, 0.25)',
            borderCurve: 'continuous',
          },
          squareStyle,
        ]}
      >
        {/* 7 dots inside the square */}
        <View style={{ width: 34, height: 34, position: 'relative' }}>
          {/* Center dot */}
          <View style={{ position: 'absolute', top: 14, left: 14, width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFF' }} />
          {/* Outer hexagonal dots */}
          <View style={{ position: 'absolute', top: 2, left: 14, width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFF' }} />
          <View style={{ position: 'absolute', top: 26, left: 14, width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFF' }} />
          <View style={{ position: 'absolute', top: 8, left: 4, width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFF' }} />
          <View style={{ position: 'absolute', top: 8, right: 4, width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFF' }} />
          <View style={{ position: 'absolute', top: 20, left: 4, width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFF' }} />
          <View style={{ position: 'absolute', top: 20, right: 4, width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFF' }} />
        </View>
      </Animated.View>
    </View>
  );
}

/* --- FEATURE CARD COMPONENT --- */
function OnboardingFeature({
  emoji,
  title,
  subtitle,
  accentColor,
}: {
  emoji: string;
  title: string;
  subtitle: string;
  accentColor: string;
}) {
  return (
    <View
      style={{
        backgroundColor: '#12181B',
        borderRadius: 16,
        padding: 18,
        borderWidth: 1,
        borderColor: '#202D33',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        borderCurve: 'continuous',
      }}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 1.5,
          borderColor: accentColor,
        }}
      >
        <Text style={{ fontSize: 22 }}>{emoji}</Text>
      </View>
      
      <View style={{ flex: 1, gap: 4 }}>
        <Text
          selectable
          style={{
            fontFamily: 'Montserrat_700Bold',
            fontSize: 16,
            color: '#FFFFFF',
          }}
        >
          {title}
        </Text>
        <Text
          selectable
          style={{
            fontFamily: 'Montserrat_400Regular',
            fontSize: 13,
            color: '#707979',
            lineHeight: 18,
          }}
        >
          {subtitle}
        </Text>
      </View>
    </View>
  );
}
