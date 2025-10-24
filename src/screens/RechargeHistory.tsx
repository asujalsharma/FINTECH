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
        <Icon name="history" size={24} color="#0ea5a4" />
      </View>

      {/* Search Box */}
      <TextInput
        placeholder="Search by mobile number"
        value={search}
        onChangeText={setSearch}
        style={styles.searchBox}
      />

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {["All", "Success", "Failed"].map((tab) => (
          <TouchableOpacity
            key={tab}
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
          <Text style={styles.emptyText}>No records found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredHistory}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb", padding: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    alignItems: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#0f172a" },

  searchBox: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: "#0f172a",
    elevation: 1,
    marginBottom: 12,
  },

  filterRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  filterBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
  },
  filterActive: { backgroundColor: "#0ea5a4" },
  filterText: { fontWeight: "600", color: "#0f172a" },
  filterTextActive: { color: "#fff" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    elevation: 1,
  },
  mobile: { fontSize: 16, fontWeight: "700", color: "#0f172a" },
  details: { fontSize: 13, color: "#6b7280", marginVertical: 4 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  amount: { fontSize: 16, fontWeight: "700", color: "#0ea5a4" },
  date: { fontSize: 12, color: "#9ca3af" },

  status: { fontWeight: "700" },
  success: { color: "#16a34a" },
  failed: { color: "#dc2626" },

  emptyBox: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 14, color: "#6b7280" },
});
