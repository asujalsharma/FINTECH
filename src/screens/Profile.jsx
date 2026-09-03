// import {
//   StyleSheet,
//   Text,
//   View,
//   SafeAreaView,
//   TouchableOpacity,useColorScheme,Image, Alert,BackHandler,

// } from 'react-native';
// import React, {useEffect, useState} from 'react';
// import { URL } from '../constants/URL';
// import COLORS from '../constants/colors';
// import Icon from 'react-native-vector-icons/FontAwesome';
// import {launchImageLibrary,launchCamera} from 'react-native-image-picker';
// import axios from 'axios'
// import { useNavigation, useRoute } from '@react-navigation/native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import QR from '../components/QR';

// export default function Profile() {
//   const route = useRoute();
//   const {data}=route.params
//   const navigation=useNavigation()
//   const colorScheme = useColorScheme();

//   const backgroundColor = colorScheme === 'dark' ? 'black' : 'white';
//   const [unFold,setUnFold]=useState(false)
//   const [imagePath, setImagePath] = useState(null);
//  const showMore=()=>{
//     setUnFold(!unFold)
//  }

//     const fetchImg=async ()=>{
//       try {
//         const response = await axios.get(`${URL}/api/display/${data._id}`);

//         setImagePath(response.data.imagePath.replace(/\\/g, '/'))

//       } catch (error) {
//         console.log(error)
//       }
//      }

//      useEffect(()=>{

//       fetchImg()

//     },[data._id])

//  const imgEdit=()=>{
//   const options={
//     mediaType: 'photo',
//     includeBase64: false,
//     maxHeight: 2000,
//     maxWidth: 2000,
//   }
//   launchImageLibrary(options,(response)=>{
//     if (response.didCancel) {
//       console.log('User cancelled image picker');
//     } else if (response.error) {
//       console.log('Image picker error: ', response.error);
//     } else {
//       let imageUri = response.uri || response.assets?.[0]?.uri;

//       uploadImg(imageUri)
//     }
//   })

//  }

//  handleCameraLaunch = () => {
//   const options = {
//     mediaType: 'photo',
//     includeBase64: false,
//     maxHeight: 2000,
//     maxWidth: 2000,
//   };

//   launchCamera(options, response => {
//     if (response.didCancel) {
//       console.log('User cancelled camera');
//     } else if (response.error) {
//       console.log('Camera Error: ', response.error);
//     } else {
//       let imageUri = response.uri || response.assets?.[0]?.uri;

//       uploadImg(imageUri);
//     }
//   });
// }

//  const uploadImg=async (image)=>{
//   const formData= new FormData()

//   const fileType = image.split('/').pop().split('.').pop()
//   formData.append('image', {
//     uri: image,
//     type: `image/${fileType}`,
//     name: image.split('/').pop()
// });

//  formData.append('_id',data._id)
//  try {
//     const response= await axios.post(`${URL}/api/upload`,formData,
//     {headers: {
//      'Content-Type': 'multipart/form-data',
//    },})

//   if(response.data.message == 'success'){
//         fetchImg()
//   }

//  } catch (error) {
//    console.log(error)
//  }

// }

// const handleButtonPress = () => {

// Alert.alert(
//   'Upload your image',
//   'Maximum image resolution 2000*2000px',
//   [
//     {
//       text: 'Cancel',
//       onPress: () => console.log('Cancel Pressed'),
//       style: 'cancel',
//     },
//     {
//       text: 'Choose from Library',
//       onPress: () => {
//         imgEdit()

//       },
//     },
//     {
//       text: 'Take photo',
//       onPress: () => {
//         handleCameraLaunch()
//       },
//     },

//   ],
//   { cancelable: false }
// );
// };

// handleLogout = async () => {
//   try {

//     await AsyncStorage.clear();

//     BackHandler.exitApp();
//   } catch (error) {
//     console.error('Error logging out:', error);
//   }
// };

// return (

//     <SafeAreaView style={[styles.Container,{backgroundColor}]}>
//       <View style={styles.subContainer}>
//       <View style={styles.header}>
//       <TouchableOpacity onPress={() => navigation.goBack()}>
//         <Icon name="chevron-left" size={24} color={COLORS.black} />
//       </TouchableOpacity>

