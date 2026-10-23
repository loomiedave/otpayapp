import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

const NAVY = '#0E2F6B';
const GOLD = '#D4A62B';
const INACTIVE = 'rgba(255,255,255,0.78)';

// Raises the middle tab (Markets) as the gold floating button, like Mixx's scan button.
// Set to false for five equal tabs.
const RAISE_CENTER = true;

type TabBarProps = Parameters<NonNullable<React.ComponentProps<typeof Tabs>['tabBar']>>[0];

function CustomTabBar({ state, descriptors, navigation }: TabBarProps): React.JSX.Element {
  const insets = useSafeAreaInsets();

  const visible = state.routes
    .map((route, index) => ({ route, index }))
    .filter(({ route }) => (descriptors[route.key].options as any).href !== null);

  const hasCenter = RAISE_CENTER && visible.length % 2 === 1;
  const centerPosition = Math.floor(visible.length / 2);

  return (
    <View
      style={{
        backgroundColor: NAVY,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingTop: 10,
        paddingBottom: Math.max(insets.bottom, 10),
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.18,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: -4 },
        elevation: 16,
      }}
    >
      {visible.map(({ route, index }, position) => {
        const { options } = descriptors[route.key];
        const focused = state.index === index;
        const color = focused ? GOLD : INACTIVE;
        const label = typeof options.title === 'string' ? options.title : route.name;
        const isCenter = hasCenter && position === centerPosition;

        const icon =
          options.tabBarIcon?.({
            focused,
            color: isCenter ? NAVY : color,
            size: isCenter ? 26 : 22,
          }) ?? <Feather name="circle" size={22} color={color} />;

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
                  style={{
                    position: 'absolute',
                    top: -34,
                    left: '50%',
                    marginLeft: -31,
                    width: 62,
                    height: 62,
                    backgroundColor: GOLD,
                    borderTopLeftRadius: 31,
                    borderTopRightRadius: 31,
                    borderBottomLeftRadius: 31,
                    borderBottomRightRadius: 10,
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: '#000',
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    shadowOffset: { width: 0, height: 4 },
                    elevation: 10,
                  }}
                >
                  {icon}
                </View>
                <View style={{ height: 22 }} />
              </>
            ) : (
              icon
            )}
            <Text style={{ color, fontSize: 11, fontWeight: focused ? '700' : '500', marginTop: 4 }}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabsLayout(): React.JSX.Element {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <CustomTabBar {...props} />}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Feather name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="recipients"
        options={{
          title: 'Recipients',
          tabBarIcon: ({ color, size }) => <Feather name="users" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="markets"
        options={{
          title: 'Markets',
          tabBarIcon: ({ color, size }) => <Feather name="activity" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transactions',
          tabBarIcon: ({ color, size }) => <Feather name="calendar" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'More',
          tabBarIcon: ({ color, size }) => <Feather name="align-justify" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}