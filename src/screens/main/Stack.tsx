"use client"

import { useState } from "react"
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, TextInput, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../hooks/useTheme"

interface CardType {
  id: string
  type: "BAC" | "PAC" | "VAC" | "CAC"
  name: string
  nickname: string
  avatar: string
  isPrime?: boolean
}

const StackScreen = () => {
  const { colors, typography } = useTheme()
  const [searchQuery, setSearchQuery] = useState("")

  const cards: CardType[] = [
    {
      id: "1",
      type: "BAC",
      name: "John Doe",
      nickname: "Johny",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      isPrime: true,
    },
    {
      id: "2",
      type: "VAC",
      name: "John Doe",
      nickname: "Johny",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      id: "3",
      type: "BAC",
      name: "John Doe",
      nickname: "Johny",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      id: "4",
      type: "PAC",
      name: "John Doe",
      nickname: "Johny",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      id: "5",
      type: "VAC",
      name: "John Doe",
      nickname: "Johny",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      isPrime: true,
    },
    {
      id: "6",
      type: "CAC",
      name: "John Doe",
      nickname: "Johny",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      id: "7",
      type: "PAC",
      name: "John Doe",
      nickname: "Johny",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      isPrime: true,
    },
  ]

  const getCardTypeColor = (type: CardType["type"]) => {
    switch (type) {
      case "BAC":
        return colors.success
      case "PAC":
        return colors.accent
      case "VAC":
        return colors.error
      case "CAC":
        return colors.info
      default:
        return colors.secondary
    }
  }

  const handleCall = (id: string) => {
    console.log("Call card:", id)
  }

  const renderCard = ({ item }: { item: CardType }) => (
    <View style={styles.cardContainer}>
      <View style={[styles.cardTypeBadge, { backgroundColor: getCardTypeColor(item.type) }]}>
        <Text
          style={[
            styles.cardTypeText,
            {
              color: "#FFFFFF",
              fontFamily: typography.fontFamily.medium,
              fontSize: typography.fontSize.xs,
            },
          ]}
        >
          {item.type}
        </Text>
      </View>
      <View style={styles.cardContent}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.cardInfo}>
          <Text
            style={[
              styles.cardName,
              {
                color: colors.text,
                fontFamily: typography.fontFamily.bold,
                fontSize: typography.fontSize.lg,
              },
            ]}
          >
            {item.name}
          </Text>
          <Text
            style={[
              styles.cardNickname,
              {
                color: colors.textSecondary,
                fontFamily: typography.fontFamily.regular,
                fontSize: typography.fontSize.md,
              },
            ]}
          >
            {item.nickname}
          </Text>
        </View>
        <TouchableOpacity style={styles.callButton} onPress={() => handleCall(item.id)}>
          <Ionicons name="call-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      {item.isPrime && (
        <View style={[styles.primeBadge, { backgroundColor: colors.accent }]}>
          <Text
            style={[
              styles.primeText,
              {
                color: colors.primary,
                fontFamily: typography.fontFamily.bold,
                fontSize: typography.fontSize.xs,
                transform: [{ rotate: "90deg" }],
              },
            ]}
          >
            PRIME
          </Text>
        </View>
      )}
    </View>
  )

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
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
          Stack
        </Text>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="menu" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={[styles.searchInputContainer, { backgroundColor: colors.card }]}>
          <Ionicons name="search-outline" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[
              styles.searchInput,
              {
                color: colors.text,
                fontFamily: typography.fontFamily.regular,
                fontSize: typography.fontSize.md,
              },
            ]}
            placeholder="Search"
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.micButton}>
            <Ionicons name="mic-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
        <View style={styles.filterButtons}>
          <TouchableOpacity style={[styles.filterButton, { backgroundColor: colors.card }]}>
            <Ionicons name="folder-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.filterButton, { backgroundColor: colors.card }]}>
            <Ionicons name="star-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <Text
        style={[
          styles.sectionTitle,
          {
            color: colors.textSecondary,
            fontFamily: typography.fontFamily.medium,
            fontSize: typography.fontSize.md,
          },
        ]}
      >
        ALL CARDS
      </Text>

      <FlatList
        data={cards}
        renderItem={renderCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontWeight: "bold",
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: "100%",
  },
  micButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  filterButtons: {
    flexDirection: "row",
    marginLeft: 8,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  sectionTitle: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  cardContainer: {
    position: "relative",
    marginBottom: 16,
  },
  cardTypeBadge: {
    position: "absolute",
    left: 0,
    top: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    zIndex: 1,
  },
  cardTypeText: {
    textTransform: "uppercase",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  cardInfo: {
    flex: 1,
    marginLeft: 16,
  },
  cardName: {},
  cardNickname: {},
  callButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  primeBadge: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 24,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  primeText: {
    textTransform: "uppercase",
  },
})

export default StackScreen
