import React from 'react';
import { Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import COLORS from '../constants/colors';

const Button = props => {
  const filledBgColor = props.color || COLORS.headerBg || '#471d7d';
  const outlinedColor = COLORS.white;
  const isFilled = props.filled !== undefined ? props.filled : true;
  const bgColor = isFilled ? filledBgColor : outlinedColor;
  const textColor = isFilled ? COLORS.white : (props.color || COLORS.headerBg || '#471d7d');

  const handlePress = props.onpress || props.onPress;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[
        styles.button,
        {
          backgroundColor: bgColor,
          borderColor: filledBgColor,
        },
        props.style,
      ]}
      onPress={handlePress}
      disabled={props.disabled || props.loading}
    >
      {props.loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text style={[styles.text, { color: textColor }, props.textStyle]}>
          {props.title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 52,
    paddingHorizontal: 24,
    backgroundColor: '#471d7d',
    borderColor: '#471d7d',
    borderWidth: 1.5,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    elevation: 3,
    shadowColor: '#471d7d',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

export default Button;

