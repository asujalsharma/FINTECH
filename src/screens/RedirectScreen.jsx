import COLORS from '../constants/colors';
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

const RedirectScreen = ({ route }) => {
  const { data, type } = route.params;

  console.log('dataaaaaaaaa', data, type);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      {/* Header */}
      <View style={styles.header}>
        <Icon name="arrow-back" size={22} color="#fff" />
        {type == 'travel' ? (
          <Text style={styles.headerText}>{data?.name} Booking</Text>
        ) : (
          <Text style={styles.headerText}>{data?.name}</Text>
        )}
        {/* <Text style={styles.headerText}>{data?.name} Booking</Text> */}
        <View style={{}} />
      </View>
      {/* <ScrollView contentContainerStyle={styles.scrollContainer}> */}
      {/* <WebView source={{ uri: 'https://reactnative.dev/' }} style={{ flex: 1 }} />; */}
      <WebView source={{ uri: data.route }} style={{ flex: 1 }} />;
      {/* </ScrollView> */}
    </SafeAreaView>
  );
};

// Reusable Profile Button


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
    backgroundColor: COLORS.primary,
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
