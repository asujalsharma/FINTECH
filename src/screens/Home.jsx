// // RechargeHome.js
// import React, { useState } from "react";
// import {
//   SafeAreaView,
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   Image,
//   ScrollView,
//   StatusBar,
// } from "react-native";
// import Icon from "react-native-vector-icons/MaterialCommunityIcons";
// import Navigation from "../navigation/Navigation";
// import { useNavigation } from "@react-navigation/native";

// const categories = [
//   { id: "1", title: "Mobile", icon: "cellphone" },
//   { id: "2", title: "DTH", icon: "television" },
//   { id: "3", title: "Electricity", icon: "flash" },
//   { id: "4", title: "LPG", icon: "fire" },
//   { id: "5", title: "Broadband", icon: "wifi" },
//   { id: "6", title: "Water", icon: "water" },
//   { id: "7", title: "FASTag", icon: "car" },
//   { id: "8", title: "Insurance", icon: "shield-check" },
// ];

// const offers = [
//   {
//     id: "o1",
//     title: "Flat ₹50 Cashback!",
//     desc: "Recharge & Get Instant Cashback",
//     color: "#0ea5a4",
//   },
//   {
//     id: "o2",
//     title: "Refer & Earn",
//     desc: "Invite friends and earn ₹50",
//     color: "#6366f1",
//   },
// ];

// const recentTransactions = [
//   {
//     id: "t1",
//     service: "Mobile Recharge",
//     amount: "₹199",
//     status: "Success",
//     date: "02 Sep 2025",
//   },
//   {
//     id: "t2",
//     service: "Electricity Bill",
//     amount: "₹1450",
//     status: "Pending",
//     date: "03 Sep 2025",
//   },
//   {
//     id: "t3",
//     service: "DTH Recharge",
//     amount: "₹350",
//     status: "Failed",
//     date: "04 Sep 2025",
//   },
// ];

// export default function Home() {
//   const [selected, setSelected] = useState(null);
//   const navigation = useNavigation();

//   const renderCategory = ({ item }) => {
//     const active = selected === item.id;
//     return (
//       <TouchableOpacity
//         style={[styles.catCard, active && styles.catCardActive]}
//         onPress={() => navigation.navigate('Recharge')}
//       >
//         <Icon
//           name={item.icon}
//           size={28}
//           color={active ? "#fff" : "#0f172a"}
//         />
//         <Text style={[styles.catText, active && { color: "#fff" }]}>
//           {item.title}
//         </Text>
//       </TouchableOpacity>
//     );
//   };

//   const renderOffer = ({ item }) => (
//     <View style={[styles.offerCard, { backgroundColor: item.color }]}>
//       <Text style={styles.offerTitle}>{item.title}</Text>
//       <Text style={styles.offerDesc}>{item.desc}</Text>
//     </View>
//   );

//   const renderTransaction = ({ item }) => {
//     const statusColor =
//       item.status === "Success"
//         ? "#10b981"
//         : item.status === "Pending"
//         ? "#f59e0b"
//         : "#ef4444";
//     return (
//       <View style={styles.txnCard}>
//         <View>
//           <Text style={styles.txnService}>{item.service}</Text>
//           <Text style={styles.txnDate}>{item.date}</Text>
//         </View>
//         <View style={{ alignItems: "flex-end" }}>
//           <Text style={styles.txnAmount}>{item.amount}</Text>
//           <Text style={[styles.txnStatus, { color: statusColor }]}>
//             {item.status}
//           </Text>
//         </View>
//       </View>
//     );
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" />

//       {/* Header */}
//       <View style={styles.header}>
//         <View>
//           <Text style={styles.greet}>Hello, User 👋</Text>
//           <Text style={styles.subGreet}>Pay Bills & Earn Rewards</Text>
//         </View>
//         <TouchableOpacity style={styles.walletBtn}>
//           <Icon name="wallet" size={20} color="#fff" />
//           <Text style={styles.walletText}>₹1200</Text>
//         </TouchableOpacity>
//       </View>

//       <ScrollView showsVerticalScrollIndicator={false}>
//         {/* Categories */}
//         <Text style={styles.sectionTitle}>Recharge & Pay Bills</Text>
//         <FlatList
//           data={categories}
//           numColumns={4}
//           keyExtractor={(i) => i.id}
//           renderItem={renderCategory}
//           contentContainerStyle={styles.catGrid}
//         />

//         {/* Offers */}
//         <Text style={styles.sectionTitle}>Offers & Rewards</Text>
//         <FlatList
//           horizontal
//           data={offers}
//           keyExtractor={(i) => i.id}
//           renderItem={renderOffer}
//           showsHorizontalScrollIndicator={false}
//           ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
//           contentContainerStyle={{ paddingHorizontal: 4 }}
//         />

//         {/* Recent Transactions */}
//         <Text style={styles.sectionTitle}>Recent Transactions</Text>
//         {recentTransactions.map((t) => (
//           <View key={t.id} style={{ marginBottom: 10 }}>
//             {renderTransaction({ item: t })}
//           </View>
//         ))}
//       </ScrollView>

//       {/* Floating Button */}
//       <TouchableOpacity style={styles.fab} onPress={()=>{navigation.navigate("PinScreen")}}>
//         <Icon name="plus" size={28} color="#fff" />
//       </TouchableOpacity>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#f9fafb", padding: 16 },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 20,
//   },
//   greet: { fontSize: 18, fontWeight: "700", color: "#0f172a" },
//   subGreet: { fontSize: 13, color: "#6b7280", marginTop: 2 },
//   walletBtn: {
//     backgroundColor: "#0ea5a4",
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 14,
//     paddingVertical: 8,
//     borderRadius: 20,
//   },
//   walletText: { marginLeft: 6, color: "#fff", fontWeight: "600" },

