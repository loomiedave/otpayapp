import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Input from '@/components/ui/Input';
import { useTheme } from '@/contexts/ThemeContext';

interface ProfileFieldProps {
  label: string;
  value: string | null;
  locked: boolean;
  bordered?: boolean;
  placeholder?: string;
  keyboardType?: 'default' | 'phone-pad' | 'email-address';
  onSave: (value: string) => Promise<void> | void;
}

export default function ProfileField({
  label,
  value,
  locked,
  bordered = true,
  placeholder,
  keyboardType = 'default',
  onSave,
}: ProfileFieldProps): React.JSX.Element {
  const { isDark } = useTheme();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? '');
  const [saving, setSaving] = useState(false);

  const borderClass = bordered ? (isDark ? 'border-b border-border-main-dark' : 'border-b border-border-main') : '';
  const mutedText = isDark ? 'text-text-muted-dark text-sm' : 'text-text-muted text-sm';
  const mainText = isDark ? 'text-text-main-dark text-sm font-medium' : 'text-text-main text-sm font-medium';
  const iconColor = isDark ? '#94a3b8' : '#64748b';

  const handleSave = async () => {
    if (!draft.trim()) return;
    setSaving(true);
    try {
      await onSave(draft.trim());
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <View className={`py-3.5 ${borderClass}`}>
        <Text className={`${mutedText} mb-2`}>{label}</Text>
        <Input placeholder={placeholder} value={draft} onChangeText={setDraft} keyboardType={keyboardType} autoFocus />
        <View className="flex-row justify-end mt-2" style={{ gap: 20 }}>
          <Pressable onPress={() => { setDraft(value ?? ''); setEditing(false); }}>
            <Text className={mutedText}>Cancel</Text>
          </Pressable>
          <Pressable onPress={handleSave} disabled={saving || !draft.trim()}>
            <Text className="text-primary text-sm font-semibold">{saving ? 'Saving…' : 'Save'}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <Pressable
      onPress={() => !locked && setEditing(true)}
      disabled={locked}
      className={`flex-row items-center justify-between py-3.5 ${borderClass}`}
    >
      <Text className={mutedText}>{label}</Text>
      <View className="flex-row items-center" style={{ gap: 6 }}>
        <Text className={value ? mainText : 'text-primary text-sm font-medium'}>
          {value || `Add ${label.toLowerCase()}`}
        </Text>
        <Feather name={locked ? 'lock' : 'chevron-right'} size={13} color={iconColor} />
      </View>
    </Pressable>
  );
}
