import { Pressable, ScrollView, Text, View } from 'react-native';

export default function Profile() {
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ paddingVertical: 20 }}
    >
      <View style={{ paddingHorizontal: 16, gap: 20 }}>
        <View
          style={{
            alignItems: 'center',
            gap: 12,
            paddingVertical: 20,
            backgroundColor: 'white',
            borderRadius: 12,
            borderColor: '#eee',
            borderWidth: 1,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: '#007AFF',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 40 }}>🪳</Text>
          </View>
          <Text selectable style={{ fontSize: 20, fontWeight: '700' }}>
            L02-CockRoaches
          </Text>
          <Text selectable style={{ fontSize: 14, color: '#666' }}>
            Mobile Development · Class L02
          </Text>
          <View
            style={{
              flexDirection: 'row',
              gap: 16,
              marginTop: 8,
              paddingTop: 12,
              borderTopColor: '#eee',
              borderTopWidth: 1,
              width: '100%',
              justifyContent: 'center',
            }}
          >
            <StatCell label="Members" value="4+" />
            <StatCell label="Focus" value="MVP" />
            <StatCell label="Course" value="L02" />
          </View>
        </View>

        <View style={{ gap: 8 }}>
          <Text selectable style={{ fontSize: 16, fontWeight: '600' }}>
            Project Goal
          </Text>
          <Text
            selectable
            style={{ fontSize: 14, color: '#666', lineHeight: 20 }}
          >
            Build a scalable MVP for cognitive training game with bimanual
            interaction, focused on UX optimization and technical proficiency.
          </Text>
        </View>

        <View style={{ gap: 12 }}>
          <Text selectable style={{ fontSize: 16, fontWeight: '600' }}>
            Tech Stack
          </Text>
          <View style={{ gap: 8 }}>
            <TechRow label="Expo / React Native" value="Frontend" />
            <TechRow label="TypeScript" value="Code safety" />
            <TechRow label="REST APIs" value="Extensible" />
            <TechRow label="Firebase" value="Future online features" />
          </View>
        </View>

        <View style={{ gap: 10, marginTop: 12 }}>
          <Pressable
            style={{
              backgroundColor: '#007AFF',
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 10,
              alignItems: 'center',
            }}
          >
            <Text
              selectable
              style={{ color: 'white', fontSize: 14, fontWeight: '600' }}
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
    <View style={{ alignItems: 'center', gap: 4 }}>
      <Text
        selectable
        style={{ fontSize: 16, fontWeight: '700', color: '#007AFF' }}
      >
        {value}
      </Text>
      <Text selectable style={{ fontSize: 12, color: '#999' }}>
        {label}
      </Text>
    </View>
  );
}

function TechRow({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        backgroundColor: 'white',
        borderRadius: 10,
        borderColor: '#eee',
        borderWidth: 1,
        padding: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Text selectable style={{ fontSize: 13, color: '#222' }}>
        {label}
      </Text>
      <Text
        selectable
        style={{ fontSize: 12, fontWeight: '600', color: '#007AFF' }}
      >
        {value}
      </Text>
    </View>
  );
}
