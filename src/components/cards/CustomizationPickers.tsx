import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import {
  NAME_FONT_PRESETS,
  AVATAR_FRAME_PRESETS,
  type NameFont,
  type AvatarFrame,
} from "../../constants/cardCustomization"
import AvatarFrameWrapper from "./AvatarFrameWrapper"

import { DEFAULT_AVATAR_URL } from "../../constants/assets"

const PREVIEW_AVATAR = DEFAULT_AVATAR_URL

// ─────────────────────────────────────────────────────────────────────────────
//  Shared modal wrapper — bottom-sheet з backdrop
// ─────────────────────────────────────────────────────────────────────────────

interface BottomSheetProps {
  visible: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
}

const BottomSheet = ({ visible, title, onClose, children }: BottomSheetProps) => (
  <Modal
    visible={visible}
    transparent
    animationType="slide"
    onRequestClose={onClose}
  >
    <View style={styles.backdrop}>
      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        activeOpacity={1}
        onPress={onClose}
      />
      <View style={styles.sheet}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={22} color="#27261F" />
          </TouchableOpacity>
        </View>
        {children}
      </View>
    </View>
  </Modal>
)

// ─────────────────────────────────────────────────────────────────────────────
//  Font picker
// ─────────────────────────────────────────────────────────────────────────────

interface FontPickerModalProps {
  visible: boolean
  value: NameFont
  onSelect: (font: NameFont) => void
  onClose: () => void
}

export const FontPickerModal = ({
  visible,
  value,
  onSelect,
  onClose,
}: FontPickerModalProps) => {
  return (
    <BottomSheet visible={visible} title="Name Font" onClose={onClose}>
      <View style={styles.optionsColumn}>
        {(Object.keys(NAME_FONT_PRESETS) as NameFont[]).map((key) => {
          const preset = NAME_FONT_PRESETS[key]
          const selected = value === key
          return (
            <TouchableOpacity
              key={key}
              style={[styles.optionRow, selected && styles.optionRowSelected]}
              onPress={() => {
                onSelect(key)
                onClose()
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.sampleText,
                  // Якщо у preset'а є fontFamily — застосовуємо його.
                  // Якщо null (default) — system font (нічого не передаємо).
                  preset.fontFamily ? { fontFamily: preset.fontFamily } : null,
                ]}
              >
                {preset.sample}
              </Text>
              <Text style={styles.optionLabel}>{preset.label}</Text>
              {selected && (
                <Ionicons
                  name="checkmark-circle"
                  size={22}
                  color="#27261F"
                  style={{ marginLeft: "auto" }}
                />
              )}
            </TouchableOpacity>
          )
        })}
      </View>
    </BottomSheet>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  Avatar frame picker
// ─────────────────────────────────────────────────────────────────────────────

interface FramePickerModalProps {
  visible: boolean
  value: AvatarFrame
  onSelect: (frame: AvatarFrame) => void
  onClose: () => void
}

export const FramePickerModal = ({
  visible,
  value,
  onSelect,
  onClose,
}: FramePickerModalProps) => {
  return (
    <BottomSheet visible={visible} title="Avatar Frame" onClose={onClose}>
      <View style={styles.optionsColumn}>
        {(Object.keys(AVATAR_FRAME_PRESETS) as AvatarFrame[]).map((key) => {
          const preset = AVATAR_FRAME_PRESETS[key]
          const selected = value === key
          return (
            <TouchableOpacity
              key={key}
              style={[styles.optionRow, selected && styles.optionRowSelected]}
              onPress={() => {
                onSelect(key)
                onClose()
              }}
              activeOpacity={0.7}
            >
              <View style={styles.avatarPreview}>
                <AvatarFrameWrapper frame={key} size={44}>
                  <Image
                    source={{ uri: PREVIEW_AVATAR }}
                    style={{ width: 44, height: 44, borderRadius: 22 }}
                  />
                </AvatarFrameWrapper>
              </View>
              <Text style={styles.optionLabel}>{preset.label}</Text>
              {selected && (
                <Ionicons
                  name="checkmark-circle"
                  size={22}
                  color="#27261F"
                  style={{ marginLeft: "auto" }}
                />
              )}
            </TouchableOpacity>
          )
        })}
      </View>
    </BottomSheet>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === "ios" ? 32 : 20,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#27261F",
  },
  optionsColumn: {
    gap: 8,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "#F7F7F7",
    gap: 14,
  },
  optionRowSelected: {
    backgroundColor: "#FFF4D6",
    borderWidth: 1,
    borderColor: "#FFD700",
  },
  sampleText: {
    fontSize: 32,
    color: "#27261F",
    width: 56,
    textAlign: "center",
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#27261F",
  },
  avatarPreview: {
    width: 56,
    alignItems: "center",
  },
})
