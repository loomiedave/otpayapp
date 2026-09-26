import React, { useState } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import ScreenContainer from '../../components/ui/ScreenContainer';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Image } from 'expo-image';

export default function SignUpScreen(): React.JSX.Element {
  const router = useRouter();
  const { isDark } = useTheme();
  const { signUp } = useAuth();
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [agreeTerms, setAgreeTerms] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string>('');

  const handleSignUp = async (): Promise<void> => {
    if (!firstName || !lastName || !phone || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!agreeTerms) {
      setError('Please agree to the Terms and Privacy Policy');
      return;
    }
    setError('');
    setServerError('');
    setIsSubmitting(true);

    try {
      const { error: signUpError, needsEmailConfirmation } = await signUp(
        email.trim(),
        password,
        {
          first_name: firstName,
          last_name: lastName,
          phone: phone.trim(),
        }
      );

      if (signUpError) {

          setError(signUpError);

        return;
      }

      if (needsEmailConfirmation) {
        setAwaitingConfirmation(true);
        return;
      }
    } catch (err) {
      console.error('Sign up server error:', err);
      setServerError(
        'We\u2019re having trouble connecting to our servers. Please try again later.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (awaitingConfirmation) {
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
            We sent a confirmation link to{'\n'}
            <Text className={isDark ? 'text-text-main-dark font-semibold' : 'text-text-main font-semibold'}>
              {email}
            </Text>
            . Tap it to activate your account, then log in below.
          </Text>
          <Button label="Back to Log In" onPress={() => router.replace('/login')} />
        </View>
      </ScreenContainer>
    );
  }

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
                handleSignUp();
              }}
            />
            <View className="mt-3">
              <Button label="Go Back" variant="secondary" onPress={() => setServerError('')} />
            </View>
          </View>
        </View>
      </Modal>

      <View className="flex-1 justify-between pt-12 pb-8">
        <View className="w-full items-center">
          <View className="mb-4">
            <Image
              className="w-32 h-10 self-center"
              style={{ width: 240, height: 60 }}
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
            Create Account
          </Text>
          <Text
            className={
              isDark
                ? 'text-text-muted-dark text-base text-center px-6 leading-5 mb-8'
                : 'text-text-muted text-base text-center px-6 leading-5 mb-8'
            }
          >
            Join thousands sending money across West Africa securely.
          </Text>

          <View className="w-full">
            <View className="flex-row w-full" style={{ gap: 12 }}>
              <View className="flex-1">
                <Input label="First Name" placeholder="Kwame" icon="user" value={firstName} onChangeText={setFirstName} />
              </View>
              <View className="flex-1">
                <Input label="Last Name" placeholder="Mensah" icon="user" value={lastName} onChangeText={setLastName} />
              </View>
            </View>

            <View className="mt-4">
              <Input
                label="Phone Number"
                placeholder="e.g. 020 123 4567"
                keyboardType="phone-pad"
                icon="phone"
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            <View className="mt-4">
              <Input
                label="Email"
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                icon="mail"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View className="mt-4">
              <Input
                label="Password"
                placeholder="Your password"
                autoCapitalize="none"
                secureToggle
                icon="lock"
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <View className="mt-4">
              <Input
                label="Confirm Password"
                placeholder="Your password"
                autoCapitalize="none"
                secureToggle
                icon="lock"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                error={error}
              />
            </View>

            <Pressable className="flex-row items-start mt-5 px-1" onPress={() => setAgreeTerms(!agreeTerms)}>
              <View
                className={`w-5 h-5 rounded border items-center justify-center mt-0.5 mr-3 ${
                  agreeTerms ? 'bg-primary border-primary' : isDark ? 'border-text-muted-dark' : 'border-text-muted'
                }`}
              >
                {agreeTerms && <Feather name="check" size={12} color="#fff" />}
              </View>
              <Text className={isDark ? 'flex-1 text-text-muted-dark text-xs leading-4' : 'flex-1 text-text-muted text-xs leading-4'}>
                I agree to the{' '}
                <Text className={isDark ? 'text-text-main-dark font-semibold' : 'text-text-main font-semibold'}>
                  Terms of Service
                </Text>{' '}
                and{' '}
                <Text className={isDark ? 'text-text-main-dark font-semibold' : 'text-text-main font-semibold'}>
                  Privacy Policy
                </Text>
              </Text>
            </Pressable>

            <View className="mt-6">
              <Button
                label={isSubmitting ? 'Creating account...' : 'Create Account'}
                onPress={handleSignUp}
                disabled={isSubmitting}
              />
            </View>
          </View>
        </View>

        <View className="flex-row justify-center items-center mt-6">
          <Text className={isDark ? 'text-text-muted-dark text-sm font-medium' : 'text-text-muted text-sm font-medium'}>
            Already have an account?
          </Text>
          <Pressable onPress={() => router.push('/login')}>
            <Text className={isDark ? 'text-text-main-dark font-bold text-sm ml-1' : 'text-text-main font-bold text-sm ml-1'}>
              Log In
            </Text>
          </Pressable>
        </View>
      </View>
    </ScreenContainer>
  );
}
