import React, { useEffect } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { router } from "expo-router";
import { Text } from "~/components/ui/text";
import { LoginFormData, loginSchema } from "~/validation/schemas";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "~/components/ui/button";
import { useSession } from "~/context/AuthContext";
import { cn } from "~/lib/utils";
import { useLogin } from "~/hooks/use-login";
import { Input } from "~/components/ui/input";

export default function SignIn() {

  const { session, signIn } = useSession();

  const { control, setError, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const { mutateAsync, isLoading } = useLogin();

  const handleLogin = async (data: LoginFormData) => {
    try {
      const result = await mutateAsync(data);
      if (result) {
        signIn(result.login);
        router.replace('/');
      }
    } catch (error: any) {
      if (error.field === "login") {
        setError("login", { message: error.message });
      } else if (error.field === "password") {
        setError("password", { message: error.message });
      }
      console.log(error?.message);
    }
  };

  useEffect(() => {
    if (session) {
      requestAnimationFrame(() => router.replace('/'));
    }
  }, [session]);


  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        className="bg-background"
      >
        <View className="px-6 pt-16 pb-8">
          <View className="mb-12">
            <Text className="text-5xl font-bold text-foreground mb-3">Welcome Back</Text>
            <Text className="text-lg text-muted-foreground font-medium">Sign in to manage your tasks</Text>
          </View>

          <View className="gap-6">
            {/* Login Input */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Username</Text>
              <Controller
                control={control}
                name="login"
                render={({ field: { onChange, value } }) => (
                  <View>
                    <Input
                      value={value}
                      onChangeText={(text) => onChange(text.toLowerCase())}
                      className={cn(
                        " rounded-lg border border-input bg-card text-foreground ",
                        errors?.login?.message && "border-destructive bg-destructive/5",
                      )}
                      placeholder="Enter your username"
                      placeholderTextColor="#8c8c8c"
                    />
                    {errors?.login && (
                      <View className="mt-2 flex-row items-center gap-2">
                        <Text className="text-xs font-medium text-red-800">{errors.login?.message}</Text>
                      </View>
                    )}
                  </View>
                )}
              />
            </View>

            {/* Password Input */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Password</Text>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value } }) => (
                  <View>
                    <Input
                      value={value}
                      onChangeText={(text) => onChange(text.toLowerCase())}
                      secureTextEntry
                      className={cn(
                        " rounded-lg border border-input bg-card text-foreground ",
                        errors?.password?.message && "border-destructive bg-destructive/5",
                      )}
                      placeholder="Enter your password"
                      placeholderTextColor="#8c8c8c"
                    />
                    {errors?.password && (
                      <View className="mt-2 flex-row items-center gap-2">
                        <Text className="text-xs font-medium text-red-800">{errors.password?.message}</Text>
                      </View>
                    )}
                  </View>
                )}
              />
            </View>
          </View>

          <View className="mt-10 gap-3">
            <Button
              disabled={isLoading}
              onPress={handleSubmit(handleLogin)}
              className={cn("py-3 rounded-lg flex-row items-center justify-center gap-2", isLoading && "opacity-80")}
            >
              {isLoading ? (
                <>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text className="text-base font-semibold text-white">Signing in...</Text>
                </>
              ) : (
                <Text className="text-base font-semibold text-white">Sign In</Text>
              )}
            </Button>
          </View>

          <View className="mt-8 pt-6 border-t border-border">
            <Text className="text-center text-sm text-muted-foreground">Secure login with encrypted credentials</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}