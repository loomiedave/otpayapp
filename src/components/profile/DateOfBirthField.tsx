import React, { useState } from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '@/contexts/ThemeContext';

interface DateOfBirthFieldProps {
  value: string | null;
  locked: boolean;
  bordered?: boolean;
  onSave: (isoDate: string) => Promise<void> | void;
}

const formatDisplay = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

export default function DateOfBirthField({ value, locked, bordered = true, onSave }: DateOfBirthFieldProps): React.JSX.Element {
  const { isDark } = useTheme();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const borderClass = bordered ? (isDark ? 'border-b border-border-main-dark' : 'border-b border-border-main') : '';
  const mutedText = isDark ? 'text-text-muted-dark text-sm' : 'text-text-muted text-sm';
  const mainText = isDark ? 'text-text-main-dark text-sm font-medium' : 'text-text-main text-sm font-medium';
  const iconColor = isDark ? '#94a3b8' : '#64748b';

  const handleChange = async (_event: unknown, date?: Date) => {
    setPickerOpen(Platform.OS === 'ios');
    if (!date) return;
    setPending(true);
    try {
      await onSave(date.toISOString().split('T')[0]);
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <Pressable
        onPress={() => !locked && setPickerOpen(true)}
        disabled={locked || pending}
        className={`flex-row items-center justify-between py-3.5 ${borderClass}`}
      >
        <Text className={mutedText}>Date of Birth</Text>
        <View className="flex-row items-center" style={{ gap: 6 }}>
          <Text className={value ? mainText : 'text-primary text-sm font-medium'}>
            {pending ? 'Saving…' : value ? formatDisplay(value) : 'Add date of birth'}
          </Text>
          <Feather name={locked ? 'lock' : 'chevron-right'} size={13} color={iconColor} />
        </View>
      </Pressable>

      {pickerOpen && (
        <DateTimePicker
          value={new Date(2000, 0, 1)}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          maximumDate={new Date()}
          onValueChange={handleChange}
        />
      )}
    </>
  );
}
