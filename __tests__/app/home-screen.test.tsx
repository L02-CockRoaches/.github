import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

const mockLinkPress = jest.fn();

jest.mock('expo-router', () => {
  const React = require('react');

  return {
    Link: ({ children, href, asChild }: any) => {
      if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children, {
          onPress: () => mockLinkPress(href),
        });
      }

      return children;
    },
  };
});

import Home from '@/app/(tabs)/home';

describe('<Home />', () => {
  beforeEach(() => {
    mockLinkPress.mockClear();
  });

  it('renders the home screen content', () => {
    const { getByText } = render(<Home />);

    expect(getByText('Welcome! 👋')).toBeTruthy();
    expect(
      getByText('Đây là dự án App Mobile Dev của nhóm L02-CockRoaches')
    ).toBeTruthy();
    expect(getByText('GameTwoShape')).toBeTruthy();
    expect(getByText('Explore Features')).toBeTruthy();
  });

  it('calls navigation when the explore button is pressed', () => {
    const { getByText } = render(<Home />);

    fireEvent.press(getByText('Explore Features'));

    expect(mockLinkPress).toHaveBeenCalledWith('/explore');
  });

  it('mounts without crashing', () => {
    const { toJSON } = render(<Home />);

    expect(toJSON()).toBeTruthy();
  });
});
