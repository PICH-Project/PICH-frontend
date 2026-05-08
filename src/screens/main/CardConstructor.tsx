import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "@/hooks/useTheme"

export default function CardConstructorScreen({ navigation }: any) {
    const { colors } = useTheme()

    const handleCardSelect = (cardType: string) => {
        // Navigate to card creation flow
        navigation.navigate("CreateCard", { cardType })
    }

    const handleUpgrade = () => {
        // Navigate to subscription/upgrade screen
        Alert.alert('To be implemented...');
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.headerContainer}>
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
                    <Text style={[styles.subtitle, { color: colors.textPrimary }]}>Choose the type of card you'd like to create</Text>
                </View>

                {/* Card Options */}
                <View style={styles.cardsContainer}>
                    {/* PAC Card */}
                    <TouchableOpacity style={[styles.cardOption, { borderWidth: 2, borderColor: colors.textPrimary }]} onPress={() => handleCardSelect("PAC")} activeOpacity={0.7}>
                        <View style={styles.cardContent}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <View style={[styles.badge, styles.badgeGreen]}>
                                    <Text style={[styles.badgeText, { color: colors.textPrimary }]}>PAC</Text>
                                </View>
                                <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Personal Automatic Card</Text>
                            </View>
                            <Text style={styles.cardDescription}>Your personal card with all of the information you'd provide</Text>
                        </View>
                    </TouchableOpacity>

                    {/* BAC Card */}
                    <TouchableOpacity style={[styles.cardOption, { borderWidth: 2, borderColor: colors.textPrimary }]} onPress={() => handleCardSelect("BAC")} activeOpacity={0.7}>
                        <View style={styles.cardContent}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <View style={[styles.badge, styles.badgeOrange]}>
                                    <Text style={[styles.badgeText, { color: colors.white }]}>BAC</Text>
                                </View>
                                <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Business Automatic Card</Text>
                            </View>
                            <Text style={styles.cardDescription}>
                                A card for your company with all of the business details you'd provide
                            </Text>
                        </View>
                    </TouchableOpacity>

                    {/* VIPAC Card - Locked */}
                    <View style={[styles.cardOption, styles.cardLocked, { borderWidth: 2, borderColor: colors.textPrimary }]}>
                        <View style={styles.vipHorizontalLayout}>
                            {/* Left Section */}
                            <View style={[styles.vipLeftSection, { padding: 20, }]}>
                                <View style={[styles.badge, styles.badgePink, { paddingHorizontal: 4, }]}>
                                    <Text style={[styles.badgeText, { color: colors.white }]}>VIPAC</Text>
                                </View>
                                <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>VIP Automatic Card</Text>
                                <Text style={styles.cardDescription}>
                                    Your personal card with all of the VIP tools and maximum customization
                                </Text>
                            </View>


                            {/* Right Section */}
                            <View
                                style={[styles.vipRightSection,
                                {
                                    backgroundColor: 'white',
                                    borderLeftWidth: 2,
                                    borderColor: colors.textPrimary,
                                    borderBottomLeftRadius: 10,
                                    borderTopRightRadius: 10,
                                    borderBottomRightRadius: 10,
                                    alignItems: 'center',
                                    padding: 2
                                }]}
                            >
                                <Text style={[styles.lockedText, { color: 'black', }]}>
                                    This card type is not available for your current subscription plan
                                </Text>
                                <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade} activeOpacity={0.8}>
                                    <Text style={styles.upgradeButtonText}>Upgrade my plan</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
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
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 8,
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
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#050505",
        letterSpacing: 0.2,
    },
    headerActions: {
        flexDirection: "row",
        gap: 12,
    },
    iconButton: {
        padding: 4,
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
    badge: {
        alignSelf: "flex-start",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderTopLeftRadius: 8,
        borderBottomRightRadius: 8,
        marginBottom: 12,
        fontSize: 16,
    },
    badgeGreen: {
        backgroundColor: "#97F09A",
    },
    badgeOrange: {
        backgroundColor: "#FFBC56",
    },
    badgePink: {
        backgroundColor: "#FF6459",
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
    vipHeader: {
        flexDirection: "row",
        gap: 16,
    },
    vipTitleContainer: {
        flex: 1,
    },
    lockedNotice: {
        backgroundColor: "#F0F2F5",
        borderRadius: 12,
        padding: 12,
        minWidth: 140,
        alignItems: "center",
        justifyContent: "center",
    },
    lockedText: {
        fontSize: 11,
        color: "#65676B",
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
    vipCardContent: {
        padding: 20,
        minHeight: 180,
    },
    vipBottomSection: {
        padding: 20,
        paddingTop: 0,
        gap: 16,
    },
    vipHorizontalLayout: {
        flexDirection: "row",
        minHeight: 160,
    },
    vipLeftSection: {
        flex: 1,
        paddingRight: 16,
    },
    verticalDivider: {
        width: 1.5,
        backgroundColor: "#E4E6EB",
        marginHorizontal: 8,
    },
    vipRightSection: {
        width: 140,
        justifyContent: "center",
        alignItems: "center",
    },
})
