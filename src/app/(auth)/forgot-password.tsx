import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import ScreenContainer from '../../components/ui/ScreenContainer';
import Input from '@/components/ui/Input';
import Button from '../../components/ui/Button';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';

export default function ForgotPasswordScreen(): React.JSX.Element {
  const { isDark } = useTheme();
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [sent, setSent] = useState<boolean>(false);

  const handleReset = async (): Promise<void> => {
    if (!email) {
      setError('Please enter your email');
      return;
    }
    setError('');
    setIsSubmitting(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim());
    setIsSubmitting(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-6">
            <Feather name="mail" size={32} color="#6c63ff" />
          </View>
          <Text
            className={
              isDark
                ? 'text-2xl font-bold text-text-main-dark text-center mb-3'
                : 'text-2xl font-bold text-text-main text-center mb-3'
            }
          >
            Check your email
          </Text>
          <Text
            className={
              isDark
                ? 'text-text-muted-dark text-base text-center leading-5 mb-8'
                : 'text-text-muted text-base text-center leading-5 mb-8'
            }
          >
            We sent a password reset link to{'\n'}
            <Text className={isDark ? 'text-text-main-dark font-semibold' : 'text-text-main font-semibold'}>
              {email}
            </Text>
          </Text>
          <Button label="Back to Log In" onPress={() => router.replace('/login')} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll keyboardAvoiding>
      <View className="flex-1 justify-between pt-16 pb-8">
        <View className="w-full items-center">
          <View className="w-24 h-24 bg-primary rounded-3xl justify-center items-center shadow-sm mb-10">
            <Feather name="lock" size={32} color="#fff" />
          </View>
          <Text
            className={
              isDark
                ? 'text-3xl font-bold text-text-main-dark text-center mb-2'
                : 'text-3xl font-bold text-text-main text-center mb-2'
            }
          >
            Forgot Password?
          </Text>
          <Text
            className={
              isDark
                ? 'text-text-muted-dark text-base text-center px-6 leading-5 mb-10'
                : 'text-text-muted text-base text-center px-6 leading-5 mb-10'
            }
          >
            Enter your email and we'll send you a link to reset your password.
          </Text>
          <View className="w-full">
            <Input
              label="Email"
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              icon="mail"
              value={email}
              onChangeText={setEmail}
              error={error}
            />
            <View className="mt-8">
              <Button
                label={isSubmitting ? 'Sending...' : 'Send Reset Link'}
                onPress={handleReset}
                disabled={isSubmitting}
              />
            </View>
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}