//       <TouchableOpacity onPress={handleLogout}>

//           <Icon name="sign-out" size={24} color={COLORS.black}/>
//       </TouchableOpacity>

//     </View>
//     <View style={styles.userContainer}>

//           <View style={unFold? styles.usercon:styles.unfold}>
//           <View style={styles.textContainer}>
//             <Text style={styles.textName}>{`${data.firstName} ${data.lastName}`}</Text>
//             <Text style={styles.textNum}>{data.phoneNumber}</Text>
//           </View>
//             {unFold? '':<View style={ styles.qrStyles}><QR value={data._id}/></View>}
//            {unFold? '': <View style={styles.subtextcon}>
//               <Text style={styles.subtext}>Scan this for receiving transactions</Text>
//             </View>}
//           <TouchableOpacity style={styles.imgEdit} onPress={handleButtonPress}><Icon name="pencil-square-o" size={36} color={COLORS.white} /></TouchableOpacity>
//           <View style={styles.shape1}></View>
//           <View style={unFold ? "":styles.shape2}></View>
//           <TouchableOpacity style={styles.showMore}><Text style={styles.showText} onPress={showMore}>{unFold? 'Show QR':'Hide QR'}</Text></TouchableOpacity>
//           </View>
//           <View style={[styles.profile,{backgroundColor}]}>
//               <View style={styles.imgContainer}><Image source={{ uri: `${URL}/${imagePath}` }} style={styles.img}></Image></View>
//           </View>

//       </View>
//       <View style={styles.serviceContainer}>

//           <View style={styles.serviceTabs}>
//             <View style={styles.serviceTabContainer}>
//               <TouchableOpacity
//                 onPress={() => {
//                   //navigation.navigate('Card', {userData});
//                 }}>
//                 <View style={styles.serviceTab}>
//                 <Icon name="pencil-square-o" size={40} color={COLORS.purple} />
//                 </View>
//               </TouchableOpacity>
//               <Text style={styles.serviceText}>Edit profile</Text>
//             </View>

//             <View style={styles.serviceTabContainer}>
//               <TouchableOpacity onPress={() => {navigation.navigate('Help')}}>
//                 <View style={styles.serviceTab}>
//                 <Icon name="question-circle-o" size={40} color={COLORS.purple} />
//                 </View>
//               </TouchableOpacity>
//               <Text style={styles.serviceText}>Help</Text>
//             </View>
//             <View style={styles.serviceTabContainer}>
//               <TouchableOpacity onPress={() => {navigation.navigate('Terms')}}>
//                 <View style={styles.serviceTab}>
//                 <Icon name="lock" size={40} color={COLORS.purple} />
//                 </View>
//               </TouchableOpacity>
//               <Text style={styles.serviceText}>Security</Text>
//             </View>

//             <View style={styles.serviceTabContainer}>
//               <TouchableOpacity style={styles.serviceBtn} onPress={() => {navigation.navigate('Rewards')}}>
//                 <View style={styles.serviceTab}>
//                 <Icon name="gift" size={40} color={COLORS.purple} />
//                 </View>
//               </TouchableOpacity>
//               <Text style={styles.serviceText}>Offers & Rewards</Text>
//             </View>

//           </View>
//         </View>

//       </View>
//     </SafeAreaView>

//   );
// }
// const styles = StyleSheet.create({
//   Container: {
//     flex:1,

//   },
//   subContainer:{
//       margin:25,

//   },
//   header: {
//       flexDirection: 'row',
//       alignItems: 'flex-end',
//       justifyContent: 'space-between',
//     },
//   userContainer:{

//       marginTop:50,
//       position:"relative"

//   },
//   usercon:{
//       height: 230,
//       borderRadius:25,
//       backgroundColor:COLORS.purple,
//       overflow:"hidden"
//   },
//   textContainer:{
//     marginTop:100,
//     zIndex:100,
//     gap:3
//   },
//   textName:{

//     textAlign:'center',

//     fontSize:25,
//     fontWeight:'600',
//     color:COLORS.white

//   },
//   textNum:{
//     textAlign:'center',