//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: "700",
//     marginVertical: 10,
//     color: "#0f172a",
//   },

//   /* Categories */
//   catGrid: { marginBottom: 20 },
//   catCard: {
//     flex: 1,
//     margin: 6,
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     paddingVertical: 18,
//     alignItems: "center",
//     elevation: 2,
//   },
//   catCardActive: { backgroundColor: "#0ea5a4" },
//   catText: { marginTop: 6, fontWeight: "600", color: "#0f172a" },

//   /* Offers */
//   offerCard: {
//     padding: 16,
//     borderRadius: 14,
//     width: 200,
//   },
//   offerTitle: { color: "#fff", fontWeight: "700", fontSize: 16 },
//   offerDesc: { color: "#f1f5f9", fontSize: 13, marginTop: 4 },

//   /* Transactions */
//   txnCard: {
//     backgroundColor: "#fff",
//     padding: 14,
//     borderRadius: 12,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     elevation: 1,
//   },
//   txnService: { fontWeight: "600", color: "#0f172a" },
//   txnDate: { color: "#9ca3af", fontSize: 12, marginTop: 4 },
//   txnAmount: { fontWeight: "700", color: "#0f172a" },
//   txnStatus: { fontSize: 12, fontWeight: "600", marginTop: 4 },

//   /* FAB */
//   fab: {
//     position: "absolute",
//     right: 20,
//     bottom: 24,
//     backgroundColor: "#0ea5a4",
//     width: 56,
//     height: 56,
//     borderRadius: 28,
//     alignItems: "center",
//     justifyContent: "center",
//     elevation: 6,
//   },
// });

// import {
//   StyleSheet,
//   Text,
//   View,
//   Image,
//   SafeAreaView,
//   TouchableOpacity,
//   useColorScheme,
//   FlatList,
//   ScrollView,
// } from 'react-native';
// import React, { useEffect, useState } from 'react';
// import moment from 'moment';
// import COLORS from '../constants/colors';
// import { THEME_COLORS } from '../constants/theme';
// import Icon from 'react-native-vector-icons/FontAwesome5';
// import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome6';
// import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
// import Img from '../Assets/img1.png';
// import NavBar from '../components/NavBar';
// import { useRoute } from '@react-navigation/native';
// import axios from 'axios';
// import { useNavigation } from '@react-navigation/native';
// import { URL } from '../constants/URL';
// import fetchBalance from '../constants/fetchBalance';
// import fetchHistory from '../constants/fetchHistory';
// import fetchFlatList from '../constants/fetchFlatList';

// export default function Home() {
//   const route = useRoute();
//   // const {email,id} = route.params;
//   const [currentDate, setCurrentDate] = useState('');
//   const [userName, setUserName] = useState('');
//   const [userData, setUserData] = useState(null);
//   const [balance, setBalance] = useState(null);
//   const [history, setHistory] = useState(null);
//   const [card, setCard] = useState(false);
//   const [textMain, setTextMain] = useState('Add your Card');
//   const [textSub, setTextSub] = useState(
//     'Link your credit/debit cart to make transactions.',
//   );
//   const colorScheme = useColorScheme();
//   const backgroundColor = colorScheme === 'dark' ? 'black' : 'white';
//   const navigation = useNavigation();

//   useEffect(() => {
//     let date = moment().format('llll');
//     setCurrentDate(date);
//     // const fetchData = async () => {
//     //   try {
//     //     const response = await axios.get(`${URL}/api/home/${email}`);
//     //     setUserName(`${response.data.firstName} ${response.data.lastName}`);
//     //     setUserData(response.data);
//     //   } catch (error) {
//     //     console.log(error);
//     //   }
//     // };
//     // fetchData();

//     // const fetchDetails = async () => {
//     //   try {
//     //     const response = await axios.post(`${URL}/api/carddetails`, {
//     //       id: id,
//     //     });
//     //     if (response) {
//     //       console.log(response.data)
//     //       setCard(true)
//     //       setTextMain('Add Credit');
//     //       setTextSub('Add credit to your wallet to make transactions.');
//     //     }
//     //   } catch (error) {
//     //     console.log(error);
//     //     return null;
//     //   }
//     // };
//     // fetchDetails();
//   }, []);

//   const recentTransactions = [
//     {
//       id: "t1",
//       service: "Mobile Recharge",
//       amount: "₹199",
//       status: "Success",
//       date: "02 Sep 2025",
//     },
//     {
//       id: "t2",
//       service: "Electricity Bill",
//       amount: "₹1450",
//       status: "Pending",
//       date: "03 Sep 2025",
//     },
//     {
//       id: "t3",
//       service: "DTH Recharge",
//       amount: "₹350",
//       status: "Failed",
//       date: "04 Sep 2025",
//     },
//     {
//       id: "t4",
//       service: "Electricity Bill",
//       amount: "₹1450",
//       status: "Pending",
//       date: "03 Sep 2025",
//     },
//   ];

//   useEffect(() => {

//     const fetchBalance = async () => {
//       try {
//         const response = await axios.post(`${URL}/api/balance`, {
//           id: id,
//         });
//         //console.log(balance)

//         if (response.data.success === true) {
//           setBalance(response.data.balance)

//         } else if (response.data.success === false) {
//           setBalance(response.data.balance)

//         }
//         // if(response.data.success===false){
//         //   setBalance(0)
//         // }
//       } catch (error) {
//         console.log(error);

//       }
//     }
//     fetchBalance()

