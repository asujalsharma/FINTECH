// RechargeHistory.js
import React, { useState, useMemo } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Footer from "../components/Footer";

export default function RechargeHistory({ route }) {

  const { history } = route.params || { history: [] };

  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  // Filtered & searched history
  const filteredHistory = useMemo(() => {
    let data = history;
    if (filter !== "All") {
      data = data.filter((h) => h.status === filter);
    }
    if (search.trim()) {
      data = data.filter((h) =>
        h.mobile.toLowerCase().includes(search.toLowerCase())
      );
    }
    return data;
  }, [filter, search, history]);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={styles.mobile}>{item.mobile}</Text>
        <Text
          style={[
            styles.status,
            item.status === "Success" ? styles.success : styles.failed,
          ]}
        >
          {item.status === "Success" ? "✅ Success" : "❌ Failed"}
        </Text>
      </View>
      <Text style={styles.details}>
        {item.operator}, {item.circle}
      </Text>
      <View style={styles.row}>
        <Text style={styles.amount}>₹{item.amount}</Text>
        <Text style={styles.date}>{item.date}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recharge History</Text>
        <Icon name="history" size={24} color="#FFF" />
      </View>

      <View style={styles.content}>
        {/* Search Box */}
        <TextInput
          placeholder="Search by mobile number..."
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
        {filteredHistory.length === 0 ? (
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
            ListFooterComponent={
              <View style={{ marginTop: 20 }}>
                <Footer />
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F4F7" },
  header: {
    backgroundColor: "#471d7d",
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: "#471d7d",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#FFF" },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },

  searchBox: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 14,
    fontWeight: "500",
    color: "#0F172A",
    elevation: 2,
    shadowColor: "#471d7d",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    marginBottom: 14,
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
  filterActive: { backgroundColor: "#471d7d", borderColor: "#471d7d" },
  filterText: { fontWeight: "600", color: "#64748B", fontSize: 13 },
  filterTextActive: { color: "#FFF", fontWeight: "700" },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#471d7d",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  mobile: { fontSize: 16, fontWeight: "800", color: "#0F172A" },
  details: { fontSize: 13, color: "#64748B", marginVertical: 6, fontWeight: "500" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 8,
    marginTop: 4,
  },
  amount: { fontSize: 17, fontWeight: "800", color: "#471d7d" },
  date: { fontSize: 12, color: "#94A3B8", fontWeight: "500" },

  status: { fontWeight: "700", fontSize: 13 },
  success: { color: "#16A34A" },
  failed: { color: "#DC2626" },

  emptyBox: { flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 40 },
  emptyText: { fontSize: 15, color: "#64748B", marginTop: 8, fontWeight: "600" },
});

