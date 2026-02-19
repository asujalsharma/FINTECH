import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import COLORS from '../constants/colors';

const SCREEN_WIDTH = Dimensions.get('window').width;

const NewsTicker = ({ news }) => {
  const translateX = useRef(new Animated.Value(SCREEN_WIDTH)).current;

  useEffect(() => {
    const startAnimation = () => {
      Animated.loop(
        Animated.timing(translateX, {
          toValue: -SCREEN_WIDTH * 1.5, // Adjust based on text length
          duration: 10000, // Adjust speed
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    };

    if (news && news.length > 0) {
      startAnimation();
    }
  }, [news, translateX]);

  if (!news || news.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.tagContainer}>
        <Text style={styles.tagText}>News</Text>
      </View>
      <View style={styles.tickerContainer}>
        <Animated.Text 
          style={[
            styles.tickerText, 
            { transform: [{ translateX }] }
          ]}
          numberOfLines={1}
        >
          {news.join('  •  ')}
        </Animated.Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF8E1', // Light yellow background
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE082',
    overflow: 'hidden',
  },
  tagContainer: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 10,
    zIndex: 10,
  },
  tagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tickerContainer: {
    flex: 1,
    overflow: 'hidden',
    height: '100%',
    justifyContent: 'center',
  },
  tickerText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    minWidth: SCREEN_WIDTH, // Ensure it has width to scroll
  },
});

export default NewsTicker;
