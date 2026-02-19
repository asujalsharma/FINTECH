import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity
} from 'react-native';
import Icon from "react-native-vector-icons/MaterialIcons";

const operators = [
  { name: 'Airtel TV', icon: {uri:'https://w7.pngwing.com/pngs/240/684/png-transparent-4g-bharti-airtel-lte-3g-2g-recharge-text-trademark-logo-thumbnail.png'}},
  { name: 'Dish TV', icon: {uri:'https://w7.pngwing.com/pngs/240/684/png-transparent-4g-bharti-airtel-lte-3g-2g-recharge-text-trademark-logo-thumbnail.png'}},
  { name: 'Tata Sky', icon: {uri:'https://w7.pngwing.com/pngs/240/684/png-transparent-4g-bharti-airtel-lte-3g-2g-recharge-text-trademark-logo-thumbnail.png'}},
  { name: 'Sun Direct', icon: {uri:'https://w7.pngwing.com/pngs/240/684/png-transparent-4g-bharti-airtel-lte-3g-2g-recharge-text-trademark-logo-thumbnail.png'}},
  { name: 'Videocon DTH', icon: {uri:'https://w7.pngwing.com/pngs/240/684/png-transparent-4g-bharti-airtel-lte-3g-2g-recharge-text-trademark-logo-thumbnail.png'}},
];

import COLORS from '../constants/colors';


const OperatorListScreen = () => {
  const [searchText, setSearchText] = useState('');
  const [mobile, setMobile] = useState('');

  const filteredOperators = operators.filter(op =>
    op.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Header */}
            <View style={styles.header}>
                <Icon name="arrow-back" size={22} color="#fff" />
                <Text style={styles.title}>Select Operator</Text>
                <Text></Text>
                {/* <Text style={styles.brand}>BillBuzz</Text> */}
                {/* <Text style={styles.subtitle}>
              Ab Har Recharge par Kamao! #Guaranteed_Cashback
            </Text> */}
            </View>
            <View style={styles.inputWrapper}>
                <View style={styles.blueShadowLarge} />
                <View style={styles.blueShadowSmall} />
                <View style={styles.inputContainer}>
                    <Text style={styles.prefix}>Rs.</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter Amount"
                        placeholderTextColor="#999"
                        keyboardType="number-pad"
                        value={mobile}
                        onChangeText={setMobile}
                        maxLength={10}
                    />
                </View>
            </View>

      {/* List */}
      <FlatList
        data={filteredOperators}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.itemContainer}>
            <View style={styles.itemInner}>
              <Image source={item.icon} style={styles.icon} />
              <Text style={styles.itemText}>{item.name}</Text>
            </View>
            <Text style={styles.arrow}>{'>'}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default OperatorListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
    header: {
        backgroundColor: COLORS.primary,
        paddingVertical: 26,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    title: { fontSize: 22, fontWeight: "600", color: "#fff", marginTop: 2 },
    // brand: { fontSize: 28, fontWeight: "600", color: "#fff", marginTop: 2 },
    // subtitle: { fontSize: 13, color: "#d9e7ff", marginTop: 8 },


  itemContainer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  itemInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    height: 30,
    width: 30,
    resizeMode: 'contain',
    marginRight: 15,
  },
  itemText: {
    fontSize: 16,
  },
  arrow: {
    fontSize: 20,
    color: '#999',
  },

    inputWrapper: {
        marginTop: 40,
        marginBottom:20,
        marginHorizontal: 20,
        position: "relative",
        height: 70, // controls the input's visual height
        // iOS additional soft shadow (colored)
        ...Platform.select({
            ios: {
                shadowColor: COLORS.primary,
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
        backgroundColor: COLORS.primary,
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
        backgroundColor: COLORS.primary,
        opacity: 2,
        transform: [{ translateX: 3 }, { translateY: 3 }],
    },

    /* Foreground input on top of those glows */
    inputContainer: {
        position: "relative",
        zIndex: 2,
        height: "100%",
        backgroundColor: "#fff",
        borderRadius: 12,
        borderWidth: 1.8,
        borderColor: COLORS.primary,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
    },
    prefix: { fontSize: 16, fontWeight: "600", marginRight: 8, color: "#000" },
    input: { flex: 1, fontSize: 16, paddingVertical: 12, color: "#000" , fontWeight:'bold'},

});
