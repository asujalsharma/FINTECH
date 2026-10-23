# Add project specific ProGuard rules here.
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes Exceptions

# Reanimated
-keep class com.swmansion.reanimated.** { *; }

# Vector Icons
-keep class com.oblador.vectoricons.** { *; }

# SMS Retriever & Google Play Services
-dontwarn com.google.android.gms.auth.api.credentials.**
-dontwarn com.google.android.gms.**
-dontwarn me.furtado.smsretriever.**
-dontwarn okhttp3.**
-dontwarn okio.**
