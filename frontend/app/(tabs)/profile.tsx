import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { trackEvent, trackScreenView } from '@/services/analytics';

export default function Profile() {
  useEffect(() => {
    void trackScreenView('profile');
  }, []);

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  const handleContactPress = () => {
    triggerHaptic();
    void trackEvent('profile_contact_pressed');
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ paddingVertical: 24, backgroundColor: '#0B0F12', flexGrow: 1 }}
    >
      <View style={{ paddingHorizontal: 20, gap: 24 }}>
        
        {/* Profile Card */}
        <View
          style={{
            alignItems: 'center',
            gap: 14,
            paddingVertical: 24,
            paddingHorizontal: 16,
            backgroundColor: '#12181B',
            borderRadius: 16,
            borderColor: '#202D33',
            borderWidth: 1,
            borderCurve: 'continuous',
          }}
        >
          {/* Avatar with Gradient Border Ring */}
          <View
            style={{
              width: 88,
              height: 88,
              borderRadius: 44,
              padding: 3,
              backgroundColor: 'transparent',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <LinearGradient
              colors={['#00F2FF', '#BF00FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: 86,
                height: 86,
                borderRadius: 43,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: '#0B0F12',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 38 }}>🪳</Text>
              </View>
            </LinearGradient>
          </View>

          <View style={{ alignItems: 'center', gap: 4 }}>
            <Text
              selectable
              style={{
                fontFamily: 'Montserrat_700Bold',
                fontSize: 20,
                color: '#FFFFFF',
              }}
            >
              L02-CockRoaches
            </Text>
            <Text
              selectable
              style={{
                fontFamily: 'Montserrat_500Medium',
                fontSize: 13,
                color: '#707979',
              }}
            >
              Mobile Development · Class L02
            </Text>
          </View>

          {/* Stats Bar */}
          <View
            style={{
              flexDirection: 'row',
              gap: 12,
              marginTop: 12,
              paddingTop: 16,
              borderTopColor: '#202D33',
              borderTopWidth: 1,
              width: '100%',
              justifyContent: 'center',
            }}
          >
            <StatCell label="Members" value="5" />
            <StatCell label="Focus" value="MVP" />
            <StatCell label="Course" value="Mobile app" />
          </View>
        </View>

        {/* Project Goal */}
        <View style={{ gap: 10 }}>
          <Text
            selectable
            style={{
              fontFamily: 'Montserrat_700Bold',
              fontSize: 16,
              color: '#FFFFFF',
            }}
          >
            Project Goal
          </Text>
          <Text
            selectable
            style={{
              fontFamily: 'Montserrat_500Medium',
              fontSize: 13.5,
              color: '#A0A5A8',
              lineHeight: 20,
            }}
          >
            Build a scalable MVP for a cognitive training game with bimanual interaction, focused on user experience optimization, responsive performance, and high-quality native design.
          </Text>
        </View>

        {/* Tech Stack */}
        <View style={{ gap: 12 }}>
          <Text
            selectable
            style={{
              fontFamily: 'Montserrat_700Bold',
              fontSize: 16,
              color: '#FFFFFF',
            }}
          >
            Tech Stack
          </Text>
          <View style={{ gap: 10 }}>
            <TechRow label="Expo / React Native" value="Frontend" accentColor="#00F2FF" />
            <TechRow label="TypeScript" value="Code safety" accentColor="#BF00FF" />
            <TechRow label="REST APIs" value="Extensible" accentColor="#FF007F" />
            <TechRow label="PostgreSQL" value="Database" accentColor="#707979" />
          </View>
        </View>

        {/* Contact Button */}
        <View style={{ gap: 10, marginTop: 8 }}>
          <Pressable
            onPress={handleContactPress}
            style={({ pressed }) => ({
              backgroundColor: pressed ? 'rgba(191, 0, 255, 0.15)' : 'transparent',
              borderWidth: 1.5,
              borderColor: '#BF00FF',
              paddingVertical: 14,
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
              borderCurve: 'continuous',
            })}
          >
            <Text
              selectable
              style={{
                fontFamily: 'Montserrat_700Bold',
                color: '#BF00FF',
                fontSize: 15,
                letterSpacing: 0.5,
              }}
            >
              Contact Team
            </Text>
          </Pressable>
        </View>

      </View>
    </ScrollView>
  );
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 4 }}>
      <Text
        selectable
        style={{
          fontFamily: 'Montserrat_700Bold',
          fontSize: 16,
          color: '#00F2FF',
        }}
      >
        {value}
      </Text>
      <Text
        selectable
        style={{
          fontFamily: 'Montserrat_600SemiBold',
          fontSize: 11,
          color: '#707979',
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function TechRow({
  label,
  value,
  accentColor,
}: {
  label: string;
  value: string;
  accentColor: string;
}) {
  return (
    <View
      style={{
        backgroundColor: '#12181B',
        borderRadius: 12,
        borderColor: '#202D33',
        borderWidth: 1,
        paddingHorizontal: 16,
        paddingVertical: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderCurve: 'continuous',
      }}
    >
      <Text
        selectable
        style={{
          fontFamily: 'Montserrat_600SemiBold',
          fontSize: 13.5,
          color: '#FFFFFF',
        }}
      >
        {label}
      </Text>
      <Text
        selectable
        style={{
          fontFamily: 'Montserrat_700Bold',
          fontSize: 12.5,
          color: accentColor,
        }}
      >
        {value}
      </Text>
    </View>
  );
}
