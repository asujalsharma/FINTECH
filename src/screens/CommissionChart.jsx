import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { getData, API_BASE_URL } from '../API';
import { useNavigation } from '@react-navigation/native';
import Footer from '../components/Footer';

const BLUE = '#471d7d';

const { height } = Dimensions.get('window');

const CommissionChart = () => {
  const [Data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getData('api/commission/list');
        console.log('Commission Data:', res);

        if (res?.Status || res?.success) {
          setData(res?.data || {});
        }
      } catch (error) {
        console.error('❌ Fetch Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderCard = (name, valueObj) => {
    const commission = valueObj?.commission || 0;
    const icon = valueObj?.icon;
    const symbol = valueObj?.symbol;

    if (!icon) {
      console.log('⚠ No Icon For:', name);
    }

    let imageUrl = icon;
    if (icon && !icon.startsWith('http')) {
      imageUrl = `${API_BASE_URL}/${icon}`;
    }

    console.log('FINAL URL:', imageUrl);

    return (
      <View style={styles.inputWrapper} key={name}>
        <View style={styles.blueShadowLarge} />
        <View style={styles.blueShadowSmall} />

        <TouchableOpacity style={styles.card}>
          <View style={styles.row}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.logo}
              onError={e =>
                console.log('❌ Image Load Failed:', imageUrl, e.nativeEvent)
              }
            />

            <Text style={styles.name}>{name}</Text>
          </View>

          <Text style={styles.commission}>
            {commission} {symbol}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BLUE} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Commission Chart</Text>
        <View />
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={BLUE} />
          <Text style={{ color: BLUE, marginTop: 10 }}>Loading data...</Text>
        </View>
      ) : (
        <ScrollView style={styles.body}>
          {/* Prepaid Section */}
          {Data?.mobile && (
            <>
              <Text style={styles.sectionTitle}>Prepaid</Text>
              {Object.entries(Data.mobile).map(([name, value]) =>
                renderCard(name, value),
              )}
            </>
          )}

          {/* DTH Section */}
          {Data?.dth && (
            <>
              <Text style={styles.sectionTitle}>DTH</Text>
              {Object.entries(Data.dth).map(([name, value]) =>
                renderCard(name, value),
              )}
            </>
          )}

          {/* BBPS Section */}
          {Data?.bbps && (
            <>
              <Text style={styles.sectionTitle}>BBPS</Text>
              {Object.entries(Data.bbps).map(([name, value]) =>
                renderCard(name, value),
              )}
            </>
          )}

          {!Data?.mobile && !Data?.dth && !Data?.bbps && (
            <Text style={styles.noData}>No commission data available.</Text>
          )}

          <View style={{ marginTop: 24 }}>
            <Footer />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};


export default CommissionChart;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F4F7',
  },

  /* ---------------- HEADER ---------------- */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#471d7d',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    elevation: 5,
  },
  headerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },

  /* ---------------- LOADER ---------------- */
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  body: {
    paddingHorizontal: 16,
    marginTop: 6,
    paddingBottom: 40,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginVertical: 14,
    textAlign: 'left',
    color: '#0F172A',
  },

  noData: {
    textAlign: 'center',
    color: '#64748B',
    marginVertical: 30,
    fontSize: 15,
    fontWeight: '500',
  },

  inputWrapper: {
    marginTop: 10,
  },

  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 3,
    shadowColor: '#471d7d',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logo: {
    width: 40,
    height: 40,
    marginRight: 12,
    resizeMode: 'contain',
    borderRadius: 12,
    backgroundColor: '#EDE7F6',
  },

  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },

  commission: {
    fontSize: 14,
    fontWeight: '800',
    color: '#16A34A',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
});

