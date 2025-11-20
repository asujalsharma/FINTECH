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
  Button,
  FlatList,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { getData } from '../API';
import { Dimensions } from 'react-native';
import { Linking } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

const BLUE = '#007bff';

const HomeScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('Home');
  const [orderList, setOrderList] = useState([]);
  const [filteredOrderList, setFilteredOrderList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [UserData, setUserData] = useState();
  const [Banner, setBanner] = useState([]);
  const scrollRef = React.useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [POPUP, setPOPUP] = useState();

  useEffect(() => {
    if (POPUP?.image) {
      const now = Date.now(); // current timestamp (ms)

      AsyncStorage.getItem('lastPopupTime').then(lastTime => {
        const lastShown = lastTime ? parseInt(lastTime) : 0;

        // Difference in milliseconds
        const diff = now - lastShown;
        const hoursPassed = diff / (1000 * 60 * 60);

        if (hoursPassed >= 24) {
          setShowModal(true);
          AsyncStorage.setItem('lastPopupTime', now.toString());
        }
      });
    }
  }, [POPUP]);

  const getPopUpImage = async () => {
    setLoading(true);
    console.log('Getting Order List...');

    const res = await getData(`api/pop-image`);
    //  const res =   await postData("/api/get_categories", {
    //             user_id: userID,
    //           });
    console.log('POP UP DATA-->', res);
    // if (res.status) {
    setPOPUP(res.Data);
    // console.log('HistData-->', res?.data);
    // }
    // else{
    // errorToast('Something went wrong');
    // }
    setLoading(false);
  };

  const fetchUser = async () => {
    try {
      const res = await getData(`/api/user/profile`);

      console.log('User Response →', res);

      if (res?.Status === true || res?.success === true) {
        const userData = res?.Data || res?.user;
        setUserData(res?.Data || res?.user);

        // ✅ Save in Redux
        // dispatch(setUser(userData));
      } else {
        console.log('Failed to fetch user');
      }
    } catch (err) {
      console.log('User Fetch Error →', err);
    }
  };

  const getOrderlist = async () => {
    setLoading(true);
    console.log('Getting Order List...');

    const res = await getData(`api/service/list`);
    //  const res =   await postData("/api/get_categories", {
    //             user_id: userID,
    //           });
    console.log('HistData-->', res);
    // if (res.status) {
    setOrderList(res?.Data);
    separateServicesBySection(res?.Data);
    // console.log('HistData-->', res?.data);
    // }
    // else{
    // errorToast('Something went wrong');
    // }
    setLoading(false);
  };

  const fetchBanner = async () => {
    try {
      const res = await getData('api/home-banner/list');
      console.log(Banner);
      setBanner(res?.Data);
    } catch (err) {
      console.log(err);
      errorToast('Banner Fetch Went Wrong');
    }
  };

  // ✅ Function to separate services by section
  // const separateServicesBySection = (services = []) => {
  //   return services.reduce((acc, item) => {
  //     if (item.isShow) {  // only show if API says isShow: true
  //       if (!acc[item.section]) {
  //         acc[item.section] = [];
  //       }
  //       acc[item.section].push(item);
  //     }
  //     setFilteredOrderList(acc);
  //     console.log('Filtered List-->', acc);
  //     // return acc;
  //   }, {});
  // };
  const separateServicesBySection = (services = []) => {
    const acc = services.reduce((acc, item) => {
      // if (item.isShow) {  // केवल वही services आएंगी जिनका isShow true है
      if (!acc[item.section]) {
        acc[item.section] = [];
      }
      acc[item.section].push(item);
      // }
      return acc;
    }, {});

    // अब state set कर सकते हो
    setFilteredOrderList(acc);
    console.log('Filtered List -->', acc);

    return acc; // अगर कहीं aur use करना हो तो
  };

  // console.log('Filtered Order List-->', filteredOrderList['recharge']);
  useEffect(() => {
    fetchUser();
    getOrderlist();
    fetchBanner();
    getPopUpImage();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      getOrderlist();
      fetchUser();
    }, []),
  );

  const memoBanner = React.useMemo(() => Banner, [Banner]);

  const renderPopup = () => (
    <Modal visible={showModal} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}
      >
        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: 16,
            overflow: 'hidden',
            position: 'relative',
            alignItems: 'center',
          }}
        >
          {/* CLOSE BUTTON */}
          <TouchableOpacity
            onPress={() => setShowModal(false)}
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 10,
              padding: 4,
            }}
          >
            <Text style={{ fontSize: 28, fontWeight: '700', color: '#000' }}>
              X
            </Text>
          </TouchableOpacity>

          {/* IMAGE – Auto Adjusts Modal Size */}
          <Image
            source={{ uri: `https://api.new.techember.in/${POPUP.image}` }}
            style={{
              width: 280, // auto modal width
              height: undefined,
              aspectRatio: 1.6, // keeps image sharp & scaled correctly
              resizeMode: 'cover',
              borderRadius: 16,
            }}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {showModal && POPUP?.image && renderPopup()}
      <ScrollView contentContainerStyle={{ paddingBottom: 160 }}>
        {/* ===== HEADER ===== */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.userRow}>
              <TouchableOpacity
                style={styles.avatarContainer}
                onPress={() =>
                  navigation.navigate('Profile', {
                    name: UserData?.firstName + ' ' + UserData?.lastName,
                    phn: UserData?.phone,
                    referralCode: UserData.referalId,
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
                <Text style={{ fontSize: 12 }}>Offer</Text>
              </TouchableOpacity>

              <Icon
                name="notifications-none"
                size={24}
                color="#fff"
                onPress={() => {
                  navigation.navigate('Notification');
                }}
              />
            </View>
          </View>
        </View>

        {/* ===== WHATSAPP BANNER ===== */}
        <View style={{ marginTop: 10, width: '100%' }}>
          <FlatList
            data={memoBanner}
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
              <Image
                source={{ uri: 'https://api.new.techember.in/' + item.image }}
                style={{
                  width: SCREEN_WIDTH - 50,
                  height: 160,
                  resizeMode: 'cover',
                  marginHorizontal: 15,
                  borderRadius: 14,
                }}
              />
            )}
            onScroll={e => {
              const index = Math.round(
                e.nativeEvent.contentOffset.x / SCREEN_WIDTH,
              );
              setCurrentIndex(index);
            }}
            scrollEventThrottle={16}
          />

          {/* Smooth Auto Slide */}
          {useEffect(() => {
            if (!Banner || Banner.length === 0) return;

            const interval = setInterval(() => {
              let next = currentIndex + 1;

              if (next >= Banner.length) next = 0;

              scrollRef.current?.scrollToOffset({
                offset: next * (SCREEN_WIDTH - 30),
                animated: true,
              });

              setCurrentIndex(next);
            }, 3000);

            return () => clearInterval(interval);
          }, [Banner, currentIndex])}

          {/* === DOT INDICATOR === */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              marginTop: 10,
            }}
          >
            {Banner?.map((_, idx) => (
              <View
                key={idx}
                style={{
                  width: currentIndex === idx ? 18 : 8,
                  height: 8,
                  borderRadius: 4,
                  marginHorizontal: 4,
                  backgroundColor: currentIndex === idx ? BLUE : '#9db7ff',
                  transition: 'width 0.3s',
                }}
              />
            ))}
          </View>
        </View>
        {/* ===== MOBILE & DTH ===== */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mobile & DTH Recharge</Text>
            <Icon name="chevron-right" size={22} color={BLUE} />
          </View>
          <View style={styles.row}>
            {filteredOrderList?.['recharge']?.map((item, idx) => (
              <View style={styles.cardWrapper}>
                <View style={styles.blueShadowLarge} />
                <View style={styles.blueShadowSmall} />
                <TouchableOpacity
                  style={styles.serviceCard}
                  onPress={() => {
                    // navigation.navigate('Recharge')
                    if (item.name === 'Recharge')
                      navigation.navigate('Recharge', { ServiceId: item._id });
                    else
                      navigation.navigate('DTHRechargeScreen', {
                        ServiceId: item._id,
                      });
                  }}
                >
                  <Image
                    source={{
                      uri: 'https://api.new.techember.in/' + item.icon,
                    }}
                    style={styles.image}
                  />
                  <View>
                    <Text style={styles.cardText}>
                      {item.name === 'Recharge' ? 'Mobile' : ' DTH'}
                    </Text>
                    <Text style={styles.cardText}>Recharge</Text>
                  </View>
                  <FontAwesome5 name="hand-point-up" size={28} color={BLUE} />
                </TouchableOpacity>
              </View>
            ))}

            {/* <View style={styles.cardWrapper}>
              <View style={styles.blueShadowLarge} />
              <View style={styles.blueShadowSmall} />
              <TouchableOpacity style={styles.serviceCard}>
                <Icon name="tv" size={28} color={BLUE} />
                <View>
                <Text style={styles.cardText}>DTH </Text>
                <Text style={styles.cardText}>Recharge</Text>
                </View>
                <Icon name="smartphone" size={28} color={BLUE} />
              </TouchableOpacity>
            </View> */}
          </View>
        </View>
        {/* ===== FINANCIAL SERVICES ===== */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Bills & Finances</Text>

            <Icon
              name="chevron-right"
              size={22}
              color={BLUE}
              onPress={() => {
                navigation.navigate('BillPayments', {
                  service: filteredOrderList?.['finance'],
                });
              }}
            />
          </View>
          <View style={styles.row}>
            {
              // [
              //   { icon: "directions-bus", label: "Bus" },
              //   { icon: "flight", label: "Flight" },
              //   { icon: "hotel", label: "Hotels" },
              //   { icon: "train", label: "Train" },
              // ]
              filteredOrderList?.['finance']?.slice(0, 4)?.map((item, idx) => (
                <View style={[styles.cardWrapper1]} key={idx}>
                  <View style={styles.blueShadowLarge1} />
                  <View style={styles.blueShadowSmall1} />
                  <TouchableOpacity
                    style={styles.serviceCard1}
                    onPress={() => {
                      navigation.navigate('Provider', {
                        ServiceId: item._id,
                        name: item.name,
                      });
                    }}
                  >
                    {item.icon ? (
                      <Image
                        source={{
                          uri: 'https://api.new.techember.in/' + item.icon,
                        }}
                        style={{ width: 28, height: 28, resizeMode: 'contain' }}
                      />
                    ) : (
                      <Icon name="help-circle" size={28} color={BLUE} />
                    )}
                    <Text style={styles.cardText1}>{item.name}</Text>
                  </TouchableOpacity>
                </View>
              ))
            }
          </View>
        </View>
        {/* ===== TRAVEL BOOKING ===== */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { marginBottom: 10 }]}>
            Travel Booking
          </Text>
          <View style={styles.row}>
            {filteredOrderList?.['travel']?.slice(0, 4)?.map((item, idx) => (
              <View style={[styles.cardWrapper1]} key={idx}>
                <View style={styles.blueShadowLarge1} />
                <View style={styles.blueShadowSmall1} />
                <TouchableOpacity
                  style={styles.serviceCard1}
                  // onPress={getOrderlist}
                  onPress={() =>
                    navigation.navigate('RedirectScreen', {
                      data: item,
                      type: 'travel',
                    })
                  }
                >
                  {item.icon ? (
                    <Image
                      source={{
                        uri: 'https://api.new.techember.in/' + item.icon,
                      }}
                      style={{ width: 28, height: 28, resizeMode: 'contain' }}
                    />
                  ) : (
                    <Icon name="help-circle" size={28} color={BLUE} />
                  )}
                  <Text style={styles.cardText1}>{item.name}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
        {/* ===== INSURANCE SERVICES ===== */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { marginBottom: 10 }]}>
            Insurance
          </Text>
          <View style={styles.row}>
            {filteredOrderList?.['insurance']?.map((item, idx) => (
              <View style={[styles.cardWrapper1]} key={idx}>
                <View style={styles.blueShadowLarge1} />
                <View style={styles.blueShadowSmall1} />
                <TouchableOpacity
                  style={[styles.serviceCard1, { backgroundColor: '#0a1461' }]}
                  // onPress={getOrderlist}
                  onPress={() =>
                    navigation.navigate('RedirectScreen', {
                      data: item,
                      type: 'insurance',
                    })
                  }
                >
                  {item.icon ? (
                    <Image
                      source={{
                        uri: 'https://api.new.techember.in/' + item.icon,
                      }}
                      style={{ width: 28, height: 28, resizeMode: 'contain' }}
                    />
                  ) : (
                    <Icon name="help-circle" size={28} color={BLUE} />
                  )}
                  <Text
                    numberOfLines={1}
                    style={[styles.cardText1, { color: '#fff' }]}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
        {/* ===== BILLBUZZ REFER & EARN SECTION ===== */}
        <View style={styles.referContainer}>
          <Text style={styles.referTitle}>You 💖 PinPay</Text>
          <Text style={styles.referSubtitle}>
            Your friends are going to love us too!
          </Text>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate('ReferScreen', {
                referralCode: UserData.referalId,
              })
            }
          >
            <Text style={styles.referLink}>Refer & Win up to ₹100 →</Text>
          </TouchableOpacity>

          <Image
            source={require('../Assets/referalImage.jpeg')}
            style={styles.referImage}
          />

          <TouchableOpacity style={styles.claimBtn}>
            <Text style={styles.claimText}>🎁 Claim Your ₹10 Bonus!</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ===== FLOATING BOTTOM NAV ===== */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('WalletTopupScreen')}
        >
          <Icon name="account-balance-wallet" size={24} color="#fff" />
          <Text style={styles.navText}>Wallet</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Report', { id: UserData?._id })}
        >
          <Icon name="bar-chart" size={24} color="#fff" />
          <Text style={styles.navText}>Reports</Text>
        </TouchableOpacity>

        {/* Center Floating Button */}
        <TouchableOpacity
          style={styles.navCenter}
          onPress={() =>
            navigation.navigate('ReferScreen', {
              referralCode: UserData.referalId,
            })
          }
        >
          <Icon name="star" size={30} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('CommissionChart')}
        >
          <Icon name="currency-rupee" size={24} color="#fff" />
          <Text style={styles.navText}>Commission</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('ContactScreen')}
        >
          <Icon name="support-agent" size={24} color="#fff" />
          <Text style={styles.navText}>Support</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f9fb' },

  /* ===== HEADER ===== */
  header: {
    backgroundColor: BLUE,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 30,
    paddingBottom: 40,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userRow: { flexDirection: 'row', alignItems: 'center' },
  avatarContainer: {
    borderWidth: 2,
    borderColor: '#fff',
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

  /* ===== BANNER ===== */
  banner: {
    backgroundColor: '#eaf2ff',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: -25,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  bannerTitle: { fontSize: 12, fontWeight: '600', color: '#000' },
  bannerSubtitle: { fontSize: 15, marginTop: 4, fontWeight: '500' },
  bannerWhatsapp: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 4,
    color: '#007bff',
  },
  followBtn: {
    marginTop: 12,
    backgroundColor: BLUE,
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 24,
  },
  bannerTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 12,
  },
  tag: {
    fontSize: 11,
    backgroundColor: '#bfffd9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    margin: 4,
    color: '#064e3b',
  },

  /* ===== SECTION ===== */
  section: {
    backgroundColor: '#fff',
    marginTop: 18,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#0f172a' },

  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  /* ===== SERVICE CARD ===== */
  cardWrapper: {
    width: '47%',
    height: 72,
    marginBottom: 16,
    position: 'relative',
  },
  blueShadowLarge: {
    position: 'absolute',
    top: 3,
    left: 3,
    right: 0,
    bottom: 0,
    borderRadius: 22,
    backgroundColor: BLUE,
    opacity: 0.1,
  },
  blueShadowSmall: {
    position: 'absolute',
    borderRadius: 22,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  serviceCard: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: BLUE,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  cardText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
  },

  /* ===== SMALL SERVICE CARD ===== */
  cardWrapper1: {
    width: '22%',
    height: 92,
    marginBottom: 16,
    position: 'relative',
  },
  blueShadowLarge1: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 0,
    bottom: 0,
    borderRadius: 18,
    backgroundColor: BLUE,
    opacity: 0.1,
  },
  serviceCard1: {
    borderWidth: 1.2,
    borderColor: BLUE,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 6,
  },
  cardText1: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
    color: '#1e293b',
    textAlign: 'center',
  },
  image: {
    width: 42,
    height: 42,
    resizeMode: 'contain',
  },

  /* ===== REFER SECTION ===== */
  referContainer: {
    marginTop: 20,
    backgroundColor: '#fff',
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  referTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
  },
  referSubtitle: {
    fontSize: 14,
    color: '#555',
    marginVertical: 6,
    textAlign: 'center',
  },
  referLink: {
    fontSize: 16,
    fontWeight: '600',
    color: BLUE,
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
    backgroundColor: BLUE,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 25,
    marginTop: 4,
  },
  claimText: { color: '#fff', fontSize: 15, fontWeight: '600' },

  /* ===== FLOATING NAV ===== */
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: BLUE,
    paddingVertical: 10,
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'absolute',
    bottom: 18,
    left: 16,
    right: 16,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  navItem: { alignItems: 'center', flex: 1 },
  navCenter: {
    backgroundColor: '#fff',
    borderRadius: 40,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -22,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  navText: { fontSize: 12, color: '#fff', marginTop: 4 },
});
