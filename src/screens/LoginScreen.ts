import { ScreenFactory } from '../core/ScreenFactory';
import { LoginScreen as AndroidLoginScreen } from './android/LoginScreen.android';
import { LoginScreen as IOSLoginScreen } from './ios/LoginScreen.ios';

export const loginScreen = ScreenFactory.createScreen(
  AndroidLoginScreen,
  IOSLoginScreen as unknown as typeof AndroidLoginScreen
);
