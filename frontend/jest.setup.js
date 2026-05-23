import 'react-native-reanimated/mock';

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    Ionicons: (props) => React.createElement(Text, props, props.name || 'Ionicons'),
  };
});

// Mock expo-font
jest.mock('expo-font', () => ({
  useFonts: () => [true, null],
  loadAsync: () => Promise.resolve(),
  isLoaded: () => true,
}));

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  impactAsync: jest.fn().mockResolvedValue(undefined),
  selectionAsync: jest.fn().mockResolvedValue(undefined),
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
}));

afterEach(() => {
  jest.clearAllMocks();
});

