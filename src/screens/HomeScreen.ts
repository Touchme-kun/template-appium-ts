import { ScreenFactory } from '../core/ScreenFactory';
import { DashboardScreen } from './android/DashboardScreen.android';
// TODO: Replace second arg with iOS DashboardScreen when implemented

export const homeScreen = ScreenFactory.createScreen(DashboardScreen, DashboardScreen);
