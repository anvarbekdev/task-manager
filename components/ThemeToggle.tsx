import AsyncStorage from '@react-native-async-storage/async-storage';
import { TouchableOpacity, View } from 'react-native';
import { setAndroidNavigationBar } from '~/lib/android-navigation-bar';
import { Text } from './ui/text';
import { useEffect } from 'react';
import { useColorScheme } from 'nativewind';
import { cn } from '~/lib/utils';

export function ThemeToggle() {
  const { setColorScheme, colorScheme } = useColorScheme();
  
  const data = [
    { label: "Light", value: "light" },
    { label: "Dark", value: "dark" },
    { label: "System", value: "system" },
  ]

  useEffect(() => {
    if (colorScheme) {
      AsyncStorage.setItem('theme', colorScheme);
    }
  }, [colorScheme]);

  return (

    <View className='bg-gray flex-row rounded-2xl justify-start  mt-4'>
      {data.map((item) => (
        <TouchableOpacity
          onPress={() => {
            setColorScheme(item.value as any);
            setAndroidNavigationBar(item.value as any);
            AsyncStorage.setItem('themeorg', item.value as any);
          }}
          key={item.value}
          className={cn(
            `flex-row py-2 px-4 gap-x-2 items-center`,
            item.value === colorScheme && "border-b border-border"
          )}>
          <Text>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
