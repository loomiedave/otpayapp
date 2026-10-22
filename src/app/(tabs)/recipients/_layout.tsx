import { Stack } from 'expo-router';

export const unstable_settings = {
  anchor: 'index',
};

export default function RecipientsScreenLayout() {
  return (
    <Stack
      initialRouteName="index"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="add-recipient" />
    </Stack>
  );
}