//     fontSize:15,
//     fontWeight:'400',
//     color:COLORS.white
//   },
//   serviceTabs: {
//     marginTop: 20,
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//   },
//   profile:{
//       borderRadius:75,
//       height:130,
//       width:130,
//       position:"absolute",
//       left:"31%",
//       top:-50

//   },
//   imgEdit:{
//     position:'absolute',
//     top:15,
//     left:15
//   },
//   imgContainer:{
//       borderRadius:75,
//       height:110,
//       width:110,
//       position:"absolute",
//       left:"8%",
//       top:10,
//       overflow:'hidden',
//       backgroundColor:"#C3ACD0",

//   },
//   img:{
//       height:110,
//       width:110,
//       resizeMode:"cover"
//   },
//   shape1:{
//       position:"absolute",
//       right:-10,
//       top:-20,
//       borderBottomLeftRadius: 100,
//       borderBottomRightRadius: 60,

//   transform: [{ rotate: '45deg' }],
//       height:150,
//       width:150,
//       backgroundColor:COLORS.low_purple,
//       opacity:0.7,
//   },
//   qrStyles:{
//       margin:50,
//       marginTop:18,
//       marginBottom:0,
//       zIndex:100,
//       display:'hidden'

//   },
//   qrHidden:{
//     display:'hidden'
//   },
//   subtextcon:{
//     marginTop:10,
//     zIndex:100,
//     marginBottom:10
//   },
//   subtext:{
//     textAlign:'center',
//     color:COLORS.low_grey,
//     fontWeight:'400',
//     fontSize:16
//   },
//   shape2:{
//       position:"absolute",
//       left:-15,
//       bottom:-15,
//       borderTopLeftRadius:180,
//       borderTopRightRadius: 80,
//       borderBottomRightRadius:180,

//   transform: [{ rotate: '15deg' }],
//       height:200,
//       width:120,
//       backgroundColor:COLORS.low_purple,
//       opacity:0.7,
//   },
//   showMore:{
//       position:"absolute",
//       justifyContent:"center",
//       alignItems:"center",
//       bottom:15,
//       borderRadius:25,
//       left:"35%",
//       height:35,
//       width:100,
//       backgroundColor:COLORS.white,
//       elevation:5
//   },
//   showText:{
//       color:COLORS.black,
//       fontWeight:"600"
//   },
//   unfold:{
//       height: 510,
//       borderRadius:25,
//       backgroundColor:COLORS.purple,
//       overflow:"hidden"
//   },
//   tabContainer:{marginTop:80,marginBottom:95},
//   tabtab:{
//    flexDirection:"column",
//    alignItems:"center",
//    gap:5
//   },
//   tabRow:{

//     backgroundColor:"white",
//     flexDirection:"row",
//     justifyContent:"flex-start",
//     gap:22,
//     marginTop:15
//   },
//   tab:{

//       borderWidth:2,
//       borderRadius:15,
//       padding:20,
//       borderColor:COLORS.purple,
//       width:80,
//       height:80,
//       justifyContent:"center",
//       alignItems:"center",

