import React from 'react';
import { Text, StyleSheet } from 'react-native';

export default function AppText(props) {
  return (
    <Text style={[styles.defaultStyle, props.style]}>
      {props.children}
    </Text>
  );
}

const styles = StyleSheet.create({
  defaultStyle: {
    fontFamily: 'PlusJakartaSans_400Regular',
    color: '#000', 
  },
});