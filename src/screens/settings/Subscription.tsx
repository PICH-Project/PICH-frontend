"use client"
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { useTheme } from "../../hooks/useTheme"
import { useTabBarHeight } from "../../hooks/useTabBarHeight"

interface PlanFeature {
  id: string
  title: string
}

interface SubscriptionPlan {
  id: string
  title: string
  price: number
  features: PlanFeature[]
  isCurrent?: boolean
  isHighlighted?: boolean
}

const SubscriptionScreen = () => {
  const navigation = useNavigation()
  const { colors, typography } = useTheme()

  const plans: SubscriptionPlan[] = [
    {
      id: "basic",
      title: "Basic",
      price: 0,
      isCurrent: true,
      features: [
        { id: "f1", title: "Standart card" },
        { id: "f2", title: "Clip figjam" },
        { id: "f3", title: "Frame project arrow italic pixel" },
      ],
    },
    {
      id: "medium",
      title: "Medium",
      price: 9.99,
      features: [
        { id: "f1", title: "Basic Plan" },
        { id: "f2", title: "Clip figjam" },
        { id: "f3", title: "Frame project arrow italic pixel" },
        { id: "f4", title: "Frame project arrow italic pixel" },
      ],
    },
    {
      id: "premium",
      title: "Premium",
      price: 19.99,
      isHighlighted: true,
      features: [
        { id: "f1", title: "Medium Plan" },
        { id: "f2", title: "Clip figjam" },
        { id: "f3", title: "Frame project arrow italic pixel" },
        { id: "f4", title: "Frame arrow italic pixel" },
        { id: "f5", title: "Frame project arrow" },
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
                    {plan.price.toString().split(".")[0]}
                    {plan.price.toString().includes(".") && (
                      <Text
                        style={{
                          fontSize: typography.fontSize.xl,
                        }}
                      >
                        .{plan.price.toString().split(".")[1]}
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
                  Monthly
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
          Vertical editor underline opacity follower image move create. Union vertical scale ipsum bullet library star
          list line. Italic stroke image link content ellipse select layer distribute outline. Subtract style polygon
          thumbnail asset. Content team arrow thumbnail undo. Bullet content move italic list device. Clip rectangle
          union subtract fill fill union pencil edit scrolling. Bold connection scrolling layout opacity text selection.
          Figjam library shadow scrolling team font plugin move flatten. Pencil draft content share list polygon pen
          plugin. Export rectangle slice follower vector content mask arrange.
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
    marginBottom: 32,
  },
  plansContainer: {
    marginBottom: 24,
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
