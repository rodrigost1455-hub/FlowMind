import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

import type { TokenPair } from "@/api/types";

// expo-secure-store doesn't run on web; fall back to AsyncStorage there.
// AsyncStorage on web is window.localStorage — fine for dev, not for prod.
const ACCESS = "flowmind.access_token";
const REFRESH = "flowmind.refresh_token";

const isWeb = Platform.OS === "web";

async function setItem(key: string, value: string): Promise<void> {
  if (isWeb) {
    await AsyncStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

async function getItem(key: string): Promise<string | null> {
  if (isWeb) return AsyncStorage.getItem(key);
  return SecureStore.getItemAsync(key);
}

async function deleteItem(key: string): Promise<void> {
  if (isWeb) {
    await AsyncStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
}

export async function saveTokens(tokens: TokenPair): Promise<void> {
  await Promise.all([
    setItem(ACCESS, tokens.access_token),
    setItem(REFRESH, tokens.refresh_token),
  ]);
}

export const getToken = () => getItem(ACCESS);
export const getRefreshToken = () => getItem(REFRESH);

export async function clearTokens(): Promise<void> {
  await Promise.all([deleteItem(ACCESS), deleteItem(REFRESH)]);
}
