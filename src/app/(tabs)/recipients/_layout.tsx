import { Stack } from 'expo-router';

export const unstable_settings = {
  anchor: 'index',
};

export default function RecipientsScreenLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
