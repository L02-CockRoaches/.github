import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

const mockReplace = jest.fn();

jest.mock('expo-router', () => {
  const React = require('react');

  return {
    Link: ({ children, href, asChild }: any) => {
      if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children, {
          onPress: () => {},
        });
      }

      return children;
    },
    useLocalSearchParams: () => ({}),
    router: {
      push: jest.fn(),
      replace: (...args: unknown[]) => mockReplace(...args),
      setParams: jest.fn(),
    },
  };
});

import Home from '@/app/(tabs)/home';

describe('<Home />', () => {
  beforeEach(() => {
    mockReplace.mockClear();
  });

  it('renders the home screen content', () => {
    const { getByText } = render(<Home />);

    expect(getByText(/STITCH SYNC/i)).toBeTruthy();
    expect(getByText(/CHƠI ĐƠN & CO-OP/i)).toBeTruthy();
    expect(getByText(/TÌM TRẬN THI ĐẤU/i)).toBeTruthy();
  });

  it('calls navigation when the play button is pressed', () => {
    const { getByText } = render(<Home />);

    fireEvent.press(getByText(/CHƠI ĐƠN & CO-OP/i));

    expect(mockReplace).toHaveBeenCalledWith('/(tabs)/explore');
  });

  it('mounts without crashing', () => {
    const { toJSON } = render(<Home />);

    expect(toJSON()).toBeTruthy();
  });
});
