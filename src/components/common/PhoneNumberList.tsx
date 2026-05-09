"use client"

import type React from "react"
import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import Svg, { Path } from "react-native-svg"

// Enable LayoutAnimation for Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

interface PhoneNumberListProps {
  phoneNumbers: string[]
  onChange: (numbers: string[]) => void
  maxLength?: number
  /** Максимальна кількість номерів. Коли досягнутий — кнопка "+" заблокована. */
  maxItems?: number
  placeholder?: string
  /**
   * Темний режим — для рендерингу на чорному фоні (наприклад VIPAC-картка).
   * Прозорий контейнер з білим текстом, підлаштовується під фон-парент.
   */
  darkMode?: boolean
}

const UkrainianFlag = () => (
  <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
    <Path
      d="M16 2.5H2C1.46957 2.5 0.960859 2.71071 0.585786 3.08579C0.210714 3.46086 0 3.96957 0 4.5L0 9H18V4.5C18 3.96957 17.7893 3.46086 17.4142 3.08579C17.0391 2.71071 16.5304 2.5 16 2.5Z"
      fill="#005BBB"
    />
    <Path
      d="M18 13.5C18 14.0304 17.7893 14.5391 17.4142 14.9142C17.0391 15.2893 16.5304 15.5 16 15.5H2C1.46957 15.5 0.960859 15.2893 0.585786 14.9142C0.210714 14.5391 0 14.0304 0 13.5V9H18V13.5Z"
      fill="#FFD500"
    />
  </Svg>
)