//   })
//   useEffect(() => {
//     const fetchHistory = async () => {
//       try {
//         const response = await axios.post(`${URL}/api/paymenthistory`, {
//           id: id,
//         });
//         if (response) {
//           setHistory(response.data.payments)

//         }
//       } catch (error) {
//         console.log(error);

//       }
//     }
//     fetchHistory()

//   }, [balance])
//   const renderItem = ({ item }) => {
//     const date = new Date(item.created * 1000);

//     // Format the date and time
//     const formattedDateTime = date.toLocaleString();
//     return (
//     // <View>
//     //   <View style={styles.tile}>
//     //     {/* {item.type==='payment'?<Text style={styles.renderTextRed}>{item.type}</Text>:<Text style={styles.renderTextGreen}>{item.type}</Text>} */}
//     //     {/* <Text style={styles.renderText}>{`Rs.${item.amount}.00`}</Text> */}
//     //     <Text style={styles.renderText}>{`Rs.60.00`}</Text>
//     //     <Text style={styles.renderText}>{'12 JUL 2025'}</Text>
//     //   </View>

//     // </View>
//     <View style={styles.serviceTabContainer}>
//       <TouchableOpacity
//                     onPress={() => {
//                       navigation.navigate('BillPayments', { userData });
//                     }}>
//                     <View style={styles.serviceTab1}>
//       <Image
//       style={{width:70,height:70,resizeMode:'cover'}}
//        source={{uri:'https://rukminim2.flixcart.com/fk-p-flap/3240/540/image/0a08b3795f997b1d.jpg?q=60'}}>
//       </Image>
//       <Image
//       style={{width:70,height:70,resizeMode:'cover'}}
//        source={{uri:'https://logos-world.net/wp-content/uploads/2020/11/Flipkart-Logo.png'}}>
//       </Image>
//       </View>
//       </TouchableOpacity>
//                   {/* <TouchableOpacity
//                     onPress={() => {
//                       navigation.navigate('BillPayments', { userData });
//                     }}>
//                     <View style={styles.serviceTab}>
//                       <FontAwesomeIcon
//                         name="money-bill-1"
//                         size={25}
//                         color={COLORS.purple}
//                       />
//                     </View>
//                   </TouchableOpacity> */}
//                   <Text style={styles.serviceText}>Bill Payments</Text>
//                 </View>
//     )
//   };

//   //setHistory(fetchHistory({id:id,balance:balance}))
//   // useEffect(()=>{
//   //   const fetchBalance=async ()=>{
//   //     try {
//   //       const response = await axios.post(`${URL}/api/balance`, {
//   //         id: id,
//   //       });
//   //       if (response) {
//   //         setBalance(response.data.balance)

//   //       }
//   //       if(response.data.success===false){
//   //         setBalance(0)
//   //       }
//   //     } catch (error) {
//   //       console.log(error);

//   //     }
//   //   }
//   //   fetchBalance()
//   // })

//   return (
//     <SafeAreaView style={[{ flex: 1 }, { backgroundColor }]}>
//       <View style={styles.Container}>
//         <View style={styles.header}>
//           <View style={styles.headerTitleContainer}>
//             {/* <Text style={styles.Date}>{'Today' + `${'currentDate'}`}</Text> */}
//             <Text style={styles.Date}>{'Rohit Sharma'}</Text>
//             <Text style={styles.name}>{'Sector 18 Gurgaon'}</Text>
//           </View>
//           <View style={styles.headerBtns}>
//             <TouchableOpacity style={styles.headerbtn} onPress={() => { navigation.navigate('Help') }}>
//               <FontAwesomeIcon
//                 name="headset"
//                 size={18}
//                 color={COLORS.white}
//                 style={{ textAlign: 'center' }}
//               />
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.headerbtn} onPress={() => { navigation.navigate('Notification') }}>
//               <Icon
//                 name="bell"
//                 size={18}
//                 color={COLORS.white}
//                 style={{ textAlign: 'center' }}
//               />
//             </TouchableOpacity>
//           </View>
//         </View>

//         <View style={styles.addCard}>
//           {/* <Image source={{uri:'https://img.pikbest.com/templates/20211025/bg/77cd53893bc536e384b60fc500473ed1_120961.png!bwr800'}} style={styles.imageStyles} /> */}
//           {/* <Image source={{uri:'https://img.pikbest.com/templates/20211025/bg/77cd53893bc536e384b60fc500473ed1_120961.png'}} style={styles.imageStyles1} /> */}
//           <Image source={{ uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS620SMZHHNMURF1bsM0iaFaY7zlxYVsrLhXw&s' }} style={styles.imageStyles1} />
//           {/* <View style={styles.plus}>
//             <TouchableOpacity
//               onPress={() => navigation.navigate('Wallet', {userData})}>
//               <FontAwesomeIcon
//                 name="circle-plus"
//                 size={30}
//                 color={COLORS.white}
//               />
//             </TouchableOpacity>
//           </View>
//           <Text style={styles.cardtext}>{`Rs ${balance == null? '00': balance}.00`}</Text>
//           <Text style={styles.cardsubtext}>{balance!==null? "Available balance":textSub}</Text> */}
//         </View>
//         <ScrollView showsVerticalScrollIndicator={false}>

//           <View style={{ backgroundColor: '#fff', marginTop: 10, borderTopLeftRadius: 40, borderTopRightRadius: 40 }}>
//             <View style={styles.tabContainer}>
//               <TouchableOpacity onPress={() => navigation.navigate('AddCredit', { userData })}>
//                 <View style={styles.tab}>
//                   <View style={[styles.tabCircle, { backgroundColor }]}>
//                     <FontAwesomeIcon
//                       name="dollar"
//                       size={20}
//                       color={COLORS.purple}
//                     />
//                   </View>
//                   <Text style={styles.tabtext}>Rs. 1250.00</Text>
//                 </View>
//               </TouchableOpacity>

