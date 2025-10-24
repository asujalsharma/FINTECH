// import {
//   SafeAreaView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import React, {useState} from 'react';
// import COLORS from '../constants/colors';
// import Icon from 'react-native-vector-icons/FontAwesome';
// import Img from '../Assets/topup.png';
// import {Image} from 'react-native';
// import {TextInput} from 'react-native';
// import Button from '../components/Button';
// import {useNavigation, useRoute} from '@react-navigation/native';
// import NavBar from '../components/NavBar';
// const Notification = () => {
//   const navigation = useNavigation();

//   return (
//     <>
//       <SafeAreaView style={styles.container}>
//         <View style={styles.header}>
//           <TouchableOpacity onPress={() => navigation.goBack()}>
//             <Icon name="chevron-left" size={24} color={COLORS.black} />
//           </TouchableOpacity>
//           <Text style={styles.headertitle}>Notifications</Text>
//         </View>

//         <View style={styles.content}>
//           <Text style={styles.contentText}>No New Notifications</Text>
//         </View>
//       </SafeAreaView>
//       <NavBar />
//     </>
//   );
// };

// export default Notification;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     marginHorizontal: 28,
//   },
//   header: {
//     flexDirection: 'row',
//     margin: 25,
//     alignItems: 'flex-end',
//     justifyContent: 'center',
//   },
//   headertitle: {
//     color: COLORS.black,

//     width: 150,
//     fontSize: 18,
//     fontWeight: '600',
//     marginHorizontal: '35%',
//   },
//   content: {
//     marginTop: 250,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   contentText: {
//     color: COLORS.low_grey,
//     fontWeight: '600',
//     textAlign: 'center',
//     fontSize: 20,
//   },
// });
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";

const Notification = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#007bff" />
        {/* Header */}
       <View style={styles.header}>
               <Icon name="arrow-back" size={22} color="#fff" />
               <Text style={styles.headerText}>Notification</Text>
               <View style={{}} />
             </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
      </ScrollView>
    </SafeAreaView>
  );
};

// Reusable Profile Button
const ProfileButton = ({ icon, text }: { icon: string; text: string }) => {
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

export default Notification;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FAFF",
  },
  scrollContainer: {
    padding: 16,
    alignItems: "center",
  },

    header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007bff",
    justifyContent:"space-between",
    paddingVertical: 15,
    paddingHorizontal: 15,
    // paddingTop: 35,
    // marginTop: 10,
  },
  headerText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 0,
  },
});