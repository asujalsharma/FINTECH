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
import { getData, API_BASE_URL } from '../API';
import { Dimensions, Linking } from 'react-native';
import Footer from '../components/Footer';


const SCREEN_WIDTH = Dimensions.get('window').width;
const BLUE = '#471d7d';

const HomeScreen = () => {
  const navigation = useNavigation();

  const [orderList, setOrderList] = useState([]);
  const [filteredOrderList, setFilteredOrderList] = useState({});
  const [loading, setLoading] = useState(false);
  const [UserData, setUserData] = useState(null);
  const [Banner, setBanner] = useState([]);
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
  const fetchBanner = async () => {
    try {
      const res = await getData('api/home-banner/list');
      setBanner(res?.Data);
    } catch (err) {
      console.log('Banner Fetch Error', err);
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
            source={{ uri: `${API_BASE_URL}/${POPUP.image}` }}
            style={styles.popupImage}
          />
        </View>
      </View>
    </Modal>
  );

  // ---------------------------
  // MAIN RENDER
  // ---------------------------
  return (
    <SafeAreaView style={styles.container}>
      {showModal && POPUP?.image && renderPopup()}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* TOP HEADER */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.userRow}>
              <TouchableOpacity
                activeOpacity={0.8}
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
                <View style={styles.userTagRow}>
                  <Text style={styles.userName}>Hi, {UserData?.firstName || 'User'} 👋</Text>
                </View>
                <Text style={styles.userSubtitle}>Welcome to YaaraPay</Text>
              </View>
            </View>

            <View style={styles.headerActions}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.iconBadgeBtn}
                onPress={() => navigation.navigate('Notification')}
              >
                <Icon name="notifications-none" size={22} color="#FFF" />
                <View style={styles.activeNotificationDot} />
              </TouchableOpacity>
            </View>
          </View>

          {/* WALLET BALANCE CARD INSIDE HEADER */}
          <View style={styles.balanceCard}>
            <View style={styles.balanceCardTop}>
              <View>
                <Text style={styles.balanceLabel}>Available Balance</Text>
                <Text style={styles.balanceAmount}>
                  ₹ {UserData?.wallet?.balance !== undefined ? UserData?.wallet?.balance : '0.00'}
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.addMoneyBtn}
                onPress={() => navigation.navigate('WalletTopupScreen')}
              >
                <Icon name="add" size={18} color="#471d7d" />
                <Text style={styles.addMoneyText}>Add Money</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.balanceDivider} />

            {/* QUICK ACTIONS BAR */}
            <View style={styles.quickActionsRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.quickActionItem}
                onPress={() => navigation.navigate('WalletTopupScreen')}
              >
                <View style={styles.quickActionIconBg}>
                  <Icon name="account-balance-wallet" size={20} color="#FFF" />
                </View>
                <Text style={styles.quickActionText}>Top Up</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.quickActionItem}
                onPress={() => navigation.navigate('Report', { id: UserData?._id })}
              >
                <View style={styles.quickActionIconBg}>
                  <Icon name="receipt-long" size={20} color="#FFF" />
                </View>
                <Text style={styles.quickActionText}>Reports</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.quickActionItem}
                onPress={() => navigation.navigate('CommissionChart')}
              >
                <View style={styles.quickActionIconBg}>
                  <Icon name="trending-up" size={20} color="#FFF" />
                </View>
                <Text style={styles.quickActionText}>Commission</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.quickActionItem}
                onPress={() =>
                  navigation.navigate('ReferScreen', {
                    referralCode: UserData?.referalId,
                  })
                }
              >
                <View style={styles.quickActionIconBg}>
                  <Icon name="card-giftcard" size={20} color="#FFF" />
                </View>
                <Text style={styles.quickActionText}>Rewards</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* BANNER CAROUSEL */}
        <View style={styles.bannerContainer}>
          <FlatList
            data={memoBanner}
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => item?.link && Linking.openURL(item.link)}
              >
                <Image
                  source={{
                    uri: item.image?.startsWith('http')
                      ? item.image
                      : `${API_BASE_URL}/${item.image}`,
                  }}
                  style={styles.bannerImage}
                />
              </TouchableOpacity>
            )}
            onScroll={e => {
              const index = Math.round(
                e.nativeEvent.contentOffset.x / SCREEN_WIDTH,
              );
              setCurrentIndex(index);
            }}
            scrollEventThrottle={16}
          />

          {/* DOT INDICATOR */}
          <View style={styles.dotsContainer}>
            {Banner?.map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      currentIndex === idx ? '#471d7d' : '#CBD5E1',
                    width: currentIndex === idx ? 20 : 8,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {/* ============================
           SPECIAL SECTION → RECHARGE
        ============================ */}
        {filteredOrderList['recharge'] && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <View style={styles.sectionBadge} />
                <Text style={styles.sectionTitle}>Recharge Services</Text>
              </View>
              {/* <TouchableOpacity
                style={styles.seeAllBtn}
                onPress={() =>
                  navigation.navigate('Recharge', {
                    ServiceId: filteredOrderList['recharge'][0]?._id,
                  })
                }
              >
                <Text style={styles.seeAllText}>Explore</Text>
                <Icon name="chevron-right" size={18} color="#471d7d" />
              </TouchableOpacity> */}
            </View>

            <View style={styles.row}>
              {filteredOrderList['recharge'].map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.8}
                  style={styles.cardWrapper}
                  onPress={() =>
                    navigation.navigate(
                      item.name === 'Recharge'
                        ? 'Recharge'
                        : 'DTHRechargeScreen',
                      { ServiceId: item._id },
                    )
                  }
                >
                  <View style={styles.serviceCard}>
                    <View style={styles.serviceIconContainer}>
                      <Image
                        source={{
                          uri: item.icon?.startsWith('http')
                            ? item.icon
                            : `${API_BASE_URL}/${item.icon}`,
                        }}
                        style={styles.image}
                      />
                    </View>
                    <View style={styles.serviceTextContainer}>
                      <Text style={styles.cardTitle}>
                        {item.name === 'Recharge' ? 'Mobile' : 'DTH'}
                      </Text>
                      <Text style={styles.cardSubtitle}>Instant Cashback</Text>
                    </View>
                    {/* <View style={styles.arrowIconBg}>
                      <Icon name="arrow-forward" size={16} color="#471d7d" />
                    </View> */}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ============================
           SPECIAL SECTION → FINANCE
        ============================ */}
        {filteredOrderList['finance'] && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <View style={styles.sectionBadge} />
                <Text style={styles.sectionTitle}>Bills & Payments</Text>
              </View>
              <TouchableOpacity
                style={styles.seeAllBtn}
                onPress={() =>
                  navigation.navigate('BillPayments', {
                    service: filteredOrderList['finance'],
                  })
                }
              >
                <Text style={styles.seeAllText}>View All</Text>
                <Icon name="chevron-right" size={18} color="#471d7d" />
              </TouchableOpacity>
            </View>

            <View style={styles.grid4Column}>
              {filteredOrderList['finance'].slice(0, 4).map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.75}
                  style={styles.gridCardItem}
                  onPress={() =>
                    navigation.navigate('Provider', {
                      ServiceId: item._id,
                      name: item.name,
                    })
                  }
                >
                  <View style={styles.gridIconCircle}>
                    <Image
                      source={{
                        uri: item.icon?.startsWith('http')
                          ? item.icon
                          : `${API_BASE_URL}/${item.icon}`,
                      }}
                      style={styles.gridIconImage}
                    />
                  </View>
                  <Text style={styles.gridCardLabel} numberOfLines={2}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ============================
          DYNAMIC SECTIONS (SMALL SQUARE)
        ============================ */}
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
                <View style={styles.sectionTitleRow}>
                  <View style={styles.sectionBadge} />
                  <Text style={styles.sectionTitle}>
                    {sectionName.charAt(0).toUpperCase() + sectionName.slice(1)}
                  </Text>
                </View>
              </View>

              <View style={styles.grid4Column}>
                {filteredOrderList[sectionName].slice(0, 4).map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    activeOpacity={0.75}
                    style={styles.gridCardItem}
                    onPress={() => handleServicePress(item, sectionName)}
                  >
                    <View style={styles.gridIconCircle}>
                      <Image
                        source={{
                          uri: item.icon?.startsWith('http')
                            ? item.icon
                            : `${API_BASE_URL}/${item.icon}`,
                        }}
                        style={styles.gridIconImage}
                      />
                    </View>
                    <Text style={styles.gridCardLabel} numberOfLines={2}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

        {/* REFER & CASHBACK CARD */}
        <View style={styles.referContainer}>
          <View style={styles.referBadge}>
            <Text style={styles.referBadgeText}>🎁 INVITE & EARN</Text>
          </View>
          <Text style={styles.referTitle}>Share YaaraPay with Friends</Text>
          <Text style={styles.referSubtitle}>
            Earn up to ₹100 guaranteed cashback on every successful referral!
          </Text>

          <Image
            source={require('../Assets/referalImage.jpeg')}
            style={styles.referImage}
          />

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.claimBtn}
            onPress={() =>
              navigation.navigate('ReferScreen', {
                referralCode: UserData?.referalId,
              })
            }
          >
            <Text style={styles.claimText}>INVITE FRIENDS NOW →</Text>
          </TouchableOpacity>
        </View>

        {/* FOOTER */}
        <Footer />
      </ScrollView>


      {/* FLOATING BOTTOM NAV BAR */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('WalletTopupScreen')}
        >
          <Icon name="account-balance-wallet" size={22} color="#FFF" />
          <Text style={styles.navText}>Wallet</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Report', { id: UserData?._id })}
        >
          <Icon name="bar-chart" size={22} color="#FFF" />
          <Text style={styles.navText}>Reports</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.navCenter}
          onPress={() =>
            navigation.navigate('ReferScreen', {
              referralCode: UserData?.referalId,
            })
          }
        >
          <Icon name="star" size={28} color="#58007b" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('CommissionChart')}
        >
          <Icon name="currency-rupee" size={22} color="#FFF" />
          <Text style={styles.navText}>Commission</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('ContactScreen')}
        >
          <Icon name="support-agent" size={22} color="#FFF" />
          <Text style={styles.navText}>Support</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F4F7' },

  popupBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  popupContainer: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#471d7d',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  popupClose: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  popupCloseText: { fontSize: 20, fontWeight: '700', color: '#0F172A', lineHeight: 22 },
  popupImage: {
    width: 290,
    height: undefined,
    aspectRatio: 1.5,
    resizeMode: 'cover',
    borderRadius: 20,
  },

  /* HEADER */
  header: {
    backgroundColor: '#471d7d',
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'ios' ? 52 : 22,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 6,
    shadowColor: '#471d7d',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  userRow: { flexDirection: 'row', alignItems: 'center' },
  avatarContainer: {
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 26,
    marginRight: 12,
    elevation: 3,
  },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  userTagRow: { flexDirection: 'row', alignItems: 'center' },
  userName: { fontSize: 18, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.2 },
  userSubtitle: { fontSize: 12, color: '#D9E7FF', marginTop: 2, opacity: 0.9, fontWeight: '500' },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  iconBadgeBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeNotificationDot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#471d7d',
  },

  /* WALLET BALANCE CARD INSIDE HEADER */
  balanceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  balanceCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: { fontSize: 12, fontWeight: '600', color: '#E2E8F0', letterSpacing: 0.3 },
  balanceAmount: { fontSize: 26, fontWeight: '800', color: '#FFFFFF', marginTop: 3, letterSpacing: 0.5 },
  addMoneyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  addMoneyText: { marginLeft: 4, fontSize: 13, fontWeight: '700', color: '#471d7d' },
  balanceDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    marginVertical: 14,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  quickActionItem: {
    alignItems: 'center',
  },
  quickActionIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  quickActionText: { fontSize: 11, fontWeight: '600', color: '#FFF' },

  /* BANNER CAROUSEL */
  bannerContainer: { marginTop: 16, width: '100%' },
  bannerImage: {
    width: SCREEN_WIDTH - 40,
    height: 154,
    resizeMode: 'cover',
    marginHorizontal: 10,
    borderRadius: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
  },

  /* SECTION */
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 22,
    elevation: 2,
    shadowColor: '#471d7d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionBadge: {
    width: 4,
    height: 16,
    borderRadius: 2,
    backgroundColor: '#471d7d',
    marginRight: 8,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', letterSpacing: 0.2 },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center' },
  seeAllText: { fontSize: 12, fontWeight: '700', color: '#471d7d', marginRight: 2 },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  /* LARGE CARD (RECHARGE) */
  cardWrapper: {
    width: '48%',
    marginBottom: 6,
  },
  serviceCard: {
    flexDirection: 'row',
    borderWidth: 1.2,
    borderColor: '#EDE7F6',
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  serviceIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EDE7F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  image: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  serviceTextContainer: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
  cardSubtitle: { fontSize: 10, color: '#64748B', marginTop: 2, fontWeight: '500' },
  arrowIconBg: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
  },

  /* 4 COLUMN GRID CARDS */
  grid4Column: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridCardItem: {
    width: '23%',
    alignItems: 'center',
    marginBottom: 12,
  },
  gridIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EDE7F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(71, 29, 125, 0.12)',
  },
  gridIconImage: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  gridCardLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
    lineHeight: 14,
  },

  /* REFER & CASHBACK CONTAINER */
  referContainer: {
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    paddingVertical: 22,
    paddingHorizontal: 18,
    borderRadius: 24,
    alignItems: 'center',
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#EDE7F6',
    elevation: 3,
    shadowColor: '#471d7d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  referBadge: {
    backgroundColor: '#EDE7F6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    marginBottom: 10,
  },
  referBadgeText: { fontSize: 11, fontWeight: '800', color: '#471d7d', letterSpacing: 0.5 },
  referTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  referSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 17,
  },
  referImage: {
    width: '92%',
    height: 160,
    resizeMode: 'contain',
    marginVertical: 10,
    borderRadius: 14,
  },
  claimBtn: {
    backgroundColor: '#58007b',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 24,
    elevation: 4,
    shadowColor: '#58007b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginTop: 4,
  },
  claimText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },

  /* BOTTOM NAV */
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#471d7d',
    paddingVertical: 8,
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 14,
    left: 16,
    right: 16,
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#471d7d',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  navItem: { alignItems: 'center', flex: 1 },
  navCenter: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -24,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  navText: { fontSize: 11, fontWeight: '600', color: '#FFFFFF', marginTop: 3 },
});
