import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "@/hooks/useTheme"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useSelector } from "react-redux"
import { CardType } from "@/constants/cards"
import { selectCanCreateCardType } from "@/store/slices/subscriptionsSlice"

/**
 * DEV-флаг: коли true — лок підписки ігнорується, всі типи карток відкриваються
 * незалежно від плану. Перед релізом виставити в false.
 * TODO: revert before ship.
 */
const DEV_BYPASS_PLAN_LOCK = true

type CardOption = {
    type: CardType
    title: string
    description: string
    badgeStyle: object
    badgeTextColor: string
}

const CARD_OPTIONS: CardOption[] = [
    {
        type: CardType.PAC,
        title: "Personal Automatic Card",
        description: "Your personal card with all of the information you'd provide",
        badgeStyle: { backgroundColor: "#97F09A" },
        badgeTextColor: "#050505",
    },
    {
        type: CardType.BAC,
        title: "Business Automatic Card",
        description: "A card for your company with all of the business details you'd provide",
        badgeStyle: { backgroundColor: "#FFBC56" },
        badgeTextColor: "#FFFFFF",
    },
    {
        type: CardType.VIPAC,
        title: "VIP Automatic Card",
        description: "Your personal card with all of the VIP tools and maximum customization",
        badgeStyle: { backgroundColor: "#FF6459" },
        badgeTextColor: "#FFFFFF",
    },
]

export default function CardConstructorScreen({ navigation }: any) {
    const { colors } = useTheme()
    const insets = useSafeAreaInsets()

    // Селектори з subscriptionsSlice — враховують і PRIMARY (FREE/BUSINESS/VIP),
    // і ADDON (PREMIUM). Список активних підписок підвантажується після логіну.
    const canCreatePac = useSelector(selectCanCreateCardType(CardType.PAC))
    const canCreateBac = useSelector(selectCanCreateCardType(CardType.BAC))
    const canCreateVipac = useSelector(selectCanCreateCardType(CardType.VIPAC))
    const canCreateByType: Record<CardType, boolean> = {
        [CardType.PAC]: canCreatePac,
        [CardType.BAC]: canCreateBac,
        [CardType.VIPAC]: canCreateVipac,
    }

    const handleCardSelect = (cardType: CardType) => {
        navigation.navigate("CreateCard", { cardType })
    }

    const handleUpgrade = () => {
        navigation.navigate("Settings", { screen: "Subscription" })
    }

    /**
     * Спільний рендер картки (PAC/BAC/VIPAC). Якщо тип locked для поточного
     * плану — показуємо лок-блок праворуч (без onPress на самій картці).
     */
    const renderCardOption = (option: CardOption) => {
        const locked = DEV_BYPASS_PLAN_LOCK ? false : !canCreateByType[option.type]

        const badge = (
            <View style={[styles.badge, option.badgeStyle]}>
                <Text style={[styles.badgeText, { color: option.badgeTextColor }]}>
                    {option.type}
                </Text>
            </View>
        )

        if (locked) {
            return (
                <View
                    key={option.type}
                    style={[
                        styles.cardOption,
                        styles.cardLocked,
                        { borderWidth: 2, borderColor: colors.textPrimary },
                    ]}
                >
                    <View style={styles.lockedHorizontalLayout}>
                        <View style={styles.lockedLeftSection}>
                            {badge}
                            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
                                {option.title}
                            </Text>
                            <Text style={styles.cardDescription}>{option.description}</Text>
                        </View>

                        <View
                            style={[
                                styles.lockedRightSection,
                                { borderColor: colors.textPrimary },
                            ]}
                        >
                            <Text style={styles.lockedText}>
                                This card type is not available for your current subscription plan
                            </Text>
                            <TouchableOpacity
                                style={styles.upgradeButton}
                                onPress={handleUpgrade}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.upgradeButtonText}>Upgrade my plan</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )
        }

        return (
            <TouchableOpacity
                key={option.type}
                style={[styles.cardOption, { borderWidth: 2, borderColor: colors.textPrimary }]}
                onPress={() => handleCardSelect(option.type)}
                activeOpacity={0.7}
            >
                <View style={styles.cardContent}>
                    <View style={styles.cardHeaderRow}>
                        {badge}
                        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
                            {option.title}
                        </Text>
                    </View>
                    <Text style={styles.cardDescription}>{option.description}</Text>
                </View>
            </TouchableOpacity>
        )
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.headerContainer, { paddingTop: insets.top + 15 }]}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.textPrimary }]}>Card constructor</Text>
                <TouchableOpacity style={styles.menuButton}>
                    <Ionicons name="menu" size={24} color="#1E1B4B" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Title Section */}
                <View style={styles.titleSection}>
                    <Text style={[styles.title, { color: colors.textPrimary }]}>Choose your card:</Text>
                    <Text style={[styles.subtitle, { color: colors.textPrimary }]}>
                        Choose the type of card you'd like to create
                    </Text>
                </View>

                {/* Card Options */}
                <View style={styles.cardsContainer}>{CARD_OPTIONS.map(renderCardOption)}</View>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F0F2F5",
    },
    headerContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    menuButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    content: {
        flex: 1,
    },
    titleSection: {
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 20,
        alignItems: "center",
    },
    title: {
        fontSize: 22,
        fontWeight: "600",
        color: "#050505",
        marginBottom: 8,
        letterSpacing: 0.3,
    },
    subtitle: {
        fontSize: 14,
        color: "#65676B",
        textAlign: "center",
        letterSpacing: 0.2,
    },
    cardsContainer: {
        paddingHorizontal: 16,
        gap: 16,
        paddingBottom: 24,
    },
    cardOption: {
        borderRadius: 16,
        borderColor: "#E4E6EB",
    },
    cardLocked: {
        opacity: 0.85,
    },
    cardContent: {
        padding: 20,
    },
    cardHeaderRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    badge: {
        alignSelf: "flex-start",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderTopLeftRadius: 8,
        borderBottomRightRadius: 8,
        marginBottom: 12,
    },
    badgeText: {
        fontSize: 14,
        fontWeight: "700",
        letterSpacing: 0.5,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 8,
        letterSpacing: 0.2,
    },
    cardDescription: {
        fontSize: 14,
        color: "#65676B",
        lineHeight: 20,
        letterSpacing: 0.2,
    },
    /** Locked-стан: горизонтальний лейаут (контент зліва, лок-повідомлення справа). */
    lockedHorizontalLayout: {
        flexDirection: "row",
        minHeight: 160,
    },
    lockedLeftSection: {
        flex: 1,
        padding: 20,
        paddingRight: 16,
    },
    lockedRightSection: {
        width: 140,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
        borderLeftWidth: 2,
        borderBottomLeftRadius: 10,
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        padding: 8,
    },
    lockedText: {
        fontSize: 11,
        color: "black",
        textAlign: "center",
        marginBottom: 10,
        lineHeight: 15,
        letterSpacing: 0.1,
    },
    upgradeButton: {
        backgroundColor: "#FFD700",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    upgradeButtonText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#050505",
        letterSpacing: 0.2,
    },
})