const PhoneNumberList: React.FC<PhoneNumberListProps> = ({
  phoneNumbers,
  onChange,
  maxLength = 250,
  maxItems,
  placeholder = "(12) 345 67 89*",
  darkMode = false,
}) => {
  const [currentInput, setCurrentInput] = useState("")
  const [isExpanded, setIsExpanded] = useState(false)
  const [rotateAnim] = useState(new Animated.Value(0))

  const isAtMaxItems = typeof maxItems === "number" && phoneNumbers.length >= maxItems

  const handleAddNumber = () => {
    if (isAtMaxItems) return
    if (currentInput.trim().length > 0) {
      const newNumbers = [...phoneNumbers, currentInput.trim()]
      onChange(newNumbers)
      setCurrentInput("")
    }
  }

  const handleRemoveNumber = (index: number) => {
    const newNumbers = phoneNumbers.filter((_, i) => i !== index)
    onChange(newNumbers)
    if (isExpanded && !newNumbers.length) {
      toggleExpanded()
    }
  }

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setIsExpanded(!isExpanded)

    Animated.timing(rotateAnim, {
      toValue: isExpanded ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start()
  }

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  })

  const totalCharacters = phoneNumbers.join("").length + currentInput.length

  return (
    <View style={styles.container}>
      {/* Main Input Container — підлаштовується під dark/light тему.
          Border на dark — мінімальний, щоб не виділявся серед інших інпутів. */}
      <View
        style={[
          styles.inputContainer,
          darkMode && {
            backgroundColor: "transparent",
            // Той самий border-color, що й інші інпути форми (colors.border = "#E5E5E5")
            borderColor: "#E5E5E5",
          },
        ]}
      >

        {/* Input Row */}
        <View
          style={[
            styles.inputRow,
            // На dark прибираємо вертикальний divider між prefix і input —
            // він робить контейнер "багатоскладовим" на тлі простих інпутів вище.
            darkMode && { },
          ]}
        >
          {/* Flag and Prefix (Static) */}
          <View
            style={[
              styles.prefixContainer,
              darkMode && { borderRightColor: "transparent" },
            ]}
          >
            <UkrainianFlag />
            <Text
              style={[
                styles.prefixText,
                darkMode
                  ? { color: "#FFFFFF" }
                  : {
                      borderWidth: 1,
                      borderRadius: 4,
                      padding: 4,
                      borderColor: "#71706A",
                    },
              ]}
            >
              +380
            </Text>
          </View>

          {/* Phone Input */}
          <TextInput
            style={[styles.input, darkMode && { color: "#FFFFFF" }]}
            value={currentInput}
            onChangeText={setCurrentInput}
            placeholder={placeholder}
            placeholderTextColor={darkMode ? "#CFCAC4" : "#71706A"}
            keyboardType="phone-pad"
            maxLength={maxLength - phoneNumbers.join("").length}
          />

          {/* Chevron Down Button */}
          <TouchableOpacity style={styles.iconButton} onPress={toggleExpanded} disabled={phoneNumbers.length === 0}>
            <Animated.View style={{ transform: [{ rotate: rotation }] }}>
              <Ionicons
                name="chevron-down"
                size={20}
                color={
                  phoneNumbers.length === 0
                    ? darkMode
                      ? "#5C5750"
                      : "#CCCCCC"
                    : darkMode
                      ? "#FFFFFF"
                      : "#666666"
                }
              />
            </Animated.View>
          </TouchableOpacity>

          {/* Plus Button.
              Active light:    жовтий фон + білий плюс.
              Active dark:     жовтий фон + чорний плюс.
              Disabled light:  світло-сірий фон + ще світліший плюс.
              Disabled dark:   ледь видимий темний фон + приглушений плюс
                               (щоб не бликала яскрава пляма на чорній картці). */}
          {(() => {
            const disabled = currentInput.trim().length === 0 || isAtMaxItems
            const bg = disabled
              ? darkMode
                ? "rgba(255,255,255,0.06)"
                : "#E0E0E0"
              : "#FFCC4D"
            const iconColor = disabled
              ? darkMode
                ? "#5C5750"
                : "#CCCCCC"
              : darkMode
                ? "#000000"
                : "#FFFFFF"
            return (
              <TouchableOpacity
                style={[styles.iconButton, styles.plusButton, { backgroundColor: bg }]}
                onPress={handleAddNumber}
                disabled={disabled}
              >
                <Ionicons name="add" size={24} color={iconColor} />
              </TouchableOpacity>
            )
          })()}
        </View>
      </View>

      {/* Phone Numbers List — expanded dropdown.
          Dark: card-like темний контейнер з тонким border'ом і темними item-ами.
          Light: дефолтний світлий вигляд. */}
      {isExpanded && phoneNumbers.length > 0 && (
        <View
          style={[
            styles.listContainer,
            darkMode && {
              backgroundColor: "#21201C",
              borderWidth: 1,
              borderColor: "#E5E5E5",
            },
          ]}
        >
          {phoneNumbers.map((number, index) => (
            <View
              key={index}
              style={[
                styles.listItem,
                darkMode && {
                  backgroundColor: "rgba(255,255,255,0.06)",
                },
              ]}
            >
              <View style={styles.listItemContent}>
                <View style={styles.listItemPrefix}>
                  <UkrainianFlag />
                  <Text
                    style={[
                      styles.listItemPrefixText,
                      darkMode && { color: "#FFFFFF" },
                    ]}
                  >
                    +380
                  </Text>
                </View>
                <Text
                  style={[
                    styles.listItemNumber,
                    darkMode && { color: "#FFFFFF" },
                  ]}
                >
                  {number}
                </Text>
              </View>
              <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveNumber(index)}>
                <Ionicons name="close-circle" size={20} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    position: "relative",
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  characterCounter: {
    position: "absolute",
    top: 4,
    right: 12,
    fontSize: 10,
    color: "#999999",
    zIndex: 1,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  prefixContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 8,
    borderRightWidth: 1,
    borderRightColor: "#E0E0E0",
    marginRight: 8,
  },
  prefixText: {
    fontSize: 14,
    color: "#71706A",
    marginLeft: 6,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#333333",
    paddingVertical: 4,
  },
  iconButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
  },
  plusButton: {
    backgroundColor: "#FFCC4D",
    borderRadius: 16,
  },
  plusButtonDisabled: {
    backgroundColor: "#E0E0E0",
  },
  listContainer: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: "#F8F8F8",
    padding: 8,
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 12,
    marginBottom: 6,
  },
  listItemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  listItemPrefix: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  listItemPrefixText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginLeft: 6,
  },
  listItemNumber: {
    fontSize: 14,
    color: "#333333",
    flex: 1,
  },
  removeButton: {
    padding: 4,
  },
  badge: {
    marginTop: 8,
    alignSelf: "flex-start",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    color: "#4CD964",
    fontWeight: "600",
  },
})

export default PhoneNumberList
