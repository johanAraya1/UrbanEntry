import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { LOGO } from '../src/config';

export default function AppLogo({ size = 'medium', style }) {
  const getSize = () => {
    switch (size) {
      case 'small':
        return { width: 40, height: 40, borderRadius: 20 };
      case 'medium':
        return { width: 60, height: 60, borderRadius: 30 };
      case 'large':
        return { width: 100, height: 100, borderRadius: 50 };
      default:
        return { width: 60, height: 60, borderRadius: 30 };
    }
  };

  const sizeStyle = getSize();

  return (
    <View style={[styles.logoContainer, sizeStyle, style]}>
      <Image source={LOGO} style={styles.logoImage} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  logoImage: {
    width: '70%',
    height: '70%',
  },
});