//               {/* <TouchableOpacity onPress={() => {navigation.navigate('Transfer',{userData})}}>
//             <View style={styles.tab}>
//               <View style={[styles.tabCircle, {backgroundColor}]}>
//                 <FontAwesomeIcon
//                   name="arrow-right-arrow-left"
//                   size={20}
//                   color={COLORS.purple}
//                 />
//               </View>
//               <Text style={styles.tabtext}>Transfer</Text>
//             </View>
//           </TouchableOpacity> */}

//               <TouchableOpacity onPress={() => { navigation.navigate('History', { id }) }}>
//                 <View style={styles.tab}>
//                   <View style={[styles.tabCircle, { backgroundColor }]}>
//                     <Icon name="wallet" size={20} color={COLORS.purple} />
//                   </View>
//                   <Text style={styles.tabtext}>Add Money</Text>
//                 </View>
//               </TouchableOpacity>
//             </View>

//             <View style={styles.serviceContainer}>
//               <View style={styles.title}>
//                 <Text style={styles.titleText}>Services</Text>
//                 <View style={styles.line}></View>
//               </View>
//               <View style={styles.serviceTabs}>
//                 <View style={styles.serviceTabContainer}>
//                   <TouchableOpacity
//                     onPress={() => {
//                       navigation.navigate('BillPayments', { userData });
//                     }}>
//                     <View style={styles.serviceTab}>
//                       <FontAwesomeIcon
//                         name="money-bill-1"
//                         size={25}
//                         color={COLORS.purple}
//                       />
//                     </View>
//                   </TouchableOpacity>
//                   <Text style={styles.serviceText}>Bill Payments</Text>
//                 </View>

//                 <View style={styles.serviceTabContainer}>
//                   <TouchableOpacity onPress={() => { navigation.navigate('MobileTopUp', { userData }) }}>
//                     <View style={styles.serviceTab}>
//                       <FontAwesomeIcon
//                         name="mobile-screen"
//                         size={25}
//                         color={COLORS.purple}
//                       />
//                     </View>
//                   </TouchableOpacity>
//                   <Text style={styles.serviceText}>{'Mobile\n top up'}</Text>
//                 </View>

//                 <View style={styles.serviceTabContainer}>
//                   <TouchableOpacity style={styles.serviceBtn} onPress={() => { navigation.navigate('Rewards') }}>
//                     <View style={styles.serviceTab}>
//                       <MaterialIcon
//                         name="wallet-giftcard"
//                         size={25}
//                         color={COLORS.purple}
//                       />
//                     </View>
//                   </TouchableOpacity>
//                   <Text style={styles.serviceText}>Rewards</Text>
//                 </View>

//                 <View style={styles.serviceTabContainer}>
//                   <TouchableOpacity style={styles.serviceBtn} onPress={() => { navigation.navigate('Balance', { userData }) }}>
//                     <View style={styles.serviceTab}>
//                       <FontAwesomeIcon
//                         name="sack-dollar"
//                         size={25}
//                         color={COLORS.purple}
//                       />
//                     </View>
//                   </TouchableOpacity>
//                   <Text style={styles.serviceText}>Check balance</Text>
//                 </View>
//               </View>
//             </View>
//             <View style={[styles.serviceContainer, { marginTop: 0 }]}>
//               <View style={styles.serviceTabs}>
//                 <View style={styles.serviceTabContainer}>
//                   <TouchableOpacity
//                     onPress={() => {
//                       navigation.navigate('BillPayments', { userData });
//                     }}>
//                     <View style={styles.serviceTab}>
//                       <FontAwesomeIcon
//                         name="money-bill-1"
//                         size={25}
//                         color={COLORS.purple}
//                       />
//                     </View>
//                   </TouchableOpacity>
//                   <Text style={styles.serviceText}>Bill Payments</Text>
//                 </View>

//                 <View style={styles.serviceTabContainer}>
//                   <TouchableOpacity onPress={() => { navigation.navigate('MobileTopUp', { userData }) }}>
//                     <View style={styles.serviceTab}>
//                       <FontAwesomeIcon
//                         name="mobile-screen"
//                         size={25}
//                         color={COLORS.purple}
//                       />
//                     </View>
//                   </TouchableOpacity>
//                   <Text style={styles.serviceText}>{'Mobile\n top up'}</Text>
//                 </View>

//                 <View style={styles.serviceTabContainer}>
//                   <TouchableOpacity style={styles.serviceBtn} onPress={() => { navigation.navigate('Rewards') }}>
//                     <View style={styles.serviceTab}>
//                       <MaterialIcon
//                         name="wallet-giftcard"
//                         size={25}
//                         color={COLORS.purple}
//                       />
//                     </View>
//                   </TouchableOpacity>
//                   <Text style={styles.serviceText}>Rewards</Text>
//                 </View>

//                 <View style={styles.serviceTabContainer}>
//                   <TouchableOpacity style={styles.serviceBtn} onPress={() => { navigation.navigate('Balance', { userData }) }}>
//                     <View style={styles.serviceTab}>
//                       <FontAwesomeIcon
//                         name="sack-dollar"
//                         size={25}
//                         color={COLORS.purple}
//                       />
//                     </View>
//                   </TouchableOpacity>
//                   <Text style={styles.serviceText}>Check balance</Text>
//                 </View>
//               </View>
//             </View>

