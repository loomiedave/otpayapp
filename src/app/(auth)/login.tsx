import React, { useState } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import ScreenContainer from '../../components/ui/ScreenContainer';
import Input from '@/components/ui/Input';
import Button from '../../components/ui/Button';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Image } from 'expo-image';

export default function LoginScreen(): React.JSX.Element {
  const router = useRouter();
  const { isDark } = useTheme();
  const { signIn } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string>('');

  const handleLogin = async (): Promise<void> => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setServerError('');
    setIsSubmitting(true);

    try {
      const { error: signInError } = await signIn(email.trim(), password);
      if (signInError) {
        setError(signInError);
        return;
      }
    } catch (err) {
      console.error('Login server error:', err);
      setServerError(
        'We\u2019re having trouble connecting to our servers. Please try again later.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer scroll keyboardAvoiding>
      <Modal
        visible={!!serverError}
        transparent
        animationType="fade"
        onRequestClose={() => setServerError('')}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View
            className={
              isDark
                ? 'w-full bg-background-dark rounded-3xl p-6'
                : 'w-full bg-white rounded-3xl p-6'
            }
          >
            <Text
              className={
                isDark
                  ? 'text-xl font-bold text-text-main-dark mb-2'
                  : 'text-xl font-bold text-text-main mb-2'
              }
            >
              Something went wrong
            </Text>

            <Text
              className={
                isDark
                  ? 'text-text-muted-dark text-base leading-5 mb-6'
                  : 'text-text-muted text-base leading-5 mb-6'
              }
            >
              {serverError}
            </Text>

            <Button
              label="Try Again"
              onPress={() => {
                setServerError('');
                handleLogin();
              }}
            />

            <View className="mt-3">
              <Button
                label="Go Back"
                variant="secondary"
                onPress={() => setServerError('')}
              />
            </View>
          </View>
        </View>
      </Modal>

      <View className="flex-1 justify-between pt-16 pb-8">
        <View className="w-full items-center">
          <View className="justify-center items-center shadow-sm mb-10">
            <Image
              className="w-48 h-12 self-center"
              style={{ width: 240, height: 80 }}
              source={require('@/assets/images/otpay-logo.png')}
              contentFit="contain"
              transition={1000}
            />
          </View>
          <Text
            className={
              isDark
                ? 'text-3xl font-bold text-text-main-dark text-center mb-2'
                : 'text-3xl font-bold text-text-main text-center mb-2'
            }
          >
            Welcome Back
          </Text>
          <Text
            className={
              isDark
                ? 'text-text-muted-dark text-base text-center px-6 leading-5 mb-10'
                : 'text-text-muted text-base text-center px-6 leading-5 mb-10'
            }
          >
            Enter your email and password to access your account.
          </Text>
          <View className="w-full">
            <Input
              label="Email"
              icon="mail"
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            <Input
              label="Password"
              icon="lock"
              placeholder="Your password"
              autoCapitalize="none"
              secureToggle
              value={password}
              onChangeText={setPassword}
              error={error}
            />
            <Pressable onPress={() => router.push('/forgot-password')} className="self-end mt-2">
              <Text className={isDark ? 'text-text-muted-dark text-sm font-semibold' : 'text-text-muted text-sm font-semibold'}>
                Forgot Password?
              </Text>
            </Pressable>
            <View className="mt-8">
              <Button label={isSubmitting ? 'Logging in...' : 'Log In'} onPress={handleLogin} disabled={isSubmitting} />
            </View>
          </View>
        </View>
        <View className="flex-row justify-center items-center mt-6">
          <Text className={isDark ? 'text-text-muted-dark text-sm font-medium' : 'text-text-muted text-sm font-medium'}>
            Don't have an account?
          </Text>
          <Pressable onPress={() => router.push('/signUp')}>
            <Text className={isDark ? 'text-text-main-dark font-bold text-sm ml-1' : 'text-text-main font-bold text-sm ml-1'}>
              Sign Up
            </Text>
          </Pressable>
        </View>
      </View>
    </ScreenContainer>
  );
}