//   },
//   tabText:{
//       color:COLORS.black,
//       fontWeight:"500",
//       textAlign:"center",
//       width:100
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
//   serviceTabContainer: {
//     flexDirection: 'column',
//     alignItems: 'center',
//     width: 80,
//     gap: 3,
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
//   serviceBtn: {},
//   serviceText: {
//     textAlign: 'center',
//     fontWeight: '400',
//     color: COLORS.black,
//   },
// });

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {
  CommonActions,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Footer from '../components/Footer';
import { postData } from '../API';
import COLORS from '../constants/colors';

const Profile = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { name, phn, referralCode } = route.params;
  console.log(referralCode);
  const dispatch = useDispatch();
  const logoutUser = async () => {
    // logout();
    // props.navigation.replace('Login');
    const res = await postData('/api/auth/logout');
    console.log(res);
    if (res.Status) {
      dispatch({
        type: 'LOGOUT',
      });

      navigation.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [{ name: 'LogIn' }],
        }),
      );
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.headerBg} />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>My Profile</Text>
        <View style={{ width: 38 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* User Info Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{
                uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
              }}
              style={styles.avatar}
            />
            <View style={styles.onlineDot} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{name || 'User'}</Text>
            <Text style={styles.phone}>+91 {phn}</Text>
            <View style={styles.userBadge}>
              <Icon name="verified" size={13} color="#10B981" />
              <Text style={styles.userBadgeText}>Verified Member</Text>
            </View>
          </View>
        </View>

        {/* Section: Rewards & Services */}
        <Text style={styles.groupTitle}>ACCOUNT & BENEFITS</Text>
        <View style={styles.row}>
          <ProfileButton
            icon="share"
            text="Refer & Earn"
            onPress={() =>
              navigation.navigate('ReferScreen', { referralCode: referralCode })
            }
          />
          <ProfileButton
            icon="info-outline"
            text="About Us"
            onPress={() => navigation.navigate('AboutUs')}
          />
        </View>

        <View style={styles.row}>
          <ProfileButton
            icon="headset-mic"
            text="Contact Support"
            onPress={() => navigation.navigate('ContactScreen')}
          />
          <ProfileButton
            icon="help-outline"
            text="FAQ's"
            onPress={() => navigation.navigate('FAQScreen')}
          />
        </View>

        {/* Section: Legal & Policies */}
        <Text style={styles.groupTitle}>LEGAL & POLICIES</Text>
        <View style={styles.row}>
          <ProfileButton
            icon="policy"
            text="Privacy Policy"
            onPress={() => navigation.navigate('Privacypolicy')}
          />
          <ProfileButton
            icon="menu-book"
            text="Terms & Cond."
            onPress={() => navigation.navigate('Termsandcondition')}
          />
        </View>
        <View style={styles.row}>
          <ProfileButton
            icon="money-off"
            text="Refund Policy"
            onPress={() => navigation.navigate('Refundpolicy')}
          />
          <ProfileButton
            icon="gavel"
            text="Grievance Policy"
            onPress={() => navigation.navigate('GrievancePolicy')}
          />
        </View>

        {/* Section: Feedback & Rate */}
        <Text style={styles.groupTitle}>COMMUNITY & FEEDBACK</Text>
        <View style={styles.row}>
          <ProfileButton
            icon="rate-review"
            text="Send Feedback"
            onPress={() => Linking.openURL('mailto:yarapay@zohomail.in')}
          />
          <ProfileButton
            icon="star-rate"
            text="Rate on Playstore"
            onPress={() => Linking.openURL('market://details?id=https://www.yarapay.in/')}
          />
        </View>

        {/* Version */}
        <Text style={styles.version}>Recharge Hoga • v1.0.0</Text>

        {/* Logout */}
        <TouchableOpacity activeOpacity={0.85} style={styles.logoutBtn} onPress={logoutUser}>
          <Icon name="logout" size={18} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={{ marginTop: 10, width: '100%' }}>
          <Footer />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Reusable Profile Button
const ProfileButton = ({ icon, text, onPress }) => {
  return (
    <TouchableOpacity activeOpacity={0.7} style={styles.button} onPress={onPress}>
      <View style={styles.buttonLeft}>
        <View style={styles.btnIconBox}>
          <Icon name={icon} size={18} color="#471d7d" />
        </View>
        <Text style={styles.buttonText}>{text}</Text>
      </View>
      <Icon name="chevron-right" size={18} color="#94A3B8" />
    </TouchableOpacity>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F4F7',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 90,
    alignItems: 'center',
  },
  profileCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    width: '100%',
    padding: 18,
    marginVertical: 12,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 14,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2.5,
    borderColor: COLORS.primary,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  phone: {
    fontSize: 13.5,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 6,
    gap: 4,
  },
  userBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  groupTitle: {
    alignSelf: 'flex-start',
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
    marginTop: 14,
    marginBottom: 6,
    marginLeft: 4,
  },
  row: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    paddingVertical: 13,
    paddingHorizontal: 12,
    margin: 4,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  buttonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  btnIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  version: {
    fontSize: 12.5,
    color: '#94A3B8',
    marginBottom: 14,
    marginTop: 18,
    fontWeight: '600',
  },
  logoutBtn: {
    flexDirection: 'row',
    backgroundColor: '#002272ff',
    height: 48,
    width: '100%',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  logoutText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.3,
  },
  header: {
    height: 56,
    backgroundColor: COLORS.headerBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

