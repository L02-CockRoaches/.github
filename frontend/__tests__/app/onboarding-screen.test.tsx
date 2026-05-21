import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  __esModule: true,
  router: {
    replace: (...args: unknown[]) => mockReplace(...args),
  },
}));

import OnboardingScreen from '@/app/index';

describe('<OnboardingScreen />', () => {
  beforeEach(() => {
    mockReplace.mockClear();
  });

  it('renders the onboarding content', () => {
    const { getByText } = render(<OnboardingScreen />);

    expect(getByText('🪳 GameTwoShape')).toBeTruthy();
    expect(getByText('Train your brain, both sides at once.')).toBeTruthy();
    expect(getByText('Core Gameplay')).toBeTruthy();
    expect(getByText('Bắt đầu demo')).toBeTruthy();
  });

  it('navigates to explore when the CTA button is pressed', () => {
    const { getByText } = render(<OnboardingScreen />);

    fireEvent.press(getByText('Bắt đầu demo'));

    expect(mockReplace).toHaveBeenCalledWith('/explore');
  });

  it('mounts without crashing', () => {
    const { toJSON } = render(<OnboardingScreen />);

    expect(toJSON()).toBeTruthy();
  });
});
