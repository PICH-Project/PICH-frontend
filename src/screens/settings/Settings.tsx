"use client"

import React, { useEffect, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { useTheme } from "../../hooks/useTheme"
import Avatar from "../../components/common/Avatar"
import { useTabBarHeight } from "@/hooks/useTabBarHeight"
import { useAuth } from "../../hooks/useAuth"
import { useDispatch } from "react-redux"
import { fetchUserProfile } from "@/store/slices/authSlice"
import type { AppDispatch } from "@/store"
import Svg, { Path } from "react-native-svg"

const AvatarCircle = ({ color = '#71706A'}: { color?: string }) => {
  return (
    <Svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      accessible
      accessibilityRole="image"
    >
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M20 10C20 15.5228 15.5228 20 10 20C4.47715 20 0 15.5228 0 10C0 4.47715 4.47715 0 10 0C15.5228 0 20 4.47715 20 10ZM12.5 6.25C12.5 7.63071 11.3807 8.75 10 8.75C8.61929 8.75 7.5 7.63071 7.5 6.25C7.5 4.86929 8.61929 3.75 10 3.75C11.3807 3.75 12.5 4.86929 12.5 6.25ZM9.99992 11.25C7.47799 11.25 5.30493 12.7437 4.31717 14.8946C5.69254 16.49 7.72831 17.5 9.99998 17.5C12.2716 17.5 14.3073 16.4901 15.6827 14.8947C14.695 12.7437 12.5219 11.25 9.99992 11.25Z"
        fill={color}
      />
    </Svg>
  );
}

const GearIcon = ({ color = '#71706A' }: { color?: string }) => {
  return (
    <Svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      accessible
      accessibilityRole="image"
    >
      <Path
        d="M8.345 20C7.895 20 7.50767 19.85 7.183 19.55C6.85833 19.25 6.66233 18.8833 6.595 18.45L6.37 16.8C6.15333 16.7167 5.94933 16.6167 5.758 16.5C5.56667 16.3833 5.379 16.2583 5.195 16.125L3.645 16.775C3.22833 16.9583 2.81167 16.975 2.395 16.825C1.97833 16.675 1.65333 16.4083 1.42 16.025L0.245 13.975C0.0116665 13.5917 -0.055 13.1833 0.045 12.75C0.145 12.3167 0.37 11.9583 0.72 11.675L2.045 10.675C2.02833 10.5583 2.02 10.4457 2.02 10.337V9.662C2.02 9.554 2.02833 9.44167 2.045 9.325L0.72 8.325C0.37 8.04167 0.145 7.68333 0.045 7.25C-0.055 6.81667 0.0116665 6.40833 0.245 6.025L1.42 3.975C1.65333 3.59167 1.97833 3.325 2.395 3.175C2.81167 3.025 3.22833 3.04167 3.645 3.225L5.195 3.875C5.37833 3.74167 5.57 3.61667 5.77 3.5C5.97 3.38333 6.17 3.28333 6.37 3.2L6.595 1.55C6.66167 1.11667 6.85767 0.75 7.183 0.45C7.50833 0.15 7.89567 0 8.345 0H10.695C11.145 0 11.5327 0.15 11.858 0.45C12.1833 0.75 12.379 1.11667 12.445 1.55L12.67 3.2C12.8867 3.28333 13.091 3.38333 13.283 3.5C13.475 3.61667 13.6623 3.74167 13.845 3.875L15.395 3.225C15.8117 3.04167 16.2283 3.025 16.645 3.175C17.0617 3.325 17.3867 3.59167 17.62 3.975L18.795 6.025C19.0283 6.40833 19.095 6.81667 18.995 7.25C18.895 7.68333 18.67 8.04167 18.32 8.325L16.995 9.325C17.0117 9.44167 17.02 9.55433 17.02 9.663V10.337C17.02 10.4457 17.0033 10.5583 16.97 10.675L18.295 11.675C18.645 11.9583 18.87 12.3167 18.97 12.75C19.07 13.1833 19.0033 13.5917 18.77 13.975L17.57 16.025C17.3367 16.4083 17.0117 16.675 16.595 16.825C16.1783 16.975 15.7617 16.9583 15.345 16.775L13.845 16.125C13.6617 16.2583 13.47 16.3833 13.27 16.5C13.07 16.6167 12.87 16.7167 12.67 16.8L12.445 18.45C12.3783 18.8833 12.1827 19.25 11.858 19.55C11.5333 19.85 11.1457 20 10.695 20H8.345ZM9.57 13.5C10.5367 13.5 11.3617 13.1583 12.045 12.475C12.7283 11.7917 13.07 10.9667 13.07 10C13.07 9.03333 12.7283 8.20833 12.045 7.525C11.3617 6.84167 10.5367 6.5 9.57 6.5C8.58667 6.5 7.75733 6.84167 7.082 7.525C6.40667 8.20833 6.06933 9.03333 6.07 10C6.07067 10.9667 6.40833 11.7917 7.083 12.475C7.75767 13.1583 8.58667 13.5 9.57 13.5Z"
        fill={color}
      />
    </Svg>
  );
}

const CrownIcon = ({ color = '#71706A' }: { color?: string }) => {
  return (
    <Svg
      width={20}
      height={14}
      viewBox="0 0 20 14"
      fill="none"
      accessible
      accessibilityRole="image"
    >
      <Path
        d="M9.75 0C9.87931 7.38472e-05 10.0066 0.0329922 10.1191 0.0966797C10.2317 0.160398 10.326 0.252426 10.3926 0.363281L13.6045 5.7002L18.3418 2.62109C18.4628 2.54256 18.6038 2.50035 18.748 2.5C18.8923 2.49973 19.0339 2.54113 19.1553 2.61914C19.2767 2.69725 19.373 2.80895 19.4326 2.94043C19.4922 3.07187 19.5125 3.21763 19.4912 3.36035L17.9912 13.3604C17.9646 13.5381 17.8754 13.7011 17.7393 13.8184C17.6032 13.9355 17.4295 14 17.25 14H2.25C2.0703 14.0001 1.89594 13.9356 1.75977 13.8184C1.62358 13.7011 1.53441 13.5381 1.50781 13.3604L0.0078125 3.36035C-0.0134412 3.21764 0.00686763 3.07186 0.0664062 2.94043C0.125998 2.80892 0.222334 2.69727 0.34375 2.61914C0.46515 2.54107 0.606639 2.49973 0.750977 2.5C0.89528 2.50031 1.03616 2.54257 1.15723 2.62109L5.89453 5.7002L9.10645 0.362305C9.17313 0.251708 9.26746 0.160231 9.37988 0.0966797C9.49255 0.0330723 9.62061 -9.63385e-05 9.75 0Z"
        fill={color}
      />
    </Svg>
  );
}

const ContactSupportIcon = ({
  color = '#71706A',
}: { color?: string }) => {
  return (
    <Svg
      width={17}
      height={20}
      viewBox="0 0 17 20"
      fill="none"
      accessible
      accessibilityRole="image"
    >
      <Path
        d="M8.75 17H8.5C6.13333 17 4.125 16.175 2.475 14.525C0.825 12.875 0 10.8667 0 8.5C0 6.13333 0.825 4.125 2.475 2.475C4.125 0.825 6.13333 0 8.5 0C9.68333 0 10.7877 0.220667 11.813 0.662C12.8383 1.10333 13.7383 1.71167 14.513 2.487C15.2877 3.26233 15.8957 4.16233 16.337 5.187C16.7783 6.21167 16.9993 7.316 17 8.5C17 10.7333 16.3707 12.8083 15.112 14.725C13.8533 16.6417 12.266 18.1417 10.35 19.225C10.1833 19.3083 10.0167 19.3543 9.85 19.363C9.68333 19.3717 9.53333 19.334 9.4 19.25C9.26667 19.166 9.15 19.0577 9.05 18.925C8.95 18.7923 8.89167 18.634 8.875 18.45L8.75 17ZM8.475 13.975C8.75833 13.975 9 13.875 9.2 13.675C9.4 13.475 9.5 13.2333 9.5 12.95C9.5 12.6667 9.4 12.425 9.2 12.225C9 12.025 8.75833 11.925 8.475 11.925C8.19167 11.925 7.95 12.025 7.75 12.225C7.55 12.425 7.45 12.6667 7.45 12.95C7.45 13.2333 7.55 13.475 7.75 13.675C7.95 13.875 8.19167 13.975 8.475 13.975ZM6.3 6.375C6.48333 6.45833 6.66667 6.46267 6.85 6.388C7.03333 6.31333 7.18333 6.19233 7.3 6.025C7.45 5.825 7.625 5.67067 7.825 5.562C8.025 5.45333 8.25 5.39933 8.5 5.4C8.9 5.4 9.225 5.51233 9.475 5.737C9.725 5.96167 9.85 6.24933 9.85 6.6C9.85 6.81667 9.78767 7.03333 9.663 7.25C9.53833 7.46667 9.31733 7.73333 9 8.05C8.58333 8.41667 8.275 8.76267 8.075 9.088C7.875 9.41333 7.775 9.74233 7.775 10.075C7.775 10.275 7.846 10.446 7.988 10.588C8.13 10.73 8.30067 10.8007 8.5 10.8C8.69933 10.7993 8.866 10.7243 9 10.575C9.134 10.4257 9.234 10.2507 9.3 10.05C9.38333 9.76667 9.53333 9.50833 9.75 9.275C9.96667 9.04167 10.1667 8.83333 10.35 8.65C10.7 8.3 10.9627 7.95 11.138 7.6C11.3133 7.25 11.4007 6.9 11.4 6.55C11.4 5.78333 11.1373 5.16667 10.612 4.7C10.0867 4.23333 9.38267 4 8.5 4C7.96667 4 7.475 4.12933 7.025 4.388C6.575 4.64667 6.20833 5.00067 5.925 5.45C5.825 5.63333 5.81233 5.81267 5.887 5.988C5.96167 6.16333 6.09933 6.29233 6.3 6.375Z"
        fill={color}
      />
    </Svg>
  );
}

const LogoutIcon = ({ size = 20, color = "#71706A" }) => (
  <Svg width={size} height={17} viewBox="0 0 20 17" fill="none">
    <Path
      d="M10 0.749989V7.39999H17.442L15.72 5.67599C15.5927 5.54894 15.5153 5.38039 15.5019 5.20106C15.4885 5.02172 15.54 4.84354 15.647 4.69899L15.72 4.61499C15.8471 4.48812 16.0155 4.41108 16.1946 4.39786C16.3737 4.38465 16.5516 4.43615 16.696 4.54299L16.78 4.61499L19.777 7.61299C19.904 7.73998 19.9812 7.90833 19.9946 8.08744C20.008 8.26655 19.9567 8.44452 19.85 8.58899L19.777 8.67299L16.781 11.676C16.6472 11.8093 16.468 11.8872 16.2792 11.8941C16.0904 11.901 15.906 11.8364 15.7628 11.7133C15.6196 11.5901 15.5281 11.4175 15.5066 11.2298C15.4852 11.0421 15.5353 10.8533 15.647 10.701L15.719 10.617L17.432 8.89999H10.001L10 15.646C9.99991 15.7554 9.97586 15.8635 9.92955 15.9627C9.88324 16.0619 9.81579 16.1497 9.73193 16.22C9.64808 16.2903 9.54984 16.3415 9.44413 16.3698C9.33842 16.3981 9.22779 16.403 9.12 16.384L0.62 14.883C0.446242 14.8524 0.288826 14.7615 0.17543 14.6264C0.0620343 14.4912 -8.28557e-05 14.3204 8.29472e-08 14.144V2.14599C2.64526e-06 1.96823 0.0631439 1.79625 0.178164 1.66071C0.293185 1.52518 0.452606 1.43491 0.628 1.40599L9.128 0.00998921C9.23536 -0.00771093 9.34529 -0.00183742 9.45016 0.0272021C9.55502 0.0562416 9.65231 0.107751 9.73528 0.178157C9.81824 0.248563 9.8849 0.336179 9.93061 0.434923C9.97632 0.533668 10 0.641177 10 0.749989ZM6.502 7.89499C6.23612 7.89499 5.98113 8.00061 5.79313 8.18861C5.60512 8.37662 5.4995 8.63161 5.4995 8.89749C5.4995 9.16337 5.60512 9.41836 5.79313 9.60636C5.98113 9.79437 6.23612 9.89999 6.502 9.89999C6.76788 9.89999 7.02287 9.79437 7.21087 9.60636C7.39888 9.41836 7.5045 9.16337 7.5045 8.89749C7.5045 8.63161 7.39888 8.37662 7.21087 8.18861C7.02287 8.00061 6.76788 7.89499 6.502 7.89499ZM11 14.898H11.765L11.867 14.891C12.0467 14.8663 12.2114 14.7773 12.3306 14.6405C12.4497 14.5037 12.5152 14.3284 12.515 14.147L12.508 9.89699H11V14.898ZM11.002 6.39599L11 5.12099V1.39599H11.745C11.9261 1.39596 12.1011 1.46146 12.2376 1.58038C12.3742 1.6993 12.4631 1.86362 12.488 2.04299L12.495 2.14399L12.502 6.39599H11.002Z"
      fill={color}
    />
  </Svg>
);

const SettingsScreen = () => {
  const navigation = useNavigation()
  const { colors, typography } = useTheme()
  const { user } = useAuth()
  const dispatch = useDispatch<AppDispatch>()
  const [loading, setLoading] = useState(false)
  const tabBarHeight = useTabBarHeight()

  // Fetch user profile if not already loaded
  useEffect(() => {
    if (!user && !loading) {
      setLoading(true)
      dispatch(fetchUserProfile())
        .unwrap()
        .then(() => setLoading(false))
        .catch(() => setLoading(false))
    }
  }, [user, dispatch, loading])

  const menuItems = [
    {
      id: "account",
      title: "Account Settings",
      icon: <AvatarCircle />,
      iconColor: colors.accent,
      screen: "AccountSettings", // Make sure this matches the screen name in SettingsNavigator
    },
    {
      id: "app",
      title: "Application settings",
      icon: <GearIcon />,
      iconColor: colors.accent,
      screen: "AppSettings",
    },
    {
      id: "subscription",
      title: "Subscription",
      icon: <CrownIcon />,
      iconColor: colors.accent,
      screen: "Subscription",
    },
    {
      id: "support",
      title: "Contact Support",
      icon: <ContactSupportIcon />,
      iconColor: colors.accent,
      screen: "Support",
    },
    {
      id: "signout",
      title: "Sign Out",
      icon: <LogoutIcon />,
      iconColor: colors.accent,
      screen: "SignOut",
    },
  ]

  // Display a loading indicator while fetching user data
  if (loading && !user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    )
  }

  // Format the display name based on available user data
  const getDisplayName = () => {
    if (!user) return "User"

    return `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User"
  }

  // Get the nickname or a fallback
  const getNickname = () => {
    if (!user) return ""

    return user.nickname || ""
  }

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
              fontSize: typography.fontSize.xxl,
              alignSelf: 'center',
            },
          ]}
        >
          Settings
        </Text>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity style={{ marginRight: 12 }}>
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="menu" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarHeight + 20 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <Avatar uri={user?.avatar || "https://randomuser.me/api/portraits/men/32.jpg"} size={60} />
          <View style={styles.profileInfo}>
            <Text
              style={[
                styles.profileName,
                {
                  color: colors.text,
                  fontFamily: typography.fontFamily.bold,
                  fontSize: typography.fontSize.xl,
                  fontWeight: 'bold'
                },
              ]}
            >
              {getDisplayName()}
            </Text>
            {getNickname() ? (
              <Text
                style={[
                  styles.profileUsername,
                  {
                    color: colors.textSecondary,
                    fontFamily: typography.fontFamily.regular,
                    fontSize: typography.fontSize.lg,
                  },
                ]}
              >
                {getNickname()}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <React.Fragment key={item.id}>
              {item.id === "subscription" && (
                <Text
                  style={[
                    styles.sectionTitle,
                    {
                      color: colors.textSecondary,
                      fontFamily: typography.fontFamily.regular,
                      fontSize: typography.fontSize.sm,
                    },
                  ]}
                >
                  Resources
                </Text>
              )}
              <TouchableOpacity
                style={[
                  styles.menuItem,
                  {
                    borderBottomColor: colors.border,
                  },
                ]}
                onPress={() => navigation.navigate(item.screen as never)}
              >
                <View style={styles.menuItemLeft}>
                  <View>
                    {item.icon}
                  </View>
                  <Text
                    style={[
                      styles.menuItemText,
                      {
                        color: colors.text,
                        fontFamily: typography.fontFamily.medium,
                        fontSize: typography.fontSize.lg,
                      },
                    ]}
                  >
                    {item.title}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>

        <View style={styles.logoContainer}>
          <Image source={require("../../../assets/logo.png")} style={styles.logo} resizeMode="contain" />
          <Text
            style={[
              styles.versionText,
              {
                color: colors.textTertiary,
                fontFamily: typography.fontFamily.regular,
                fontSize: typography.fontSize.sm,
              },
            ]}
          >
            Version 2.0.3 (571)
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

// Add the loadingContainer and loadingText styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
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
    marginTop: 36,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
  },
  profileInfo: {
    marginLeft: 16,
  },
  profileName: {
    marginBottom: 2,
  },
  profileUsername: {},
  menuSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuItemText: {},
  logoContainer: {
    alignItems: "center",
    marginTop: 48,
  },
  logo: {
    width: 250,
    height: 60,
  },
  versionText: {
    marginTop: 0,
  },
})

export default SettingsScreen
