import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

type Props = {
  isDark: boolean;
};

export default function EmptyTransactions({ isDark }: Props) {
  return (
    <View className="items-center justify-center py-16">
      <View
        className={
          isDark
            ? 'w-16 h-16 rounded-full bg-background-card-dark items-center justify-center mb-4'
            : 'w-16 h-16 rounded-full bg-background-card items-center justify-center mb-4'
        }
      >
        <Feather
          name="clock"
          size={26}
          color={isDark ? '#94a3b8' : '#64748b'}
        />
      </View>

      <Text
        className={
          isDark
            ? 'text-text-main-dark font-bold text-base mb-1'
            : 'text-text-main font-bold text-base mb-1'
        }
      >
        No transactions yet
      </Text>

      <Text
        className={
          isDark
            ? 'text-text-muted-dark text-sm text-center px-8'
            : 'text-text-muted text-sm text-center px-8'
        }
      >
        Your sent and received transfers will show up here.
      </Text>
    </View>
  );
}