import React from 'react';
import { fireEvent, render, act } from '@testing-library/react-native';

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
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders the onboarding content', () => {
    const { getByText } = render(<OnboardingScreen />);

    // Fast forward the splash screen progress simulation
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(getByText(/GameTwoShape/i)).toBeTruthy();
    expect(getByText(/Train your brain, both sides at once/i)).toBeTruthy();
    expect(getByText(/Core Gameplay/i)).toBeTruthy();
    expect(getByText(/Bắt đầu tập luyện/i)).toBeTruthy();
  });

  it('navigates to home when the CTA button is pressed', () => {
    const { getByText } = render(<OnboardingScreen />);

    // Fast forward the splash screen progress simulation
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    fireEvent.press(getByText(/Bắt đầu tập luyện/i));

    expect(mockReplace).toHaveBeenCalledWith('/(tabs)/home');
  });

  it('mounts without crashing', () => {
    const { toJSON } = render(<OnboardingScreen />);

    expect(toJSON()).toBeTruthy();
  });
});
