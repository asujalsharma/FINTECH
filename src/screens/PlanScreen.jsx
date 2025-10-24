import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TextInput,
    TouchableOpacity,
    FlatList,
    ScrollView,
    Image,
    Alert,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons"; // Back icon
import { getData } from "../API";

const plans = [
    { id: "1", price: "₹299", data: "1.5 GB/day", validity: "28 days" },
    { id: "2", price: "₹319", data: "1.5 GB/day", validity: "30 days" },
    { id: "3", price: "₹329", data: "1.5 GB/day", validity: "28 days" },
    { id: "4", price: "₹349", data: "2 GB/day", validity: "28 days", tag: "Bestseller" },
];

const tabs = ["SMART PHONE", "POPULAR", "ENTERTAINM", "SMART PHONE", "POPULAR", "ENTERTAINM"];

const BLUE = "#007bff"; // tweak this to match your exact blue


const PlanScreen = ({ route }) => {
    const { operatorDetail } = route.params;
    console.log('operatorDetail>>>>', operatorDetail);

    const [plan, setPlan] = useState("");
    const [groupedplan, setGroupedPlan] = useState([]);
    const [planDetail, setPlanDetail] = useState(null)
    const [tabs, setTabs] = useState([]);
    const [selectedTab, setSelectedTab] = useState("Internet"); // default

    const navigation = useNavigation();

    const groupByType = (data) => {
        return data.reduce((groups, item) => {
            const type = item.Type || "Others";
            if (!groups[type]) {
                groups[type] = [];
            }
            groups[type].push(item);
            return groups;
        }, {});
    };

    const GetOperatorPlans = async () => {
        console.log('dcbsdvb');

        //   if (!mobile || mobile.length < 10) {
        //     Alert.alert('Please enter a valid mobile number');
        //     // errorToast('Please enter a valid mobile number');
        //     return;
        //   }
        console.log("Login request body:");

        // const response = await postData('api/auth/user-register', { phone: mobile });
        const response = await getData(`api/cyrus/plan_fetch?Operator_Code=${operatorDetail?.OpCode}&Circle_Code=${operatorDetail?.CircleCode}&MobileNumber=${operatorDetail?.Mobile}`);

        console.log("plan request body>>>>:", response);

        if (response.Status) {
            // successToast(t('register.registerSuccess'));
            console.log("Operator Fetched successfully", response.Remarks);
            setPlanDetail(response.Data)
            const grouped = groupByType(response.Data);
            setGroupedPlan(grouped);
            setTabs(Object.keys(grouped)); // create tabs dynamically
            setSelectedTab(Object.keys(grouped)[0]); // set first as default
            // navigation.navigate('PlanScreen',{operatorDetail:response.Data})
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



    useEffect(() => {
        GetOperatorPlans()
    }, [])

    useFocusEffect(
        React.useCallback(() => {
            GetOperatorPlans();
        }, [])
    );


    const handleNavigation = async (item) => {
        navigation.navigate('PaymentConfirmation',{rechargeData:item,operatorDetail:operatorDetail})
    };

    const parseDesc = (desc) => {
        if (!desc) return {};
        const parts = desc.split("|").map(p => p.trim());
        const details = {};
        parts.forEach(p => {
            const [key, value] = p.split(":").map(s => s.trim());
            if (key && value) {
                details[key] = value;
            }
        });
        return details;
    };

    // const parseDesc = (desc) => {
    //   if (!desc) return {};

    //   // Case 1: multiple key-value pairs separated by "|"
    //   if (desc.includes("|")) {
    //     const parts = desc.split("|").map(p => p.trim());
    //     const details = {};
    //     parts.forEach(p => {
    //       const [key, value] = p.split(":").map(s => s.trim());
    //       if (key && value) details[key] = value;
    //     });
    //     return details;
    //   }

    //   // Case 2: "Benefits: ..." single key, comma-separated
    //   if (desc.startsWith("Benefits:")) {
    //     const value = desc.replace("Benefits:", "").trim();
    //     const items = value.split(",").map(s => s.trim());
    //     return { Benefits: items };
    //   }

    //   // Default: return whole string as one field
    //   return { Info: desc };
    // };

    function convertDescToObject(plan) {
        if (plan.desc && typeof plan.desc === "string") {
            let descObj = {};
            plan.desc.split(" | ").forEach(part => {
                console.log('partttt', part);

                let [key, value] = part.split(" : ");
                if (key && value) {
                    descObj[key] = value;
                }
            });
            console.log('plannnnnnn', plan.desc);

            plan.desc = descObj;
        }
        console.log('plannnnnnn', plan);

        return plan;
    }

    const renderPlan = ({ item }: any) => {
        const details = parseDesc(item.desc);
        console.log('detailssssss', details);

        return (
            <View style={styles.shadowWrapper}>
                <View style={styles.blueShadowLarge} />
                <View style={styles.blueShadowSmall} />
                <View style={styles.card}>
                    {item.tag && (
                        <View style={styles.tag}>
                            <Text style={styles.tagText}>{item.tag}</Text>
                        </View>
                    )}
                    <View style={styles.cardHeader}>
                        <Text style={styles.price}>{item.rs}</Text>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <View style={{ marginHorizontal: 10 }}>
                                <Text style={styles.label}>Data</Text>
                                <Text style={styles.value}>{details?.Data}</Text>
                            </View>
                            <View>
                                <Text style={styles.label}>Validity</Text>
                                <Text style={styles.value}>{item.validity}</Text>
                            </View>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.showMoreBtn} onPress={()=>handleNavigation(item)}>
                        <Text style={styles.showMoreText}>Show More</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Icon name="arrow-back" size={22} color="#fff" />
                    <Image
                        source={{ uri: "https://rilstaticasset.akamaized.net/sites/default/files/2023-02/jio.jpg" }}
                        style={styles.operatorIcon}
                    />
                    <View>
                        <Text style={styles.phoneNumber}>{operatorDetail?.Mobile}</Text>
                        <Text style={styles.operatorName}>JIO • {operatorDetail?.Circle}</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.changeBtn}>
                    <Text style={styles.changeText}>Change</Text>
                </TouchableOpacity>
            </View>

            {/* Search + Tabs Card */}
            <View style={styles.shadowWrapper1}>
                <View style={styles.blueShadowLarge} />
                <View style={styles.blueShadowSmall} />
                <View style={styles.searchCard}>
                    <View style={styles.inputWrapper}>
                        <View style={styles.blueShadowLarge} />
                        <View style={styles.blueShadowSmall} />
                        <View style={styles.inputContainer}>
                            {/* <Text style={styles.prefix}>+91</Text> */}
                            <Icon name="search" size={22} color="#111" />
                            <TextInput
                                style={styles.input}
                                placeholder="Mobile Number"
                                placeholderTextColor="#999"
                                keyboardType="number-pad"
                                value={plan}
                                onChangeText={setPlan}
                                maxLength={10}
                            />
                        </View>
                    </View>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.tabRow}
                    >
                        {tabs.map((tab, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.tab, selectedTab === tab && styles.activeTab]}
                                onPress={() => setSelectedTab(tab)}
                            >
                                <Text style={[styles.tabText, selectedTab === tab && styles.activeTabText]}>
                                    {tab}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
                {/* <View style={styles.inputWrapper}>
                <View style={styles.blueShadowLarge} />
                <View style={styles.blueShadowSmall} />
                <View style={styles.inputContainer}>
                  <Text style={styles.prefix}>+91</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Mobile Number"
                    placeholderTextColor="#999"
                    keyboardType="number-pad"
                    value={plan}
                    onChangeText={setPlan}
                    maxLength={10}
                  />
                </View>
              </View> */}
            </View>

            {/* Plans List */}
            <FlatList
                data={groupedplan?.[selectedTab] || []}
                renderItem={renderPlan}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 20 }}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f2f4f9" },



    header: {
        backgroundColor: "#0078ff",
        padding: 15,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    phoneNumber: { color: "#fff", fontSize: 16, fontWeight: "600" },
    operatorName: { color: "#e0e0e0", fontSize: 12, marginTop: 2 },
    operatorIcon: { width: 30, height: 30, marginHorizontal: 8, borderRadius: 10 },

    changeBtn: {
        backgroundColor: "#005ccc",
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 20,
    },
    changeText: { color: "#fff", fontSize: 12, fontWeight: "600" },

    //   shadowWrapper1: {
    //     marginHorizontal: 12,
    //     marginTop: 10,
    //     backgroundColor: "#0078ff33", // light blue shadow bg
    //     borderRadius: 14,
    //     padding: 2,
    //   },
    shadowWrapper: {
        marginTop: 30,
        marginHorizontal: 20,
        position: "relative",
        height: 98, // controls the input's visual height
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
    shadowWrapper1: {
        marginTop: 30,
        marginHorizontal: 20,
        position: "relative",
        height: 142, // controls the input's visual height
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
    blueShadowLarge1: {
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
    blueShadowSmall1: {
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

    searchCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: "#0078ff"
        // marginBottom:10
    },
    searchInput: {
        backgroundColor: "#f5f5f5",
        borderRadius: 8,
        padding: 10,
        fontSize: 14,
        marginBottom: 10,
    },

    tabRow: { flexDirection: "row", gap: 10 },
    tab: {
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 20,
        backgroundColor: "#f0f0f0",
        marginVertical: 20
    },
    activeTab: { backgroundColor: "#0078ff" },
    tabText: { fontSize: 13, fontWeight: "500", color: "#444" },
    activeTabText: { color: "#fff" },

    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#0078ff"
    },
    tag: {
        backgroundColor: "#0078ff",
        paddingHorizontal: 8,
        paddingVertical: 2,
        alignSelf: "flex-start",
        borderBottomRightRadius: 8,
        borderTopLeftRadius: 12,
    },
    tagText: { color: "#fff", fontSize: 11, fontWeight: "600" },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 14,
        alignItems: "center",
    },
    price: { fontSize: 18, fontWeight: "700", color: "#000" },
    label: { fontSize: 12, color: "#777" },
    value: { fontSize: 13, fontWeight: "600", color: "#000" },

    showMoreBtn: {
        borderTopWidth: 1,
        borderTopColor: "#eee",
        paddingVertical: 8,
        alignItems: "center",
    },
    showMoreText: { fontSize: 13, fontWeight: "500", color: "#0078ff" },


    inputWrapper: {
        marginTop: 10,
        // marginHorizontal: 20,
        position: "relative",
        height: 60, // controls the input's visual height
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
        // paddingVertical:20
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
        // paddingVertical:20
    },
    prefix: { fontSize: 16, fontWeight: "600", marginRight: 8, color: "#000" },
    input: { flex: 1, fontSize: 16, paddingVertical: 12, color: "#000" },

});

export default PlanScreen;
