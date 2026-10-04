import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import Video from 'react-native-video';

const SplashScreen = ({ onFinish }) => {
  const finishedRef = useRef(false);

  const handleFinish = () => {
    if (!finishedRef.current) {
      finishedRef.current = true;
      if (onFinish) {
        onFinish();
      }
    }
  };

  useEffect(() => {
    // Safety fallback in case video stalls or fails to trigger onEnd
    const timer = setTimeout(() => {
      handleFinish();
    }, 5500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#092B88" />
      <Video
        source={require('../Assets/gemini_generated_video_b9c6e4f5.mp4')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
        repeat={false}
        paused={false}
        muted={false}
        onEnd={handleFinish}
        onError={error => {
          console.warn('Splash video playback error:', error);
          handleFinish();
        }}
      />
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#092B88',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
