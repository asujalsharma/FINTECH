import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Video from 'react-native-video';
import TransactionStatusBadge from '../components/TransactionStatusBadge';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { URL } from '../constants/URL';

const QRSuccess = () => {
  const route = useRoute();
  const { data, amount, id } = route.params || {};
  const navigation = useNavigation();
  const [playAudio, setPlayAudio] = useState(true);
  const paymentMadeRef = useRef(false);

  useEffect(() => {
    if (paymentMadeRef.current) return;
    paymentMadeRef.current = true;

    const makePayment = async () => {
      try {
        const response = await axios.post(`${URL}/api/nexpayment`, {
          id: data?._id,
          total: parseInt(amount, 10),
        });
        if (response.data.success === true) {
          const addcredit = async () => {
            try {
              const resCredit = await axios.post(`${URL}/api/addcredit`, {
                id: id,
                total: parseInt(amount, 10),
              });
              if (resCredit.data.success === true) {
                // Allow audio and animation to play before redirect
                setTimeout(() => {
                  navigation.navigate('Home', {
                    email: data?.email,
                    id: data?._id,
                  });
                }, 3500);
              }
            } catch (error) {
              console.log(error);
            }
          };
          addcredit();
        }
      } catch (error) {
        console.log(error);
      }
    };
    makePayment();

    return () => {
      setPlayAudio(false);
    };
  }, [amount, data, id, navigation]);

  const handleDone = () => {
    navigation.navigate('Home', {
      email: data?.email,
      id: data?._id,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.body}>
        <View style={styles.animationContainer}>
          <TransactionStatusBadge status="Success" size={140} />
        </View>
        <Text style={styles.heading}>Payment Successful</Text>
        <Text style={styles.amountText}>₹{Number(amount || 0).toFixed(2)}</Text>
        <Text style={styles.subText}>Secured by Bharat Connect</Text>

        <TouchableOpacity
          style={styles.doneBtn}
          onPress={handleDone}
          activeOpacity={0.8}
        >
          <Text style={styles.doneBtnText}>Done</Text>
        </TouchableOpacity>
      </View>

      {/* Bharat Connect Success Audio */}
      {playAudio && (
        <Video
          source={require('../Assets/BharatConnect_MOGO_270824.mp3')}
          paused={false}
          repeat={false}
          audioOnly={true}
          playInBackground={false}
          playWhenInactive={false}
          ignoreSilentSwitch="ignore"
          volume={1.0}
          onEnd={() => setPlayAudio(false)}
          onError={e => {
            console.warn('Bharat Connect audio error:', e);
            setPlayAudio(false);
          }}
          style={styles.hiddenAudio}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  body: {
    alignItems: 'center',
    width: '100%',
  },
  animationContainer: {
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  heading: {
    color: '#065F46',
    fontSize: 24,
    fontWeight: '800',
    marginTop: 8,
  },
  amountText: {
    color: '#059669',
    fontSize: 32,
    fontWeight: '900',
    marginTop: 8,
  },
  subText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 6,
  },
  doneBtn: {
    marginTop: 36,
    backgroundColor: '#5f259f',
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 16,
    elevation: 3,
  },
  doneBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  hiddenAudio: {
    position: 'absolute',
    width: 0,
    height: 0,
    opacity: 0,
  },
});

export default QRSuccess;
