"use client"
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { useTheme } from "../../hooks/useTheme"
import { useTabBarHeight } from "../../hooks/useTabBarHeight"
import Svg, { Path } from "react-native-svg"

interface PlanFeature {
  id: string
  title: string
}

interface SubscriptionPlan {
  id: string
  title: string
  priceMonthly: number
  priceYearly?: number
  features: PlanFeature[]
  isCurrent?: boolean
  backgroundColor?: string
  showCrown?: boolean
}

const SubscriptionScreen = () => {
  const navigation = useNavigation()
  const { colors, typography } = useTheme()

  const plans: SubscriptionPlan[] = [
    {
      id: "premium",
      title: "PREMIUM",
      priceMonthly: 3,
      priceYearly: 30,
      isCurrent: true,
      backgroundColor: "transparent",
      features: [
        { id: "f1", title: "card customization" },
        { id: "f2", title: "premium icon" },
        { id: "f3", title: "better search algorithm" },
        { id: "f4", title: "AI assistant, AI abilities" },
      ],
    },
    {
      id: "bac",
      title: "BAC (Business Automatic Card)",
      priceMonthly: 7,
      priceYearly: 77,
      backgroundColor: "#FFFAE8",
      features: [
        { id: "f1", title: "full BAC abilities" },
        { id: "f2", title: "AI business tools" },
        { id: "f3", title: "MAXimum customization" },
      ],
    },
    {
      id: "vipac",
      title: "VIPAC (VIP Automatic Card)",
      priceMonthly: 50,
      backgroundColor: "#FFEEB8",
      showCrown: true,
      features: [
        { id: "f1", title: "VIP tools" },
        { id: "f2", title: "MAXimum customization" },
        { id: "f3", title: "PREMIUM included" },
        { id: "f4", title: "AI assistant and tools" },
      ],
    },
  ]

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text
          style={[
            styles.headerTitle,
            {
              color: colors.text,
              fontFamily: typography.fontFamily.bold,
              fontSize: typography.fontSize.xl,
            },
          ]}
        >
          Subscription
        </Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={{ marginRight: 12 }}>
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="menu" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: useTabBarHeight() }]}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={[
            styles.title,
            {
              color: colors.text,
              fontFamily: typography.fontFamily.bold,
              fontSize: typography.fontSize.xxl,
            },
          ]}
        >
          Choose Your Plan
        </Text>
        <Text
          style={[
            styles.subtitle,
            {
              color: colors.textSecondary,
              fontFamily: typography.fontFamily.regular,
              fontSize: typography.fontSize.sm,
            },
          ]}
        >
          Choose a subscription plan to unlock all the functionality of the application
        </Text>

        <View style={styles.plansContainer}>
          {plans.map((plan) => (
            <View
              key={plan.id}
              style={[
                styles.planCard,
                {
                  backgroundColor: plan.backgroundColor || colors.card,
                },
                plan.id === 'premium' && { borderWidth: 1, borderColor: colors.textPrimary }
              ]}
            >
              {plan.isCurrent && (
                <View style={styles.currentBadge}>
                  <Text style={styles.currentBadgeText}>Current</Text>
                </View>
              )}

              <View style={styles.planContent}>
                <View style={styles.planLeft}>
                  <View style={[{ flexDirection: 'row', alignItems: 'center',  marginBottom: 12, gap: 6 }]}>
                    {plan.showCrown && <CrownIcon />}
                    <Text
                      style={[
                        styles.planTitle,
                        {
                          fontFamily: typography.fontFamily.bold,
                          fontSize: typography.fontSize.lg,
                          fontWeight: 'bold',
                          color: colors.textPrimary
                        },
                      ]}
                    >
                      {plan.title}
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.includesText,
                      {
                        fontFamily: typography.fontFamily.regular,
                        fontSize: typography.fontSize.sm,
                        color: colors.textPrimary
                      },
                    ]}
                  >
                    Includes
                  </Text>

                  <View style={styles.featuresContainer}>
                    {plan.features.map((feature) => (
                      <View key={feature.id} style={styles.featureItem}>
                        <View style={styles.featureBullet} />
                        <Text
                          style={[
                            styles.featureText,
                            {
                              fontFamily: typography.fontFamily.regular,
                              fontSize: typography.fontSize.sm,
                              color: colors.textPrimary
                            },
                          ]}
                        >
                          {feature.title}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={styles.planRight}>
                  <View style={styles.priceRow}>
                    <Text style={[styles.priceAmount, { fontFamily: typography.fontFamily.bold, color: '#71706A' }]}>
                      ${plan.priceMonthly}
                    </Text>
                    <Text style={[styles.pricePeriod, { fontFamily: typography.fontFamily.regular, color: '#71706A' }]}>Monthly</Text>
                  </View>
                  {plan.priceYearly && (
                    <View style={styles.priceRow}>
                      <Text style={[styles.priceAmount, { fontFamily: typography.fontFamily.bold, color: '#56554E' }]}>
                        ${plan.priceYearly}
                      </Text>
                      <Text style={[styles.pricePeriod, { fontFamily: typography.fontFamily.regular, color: '#56554E' }]}>Yearly</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>

        <Text
          style={[
            styles.disclaimer,
            {
              color: colors.textSecondary,
              fontFamily: typography.fontFamily.regular,
              fontSize: typography.fontSize.sm,
            },
          ]}
        >
          Vertical editor underline opacity follower image move create. Union vertical scale ipsum bullet library star list line. Italic stroke image link content ellipse select layer distribute outline. Subtract style polygon thumbnail asset. Content team arrow thumbnail undo. Bullet content move italic list device. Clip rectangle union subtract fill fill union pencil edit scrolling. Bold connection scrolling layout opacity text selection.
          Figjam library shadow scrolling team font plugin move flatten. Pencil draft content share list polygon pen plugin.
          Export rectangle slice follower vector content mask arrange.
        </Text>
      </ScrollView>
    </SafeAreaView>
  )
}

const CrownIcon = () => {
  return (
    <Svg width={20} height={14} viewBox="0 0 20 14" fill="none">
      <Path
        d="M9.74951 0C9.87899 7.38348e-06 10.0069 0.0338689 10.1196 0.0976562C10.2322 0.161438 10.3265 0.253322 10.3931 0.364258L13.605 5.7002L18.3423 2.62109C18.4633 2.54265 18.6043 2.50032 18.7485 2.5C18.8929 2.49973 19.0343 2.54197 19.1558 2.62012C19.277 2.69817 19.3735 2.8091 19.4331 2.94043C19.4927 3.07197 19.513 3.2185 19.4917 3.36133L17.9917 13.3613C17.9651 13.5389 17.8758 13.7011 17.7397 13.8184C17.6036 13.9356 17.4292 14.0001 17.2495 14H2.24951C2.06994 14 1.89633 13.9355 1.76025 13.8184C1.62416 13.7011 1.53493 13.539 1.5083 13.3613L0.00830078 3.36133C-0.0130408 3.2185 0.00730585 3.07197 0.0668945 2.94043C0.126501 2.8091 0.222952 2.69816 0.344238 2.62012C0.465668 2.54199 0.607073 2.49973 0.751465 2.5C0.895678 2.50034 1.03671 2.54264 1.15771 2.62109L5.89502 5.7002L9.10693 0.363281C9.17368 0.252473 9.26773 0.160286 9.38037 0.0966797C9.49291 0.0331442 9.62028 -2.06176e-05 9.74951 0Z"
        fill="#FFC300"
      />
    </Svg>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    textAlign: "center",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  title: {
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  plansContainer: {
    marginBottom: 24,
  },
  planCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    position: "relative",
  },
  currentBadge: {
    position: "absolute",
    top: -12,
    right: 24,
    backgroundColor: "#71706A",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 1,
  },
  currentBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  crownIcon: {
    position: "absolute",
    top: 16,
    left: 20,
    fontSize: 28,
  },
  planContent: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  planLeft: {
    flex: 1,
    paddingRight: 16,
  },
  planTitle: {
    color: "#333333",
  },
  includesText: {
    marginBottom: 8,
    color: "#666666",
  },
  featuresContainer: {
    gap: 6,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  featureBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#333333",
    marginRight: 8,
    marginTop: 6,
  },
  featureText: {
    flex: 1,
    color: "#333333",
  },
  planRight: {
    alignItems: "flex-start",
    justifyContent: "flex-start",
    flexDirection: 'row',
    paddingTop: 32,
    gap: 12
  },
  priceRow: {
    alignItems: "flex-end",
    marginBottom: 8,
  },
  priceAmount: {
    fontSize: 24,
    color: "#333333",
  },
  pricePeriod: {
    fontSize: 12,
    color: "#666666",
  },
  disclaimer: {
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 20,
  },
})

export default SubscriptionScreen
