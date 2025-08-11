"use client"
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { useTheme } from "../../hooks/useTheme"
import { useTabBarHeight } from "../../hooks/useTabBarHeight"
import Switch from "@/components/common/Switch"
import { useState } from "react"

interface PlanFeature {
  id: string
  title: string
}

interface SubscriptionPlan {
  id: string
  title: string
  priceMonthly: number
  priceAnnual: number
  features: PlanFeature[]
  isCurrent?: boolean
  isHighlighted?: boolean
  isBasic?: boolean
}

const SubscriptionScreen = () => {
  const [isAnnual, setIsAnnual] = useState<boolean>(false);
  const navigation = useNavigation()
  const { colors, typography } = useTheme()

  const plans: SubscriptionPlan[] = [
    {
      id: "basic",
      title: "Basic",
      priceMonthly: 0,
      priceAnnual: 0,
      isCurrent: true,
      isBasic: true,
      features: [
        { id: "f1", title: "PAC" },
        { id: "f2", title: "Card Builder" },
        { id: "f3", title: "Card Index" },
        { id: "f4", title: "Loyalty Programmes" },
      ],
    },
    {
      id: "premium",
      title: "Premium",
      priceMonthly: 3,
      priceAnnual: 30,
      features: [
        { id: "f1", title: "Premium user indication" },
        { id: "f2", title: "Card and card index personalisation elements" },
        { id: "f3", title: "Creation of additional card sorting categories" },
        { id: "f4", title: "Extended application functionality" },
      ],
    },
    {
      id: "business",
      title: "Business",
      priceMonthly: 7,
      priceAnnual: 70,
      features: [
        { id: "f1", title: "Personalized offers and updates" },
        { id: "f2", title: "Reliable referral logic" },
      ],
    },
    {
      id: "vip",
      title: "VIP",
      priceMonthly: 50,
      priceAnnual: 500,
      isHighlighted: true,
      features: [
        { id: "f1", title: "All best options" },
      ],
    },
  ]

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={colors.text} />
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
        <TouchableOpacity>
          <Ionicons name="menu" size={24} color={colors.text} />
        </TouchableOpacity>
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
              fontSize: typography.fontSize.xxxl,
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
              fontSize: typography.fontSize.md,
            },
          ]}
        >
          Choose a subscription plan to unlock all the functionality of the application
        </Text>

        <View style={styles.peroidContainer}>
          <View style={styles.peroidContent}>
            <Text
              style={{
                color: colors.text,
                fontFamily: typography.fontFamily.regular,
                fontSize: typography.fontSize.md,
              }}
            >
              Monthly
            </Text>
            <Switch
              value={isAnnual}
              onValueChange={setIsAnnual}
            />
            <Text
              style={{
                color: colors.text,
                fontFamily: typography.fontFamily.regular,
                fontSize: typography.fontSize.md,
              }}
            >
              Annual
            </Text>
          </View>
        </View>

        <View style={styles.plansContainer}>
          {plans.map((plan) => (
            <View
              key={plan.id}
              style={[
                styles.planCard,
                {
                  backgroundColor: plan.isHighlighted ? colors.secondary : colors.card,
                },
              ]}
            >
              {plan.isCurrent && (
                <View
                  style={[
                    styles.currentBadge,
                    {
                      backgroundColor: colors.secondary,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: colors.background,
                      fontFamily: typography.fontFamily.medium,
                      fontSize: typography.fontSize.sm,
                    }}
                  >
                    Current
                  </Text>
                </View>
              )}
              {plan.isHighlighted && (
                <View style={styles.starIcon}>
                  <Ionicons name="star" size={24} color={colors.accent} />
                </View>
              )}
              <View style={styles.planHeader}>
                <Text
                  style={[
                    styles.planTitle,
                    {
                      color: plan.isHighlighted ? colors.text : colors.text,
                      fontFamily: typography.fontFamily.bold,
                      fontSize: typography.fontSize.xl,
                    },
                  ]}
                >
                  {plan.title}
                </Text>
                <View style={styles.priceContainer}>
                  <Text
                    style={[
                      styles.priceCurrency,
                      {
                        color: plan.isHighlighted ? colors.text : colors.text,
                        fontFamily: typography.fontFamily.bold,
                        fontSize: typography.fontSize.xl,
                      },
                    ]}
                  >
                    $
                  </Text>
                  <Text
                    style={[
                      styles.priceValue,
                      {
                        color: plan.isHighlighted ? colors.text : colors.text,
                        fontFamily: typography.fontFamily.bold,
                        fontSize: typography.fontSize.xxxl,
                      },
                    ]}
                  >
                    {(isAnnual ? plan.priceAnnual : plan.priceMonthly).toString().split(".")[0]}
                    {(isAnnual ? plan.priceAnnual : plan.priceMonthly).toString().includes(".") && (
                      <Text
                        style={{
                          fontSize: typography.fontSize.xl,
                        }}
                      >
                        .{(isAnnual ? plan.priceAnnual : plan.priceMonthly).toString().split(".")[1]}
                      </Text>
                    )}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.billingPeriod,
                    {
                      color: plan.isHighlighted ? colors.textSecondary : colors.textSecondary,
                      fontFamily: typography.fontFamily.regular,
                      fontSize: typography.fontSize.sm,
                    },
                  ]}
                >
                 {plan.isBasic ? 'Forever' : (isAnnual ? 'Annual' : 'Monthly')}
                </Text>
              </View>

              <Text
                style={[
                  styles.includesText,
                  {
                    color: plan.isHighlighted ? colors.textSecondary : colors.textSecondary,
                    fontFamily: typography.fontFamily.regular,
                    fontSize: typography.fontSize.sm,
                  },
                ]}
              >
                Includes
              </Text>

              <View style={styles.featuresContainer}>
                {plan.features.map((feature) => (
                  <View key={feature.id} style={styles.featureItem}>
                    <View
                      style={[
                        styles.featureBullet,
                        {
                          backgroundColor: colors.accent,
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.featureText,
                        {
                          color: plan.isHighlighted ? colors.text : colors.text,
                          fontFamily: typography.fontFamily.regular,
                          fontSize: typography.fontSize.md,
                        },
                      ]}
                    >
                      {feature.title}
                    </Text>
                  </View>
                ))}
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
          The project’s monetization model is based on an internal token.
          Businesses wishing to reward users must purchase the token from the open market, which maintains token circulation and liquidity. 
          Users can spend tokens to pay for subscriptions, customize cards, access additional services, and unlock optional features. 
          The token will also be used for interactive and social purposes, such as gifting, collecting NFTs, or sending valuable content.
        </Text>
      </ScrollView>
    </SafeAreaView>
  )
}

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
    marginTop: 24,
  },
  headerTitle: {
    textAlign: "center",
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
    marginBottom: 16,
  },
  plansContainer: {
    marginBottom: 24,
  },
  peroidContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  peroidContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 16,
  },
  planCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    position: "relative",
  },
  currentBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  starIcon: {
    position: "absolute",
    top: 16,
    left: 16,
  },
  planHeader: {
    marginBottom: 16,
  },
  planTitle: {
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  priceCurrency: {
    marginTop: 4,
  },
  priceValue: {},
  billingPeriod: {
    textAlign: "right",
  },
  includesText: {
    marginBottom: 8,
  },
  featuresContainer: {},
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  featureBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  featureText: {},
  disclaimer: {
    textAlign: "center",
    marginBottom: 24,
  },
})

export default SubscriptionScreen
