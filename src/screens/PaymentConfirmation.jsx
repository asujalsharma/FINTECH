import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const PaymentConfirmation = ({route}) => {
    const {rechargeData, operatorDetail} = route.params;
    console.log('rechargeData',rechargeData,operatorDetail);
    
  const [method, setMethod] = useState("wallet");

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Icon name="arrow-back" size={22} color="#fff" />
        <Text style={styles.headerText}>Payment Confirmation</Text>
        <View style={{ width: 22 }} /> 
      </View>

      {/* Jio Info Card */}
      <View style={styles.shadowWrapper}>
        <View style={styles.cardRow}>
          <View>
            <Text style={styles.jioTitle}>JIO</Text>
            <Text style={styles.jioNumber}>Number - 6263678561</Text>
          </View>
          <Image
            source={{ uri: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Jio_Logo.png" }}
            style={styles.jioLogo}
          />
        </View>
      </View>

      {/* Payment Options */}
      <View style={styles.shadowWrapper}>
        <TouchableOpacity
          style={styles.optionRow}
          onPress={() => setMethod("wallet")}
        >
          <Text style={styles.optionText}>💳 Wallet ( ₹0/- )</Text>
          <View
            style={[
              styles.radio,
              method === "wallet" && styles.radioSelected,
            ]}
          />
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity
          style={styles.optionRow}
          onPress={() => setMethod("upi")}
        >
          <Text style={styles.optionText}>🇮🇳 UPI</Text>
          <View
            style={[styles.radio, method === "upi" && styles.radioSelected]}
          />
        </TouchableOpacity>
      </View>

      {/* Cashback Strip */}
      <View style={styles.cashbackBox}>
        <Text style={styles.cashbackText}>
          🎉 Hurray! You've unlocked ₹7.92 cashback!
        </Text>
      </View>

      {/* Payable Amount */}
      <View style={styles.shadowWrapper}>
        <View style={styles.payRow}>
          <Text style={styles.payLabel}>Payable Amount</Text>
          <Text style={styles.payAmount}>₹198</Text>
        </View>
      </View>
      <Text style={styles.note}>
        Read Carefully! Successful transaction will not be refunded
      </Text>

      {/* Bottom Button */}
      <TouchableOpacity style={styles.slideBtn}>
        <Text style={styles.slideText}>➤ Slide To Proceed</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f4f9", padding: 0},

  header: {
    backgroundColor: "#0078ff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  headerText: { color: "#fff", fontSize: 16, fontWeight: "600" },

  // Blue Shadow Wrapper
  shadowWrapper: {
    marginTop: 15,
    borderRadius: 12,
    backgroundColor: "#fff",

    // Shadow
    shadowColor: "#0078ff",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,

    padding: 14,
  },

  // Jio Info
  cardRow: { flexDirection: "row", justifyContent: "space-between" , padding:12,marginHorizontal:10},
  jioTitle: { fontSize: 15, fontWeight: "700", color: "#000" },
  jioNumber: { fontSize: 13, color: "#777", marginTop: 3 },
  jioLogo: { width: 32, height: 32, borderRadius: 16 },

  // Payment Options
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal:10
  },
  optionText: { fontSize: 15, color: "#000" },
  divider: { height: 1, backgroundColor: "#eee", marginVertical: 5 },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#aaa",
  },
  radioSelected: {
    backgroundColor: "#0078ff",
    borderColor: "#0078ff",
  },

  // Cashback
  cashbackBox: {
    marginTop: 15,
    backgroundColor: "#0078ff",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    padding:10
  },
  cashbackText: { color: "#fff", fontSize: 14, fontWeight: "500" },

  // Payable Amount
  payRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  payLabel: { fontSize: 15, fontWeight: "500", color: "#000" },
  payAmount: { fontSize: 16, fontWeight: "700", color: "#000" },
  note: {
    marginTop: 6,
    fontSize: 12,
    color: "#888",
    textAlign: "center",
  },

  // Bottom Button
  slideBtn: {
    marginTop: "auto",
    backgroundColor: "#0078ff",
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  slideText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});

export default PaymentConfirmation;
