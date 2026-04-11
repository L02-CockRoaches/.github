import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';

export default function OnboardingScreen() {
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ flexGrow: 1, paddingVertical: 24 }}
    >
      <View
        style={{
          flex: 1,
          paddingHorizontal: 16,
          justifyContent: 'space-between',
          gap: 20,
        }}
      >
        <View style={{ gap: 16 }}>
          <Text selectable style={{ fontSize: 36, fontWeight: '800' }}>
            🪳 GameTwoShape
          </Text>
          <Text selectable style={{ fontSize: 17, color: '#444' }}>
            Train your brain, both sides at once.
          </Text>
          <Text
            selectable
            style={{ fontSize: 15, color: '#666', lineHeight: 22 }}
          >
            Bài tập luyện não bộ bằng cách vẽ hai hình khác nhau cùng lúc để
            tăng khả năng tập trung và phối hợp hai tay.
          </Text>
        </View>

        <View style={{ gap: 10 }}>
          <OnboardingFeature
            emoji="🎮"
            title="Core Gameplay"
            subtitle="Vẽ đồng thời 2 hình trong thời gian giới hạn"
          />
          <OnboardingFeature
            emoji="🧠"
            title="Brain Training"
            subtitle="Luyện chia đôi sự chú ý và phản xạ phối hợp"
          />
          <OnboardingFeature
            emoji="🏆"
            title="Challenge Loop"
            subtitle="Tăng độ khó, tích điểm, phá kỷ lục cá nhân"
          />
        </View>

        <View style={{ gap: 12 }}>
          <Pressable
            onPress={() => router.replace('/explore')}
            style={{
              backgroundColor: '#007AFF',
              borderRadius: 12,
              paddingVertical: 14,
              alignItems: 'center',
            }}
          >
            <Text
              selectable
              style={{ color: 'white', fontSize: 16, fontWeight: '700' }}
            >
              Bắt đầu demo
            </Text>
          </Pressable>
          <Text
            selectable
            style={{ textAlign: 'center', color: '#777', fontSize: 12 }}
          >
            L02-CockRoaches · Mobile Development
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

function OnboardingFeature({
  emoji,
  title,
  subtitle,
}: {
  emoji: string;
  title: string;
  subtitle: string;
}) {
  return (
    <View
      style={{
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: '#ececec',
        gap: 6,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
      }}
    >
      <Text selectable style={{ fontSize: 20 }}>
        {emoji}
      </Text>
      <Text selectable style={{ fontSize: 15, fontWeight: '700' }}>
        {title}
      </Text>
      <Text selectable style={{ color: '#666' }}>
        {subtitle}
      </Text>
    </View>
  );
}
