import React from 'react';
import { View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  noPadding?: boolean;
}

export function Card({ children, noPadding, className, ...rest }: CardProps): React.JSX.Element {
  return (
    <View
      className={`bg-background-card rounded-2xl border border-border-main ${noPadding ? '' : 'p-4'} ${className ?? ''}`}
      {...rest}
    >
      {children}
    </View>
  );
}

export function Divider(): React.JSX.Element {
  return <View className="h-px bg-border-main w-full" />;
}
