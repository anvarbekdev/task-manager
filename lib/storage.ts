import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV();

export const save = (key: string, value: any) => {
  storage.set(key, JSON.stringify(value));
};

export const load = (key: string) => {
  const raw = storage.getString(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const remove = (key: string) => {
  storage.delete(key);
};
