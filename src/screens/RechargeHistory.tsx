import React, { useState, useMemo, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { getData } from "../API";
import { colors } from "../constants/colors";

const DUMMY_RECHARGES = [
  {
    mobile: "9876543210",
    operator: "Jio Prepaid",
    circle: "Delhi NCR",
    amount: 299,
    status: "Success",
    date: new Date().toLocaleDateString(),
  },
  {
    mobile: "9811223344",
    operator: "Airtel Prepaid",
    circle: "Mumbai",
    amount: 719,
    status: "Success",
    date: new Date(Date.now() - 86400000 * 3).toLocaleDateString(),
  },
  {
    mobile: "9988776655",
    operator: "Vi Prepaid",
    circle: "Maharashtra",
    amount: 199,
    status: "Failed",
    date: new Date(Date.now() - 86400000 * 7).toLocaleDateString(),
  },
];

export default function RechargeHistory({ route, navigation }: any) {
  const initialHistory = route?.params?.history || [];
  const [history, setHistory] = useState<any[]>(initialHistory);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res: any = await getData("api/user/combined-history");
      if (res?.Data?.mobile && res.Data.mobile.length > 0) {
        const mapped = res.Data.mobile.map((item: any) => ({
          mobile: item.number || item.consumerNumber || "N/A",
          operator: item.operatorName || item.provider || "Prepaid",
          circle: item.circle || "India",
          amount: item.amount || 0,
          status: item.status?.toLowerCase() === "success" ? "Success" : "Failed",
          date: new Date(item.createdAt || Date.now()).toLocaleDateString(),
        }));
        setHistory(mapped);
      } else if (history.length === 0) {
        setHistory(DUMMY_RECHARGES);
      }
    } catch (e) {
      console.log("Error loading recharge history:", e);
      if (history.length === 0) {
        setHistory(DUMMY_RECHARGES);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (initialHistory.length === 0) {
      fetchHistory();
    }
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const filteredHistory = useMemo(() => {
    let data = history;
    if (filter !== "All") {
      data = data.filter((h) => h.status === filter);
    }
    if (search.trim()) {
      data = data.filter((h) =>
        (h.mobile || "").toLowerCase().includes(search.toLowerCase()) ||
        (h.operator || "").toLowerCase().includes(search.toLowerCase())
      );
    }
    return data;
  }, [filter, search, history]);

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={styles.mobile}>{item.mobile}</Text>
        <Text
          style={[
            styles.status,
            item.status === "Success" ? styles.success : styles.failed,
          ]}
        >
          {item.status === "Success" ? "● Success" : "● Failed"}
        </Text>
      </View>
      <Text style={styles.details}>
        {item.operator} • {item.circle}
      </Text>
      <View style={styles.row}>
        <Text style={styles.amount}>₹{item.amount}</Text>
        <Text style={styles.date}>{item.date}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          {navigation?.canGoBack() && (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="arrow-left" size={24} color="#FFF" />
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>Recharge History</Text>
        </View>
        <Icon name="history" size={24} color="#FFF" />
      </View>

      <View style={styles.content}>
        {/* Search Box */}
        <TextInput
          placeholder="Search by mobile or operator..."
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
          style={styles.searchBox}
        />

        {/* Filter Tabs */}
        <View style={styles.filterRow}>
          {["All", "Success", "Failed"].map((tab) => (
            <TouchableOpacity
              key={tab}
              activeOpacity={0.8}
              style={[styles.filterBtn, filter === tab && styles.filterActive]}
              onPress={() => setFilter(tab)}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === tab && styles.filterTextActive,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* History List */}
        {loading ? (
          <View style={styles.emptyBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.emptyText, { marginTop: 10 }]}>Loading records...</Text>
          </View>
        ) : filteredHistory.length === 0 ? (
          <View style={styles.emptyBox}>
            <Icon name="file-document-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyText}>No recharge records found</Text>
          </View>
        ) : (
          <FlatList
            data={filteredHistory}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 30 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primary]}
              />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  header: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#FFF" },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },

  searchBox: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 14,
    fontWeight: "500",
    color: "#0F172A",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  filterRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 14,
    gap: 8,
  },
  filterBtn: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  filterActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { fontWeight: "600", color: "#64748B", fontSize: 13 },
  filterTextActive: { color: "#FFF", fontWeight: "700" },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  mobile: { fontSize: 15, fontWeight: "700", color: "#1F2937" },
  details: { fontSize: 12, color: "#6B7280", marginVertical: 4, fontWeight: "500" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 8,
    marginTop: 4,
  },
  amount: { fontSize: 16, fontWeight: "800", color: colors.primary },
  date: { fontSize: 12, color: "#9CA3AF", fontWeight: "500" },

  status: { fontWeight: "700", fontSize: 12 },
  success: { color: colors.secondary },
  failed: { color: "#EF4444" },

  emptyBox: { flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 40 },
  emptyText: { fontSize: 14, color: "#6B7280", marginTop: 8, fontWeight: "600" },
});