//             <View style={styles.transactionsContainer}>
//               <View style={styles.title}>
//                 <Text style={styles.titleText}>Other Services</Text>
//                 <View style={styles.line}></View>
//                 <View style={styles.transactions}>
//                   <FlatList
//                     data={recentTransactions}
//                     horizontal
//                     renderItem={renderItem}
//                     keyExtractor={item => item.id}
//                   />
//                 </View>
//               </View>
//             </View>
//             <View style={{marginBottom:50}}></View>
//           </View>
//         </ScrollView>

//       </View>
//       <NavBar navigation={navigation} data={'userData'} />
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   Container: {
//     // margin: 25,
//     flex: 1,
//     // alignItems:'center',
//     // padding:25,
//     // marginBottom: 0,
//     // position: 'relative',
//     backgroundColor: '#157363',
//   },
//   header: {
//     flexDirection: 'row',
//     // backgroundColor:'#157363',
//     alignItems: 'center',
//     // height:50,
//     paddingHorizontal: 10,
//     justifyContent: 'space-between',
//   },
//   headerTitleContainer: {
//     flexDirection: 'column',
//   },
//   Date: {
//     color: COLORS.white,
//     fontSize: 18,
//   },
//   name: {
//     color: COLORS.white,
//     fontSize: 14,
//   },
//   headerBtns: {
//     flexDirection: 'row',
//     gap: 10,
//   },
//   headerbtn: {
//     padding: 3,
//     borderWidth: 1,
//     borderColor: '#fff',
//     borderRadius: 50,
//     width: 30,
//     height: 30,
//   },
//   addCard: {
//     // position: 'relative',
//     // width: '100%',
//     alignItems: 'center',
//     justifyContent: 'center',
//     // height: 150,
//     backgroundColor: COLORS.purple,
//     marginTop: 10,
//     borderRadius: 12,
//     padding: 0,
//   },
//   cardtext: {
//     fontSize: 30,
//     color: COLORS.black,
//     fontWeight: '600',
//   },
//   cardsubtext: {
//     fontSize: 14,
//     fontWeight: '400',
//     color: COLORS.black,
//   },
//   plus: {
//     position: 'absolute',
//     right: 10,
//     top: 10,
//   },
//   // imageStyles: {
//   //   position: 'absolute',
//   //   right: 0,
//   //   bottom: 0,
//   //   zIndex: -1,
//   //   width:'100%',
//   //   height:60,
//   // },
//   //   imageStyles1: {
//   //   // position: 'absolute',
//   //   // right: 0,
//   //   // bottom: 0,
//   //   // zIndex: -1,
//   //   width:'100%',
//   //   height:60,
//   // },
//   imageStyles1: {
//     width: '97%',
//     height: 160,
//     resizeMode: 'cover',
//     borderRadius: 10
//   },
//   tabContainer: {
//     marginTop: 20,
//     // gap: 5,
//     // width:'100%',
//     paddingHorizontal: 10,
//     flexDirection: 'row',
//     // justifyContent: 'space-around',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     backgroundColor: COLORS.white,

//   },
//   tab: {
//     position: 'relative',
//     height: 70,
//     width: 180,
//     paddingHorizontal: 30,
//     backgroundColor: COLORS.purple,
//     borderRadius: 12,
//     flexDirection: 'column',
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 10,
//   },
//   tabCircle: {
//     position: 'absolute',
//     height: 40,
//     width: 40,
//     borderRadius: 50,
//     right: '70%',
//     transform: [{ translateX: 10 }],
//     top: -18,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   tabtext: {
//     color: COLORS.white,
//     fontWeight: '500',
//   },
//   serviceContainer: {
//     marginTop: 20,
//     flexDirection: 'column',
//   },
//   title: {},
//   titleText: {
//     fontSize: 23,
//     color: COLORS.black,
//     fontWeight: '600',
//   },
//   line: {
//     height: 3,
//     width: '100%',
//     backgroundColor: COLORS.purple,
//     marginTop: 5,
//   },
//   serviceTabContainer: {
//     flexDirection: 'column',
//     alignItems: 'center',
//     width: 80,
//     gap: 3,
//   },
//   serviceTabs: {
//     marginTop: 20,
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//   },
//   serviceTab: {
//     flexDirection: 'column',
//     width: 60,
//     height: 60,
//     borderRadius: 12,
//     borderWidth: 2,
//     borderColor: COLORS.purple,
//     padding: 10,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//     serviceTab1: {
//     flexDirection: 'column',
//     // width: 60,
//     // height: 60,
//     borderRadius: 12,
//     marginHorizontal:10,
//     borderWidth: 2,
//     borderColor: COLORS.purple,
//     padding: 10,
//     alignItems: 'center',
//     // justifyContent: 'center',
//   },
//   serviceBtn: {},
//   serviceText: {
//     textAlign: 'center',
//     fontWeight: '400',
//     color: COLORS.black,
//   },
//   transactionsContainer: {
//     marginTop: 10,
//     flexDirection: 'column',
//     backgroundColor: COLORS.white,
//     marginBottom:40,
//     // paddingBottom:30

//   },
//   transactions: {
//     height: 100,
//     padding: 10
//   },
//   tile: {
//     flexDirection: 'row',
//     padding: 10,
//     justifyContent: 'space-between',

//   },
//   renderText: {
//     fontWeight: '600'
//   },
//   renderTextGreen: {
//     fontWeight: '600',
//     color: COLORS.green
//   },
//   renderTextRed: {
//     fontWeight: '600',
//     color: COLORS.warning

//   },
// });

// ========================
// FULL FILE: HomeScreen.js
// ========================

import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
  FlatList,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import LinearGradient from 'react-native-linear-gradient';
import { getData } from '../API';
import { Dimensions, Linking } from 'react-native';
import { THEME_COLORS, GRADIENTS, SHADOWS } from '../constants/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const ORANGE = THEME_COLORS.orange;

const ICON_GRADIENTS = [
  GRADIENTS.blue_grad,
  GRADIENTS.orange_grad,
  GRADIENTS.green_grad,
];

const HomeScreen = () => {
  const navigation = useNavigation();
  
  const [orderList, setOrderList] = useState([]);
  const [filteredOrderList, setFilteredOrderList] = useState({});
  const [loading, setLoading] = useState(false);
  const [UserData, setUserData] = useState(null);

  const [stats, setStats] = useState({ spendings: 0, earnings: 0, pending: 0 });
  const scrollRef = React.useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [POPUP, setPOPUP] = useState();

  // ---------------------------
  // SHOW POPUP ONCE PER HOUR
  // ---------------------------
  useEffect(() => {
    if (POPUP?.image) {
      const now = Date.now();
      AsyncStorage.getItem('lastPopupTime').then(lastTime => {
        const lastShown = lastTime ? parseInt(lastTime) : 0;
        const diff = now - lastShown;
        const hoursPassed = diff / (1000 * 60 * 60);

        if (hoursPassed >= 1) {
          setShowModal(true);
          AsyncStorage.setItem('lastPopupTime', now.toString());
        }
      });
    }
  }, [POPUP]);

  // ---------------------------
  // POPUP IMAGE API
  // ---------------------------
  const getPopUpImage = async () => {
    setLoading(true);
    const res = await getData(`api/pop-image`);
    setPOPUP(res.Data);
    setLoading(false);
  };

  const handleServicePress = (item, sectionName) => {
    if (item.route && item.route !== '') {
      navigation.navigate('RedirectScreen', {
        data: item,
        type: sectionName,
      });
    } else {
      navigation.navigate('Provider', {
        ServiceId: item._id,
        name: item.name,
      });
    }
  };

  // ---------------------------
  // USER PROFILE API
  // ---------------------------
  const fetchUser = async () => {
    try {
      const res = await getData(`/api/user/profile`);
      if (res?.Status === true || res?.success === true) {
        setUserData(res?.Data || res?.user);
      }
    } catch (err) {
      console.log('User Fetch Error →', err);
    }
  };

  // ---------------------------
  // SERVICES LIST
  // ---------------------------
  const getOrderlist = async () => {
    setLoading(true);
    const res = await getData(`api/service/list?status=true`);
    const res1 = await getData(`api/affiliate/list`);
    // console.log('Service List →', res);
    console.log('Affiliate List →', res1);
    const combinedData = [...(res?.Data || []), ...(res1?.Data || [])];
    setOrderList(combinedData);
    separateServicesBySection(combinedData);

    setLoading(false);
  };

  // ---------------------------
  // BANNER FETCH
  // ---------------------------
  // ---------------------------
  // STATS FETCH
  // ---------------------------
  const fetchStats = async () => {
    try {
      if (!UserData?._id) return;

      // 1. Fetch Ledger for Spendings & Earnings
      const ledgerRes = await getData(`api/txn/list/${UserData._id}`);
      let totalSpendings = 0;
      let totalEarnings = 0;

      if (ledgerRes?.Data) {
        ledgerRes.Data.forEach(txn => {
          if (txn.txnType === 'debit') {
            totalSpendings += parseFloat(txn.txnAmount || 0);
          } else if (txn.txnType === 'credit') {
            totalEarnings += parseFloat(txn.txnAmount || 0);
          }
        });
      }

      // 2. Fetch Pending Recharges
      const historyRes = await getData('api/user/combined-history');
      let pendingCount = 0;

      if (historyRes?.Data) {
        const mobile = historyRes.Data.mobile || [];
        const dth = historyRes.Data.dth || [];
        const bbps = historyRes.Data.bbps || [];

        const allTxns = [...mobile, ...dth, ...bbps];
        pendingCount = allTxns.filter(
          item => item.status?.toUpperCase() === 'PENDING',
        ).length;
      }

      setStats({
        spendings: totalSpendings.toFixed(2),
        earnings: totalEarnings.toFixed(2),
        pending: pendingCount,
      });
    } catch (err) {
      console.log('Stats Fetch Error', err);
    }
  };

  // -----------------------------------
  // GROUP SERVICES BY "section" FIELD
  // -----------------------------------
  const separateServicesBySection = (services = []) => {
    const acc = services.reduce((acc, item) => {
      if (!acc[item.section]) acc[item.section] = [];
      acc[item.section].push(item);
      return acc;
    }, {});
    console.log('Separated Services →', acc);
    setFilteredOrderList(acc);
  };

  // -----------------------------------
  // INITIAL LOAD
  // -----------------------------------

  useEffect(() => {
    fetchUser();
    getOrderlist();
    getPopUpImage();
  }, []);

  useEffect(() => {
    if (UserData?._id) {
        fetchStats();
    }
  }, [UserData]);

  useFocusEffect(
    React.useCallback(() => {
      getOrderlist();
      fetchUser();
    }, []),
  );



  // ---------------------------
  // POPUP MODAL RENDER
  // ---------------------------
  const renderPopup = () => (
    <Modal visible={showModal} transparent animationType="fade">
      <View style={styles.popupBackdrop}>
        <View style={styles.popupContainer}>
          <TouchableOpacity
            onPress={() => setShowModal(false)}
            style={styles.popupClose}
          >
            <Text style={styles.popupCloseText}>X</Text>
          </TouchableOpacity>

          <Image
            source={{ uri: `https://api.new.techember.in/${POPUP.image}` }}
            style={styles.popupImage}
          />
        </View>
      </View>
    </Modal>
  );

  // ---------------------------
  // RENDER SERVICE ITEM
  // ---------------------------
  const RenderServiceItem = ({ item, index, sectionName }) => {
    const gradient = ICON_GRADIENTS[index % ICON_GRADIENTS.length];
    
    return (
      <View style={styles.cardWrapper1} key={index}>
        <TouchableOpacity
          style={styles.serviceTouch}
          onPress={() => {
             if (sectionName === 'recharge' || sectionName === 'finance') {
                 if (item.name === 'Recharge') navigation.navigate('Recharge', { ServiceId: item._id });
                 else if (item.name === 'DTH') navigation.navigate('DTHRechargeScreen', { ServiceId: item._id });
                 else navigation.navigate('Provider', { ServiceId: item._id, name: item.name });
             } else {
                 handleServicePress(item, sectionName);
             }
          }}
        >
          <LinearGradient
            colors={gradient}
            style={styles.serviceIconContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Image
              source={{ uri: 'https://api.new.techember.in/' + item.icon }}
              style={{ width: 32, height: 32, resizeMode: 'contain', tintColor: '#fff' }}
            />
          </LinearGradient>
          <Text style={styles.cardText1} numberOfLines={2}>
            {item.name}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // ---------------------------
  // MAIN RENDER
  // ---------------------------
  return (
    <SafeAreaView style={styles.container}>
      {showModal && POPUP?.image && renderPopup()}

      <ScrollView contentContainerStyle={{ paddingBottom: 160 }}>
        {/* HEADER */}
        <LinearGradient
          colors={GRADIENTS.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        >
          <View style={styles.headerRow}>
            <View style={styles.userRow}>
              <TouchableOpacity
                style={styles.avatarContainer}
                onPress={() =>
                  navigation.navigate('Profile', {
                    name: UserData?.firstName + ' ' + UserData?.lastName,
                    phn: UserData?.phone,
                    referralCode: UserData?.referalId,
                  })
                }
              >
                <Image
                  source={{
                    uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIf4R5qPKHPNMyAqV-FjS_OTBB8pfUV29Phg&s',
                  }}
                  style={styles.avatar}
                />
              </TouchableOpacity>

              <View>
                <Text style={styles.userName}>Hi, {UserData?.firstName}</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('WalletTopupScreen')}
                >
                  <Text style={styles.balance}>
                    Balance : {UserData?.wallet?.balance} ▼
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.offerBtn}
                onPress={() => {
                  Linking.openURL(
                    'https://whatsapp.com/channel/0029VbBvpYjBA1f6Pxd9jb1N',
                  );
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '700', color: THEME_COLORS.success }}>Offer</Text>
              </TouchableOpacity>

              <Icon
                name="notifications-none"
                size={24}
                color="#fff"
                onPress={() => navigation.navigate('Notification')}
              />
            </View>
          </View>
        </LinearGradient>

        {/* STATS GRID */}
        <View style={styles.statsGrid}>
          {/* Tile 1: Balance */}
          <View style={styles.statsCard}>
            <View style={[styles.statsIcon, { backgroundColor: '#E3F2FD' }]}>
              <Icon name="account-balance-wallet" size={24} color={THEME_COLORS.primary} />
            </View>
            <View>
             <Text style={styles.statsLabel}>Balance</Text>
             <Text style={styles.statsValue}>₹{UserData?.wallet?.balance || 0}</Text>
            </View>
          </View>

          {/* Tile 2: Spendings */}
          <View style={styles.statsCard}>
            <View style={[styles.statsIcon, { backgroundColor: '#FFEBEE' }]}>
              <FontAwesome5 name="arrow-up" size={20} color={THEME_COLORS.warning} />
            </View>
             <View>
            <Text style={styles.statsLabel}>Spendings</Text>
            <Text style={styles.statsValue}>₹{stats.spendings}</Text>
            </View>
          </View>

          {/* Tile 3: Earnings */}
          <View style={styles.statsCard}>
            <View style={[styles.statsIcon, { backgroundColor: '#E8F5E9' }]}>
              <FontAwesome5 name="arrow-down" size={20} color={THEME_COLORS.success} />
            </View>
             <View>
            <Text style={styles.statsLabel}>Earnings</Text>
            <Text style={styles.statsValue}>₹{stats.earnings}</Text>
            </View>
          </View>

          {/* Tile 4: Pending */}
          <View style={styles.statsCard}>
             <View style={[styles.statsIcon, { backgroundColor: '#FFF3E0' }]}>
              <Icon name="pending-actions" size={24} color={THEME_COLORS.orange} />
            </View>
             <View>
            <Text style={styles.statsLabel}>Pending</Text>
            <Text style={styles.statsValue}>{stats.pending}</Text>
            </View>
          </View>
        </View>



        {/* ============================
           ALL SERVICES GRID
        ============================ */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recharges & Bills</Text>
          </View>
          
          <View style={styles.row}>
            {/* 1. RECHARGE SECTION */}
            {filteredOrderList['recharge']?.map((item, idx) => (
                <RenderServiceItem key={`rech-${idx}`} item={item} index={idx} sectionName="recharge" />
            ))}

            {/* 2. FINANCE SECTION */}
            {filteredOrderList['finance']?.map((item, idx) => (
                <RenderServiceItem key={`fin-${idx}`} item={item} index={filteredOrderList['recharge']?.length + idx} sectionName="finance" />
            ))}
          </View>
        </View>

        {/* DYNAMIC SECTIONS */}
        {Object.keys(filteredOrderList)
          .filter(
            sectionName =>
              sectionName !== 'recharge' &&
              sectionName !== 'finance' &&
              sectionName.trim() !== '' &&
              filteredOrderList[sectionName]?.length > 0,
          )
          .map((sectionName, index) => (
            <View key={index} style={styles.section}>
               <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {sectionName.charAt(0).toUpperCase() + sectionName.slice(1)}
                </Text>
              </View>
              <View style={styles.row}>
                {filteredOrderList[sectionName].slice(0, 8).map((item, idx) => (
                   <RenderServiceItem key={`dyn-${index}-${idx}`} item={item} index={idx + 2} sectionName={sectionName} />
                ))}
              </View>
            </View>
        ))}

        {/* REFER SECTION */}
        <LinearGradient
          colors={GRADIENTS.lightBg}
          style={styles.referContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.referTitle}>You 💖 99 Recharce</Text>
          <Text style={styles.referSubtitle}>
            Your friends are going to love us too!
          </Text>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate('ReferScreen', {
                referralCode: UserData?.referalId,
              })
            }
          >
            <Text style={styles.referLink}>Refer & Win up to ₹100 →</Text>
          </TouchableOpacity>

          {/* <Image
            source={require('../Assets/referalImage.jpeg')}
            style={styles.referImage}
          /> */}

          <LinearGradient
            colors={GRADIENTS.orangeBtn}
            style={styles.claimBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <TouchableOpacity>
              <Text style={styles.claimText}>🎁 Claim Your ₹10 Bonus!</Text>
            </TouchableOpacity>
          </LinearGradient>
        </LinearGradient>
      </ScrollView>

      {/* BOTTOM NAV */}
      <LinearGradient
        colors={GRADIENTS.nav}
        style={[styles.bottomNav, SHADOWS.nav, { justifyContent: 'space-around' }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('WalletTopupScreen')}
        >
          <Icon name="account-balance-wallet" size={24} color={THEME_COLORS.blueNav} />
          <Text style={[styles.navText, { color: THEME_COLORS.blueNav }]}>Wallet</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Report', { id: UserData?._id })}
        >
          <Icon name="bar-chart" size={24} color={THEME_COLORS.blueNav} />
          <Text style={[styles.navText, { color: THEME_COLORS.blueNav }]}>Reports</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('CommissionChart')}
        >
          <Icon name="currency-rupee" size={24} color={THEME_COLORS.blueNav} />
          <Text style={[styles.navText, { color: THEME_COLORS.blueNav }]}>Commission</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('ContactScreen')}
        >
          <Icon name="support-agent" size={24} color={THEME_COLORS.blueNav} />
          <Text style={[styles.navText, { color: THEME_COLORS.blueNav }]}>Support</Text>
        </TouchableOpacity>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default HomeScreen;

// ========================
// STYLES
// ========================

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },

  popupBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  popupContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
  },
  popupClose: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    padding: 4,
  },
  popupCloseText: { fontSize: 28, fontWeight: '700', color: '#000' },
  popupImage: {
    width: 280,
    height: undefined,
    aspectRatio: 1.6,
    resizeMode: 'cover',
    borderRadius: 16,
  },

  /* HEADER */
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 30,
    paddingBottom: 40,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userRow: { flexDirection: 'row', alignItems: 'center' },
  avatarContainer: {
    borderWidth: 2.5,
    borderColor: THEME_COLORS.orangeLight,
    borderRadius: 50,
    marginRight: 12,
  },
  avatar: { width: 46, height: 46, borderRadius: 25 },
  userName: { fontSize: 17, fontWeight: '700', color: '#fff' },
  balance: { fontSize: 14, color: '#e8f1ff', marginTop: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  offerBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#fff',
    marginRight: 12,
  },

  /* BANNERS */
  bannerImage: {
    width: SCREEN_WIDTH - 50,
    height: 160,
    resizeMode: 'cover',
    marginHorizontal: 15,
    borderRadius: 14,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },

  /* SECTION */
  section: {
    backgroundColor: '#fff',
    marginTop: 18,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    elevation: 3,
    borderLeftWidth: 3,
    borderLeftColor: '#fff',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: THEME_COLORS.textPrimary },

  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  /* SMALL CARD (STANDARD) */
  cardWrapper1: {
    width: '23%', 
    marginBottom: 16,
    alignItems: 'center',
  },
  serviceTouch: {
    alignItems: 'center',
    width: '100%',
  },
  serviceIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 20, 
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardText1: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME_COLORS.textPrimary,
    textAlign: 'center',
    width: '100%',
  },

  /* REFER SECTION */
  referContainer: {
    marginTop: 20,
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  referTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME_COLORS.textPrimary,
    textAlign: 'center',
  },
  referSubtitle: {
    fontSize: 14,
    color: THEME_COLORS.textSecondary,
    marginVertical: 6,
    textAlign: 'center',
  },
  referLink: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME_COLORS.success,
    marginVertical: 6,
  },
  referImage: {
    width: '90%',
    height: 180,
    resizeMode: 'contain',
    marginVertical: 10,
    borderRadius: 12,
  },
  claimBtn: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 25,
  },
  claimText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  /* BOTTOM NAV */
  bottomNav: {
    display: 'flex',
    flexDirection: 'row',
    paddingVertical: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius:0,
  },
  navItem: { alignItems: 'center', flex: 1 },
  navCenter: {
    backgroundColor: THEME_COLORS.success,
    borderRadius: 40,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -22,
    borderWidth: 3,
    borderColor: '#fff',
  },
  navText: { fontSize: 12, fontWeight: '600', color: THEME_COLORS.blueNav, marginTop: 4 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 16,
    marginTop: 10,
  },
  statsCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  statsLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  statsValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginTop: 2,
  },
});
