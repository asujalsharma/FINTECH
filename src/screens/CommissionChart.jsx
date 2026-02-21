import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,

  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { getData } from '../API';
import { URL } from '../constants/URL';
import { useNavigation } from '@react-navigation/native';

import { THEME_COLORS, GRADIENTS } from '../constants/theme';
import LinearGradient from 'react-native-linear-gradient';
const BLUE = THEME_COLORS.orange;
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
      imageUrl = `${URL}/${icon}`;
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
      <StatusBar barStyle="light-content" backgroundColor="#0A237A" />

      {/* Header */}
      <LinearGradient
        colors={['#0A237A', '#1246C0', '#1A6FE0']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
        <View>
          <Text style={styles.headerText}>Commission Chart</Text>
        </View>
        <View />
      </LinearGradient>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={THEME_COLORS.primary} />
          <Text style={{ color: '#64748B', marginTop: 10, fontWeight: '600' }}>
            Fetching Commission Data...
          </Text>
        </View>
      ) : (
        <View style={styles.whiteSheet}>
          <ScrollView contentContainerStyle={styles.body}>
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
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
};

export default CommissionChart;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A237A',
  },

  /* ---------------- HEADER ---------------- */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    elevation: 0,
  },

  whiteSheet: {
    flex: 1,
    backgroundColor: '#F5F7FF',
    marginTop: 10,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
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
    backgroundColor: '#fff',
  },

  /* ---------------- BODY ---------------- */
  body: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginVertical: 12,
    textAlign: 'left',
    color: '#000',
  },

  noData: {
    textAlign: 'center',
    color: '#777',
    marginVertical: 20,
    fontSize: 16,
  },

  /* ---------------- CARD WRAPPER (SHADOW BACKDROP) ---------------- */
  inputWrapper: {
    marginTop: 14,
    position: 'relative',
  },

  blueShadowLarge: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: -2,
    bottom: -2,
    borderRadius: 12,
    backgroundColor: BLUE,
    opacity: 0.12,
    zIndex: -2,
  },

  blueShadowSmall: {
    position: 'absolute',
    top: 3,
    left: 3,
    right: -1,
    bottom: -1,
    borderRadius: 12,
    backgroundColor: BLUE,
    opacity: 0.18,
    zIndex: -1,
  },

  /* ---------------- CARD ---------------- */
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E0E6F2',

    ...Platform.select({
      ios: {
        shadowColor: THEME_COLORS.orange,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },

  /* ---------------- ROW CONTENT ---------------- */
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logo: {
    width: 38,
    height: 38,
    marginRight: 12,
    resizeMode: 'contain',
    borderRadius: 10,
    backgroundColor: '#F2F4F9',
  },

  name: {
    fontSize: 15.5,
    fontWeight: '600',
    color: '#0A0A0A',
  },

  commission: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0BA23F',
  },
});
