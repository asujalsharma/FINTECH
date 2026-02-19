import COLORS from '../constants/colors';
import { postData } from '../API';
import { useRoute } from '@react-navigation/native';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
  Platform,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

export default function Bill() {
  const navigation = useNavigation();
  const route = useRoute();
  const { UniqueId, operator } = route.params || {};
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(false);
  const [NoBill, setNoBill] = useState();
  console.log(operator);
  useEffect(() => {
    if (!UniqueId) return;
    async function load() {
      setLoading(true);
      try {
        const res = await postData(`/api/cyrus/bbps/new-bill-fetch`, {
          number: UniqueId,
          operator: operator?.op_id,
        });
        if (res.status === 204) {
          setNoBill(true);
          return;
        }
        console.log('Response:', res);
        const data = res?.Data?.data || res?.Data;
        setBill(normalizeBill(data));
      } catch (err) {
        console.log('Error:', err);
        Alert.alert(
          'Error',
          err?.response?.data?.Remarks || 'Something went wrong',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ],
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [UniqueId]);

  function normalizeBill(data) {
    if (!data) return null;
    return {
      customerName:
        data.customerName ?? data.customer_name ?? data.userName ?? 'Unknown',
      number: data.cellNumber ?? UniqueId,
      billDate: data.billDate ?? data.billdate ?? null,
      dueDate: data.dueDate ?? data.due ?? null,
      amount: data.amount ?? data.billAmount ?? 0,
    };
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#000000ff" />
      </View>
    );
  }

  if (NoBill) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
          backgroundColor: '#F5F5F5',
        }}
      >
        <Text
          style={{
            fontSize: 22,
            fontWeight: '700',
            color: COLORS.primary,
            marginBottom: 15,
          }}
        >
          NO BILLS DUE !
        </Text>

        <Text
          style={{
            fontSize: 14,
            color: '#555',
            textAlign: 'center',
            marginBottom: 25,
          }}
        >
          You have no outstanding bills at the moment.
        </Text>

        <TouchableOpacity
          onPress={() => navigation.navigate('Home')}
          style={{
            backgroundColor: COLORS.primary,
            paddingVertical: 12,
            paddingHorizontal: 30,
            borderRadius: 10,
          }}
        >
          <Text
            style={{
              color: '#fff',
              fontSize: 16,
              fontWeight: '600',
            }}
          >
            Back to Home
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 120 }} // Extra space for the button
        showsVerticalScrollIndicator={false}
      >
        {/* All top content */}
        <View>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton}>
              <Icon name="arrow-left" size={26} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{operator?.operator_name}</Text>
          </View>

          {/* Customer Info */}
          <View style={styles.userCard}>
            <View style={styles.avatar}>
              <Icon name="account-circle" size={52} color="#2f66f5" />
            </View>
            <View>
              <Text style={styles.userName}>{bill?.customerName}</Text>
              <Text style={styles.userNumber}>Number: {bill?.number}</Text>
            </View>
          </View>

          {/* Bill Details */}
          <View style={styles.detailsCard}>
            <Text style={styles.detailsTitle}>Bill Details</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Bill Date</Text>
              <Text style={styles.detailValue}>{bill?.billDate || '—'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Bill Amount</Text>
              <Text style={styles.detailValue}>{bill?.amount}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: 'red' }]}>
                Due Date
              </Text>
              <Text style={[styles.detailValue, { color: 'red' }]}>
                {bill?.dueDate || '—'}
              </Text>
            </View>
          </View>

          {/* Amount */}
          <View style={styles.amountCard}>
            <Text style={styles.amountSymbol}>₹</Text>
            <Text style={styles.amountValue}>{bill?.amount}</Text>
          </View>

          {/* Notice */}
          <View style={styles.noticeBox}>
            <Icon name="alert-circle-outline" size={20} color="#ff9800" />
            <Text style={styles.noticeText}>
              The service provider may occasionally take up to 72 hours to
              process your bill.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* ✅ Fixed Pay Button at Bottom */}
      <TouchableOpacity
        style={[
          styles.payButton,
          { position: 'absolute', bottom: 20, left: 20, right: 20 },
        ]}
        onPress={() =>
          navigation.navigate('PaymentConfirmation', {
            operatorDetail: operator,
            rechargeData: bill,
            isPrePaid: false,
          })
        }
      >
        <Text style={styles.payText}>Pay Now</Text>
        <Icon name="chevron-double-right" size={22} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  backButton: { marginRight: 8 },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '600', color: '#222' },
  headerLogo: { width: 100, height: 22, resizeMode: 'contain' },

  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  avatar: { marginRight: 10 },
  userName: { fontSize: 16, fontWeight: '600', color: '#000' },
  userNumber: { fontSize: 14, color: '#666' },

  detailsCard: { marginTop: 10 },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  detailLabel: { fontSize: 14, color: '#333' },
  detailValue: { fontSize: 14, color: '#000' },

  amountCard: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountSymbol: { fontSize: 22, color: '#000' },
  amountValue: { fontSize: 26, fontWeight: '700', color: '#000' },

  walletRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  walletLabel: { fontSize: 15, color: '#333' },
  walletValue: { fontSize: 15, fontWeight: '600', color: '#000' },

  noticeBox: {
    flexDirection: 'row',
    backgroundColor: '#fff3e0',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 20,
  },
  noticeText: { color: '#333', marginLeft: 6, flex: 1, fontSize: 13 },

  payButton: {
    flexDirection: 'row',
    backgroundColor: '#2f66f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    marginTop: 24,
    paddingVertical: 14,
  },
  payText: { color: '#fff', fontWeight: '600', fontSize: 16, marginLeft: 6 },
});
