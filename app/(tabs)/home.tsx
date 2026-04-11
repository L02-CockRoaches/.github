import { Link } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';

export default function Home() {
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ paddingVertical: 20 }}
    >
      <View style={{ paddingHorizontal: 16, gap: 24 }}>
        <View style={{ gap: 8 }}>
          <Text selectable style={{ fontSize: 32, fontWeight: '700' }}>
            Welcome! 👋
          </Text>
          <Text selectable style={{ fontSize: 16, color: '#666' }}>
            Đây là dự án App Mobile Dev của nhóm L02-CockRoaches
          </Text>
        </View>

        <View style={{ gap: 12 }}>
          <FeatureCard
            icon="🎮"
            title="GameTwoShape"
            description="Luyện phối hợp hai tay qua cơ chế vẽ song song"
          />
          <FeatureCard
            icon="🧠"
            title="Brain Training"
            description="Rèn chia đôi sự chú ý và tập trung ngắn hạn"
          />
          <FeatureCard
            icon="🚀"
            title="MVP Ready"
            description="Core loop, điểm số và flow demo đã sẵn sàng"
          />
        </View>

        <View
          style={{
            backgroundColor: '#007AFF',
            borderRadius: 12,
            padding: 20,
            gap: 12,
          }}
        >
          <Text
            selectable
            style={{ fontSize: 18, fontWeight: '600', color: 'white' }}
          >
            Demo Stats
          </Text>
          <View style={{ flexDirection: 'row', gap: 20 }}>
            <StatItem number="2" label="Flows" />
            <StatItem number="3" label="Tabs" />
            <StatItem number="MVP" label="Scope" />
          </View>
        </View>

        <View style={{ gap: 10 }}>
          <Link href="/explore" asChild>
            <Pressable
              style={{
                backgroundColor: '#007AFF',
                paddingVertical: 14,
                borderRadius: 10,
                alignItems: 'center',
              }}
            >
              <Text
                selectable
                style={{ color: 'white', fontSize: 16, fontWeight: '600' }}
              >
                Explore Features
              </Text>
            </Pressable>
          </Link>
          <Link href="/profile" asChild>
            <Pressable
              style={{
                backgroundColor: '#f5f5f5',
                paddingVertical: 14,
                borderRadius: 10,
                alignItems: 'center',
              }}
            >
              <Text
                selectable
                style={{ color: '#000', fontSize: 16, fontWeight: '600' }}
              >
                View Team Profile
              </Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <View
      style={{
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        borderColor: '#eee',
        borderWidth: 1,
        gap: 8,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      }}
    >
      <Text selectable style={{ fontSize: 28 }}>
        {icon}
      </Text>
      <Text selectable style={{ fontSize: 16, fontWeight: '600' }}>
        {title}
      </Text>
      <Text selectable style={{ fontSize: 14, color: '#666' }}>
        {description}
      </Text>
    </View>
  );
}

function StatItem({ number, label }: { number: string; label: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 4 }}>
      <Text
        selectable
        style={{ fontSize: 24, fontWeight: '700', color: 'white' }}
      >
        {number}
      </Text>
      <Text selectable style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
        {label}
      </Text>
    </View>
  );
}
