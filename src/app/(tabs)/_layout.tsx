import React from 'react';
import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTranslation } from 'react-i18next';

import { useTheme } from '@/contexts/ThemeContext'; // NEW: to know if the app is in dark mode
import { useThemeColors } from '@/hooks/useThemeColors'; // NEW: icon colors from your theme

// CHANGED: the NAVY, GOLD and INACTIVE constants are gone. Colors now come from your Tailwind theme.

// Raises the middle tab (Markets) as the floating button, like Mixx's scan button.
// Set to false for five equal tabs.
const RAISE_CENTER = true;

type TabBarProps = Parameters<NonNullable<React.ComponentProps<typeof Tabs>['tabBar']>>[0];

function CustomTabBar({ state, descriptors, navigation }: TabBarProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme(); // NEW
  const colors = useThemeColors(); // NEW

  const visible = state.routes
    .map((route, index) => ({ route, index }))
    .filter(({ route }) => (descriptors[route.key].options as any).href !== null);

  const hasCenter = RAISE_CENTER && visible.length % 2 === 1;
  const centerPosition = Math.floor(visible.length / 2);

  // NEW: theme classes for the bar, in light and dark mode
  const barClass = isDark
    ? 'bg-background-card-dark border-t border-border-main-dark'
    : 'bg-background-card border-t border-border-main';

  return (
    <View
      // CHANGED: background and top border come from the theme (className) instead of the NAVY constant
      className={`flex-row items-center ${barClass}`}
      style={{
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingTop: 10,
        paddingBottom: Math.max(insets.bottom, 10),
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: -4 },
        elevation: 16,
      }}
    >
      {visible.map(({ route, index }, position) => {
        const { options } = descriptors[route.key];
        const focused = state.index === index;
        const label = typeof options.title === 'string' ? options.title : route.name;
        const isCenter = hasCenter && position === centerPosition;

        // CHANGED: icon color from the theme (blue when active, muted grey when not)
        const iconColor = focused ? colors.primary : colors.iconMuted;

        // CHANGED: label color from the theme classes
        const labelClass = focused
          ? isDark ? 'text-primary-dark' : 'text-primary'
          : isDark ? 'text-text-muted-dark' : 'text-text-muted';

        // CHANGED: the center tab no longer needs an icon, it shows "OT" instead (see below)
        const icon = isCenter
          ? null
          : options.tabBarIcon?.({ focused, color: iconColor, size: 22 }) ?? (
              <Feather name="circle" size={22} color={iconColor} />
            );

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => navigation.emit({ type: 'tabLongPress', target: route.key });

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            onLongPress={onLongPress}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={focused ? { selected: true } : {}}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 6 }}
          >
            {isCenter ? (
              <>
                <View
                  className="bg-accent items-center justify-center"
                  style={{
                    position: 'absolute',
                    top: -34,
                    left: '50%',
                    marginLeft: -31,
                    width: 62,
                    height: 62,
                    borderRadius: 31,
                    shadowColor: '#000',
                    shadowOpacity: 0.25,
                    shadowRadius: 8,
                    shadowOffset: { width: 0, height: 4 },
                    elevation: 10,
                  }}
                >
                  <Text className="text-text-main text-2xl font-black italic" style={{ letterSpacing: -1 }}>
                    OT
                  </Text>
                </View>
                <View style={{ height: 22 }} />
              </>
            ) : (
              icon
            )}
            <Text className={labelClass} style={{ fontSize: 11, fontWeight: focused ? '700' : '500', marginTop: 4 }}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabsLayout(): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <CustomTabBar {...props} />}>
      <Tabs.Screen
        name='home'
        options={{
          title: `${t('nav.home')}`,
          tabBarIcon: ({ color, size }) => <Feather name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="recipients"
        options={{
          title: `${t('nav.recipients')}`,
          tabBarIcon: ({ color, size }) => <Feather name="users" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="markets"
        options={{
          title: `${t('nav.markets')}`,
          // The icon below is no longer shown (the "OT" mark replaces it), but it is harmless to keep
          tabBarIcon: ({ color, size }) => <Feather name="activity" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: `${t('nav.transactions')}`,
          tabBarIcon: ({ color, size }) => <Feather name="calendar" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: `${t('nav.more')}`,
          tabBarIcon: ({ color, size }) => <Feather name="align-justify" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
