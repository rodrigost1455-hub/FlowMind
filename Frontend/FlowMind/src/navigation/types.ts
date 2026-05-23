import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type AuthStackNavProp<T extends keyof AuthStackParamList> =
  NativeStackNavigationProp<AuthStackParamList, T>;

export type AppTabsParamList = {
  Dashboard: undefined;
  Expenses: undefined;
  Insights: undefined;
  Profile: undefined;
};
