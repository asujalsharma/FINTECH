import React, { useEffect, useRef } from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import COLORS from '../constants/colors';

import Login from '../screens/Login';
import AccountCreated from '../screens/AccountCreated';
import Register from '../screens/Register';
import ForgetPassword from '../screens/ForgetPassword';
import ResetPassword from '../screens/ResetPassword';
import Home from '../screens/Home';
import CreatePassword from '../screens/CreatePassword';
import AddCard from '../screens/AddCard';
import Wallet from '../screens/Wallet';

import OTPVerificationScreen from '../screens/OTPVerificationScreen';
import Profile from '../screens/Profile';
import TwoFactorAuthScreen from '../screens/TwoFactorAuthScreen';

import QRScan from '../screens/QRScan';
import PinScreen from '../screens/PinScreen';
import AddCredit from '../screens/AddCredit';
import PinVerify from '../screens/PinVerify';
import Created from '../screens/Created';
import MobileTopUp from '../screens/MobileTopUp';
import TopUp from '../screens/TopUp';
import Success from '../screens/Success';
import Verify from '../screens/Verify';
import Notification from '../screens/Notification';
import Help from '../screens/Help';
import History from '../screens/History';

import BillPayments from '../screens/BillPayments';
import ElectricityPayment from '../screens/ElectricityPayment';

import Chart from '../screens/Chart';
import Transfer from '../screens/Transfer';
import QRPayment from '../screens/QRPayment';
import QRSuccess from '../screens/QRSuccess';
import QuickUser from '../screens/QuickUser';
import QuickTopUp from '../screens/QuickTopUp';
import QRVerify from '../screens/QRVerify';
import Balance from '../screens/Balance';
import Terms from '../screens/Term';
import RechargeScreen from '../screens/RechargeScreen';
import RechargeHistory from '../screens/RechargeHistory';
import OtpInput from '../screens/OTPVerificationScreen';
import PersonalInfoScreen from '../screens/PersonalInfoScreen';
import CommissionChart from '../screens/CommissionChart';
import ContactScreen from '../screens/ContactScreen';
import Privacypolicy from '../screens/Privacypolicy';
import Refundpolicy from '../screens/Refundpolicy';
import Grievancepolicy from '../screens/Grievancepolicy';
import Termsandcondition from '../screens/Termsandcondition';
import RedirectScreen from '../screens/RedirectScreen';
import PlanScreen from '../screens/PlanScreen';
import PaymentConfirmation from '../screens/PaymentConfirmation';
import DTHRechargeScreen from '../screens/DTHRechargeScreen';
import OperatorListScreen from '../screens/OperatorListScreen';
import WalletTopupScreen from '../screens/WalletTopupScreen';
import Provider from '../screens/Provider';
import Payment from '../screens/Payment';
import Bill from '../screens/Bill';
import ReferScreen from '../screens/referal';
import ReportsScreen from '../screens/ReportsScreen';
import AboutUs from '../screens/AboutUs';
import RefundPolicy from '../screens/Refundpolicy';
import { useSelector } from 'react-redux';
import TermsAndConditions from '../screens/Termsandcondition';
import GrievancePolicy from '../screens/Grievancepolicy';
import FAQScreen from '../screens/FAQScreen';
import FastagPaymentScreen from '../screens/FastagPayment';
import GooglePlayPayment from '../screens/GooglePlayPayment';
import PaymentWebviewScreen from '../screens/PaymentGateway';

// Sarvana Sahayog & Onboarding screens
import SplashScreen from '../screens/splashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import SahayogHome from '../screens/SahayogHome';
import SchemeDetails from '../screens/SchemeDetails';
import ApplyScheme from '../screens/ApplyScheme';
import SahayogAccount from '../screens/SahayogAccount';
import DonationScreen from '../screens/DonationScreen';

// ─── Vivah Sahayog Fund Account screens ───
import VivahSahayogEntryScreen from '../screens/VivahSahayogEntryScreen';
import FundAccountStep1Screen from '../screens/FundAccountStep1Screen';
import FundAccountStep2Screen from '../screens/FundAccountStep2Screen';
import FundAccountStep3Screen from '../screens/FundAccountStep3Screen';
import FundAccountProfileScreen from '../screens/FundAccountProfileScreen';
import FundWalletStatementsScreen from '../screens/FundWalletStatementsScreen';

