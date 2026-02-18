import { THEME_COLORS, GRADIENTS } from '../constants/theme';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { WebView } from 'react-native-webview';

const RedirectScreen = ({ route }) => {
  const { data, type } = route.params;

  console.log('dataaaaaaaaa', data, type);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0004fb" />
      {/* Header */}
      <LinearGradient
        colors={GRADIENTS.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <Icon name="arrow-back" size={22} color="#fff" />
        {type == 'travel' ? (
          <Text style={styles.headerText}>{data?.name} Booking</Text>
        ) : (
          <Text style={styles.headerText}>{data?.name}</Text>
        )}
        {/* <Text style={styles.headerText}>{data?.name} Booking</Text> */}
        <View style={{}} />
      </LinearGradient>
      {/* <ScrollView contentContainerStyle={styles.scrollContainer}> */}
      {/* <WebView source={{ uri: 'https://reactnative.dev/' }} style={{ flex: 1 }} />; */}
      <WebView source={{ uri: data.route }} style={{ flex: 1 }} />
      {/* </ScrollView> */}
    </SafeAreaView>
  );
};
// Reusable Profile Button
const ProfileButton = ({ icon, text }) => {
  return (
    <TouchableOpacity style={styles.button}>
      <View style={styles.buttonLeft}>
        <Icon name={icon} size={22} color={THEME_COLORS.orange} />
        <Text style={styles.buttonText}>{text}</Text>
      </View>
      <Icon name="chevron-right" size={22} color={THEME_COLORS.orange} />
    </TouchableOpacity>
  );
};

export default RedirectScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FAFF',
  },
  scrollContainer: {
    padding: 16,
    alignItems: 'center',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor: THEME_COLORS.orange, // Replaced by LinearGradient
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 15,
    // paddingTop: 35,
    // marginTop: 10,
  },
  headerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 0,
  },
});
