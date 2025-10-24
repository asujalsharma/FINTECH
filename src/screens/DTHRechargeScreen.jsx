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

export default function DTHRechargeScreen() {
    const [mobile, setMobile] = useState("");
    const [operatorDetail, setOperatorDetail] = useState(null)
    const [operator, setOperator] = useState(null);
    const [customerID, setCustomerID] = useState("");
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
            navigation.navigate('PlanScreen', { operatorDetail: response.Data })
        }
        else {
            // errorToast(t('register.somethingWentWrong'));
            console.log("Login failed", response);
        }
    };
    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Icon name="arrow-back" size={22} color="#fff" />
                <Text style={styles.title}>DTH Recharge</Text>
                <Text></Text>
                {/* <Text style={styles.brand}>BillBuzz</Text> */}
                {/* <Text style={styles.subtitle}>
              Ab Har Recharge par Kamao! #Guaranteed_Cashback
            </Text> */}
            </View>
            <View style={[styles.inputWrapper,{height:60}]}>
                <View style={styles.blueShadowLarge} />
                <View style={styles.blueShadowSmall} />
                <View style={styles.inputContainer}>
                    <Text style={[styles.prefix,{color:'#888'}]}>Select Operator</Text>
                </View>
            </View>
            <View style={styles.inputWrapper}>
                <View style={styles.blueShadowLarge} />
                <View style={styles.blueShadowSmall} />
                <View style={styles.inputContainer}>
                    {/* <Text style={styles.prefix}></Text> */}
                    <TextInput
                        style={styles.input}
                        placeholder="Customer ID"
                        placeholderTextColor="#999"
                        keyboardType="number-pad"
                        value={customerID}
                        onChangeText={setCustomerID}
                        maxLength={10}
                    />
                </View>
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
                        value={amount}
                        onChangeText={setAmount}
                        maxLength={10}
                    />
                </View>
            </View>

            {/* Bottom button */}
            <TouchableOpacity style={styles.button}
                // onPress={GetOperator}
                onPress={()=>navigation.navigate('OperatorListScreen')}
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
    input: { flex: 1, fontSize: 16, paddingVertical: 12, color: "#000" , fontWeight:'bold'},

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