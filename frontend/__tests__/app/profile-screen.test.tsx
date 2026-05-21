import { render } from '@testing-library/react-native';

import Profile from '@/app/(tabs)/profile';

describe('<Profile />', () => {
  it('renders the project summary and stack labels', () => {
    const { getByText } = render(<Profile />);

    expect(getByText('L02-CockRoaches')).toBeTruthy();
    expect(getByText('Project Goal')).toBeTruthy();
    expect(getByText('Tech Stack')).toBeTruthy();
    expect(getByText('Expo / React Native')).toBeTruthy();
    expect(getByText('Contact Team')).toBeTruthy();
  });
});
