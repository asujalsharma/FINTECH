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
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { WebView } from 'react-native-webview';

const RedirectScreen = ({ route, navigation }) => {
  const { data, type } = route.params || {};

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A2E8A" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack?.()}>
          <Icon name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        {type == 'travel' ? (
          <Text style={styles.headerText}>{data?.name} Booking</Text>
        ) : (
          <Text style={styles.headerText}>{data?.name || 'Service'}</Text>
        )}
        <View style={{ width: 22 }} />
      </View>
      {data?.route ? (
        <WebView source={{ uri: data.route }} style={{ flex: 1 }} />
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#6B7280' }}>No URL provided</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

// Reusable Profile Button
const ProfileButton = ({ icon, text }) => {
  return (
    <TouchableOpacity style={styles.button}>
      <View style={styles.buttonLeft}>
        <Icon name={icon} size={22} color="#007bff" />
        <Text style={styles.buttonText}>{text}</Text>
      </View>
      <Icon name="chevron-right" size={22} color="#007bff" />
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
    backgroundColor: '#0A2E8A',
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
