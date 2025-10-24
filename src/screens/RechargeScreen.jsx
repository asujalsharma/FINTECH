// RechargeScreen.js
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
// import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Icon from "react-native-vector-icons/MaterialIcons";
import { getData } from "../API";


const operators = ["Airtel", "Jio", "Vi", "BSNL"];
const circles = ["Delhi NCR", "Maharashtra", "UP East", "Tamil Nadu"];

const popularPlans = [
  { id: "p1", amount: "199", desc: "1.5GB/day, 28 Days" },
  { id: "p2", amount: "299", desc: "2GB/day, 28 Days" },
  { id: "p3", amount: "666", desc: "1.5GB/day, 77 Days" },
  { id: "p4", amount: "719", desc: "2GB/day, 84 Days" },
];
const BLUE = "#007bff";

export default function RechargeScreen() {
  const [mobile, setMobile] = useState("");
  const [operatorDetail, setOperatorDetail] = useState(null)
  const [operator, setOperator] = useState(null);
  const [circle, setCircle] = useState(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

    const [history, setHistory] = useState([]);
    const navigation = useNavigation();

  const handleRecharge = () => {
    if (mobile.length !== 10 || !operator || !circle || !amount) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);

      const isSuccess = Math.random() > 0.4;
      const newRecord = {
        mobile,
        operator,
        circle,
        amount,
        status: isSuccess ? "Success" : "Failed",
        date: new Date().toLocaleString(),
      };

      setHistory([newRecord, ...history]);

      if (isSuccess) {
        Alert.alert("Recharge Successful 🎉", "Your recharge is complete.");
      } else {
        Alert.alert("Recharge Failed ❌", "Please try again later.");
      }
    }, 2000);
  };
    //  const GetOperator = async () => {
    //   navigation.navigate('PlanScreen')
    // };
  
    const GetOperator = async () => {
      let body = {
        phone: mobile,
      };
      if (!mobile || mobile.length < 10) {
        Alert.alert('Please enter a valid mobile number');
        // errorToast('Please enter a valid mobile number');
        return;
      }
      console.log("Login request body:", body);
  
      // const response = await postData('api/auth/user-register', { phone: mobile });
          const response = await getData(`/api/cyrus/operator_by_phone?phone=${mobile}`);
      
      console.log("plan request body:", response);
  
      if (response.Status) {
        // successToast(t('register.registerSuccess'));
        console.log("Operator Fetched successfully", response.Remarks);
        setOperatorDetail(response.Data)
        navigation.navigate('PlanScreen',{operatorDetail:response.Data})
        // Alert.alert("Login Successful", `You have successfully logged in. ${response.Otp}`, [
        //   {
        //     text: "OK",
  
        //     // navigation.goBack();
        //   }])
        // successToast('OTP Sent Successfully', `Otp has been sent to your mobile number ${response.data.otp}`);
        // handleSendOtp(response.Otp);

      }
      else {
        // errorToast(t('register.somethingWentWrong'));
        console.log("Login failed", response);
      }
    };

  // const handleRecharge = () => {
  //   if (mobile.length !== 10) {
  //     Alert.alert("Invalid Number", "Please enter a valid 10-digit mobile number.");
  //     return;
  //   }
  //   if (!operator || !circle || !amount) {
  //     Alert.alert("Missing Info", "Please select all fields to proceed.");
  //     return;
  //   }

  //   // Mock loading
  //   setLoading(true);
  //   setTimeout(() => {
  //     setLoading(false);

  //     const isSuccess = Math.random() > 0.4; // 60% success chance
  //     if (isSuccess) {
  //       Alert.alert(
  //         "Recharge Successful 🎉",
  //         `Recharge of ₹${amount} for ${mobile} (${operator}, ${circle}) is successful!`
  //       );
  //     } else {
  //       Alert.alert(
  //         "Recharge Failed ❌",
  //         `Recharge of ₹${amount} for ${mobile} could not be completed.\nPlease try again later.`
  //       );
  //     }
  //   }, 2000);
  // };

  return (
    // <SafeAreaView style={styles.container}>
    //   <KeyboardAvoidingView
    //     style={{ flex: 1 }}
    //     behavior={Platform.OS === "ios" ? "padding" : undefined}
    //   >
    //     {/* Header */}
    //     <View style={styles.header}>
    //       <Text style={styles.headerTitle}>Mobile Recharge</Text>
    //       <Icon name="cellphone" size={24} color="#0ea5a4" 
    //        onPress={() => navigation.navigate("RechargeHistory", { history })}/>
    //     </View>

    //     {/* Mobile Input */}
    //     <View style={styles.inputCard}>
    //       <Text style={styles.label}>Mobile Number</Text>
    //       <TextInput
    //         placeholder="Enter 10-digit number"
    //         keyboardType="number-pad"
    //         maxLength={10}
    //         value={mobile}
    //         onChangeText={setMobile}
    //         style={styles.textInput}
    //       />
    //     </View>

    //     {/* Operator */}
    //     <View style={styles.inputCard}>
    //       <Text style={styles.label}>Operator</Text>
    //       <FlatList
    //         horizontal
    //         data={operators}
    //         keyExtractor={(i) => i}
    //         renderItem={({ item }) => (
    //           <TouchableOpacity
    //             style={[
    //               styles.optionBtn,
    //               operator === item && styles.optionBtnActive,
    //             ]}
    //             onPress={() => setOperator(item)}
    //           >
    //             <Text
    //               style={[
    //                 styles.optionText,
    //                 operator === item && styles.optionTextActive,
    //               ]}
    //             >
    //               {item}
    //             </Text>
    //           </TouchableOpacity>
    //         )}
    //         ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
    //         showsHorizontalScrollIndicator={false}
    //       />
    //     </View>

    //     {/* Circle */}
    //     <View style={styles.inputCard}>
    //       <Text style={styles.label}>Circle</Text>
    //       <FlatList
    //         horizontal
    //         data={circles}
    //         keyExtractor={(i) => i}
    //         renderItem={({ item }) => (
    //           <TouchableOpacity
    //             style={[
    //               styles.optionBtn,
    //               circle === item && styles.optionBtnActive,
    //             ]}
    //             onPress={() => setCircle(item)}
    //           >
    //             <Text
    //               style={[
    //                 styles.optionText,
    //                 circle === item && styles.optionTextActive,
    //               ]}
    //             >
    //               {item}
    //             </Text>
    //           </TouchableOpacity>
    //         )}
    //         ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
    //         showsHorizontalScrollIndicator={false}
    //       />
    //     </View>

    //     {/* Amount */}
    //     <View style={styles.inputCard}>
    //       <Text style={styles.label}>Amount</Text>
    //       <TextInput
    //         placeholder="Enter Amount"
    //         keyboardType="number-pad"
    //         value={amount}
    //         onChangeText={setAmount}
    //         style={styles.textInput}
    //       />

    //       <FlatList
    //         horizontal
    //         data={popularPlans}
    //         keyExtractor={(i) => i.id}
    //         renderItem={({ item }) => (
    //           <TouchableOpacity
    //             style={styles.planCard}
    //             onPress={() => setAmount(item.amount)}
    //           >
    //             <Text style={styles.planAmount}>₹{item.amount}</Text>
    //             <Text style={styles.planDesc}>{item.desc}</Text>
    //           </TouchableOpacity>
    //         )}
    //         ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
    //         showsHorizontalScrollIndicator={false}
    //         contentContainerStyle={{ marginTop: 12 }}
    //       />
    //     </View>

    //     {/* Proceed Button */}
    //     <TouchableOpacity
    //       style={[
    //         styles.rechargeBtn,
    //         !(mobile.length === 10 && operator && circle && amount) &&
    //           styles.rechargeBtnDisabled,
    //       ]}
    //       disabled={!(mobile.length === 10 && operator && circle && amount) || loading}
    //       onPress={handleRecharge}
    //     >
    //       {loading ? (
    //         <ActivityIndicator color="#fff" />
    //       ) : (
    //         <Text style={styles.rechargeText}>Proceed to Recharge</Text>
    //       )}
    //     </TouchableOpacity>
    //   </KeyboardAvoidingView>
    // </SafeAreaView>
        <SafeAreaView style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Icon name="arrow-back" size={22} color="#fff" />
            <Text style={styles.title}>Mobile Recharge</Text>
            <Text></Text>
            {/* <Text style={styles.brand}>BillBuzz</Text> */}
            {/* <Text style={styles.subtitle}>
              Ab Har Recharge par Kamao! #Guaranteed_Cashback
            </Text> */}
          </View>
    
          {/* Input with blue-glow shadows behind it */}
          <View style={styles.inputWrapper}>
            {/* Larger, softer blue glow (further bottom-right) */}
            <View style={styles.blueShadowLarge} />
    
            {/* Smaller, sharper blue glow (closer) */}
            <View style={styles.blueShadowSmall} />
    
            {/* The actual input box */}
            <View style={styles.inputContainer}>
              <Text style={styles.prefix}>+91</Text>
              <TextInput
                style={styles.input}
                placeholder="Mobile Number"
                placeholderTextColor="#999"
                keyboardType="number-pad"
                value={mobile}
                onChangeText={setMobile}
                maxLength={10}
              />
            </View>
          </View>
    
          {/* Bottom button */}
          <TouchableOpacity style={styles.button} 
          onPress={GetOperator}
          >
            <Text style={styles.buttonText}>PROCEED</Text>
          </TouchableOpacity>
        </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  header: {
    backgroundColor: BLUE,
    paddingVertical: 30,
    paddingHorizontal: 20,
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between',
      },
  title: { fontSize: 24, fontWeight: "600", color: "#fff", marginTop: 6 },
  brand: { fontSize: 28, fontWeight: "600", color: "#fff", marginTop: 2 },
  subtitle: { fontSize: 13, color: "#d9e7ff", marginTop: 8 },

  /* Wrapper holds absolutely positioned blue-glow views behind the input */
  inputWrapper: {
    marginTop: 40,
    marginHorizontal: 20,
    position: "relative",
    height: 70, // controls the input's visual height
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

  /* Foreground input on top of those glows */
  inputContainer: {
    position: "relative",
    zIndex: 2,
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1.8,
    borderColor: BLUE,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  prefix: { fontSize: 16, fontWeight: "600", marginRight: 8, color: "#000" },
  input: { flex: 1, fontSize: 16, paddingVertical: 12, color: "#000" },

  /* Bottom full-width button */
  button: {
    backgroundColor: BLUE,
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: "auto", // push to bottom
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#f9fafb", padding: 16 },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 20,
//     alignItems: "center",
//   },
//   headerTitle: { fontSize: 18, fontWeight: "700", color: "#0f172a" },

//   inputCard: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 14,
//     marginBottom: 16,
//     elevation: 1,
//   },
//   label: { fontSize: 14, fontWeight: "600", color: "#0f172a", marginBottom: 8 },
//   textInput: {
//     backgroundColor: "#f1f5f9",
//     borderRadius: 10,
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     fontSize: 14,
//     color: "#0f172a",
//   },

//   optionBtn: {
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderRadius: 20,
//     backgroundColor: "#f1f5f9",
//   },
//   optionBtnActive: { backgroundColor: "#0ea5a4" },
//   optionText: { color: "#0f172a", fontWeight: "600" },
//   optionTextActive: { color: "#fff" },

//   planCard: {
//     backgroundColor: "#f1f5f9",
//     padding: 12,
//     borderRadius: 12,
//     minWidth: 120,
//   },
//   planAmount: { fontWeight: "700", color: "#0f172a", marginBottom: 4 },
//   planDesc: { fontSize: 12, color: "#6b7280" },

//   rechargeBtn: {
//     backgroundColor: "#0ea5a4",
//     paddingVertical: 14,
//     borderRadius: 12,
//     alignItems: "center",
//     marginTop: "auto",
//   },
//   rechargeBtnDisabled: { backgroundColor: "#9ca3af" },
//   rechargeText: { color: "#fff", fontWeight: "700", fontSize: 16 },
// });
