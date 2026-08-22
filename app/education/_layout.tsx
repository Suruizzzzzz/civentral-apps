import { HeaderBar } from "@/src/components/common/HeaderBar";
import { StandaloneTabBar } from "@/src/components/navigation/StandaloneTabBar";
import { styles } from "@/src/features/education/styles/layout.styles";
import { Stack, useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";

export default function EducationLayout() {
  const router = useRouter();

  return (
    <View style={styles.shell}>
      <HeaderBar
        subtitle="Education & Scholarship Portal"
        onNotificationPress={() => router.push("/(tabs)/notifications" as any)}
      />
      <View style={styles.content}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>
      <StandaloneTabBar />
    </View>
  );
}