const toastConfig = {
  success: props => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: 'green',
        backgroundColor: COLORS.purple,
        height: 100,
        opacity: 0.9,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 18,
        color: 'white',
        fontWeight: 'bold',
      }}
      text2Style={{
        fontSize: 13,
        color: 'white',
      }}
    />
  ),

  error: props => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: 'red',
        backgroundColor: COLORS.purple,
        height: 100,
        opacity: 0.9,
      }}
      text1Style={{
        fontSize: 18,
        color: 'white',
        fontWeight: 'bold',
      }}
      text2Style={{
        fontSize: 15,
        color: 'white',
      }}
    />
  ),

  tomatoToast: ({ text1, props }) => (
    <View style={{ height: 60, width: '100%', backgroundColor: 'tomato' }}>
      <Text>{text1}</Text>
      <Text>{props.uuid}</Text>
    </View>
  ),
};

import { navigationRef } from './navigationRef';
import { CommonActions } from '@react-navigation/native';

export default function Navigation() {
  const Stack = createNativeStackNavigator();

  const isLoggedIn = useSelector(state => state.isLoggedIn);
  const user = useSelector(state => state.user);
  const token = user?.AccessToken || user?.token;

  // Valid session requires both isLoggedIn true AND a valid token string
  const hasValidAuth = Boolean(
    isLoggedIn &&
      token &&
      typeof token === 'string' &&
      token.trim().length > 0,
  );

  const wasLoggedIn = useRef(hasValidAuth);
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      wasLoggedIn.current = hasValidAuth;
      return;
    }

    if (navigationRef.isReady()) {
      if (hasValidAuth && !wasLoggedIn.current) {
        // User just logged in successfully -> navigate to Home
        navigationRef.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          }),
        );
      } else if (!hasValidAuth && wasLoggedIn.current) {
        // User was logged in and session dropped / user logged out -> reset to LogIn
        navigationRef.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'LogIn' }],
          }),
        );
      }
    }

    wasLoggedIn.current = hasValidAuth;
  }, [hasValidAuth]);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName={hasValidAuth ? 'Home' : 'LogIn'}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="LogIn" component={Login} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="SplashScreen" component={SplashScreen} />
        <Stack.Screen name="OnboardingScreen" component={OnboardingScreen} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="AccountCreated" component={AccountCreated} />
        <Stack.Screen name="ForgetPassword" component={ForgetPassword} />
        <Stack.Screen name="ResetPassword" component={ResetPassword} />
        <Stack.Screen name="OtpInput" component={OtpInput} />
        <Stack.Screen
          name="twoFactorAuthScreen"
          component={TwoFactorAuthScreen}
        />
        <Stack.Screen name="CreatePassword" component={CreatePassword} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen
          name="OTPVerificationScreen"
          component={OTPVerificationScreen}
        />
        <Stack.Screen name="AddCard" component={AddCard} />
        <Stack.Screen name="Wallet" component={Wallet} />

        <Stack.Screen name="QRScan" component={QRScan} />
        <Stack.Screen name="PinScreen" component={PinScreen} />
        <Stack.Screen name="PinVerify" component={PinVerify} />
        <Stack.Screen name="Created" component={Created} />

        <Stack.Screen name="AddCredit" component={AddCredit} />
        <Stack.Screen name="MobileTopUp" component={MobileTopUp} />
        <Stack.Screen name="TopUp" component={TopUp} />
        <Stack.Screen name="Success" component={Success} />
        <Stack.Screen name="Verify" component={Verify} />
        <Stack.Screen name="Notification" component={Notification} />
        <Stack.Screen name="Help" component={Help} />
        <Stack.Screen name="History" component={History} />

        {/* Sarvana Sahayog Stack */}
        <Stack.Screen name="SahayogHome" component={SahayogHome} />
        <Stack.Screen name="SchemeDetails" component={SchemeDetails} />
        <Stack.Screen name="ApplyScheme" component={ApplyScheme} />
        <Stack.Screen name="SahayogAccount" component={SahayogAccount} />
        <Stack.Screen name="DonationScreen" component={DonationScreen} />
        <Stack.Screen name="Donation" component={DonationScreen} />

        {/* ─── Vivah Sahayog Fund Account Stack ─── */}
        <Stack.Screen name="VivahSahayogEntry" component={VivahSahayogEntryScreen} />
        <Stack.Screen name="FundAccountStep1" component={FundAccountStep1Screen} />
        <Stack.Screen name="FundAccountStep2" component={FundAccountStep2Screen} />
        <Stack.Screen name="FundAccountStep3" component={FundAccountStep3Screen} />
        <Stack.Screen name="FundAccountProfile" component={FundAccountProfileScreen} />
        <Stack.Screen name="FundWalletStatements" component={FundWalletStatementsScreen} />

        <Stack.Screen name="BillPayments" component={BillPayments} />
        <Stack.Screen
          name="ElectricityPayment"
          component={ElectricityPayment}
        />
        <Stack.Screen name="Provider" component={Provider} />
        <Stack.Screen name="Payment" component={Payment} />
        <Stack.Screen name="Bill" component={Bill} />
        <Stack.Screen name="ReferScreen" component={ReferScreen} />
        <Stack.Screen name="AboutUs" component={AboutUs} />
        <Stack.Screen name="Refund" component={RefundPolicy} />
        <Stack.Screen name="Privacy" component={Privacypolicy} />
        <Stack.Screen name="TermsandCondition" component={TermsAndConditions} />
        <Stack.Screen name="GrievancePolicy" component={GrievancePolicy} />
        <Stack.Screen name="FAQScreen" component={FAQScreen} />

        <Stack.Screen name="Chart" component={Chart} />
        <Stack.Screen name="Transfer" component={Transfer} />
        <Stack.Screen name="QRPayment" component={QRPayment} />
        <Stack.Screen name="QRSuccess" component={QRSuccess} />
        <Stack.Screen name="QuickUser" component={QuickUser} />
        <Stack.Screen name="QuickTopUp" component={QuickTopUp} />
        <Stack.Screen name="QRVerify" component={QRVerify} />
        <Stack.Screen name="Balance" component={Balance} />
        <Stack.Screen name="Terms" component={Terms} />
        <Stack.Screen name="Recharge" component={RechargeScreen} />
        <Stack.Screen name="RechargeScreen" component={RechargeScreen} />
        <Stack.Screen name="RechargeHistory" component={RechargeHistory} />
        <Stack.Screen
          name="PersonalInfoScreen"
          component={PersonalInfoScreen}
        />
        <Stack.Screen name="CommissionChart" component={CommissionChart} />
        <Stack.Screen name="ContactScreen" component={ContactScreen} />
        <Stack.Screen name="Contact" component={ContactScreen} />
        <Stack.Screen name="Privacypolicy" component={Privacypolicy} />
        <Stack.Screen name="Refundpolicy" component={Refundpolicy} />
        <Stack.Screen name="Grievancepolicy" component={Grievancepolicy} />
        <Stack.Screen name="Termsandcondition" component={Termsandcondition} />
        <Stack.Screen name="RedirectScreen" component={RedirectScreen} />
        <Stack.Screen name="PlanScreen" component={PlanScreen} />
        <Stack.Screen
          name="PaymentConfirmation"
          component={PaymentConfirmation}
        />
        <Stack.Screen name="DTHRechargeScreen" component={DTHRechargeScreen} />
        <Stack.Screen
          name="OperatorListScreen"
          component={OperatorListScreen}
        />
        <Stack.Screen name="WalletTopupScreen" component={WalletTopupScreen} />
        <Stack.Screen name="Report" component={ReportsScreen} />
        <Stack.Screen name="ReportsScreen" component={ReportsScreen} />
        <Stack.Screen name="FastagScreen" component={FastagPaymentScreen} />
        <Stack.Screen name="GooglePlayPayment" component={GooglePlayPayment} />
        <Stack.Screen
          name="PaymentWebview"
          component={PaymentWebviewScreen}
          options={{ title: 'Complete Payment' }}
        />
      </Stack.Navigator>

      <Toast config={toastConfig} />
    </NavigationContainer>
  );
}
