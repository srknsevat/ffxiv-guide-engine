import type { GuideSummaryDto } from "@ffxiv-guide-engine/types";
import { StatusBar } from "expo-status-bar";
import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Button,
  FlatList,
  SafeAreaView,
  Text,
  TextInput,
  View
} from "react-native";
import { loginWithPassword } from "./src/lib/auth-client";
import { getApiBaseUrl } from "./src/lib/api-base-url";
import { fetchPublishedGuides } from "./src/lib/guides-client";

export default function App(): ReactElement {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [guides, setGuides] = useState<GuideSummaryDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    void (async () => {
      setIsLoading(true);
      const rows = await fetchPublishedGuides("en");
      setGuides(rows);
      setIsLoading(false);
    })();
  }, []);
  const onLogin = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const result = await loginWithPassword({
        apiBaseUrl: getApiBaseUrl(),
        email,
        password
      });
      setToken(result.accessToken);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <StatusBar style="auto" />
      <Text style={{ fontSize: 18, marginBottom: 8 }}>Guides (EN)</Text>
      {isLoading ? <ActivityIndicator /> : null}
      <FlatList
        data={guides}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Text style={{ marginVertical: 4 }}>{item.title}</Text>}
      />
      <View style={{ marginTop: 16 }}>
        <Text>Optional sign-in</Text>
        <TextInput
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <Button title="Login" onPress={() => void onLogin()} />
        {token ? <Text>Signed in.</Text> : null}
      </View>
    </SafeAreaView>
  );
}
