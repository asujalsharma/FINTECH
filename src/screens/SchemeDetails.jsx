import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import COLORS from '../constants/colors';

const TABS = ['योजना', 'पात्रता', 'दस्तावेज', 'FAQ'];

export default function SchemeDetails() {
  const navigation = useNavigation();
  const route = useRoute();
  const [activeTab, setActiveTab] = useState('योजना');

  const title = route.params?.schemeTitle || 'Vivah Sahayog Yojna';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <FeatherIcon name="chevron-left" size={26} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Quote Hero Banner */}
        <View style={styles.heroBanner}>
          <Image
            source={require('../Assets/vivah_sahayog_logo.png')}
            style={styles.heroAvatar}
          />
          <View style={styles.quoteTextContainer}>
            <Text style = {styles.headerTitlere}>VIVAH SAHAYOG YOJANA</Text>
            <Text style={styles.quoteText}>
              “बेटी मुस्कुराएगी{"\n"}तो समाज आगे बढ़ेगा”
            </Text>
          </View>
        </View>

        {/* 4 Tabs */}
        <View style={styles.tabsContainer}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabItem,
                activeTab === tab && styles.activeTabItem,
              ]}
              activeOpacity={0.8}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === tab && styles.activeTabLabel,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab 1 Content: योजना */}
        {activeTab === 'योजना' && (
          <View style={styles.tabContentSection}>
            {/* About Scheme */}
            <View style={styles.infoBlock}>
              <Text style={styles.sectionHeading}>योजना के बारे में</Text>
              <Text style={styles.descriptionText}>
                SARVANA Care Foundation जरूरतमंद परिवारों की बेटियों के विवाह में
                सामाजिक सहयोग उपलब्ध कराने के लिए यह योजना चला रहा है।
              </Text>
            </View>

            {/* Payment & Amount Rules */}
            <View style={styles.infoBlock}>
              <Text style={styles.sectionHeading}>भुगतान एवं राशि संबंधी नियम</Text>

              <View style={styles.checkListItem}>
                <MaterialIcon name="calendar-clock" size={20} color="#0F8A5F" />
                <Text style={styles.checkListText}>
                  प्रत्येक महीने लगभग ₹500 की राशि
                </Text>
              </View>

              <View style={styles.checkListItem}>
                <MaterialIcon name="file-document-outline" size={20} color="#0F8A5F" />
                <Text style={styles.checkListText}>
                  भुगतान से संबंधित पूरी विवरणिका (Statement) देखने की सुविधा उपलब्ध
                </Text>
              </View>

              <View style={styles.checkListItem}>
                <MaterialIcon name="history" size={20} color="#0F8A5F" />
                <Text style={styles.checkListText}>
                  उपयोगकर्ता अपने सभी लेन-देन की विस्तृत जानकारी देख सकेगा
                </Text>
              </View>


              <View style={styles.checkListItem}>
                <MaterialIcon name="account-check-outline" size={20} color="#0F8A5F" />
                <Text style={styles.checkListText}>
                  राशि की पूरी प्रक्रिया / भुगतान पूर्ण होने के बाद मैन्युअल सेटिंग / सत्यापन आवश्यक होगा
                </Text>
              </View>
            </View>

            {/* Disclaimer Card */}
            <View style={styles.disclaimerCard}>
              <Text style={styles.disclaimerText}>
                यह बैंक खाता या निश्चित निवेश योजना नहीं है। प्रत्येक महीने NDO / फंड की स्थिति एवं निर्धारित नियमों के अनुसार राशि प्रदान की जाएगी।
              </Text>
            </View>
          </View>
        )}

        {/* Tab 2 Content: पात्रता */}
        {activeTab === 'पात्रता' && (
          <View style={styles.tabContentSection}>
            <View style={styles.infoBlock}>
              <Text style={styles.sectionHeading}>पात्रता के नियम</Text>
              <View style={styles.checkListItem}>
                <MaterialIcon name="check-circle" size={20} color="#0F8A5F" />
                <Text style={styles.checkListText}>
                  बालिका की आयु 0 से 18 वर्ष के बीच होनी चाहिए
                </Text>
              </View>
              <View style={styles.checkListItem}>
                <MaterialIcon name="check-circle" size={20} color="#0F8A5F" />
                <Text style={styles.checkListText}>
                  परिवार भारतीय नागरिक होना अनिवार्य है
                </Text>
              </View>
              <View style={styles.checkListItem}>
                <MaterialIcon name="check-circle" size={20} color="#0F8A5F" />
                <Text style={styles.checkListText}>
                  परिवार की वार्षिक आय सीमा के अंतर्गत हो
                </Text>
              </View>
              <View style={styles.checkListItem}>
                <MaterialIcon name="cellphone-check" size={20} color="#0F8A5F" />
                <Text style={styles.checkListText}>
                  संबंधित जानकारी सक्रिय मोबाइल नंबर से जोड़ी जाएगी
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Tab 3 Content: दस्तावेज एवं खाता प्रक्रिया */}
        {activeTab === 'दस्तावेज' && (
          <View style={styles.tabContentSection}>
            <View style={styles.infoBlock}>
              <Text style={styles.sectionHeading}>आवश्यक दस्तावेज</Text>
              <View style={styles.checkListItem}>
                <MaterialIcon name="file-document-outline" size={20} color="#D81B60" />
                <Text style={styles.checkListText}>बालिका का जन्म प्रमाण पत्र</Text>
              </View>
              <View style={styles.checkListItem}>
                <MaterialIcon name="file-document-outline" size={20} color="#D81B60" />
                <Text style={styles.checkListText}>माता-पिता का आधार कार्ड</Text>
              </View>
              <View style={styles.checkListItem}>
                <MaterialIcon name="file-document-outline" size={20} color="#D81B60" />
                <Text style={styles.checkListText}>आय प्रमाण पत्र / राशन कार्ड</Text>
              </View>
              <View style={styles.checkListItem}>
                <MaterialIcon name="file-document-outline" size={20} color="#D81B60" />
                <Text style={styles.checkListText}>पासपोर्ट साइज फोटो</Text>
              </View>
            </View>

            <View style={styles.infoBlock}>
              <Text style={styles.sectionHeading}>दस्तावेज़ एवं खाता प्रक्रिया</Text>
              <View style={styles.checkListItem}>
                <MaterialIcon name="numeric-1-circle" size={20} color="#0F8A5F" />
                <Text style={styles.checkListText}>उपयोगकर्ता की आवश्यक जानकारी दर्ज की जाएगी।</Text>
              </View>
              <View style={styles.checkListItem}>
                <MaterialIcon name="numeric-2-circle" size={20} color="#0F8A5F" />
                <Text style={styles.checkListText}>आवश्यक दस्तावेज़ अपलोड किए जाएँगे।</Text>
              </View>
              <View style={styles.checkListItem}>
                <MaterialIcon name="numeric-3-circle" size={20} color="#0F8A5F" />
                <Text style={styles.checkListText}>दस्तावेज़ों का सत्यापन (Verification) किया जाएगा।</Text>
              </View>
              <View style={styles.checkListItem}>
                <MaterialIcon name="numeric-4-circle" size={20} color="#0F8A5F" />
                <Text style={styles.checkListText}>खाते का पूरा अवलोकन (Overview) उपलब्ध कराया जाएगा।</Text>
              </View>
              <View style={styles.checkListItem}>
                <MaterialIcon name="numeric-5-circle" size={20} color="#0F8A5F" />
                <Text style={styles.checkListText}>खाते में उपलब्ध राशि एवं भुगतान की स्थिति प्रदर्शित होगी।</Text>
              </View>
              <View style={styles.checkListItem}>
                <MaterialIcon name="numeric-6-circle" size={20} color="#0F8A5F" />
                <Text style={styles.checkListText}>उपयोगकर्ता को पूरी लेन-देन विवरणिका (Statement) देखने की सुविधा मिलेगी।</Text>
              </View>
            </View>
          </View>
        )}

        {/* Tab 4 Content: सामान्य प्रश्न / FAQ */}
        {activeTab === 'FAQ' && (
          <View style={styles.tabContentSection}>
            <View style={styles.infoBlock}>
              <Text style={styles.sectionHeading}>सामान्य प्रश्न / FAQ</Text>

              {/* Q1 */}
              <View style={styles.faqCard}>
                <Text style={styles.faqQuestion}>
                  Q. कितने सहयोग / लाभ प्राप्त होंगे?
                </Text>
                <Text style={styles.faqAnswer}>
                  A. प्रत्येक महीने NDO / फंड की स्थिति के अनुसार राशि प्रदान की जाएगी।
                </Text>
              </View>

              {/* Q2 */}
              <View style={styles.faqCard}>
                <Text style={styles.faqQuestion}>
                  Q. क्या इसके लिए कोई निश्चित (Fixed) राशि मिलेगी?
                </Text>
                <Text style={styles.faqAnswer}>
                  A. नहीं, राशि प्रत्येक महीने की स्थिति एवं निर्धारित नियमों के अनुसार दी जाएगी।
                </Text>
              </View>

              {/* Q3 */}
              <View style={styles.faqCard}>
                <Text style={styles.faqQuestion}>
                  Q. क्या यह कोई बीमा या निवेश योजना है?
                </Text>
                <Text style={styles.faqAnswer}>
                  A. नहीं, यह पूर्णतः एक स्वैच्छिक सामाजिक सहयोग योजना है। सहायता Foundation की नीति और उपलब्ध निधि के अनुसार प्रदान की जाएगी।
                </Text>
              </View>

              {/* Q4 */}
              <View style={styles.faqCard}>
                <Text style={styles.faqQuestion}>
                  Q. भुगतान एवं राशि संबंधी क्या नियम हैं?
                </Text>
                <Text style={styles.faqAnswer}>
                  A.प्रत्येक महीने लगभग ₹500 का सहयोग निर्धारित है।
                </Text>
              </View>

              {/* Q5 */}
              <View style={styles.faqCard}>
                <Text style={styles.faqQuestion}>
                  Q. क्या दस्तावेज़ सत्यापन व मैन्युअल सेटिंग जरूरी है?
                </Text>
                <Text style={styles.faqAnswer}>
                  A. हाँ, दस्तावेज़ अपलोड होने और राशि की प्रक्रिया पूर्ण होने के बाद SARVANA टीम द्वारा मैन्युअल सत्यापन और खाता सेटिंग की जाती है।
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Fixed Bottom Apply Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.applyBtn}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('ApplyScheme')}
        >
          <Text style={styles.applyBtnText}>अभी आवेदन करें</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    padding: 2,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 20,
  },
  heroBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F5',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FCE7F3',
    marginBottom: 16,
  },
  heroAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    marginRight: 14,
  },
  quoteTextContainer: {
    flex: 1,
  },
  headerTitlere: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  quoteText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#D81B60',
    lineHeight: 22,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1.5,
    borderBottomColor: '#F1F5F9',
    marginBottom: 16,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  activeTabItem: {
    borderBottomColor: '#D81B60',
  },
  tabLabel: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#64748B',
  },
  activeTabLabel: {
    color: '#D81B60',
    fontWeight: '700',
  },
  tabContentSection: {
    gap: 16,
  },
  infoBlock: {
    marginBottom: 8,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 13.5,
    color: '#475569',
    lineHeight: 20,
  },
  checkListItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 10,
  },
  checkListText: {
    flex: 1,
    fontSize: 13.5,
    color: '#334155',
    lineHeight: 19,
  },
  disclaimerCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 8,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  applyBtn: {
    backgroundColor: '#D81B60',
    borderRadius: 10,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#D81B60',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  faqCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  faqQuestion: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
    lineHeight: 19,
  },
  faqAnswer: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
  },
});
