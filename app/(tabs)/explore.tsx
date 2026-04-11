import { Pressable, ScrollView, Text, View } from 'react-native';

export default function Explore() {
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ paddingVertical: 20 }}
    >
      <View style={{ paddingHorizontal: 16, gap: 20 }}>
        <SectionCard
          title="🎯 Core Gameplay Loop"
          items={[
            'Start Menu hiển thị High Score',
            'Play → Countdown 3..2..1',
            'Vẽ đúng 2 hình trước khi hết giờ để cộng điểm',
            'Sai hoặc hết giờ → Game Over + Replay/Home',
          ]}
        />

        <SectionCard
          title="🧩 Hidden Processing Flow"
          items={[
            'Ghi nhận 2 path touch độc lập trái/phải',
            'So sánh từng path với shape target',
            'Chỉ Pass cả hai mới cộng điểm',
            'Reset round với độ khó cao hơn',
          ]}
        />

        <SectionCard
          title="📦 MVP Scope"
          items={[
            'Multi-touch canvas chia đôi màn hình',
            'Basic shape recognition (circle/square/triangle)',
            'Time + score progression',
            'Lưu high score local trên thiết bị',
          ]}
        />

        <View style={{ gap: 12, marginTop: 12 }}>
          <Text selectable style={{ fontSize: 18, fontWeight: '600' }}>
            Quick Highlights
          </Text>
          <View style={{ gap: 10 }}>
            <ShowcaseButton
              emoji="⚡"
              text="Fast reaction loop"
              color="#FF9500"
            />
            <ShowcaseButton
              emoji="🧠"
              text="Cognitive training"
              color="#34C759"
            />
            <ShowcaseButton
              emoji="🤝"
              text="Bimanual coordination"
              color="#5856D6"
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function SectionCard({ title, items }: { title: string; items: string[] }) {
  return (
    <View
      style={{
        backgroundColor: 'white',
        borderRadius: 12,
        borderColor: '#eee',
        borderWidth: 1,
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      }}
    >
      <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
        <Text
          selectable
          style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}
        >
          {title}
        </Text>
        <View style={{ gap: 8 }}>
          {items.map((item, index) => (
            <View key={index} style={{ flexDirection: 'row', gap: 10 }}>
              <Text style={{ color: '#007AFF' }}>✓</Text>
              <Text
                selectable
                style={{
                  flex: 1,
                  fontSize: 14,
                  color: '#333',
                  paddingRight: 10,
                }}
              >
                {item}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function ShowcaseButton({
  emoji,
  text,
  color,
}: {
  emoji: string;
  text: string;
  color: string;
}) {
  return (
    <Pressable
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: color,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 10,
      }}
    >
      <Text style={{ fontSize: 20 }}>{emoji}</Text>
      <Text
        selectable
        style={{ fontSize: 14, fontWeight: '600', color: 'white', flex: 1 }}
      >
        {text}
      </Text>
      <Text style={{ color: 'white' }}>→</Text>
    </Pressable>
  );
}
