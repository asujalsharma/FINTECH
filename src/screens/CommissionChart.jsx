import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
  Dimensions,
  StatusBar,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const BLUE = "#007bff";

const {width, height} =  Dimensions.get('window');


const CommissionChart = () => {
  const prepaid = [
    { name: "Jio", logo: {uri:'https://pnghdpro.com/wp-content/themes/pnghdpro/download/social-media-and-brands/jio-logo-hd.png'}, commission: "Flat 4%" },
    { name: "Airtel", logo: {uri:'https://w7.pngwing.com/pngs/240/684/png-transparent-4g-bharti-airtel-lte-3g-2g-recharge-text-trademark-logo-thumbnail.png'}, commission: "Flat 4%" },
    { name: "VI", logo: {uri:'https://w7.pngwing.com/pngs/939/821/png-transparent-vi%E2%84%A2-vodafone-idea-hd-logo.png'}, commission: "Flat 4%" },
    { name: "BSNL", logo: {uri:'https://e7.pngegg.com/pngimages/357/522/png-clipart-bharat-sanchar-nigam-limited-prepay-mobile-phone-home-business-phones-mobile-phones-internet-airtel-customer-care-text-logo.png'}, commission: "Flat 4%" },

    // { name: "Jio", logo: require("./assets/jio.png"), commission: "Flat 4%" },
    // { name: "VI", logo: require("./assets/vi.png"), commission: "Flat 4%" },
    // { name: "BSNL", logo: require("./assets/bsnl.png"), commission: "Flat 4%" },
  ];

//   const dth = [
//     { name: "Airtel Dth", logo: require("./assets/airtel.png"), commission: "Flat 5%" },
//     { name: "Dish Tv", logo: require("./assets/dishtv.png"), commission: "Flat 5%" },
//     { name: "Sun Direct", logo: require("./assets/sundirect.png"), commission: "Flat 5%" },
//     { name: "Tata Play", logo: require("./assets/tataplay.png"), commission: "Flat 5%" },
//     { name: "Videocon Dth", logo: require("./assets/videocon.png"), commission: "Flat 5%" },
//   ];
  const dth = [
    { name: "Airtel Dth", logo: {uri:'https://pnghdpro.com/wp-content/themes/pnghdpro/download/social-media-and-brands/jio-logo-hd.png'}, commission: "Flat 4%" },
    { name: "Dish Tv", logo: {uri:'https://w7.pngwing.com/pngs/240/684/png-transparent-4g-bharti-airtel-lte-3g-2g-recharge-text-trademark-logo-thumbnail.png'}, commission: "Flat 4%" },
    { name: "Sun Direct", logo: {uri:'https://w7.pngwing.com/pngs/939/821/png-transparent-vi%E2%84%A2-vodafone-idea-hd-logo.png'}, commission: "Flat 4%" },
    { name: "Tata Play", logo: {uri:'https://e7.pngegg.com/pngimages/357/522/png-clipart-bharat-sanchar-nigam-limited-prepay-mobile-phone-home-business-phones-mobile-phones-internet-airtel-customer-care-text-logo.png'}, commission: "Flat 4%" },
    { name: "Videocon Dth", logo: {uri:'https://e7.pngegg.com/pngimages/357/522/png-clipart-bharat-sanchar-nigam-limited-prepay-mobile-phone-home-business-phones-mobile-phones-internet-airtel-customer-care-text-logo.png'}, commission: "Flat 4%" },

    // { name: "Jio", logo: require("./assets/jio.png"), commission: "Flat 4%" },
    // { name: "VI", logo: require("./assets/vi.png"), commission: "Flat 4%" },
    // { name: "BSNL", logo: require("./assets/bsnl.png"), commission: "Flat 4%" },
  ];

  const renderCard = (item: any) => (
    <View style={styles.inputWrapper}>
    <View style={styles.blueShadowLarge} />
    <View style={styles.blueShadowSmall} />
    <TouchableOpacity style={styles.card} key={item.name}>
      <View style={styles.row}>
        <Image source={item.logo} style={styles.logo} resizeMode="contain" />
        <Text style={styles.name}>{item.name}</Text>
      </View>
      <Text style={styles.commission}>{item.commission}</Text>
    </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={BLUE} />
      {/* Header */}
      <View style={styles.header}>
        <Icon name="arrow-back" size={22} color="#fff" />
        <Text style={styles.headerText}>Commission Chart</Text>
        <View style={{}} />
      </View>

      <ScrollView style={styles.body}>
        {/* Prepaid Section */}
        <Text style={styles.sectionTitle}>Prepaid</Text>
        {prepaid.map((item) => renderCard(item))}

        {/* DTH Section */}
        <Text style={styles.sectionTitle}>DTH</Text>
        {dth.map((item) => renderCard(item))}

        {/* Bill Payment Section */}
        <Text style={styles.sectionTitle}></Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CommissionChart;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
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
  body: {
    paddingHorizontal: 12,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 8,
    textAlign: "center",
    color: "#000",
  },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 8,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: "#007bff",

    // Blue shadow effect
    ...Platform.select({
      ios: {
        shadowColor: "#007bff",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.35,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    color: "#000",
  },
  commission: {
    fontSize: 14,
    color: "green",
    fontWeight: "600",
  },
    inputWrapper: {
      marginTop: 12,
    //   marginHorizontal: 20,
      position: "relative",
      height: height * 0.075, // controls the input's visual height
      // iOS additional soft shadow (colored)
      ...Platform.select({
        ios: {
          shadowColor: BLUE,
          shadowOffset: { width: 4, height: 6 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
        },
        android: {
          // keep elevation small — the colored glow is handled by the fake views
          elevation: 0,
        },
      }),
    },
  
    /* Big faint blue glow (further offset) */
    blueShadowLarge: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: 12,
      backgroundColor: BLUE,
      opacity: 0.12,
      transform: [{ translateX: 3 }, { translateY: 3 }],
    },
  
    /* Smaller faint blue glow (closer offset) */
    blueShadowSmall: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: 12,
      backgroundColor: BLUE,
      opacity: 2,
      transform: [{ translateX: 3 }, { translateY: 3 }],
    },
});
