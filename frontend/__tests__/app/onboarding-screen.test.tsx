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
  let randomSpy: jest.SpyInstance;

  beforeEach(() => {
    mockReplace.mockClear();
    jest.useFakeTimers();
    randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.9);
  });

  afterEach(() => {
    randomSpy.mockRestore();
    jest.useRealTimers();
  });

  const renderReadyScreen = () => {
    const screen = render(<OnboardingScreen />);

    act(() => {
      jest.advanceTimersByTime(35 * 120 + 500);
    });

    return screen;
  };

  it('renders the onboarding content', () => {
    const screen = renderReadyScreen();

    try {
      expect(screen.getByText(/GameTwoShape/i)).toBeTruthy();
      expect(screen.getByText(/Train your brain, both sides at once/i)).toBeTruthy();
      expect(screen.getByText(/Core Gameplay/i)).toBeTruthy();
      expect(screen.getAllByText(/LUY/i).length).toBeGreaterThan(0);
    } finally {
      screen.unmount();
    }
  });

  it('navigates to home when the CTA button is pressed', () => {
    const screen = renderReadyScreen();

    try {
      const ctaLabels = screen.getAllByText(/LUY/i);
      fireEvent.press(ctaLabels[ctaLabels.length - 1]);

      expect(mockReplace).toHaveBeenCalledWith('/(tabs)/home');
    } finally {
      screen.unmount();
    }
  });

  it('mounts without crashing', () => {
    const screen = renderReadyScreen();

    try {
      expect(screen.toJSON()).toBeTruthy();
    } finally {
      screen.unmount();
    }
  });
});
