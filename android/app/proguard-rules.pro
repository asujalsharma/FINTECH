# Add project specific ProGuard rules here.

# React Native
-keep class com.facebook.react.** { *; }
-keep class com.facebook.jni.** { *; }
-keep interface com.facebook.react.** { *; }
-keepclassmembers class * {
    @com.facebook.react.uimanager.annotations.ReactProp <methods>;
    @com.facebook.react.uimanager.annotations.ReactPropGroup <methods>;
}

# Hermes Engine
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }

# Fresco & OkHttp
-keep class com.facebook.drawee.** { *; }
-keep class com.facebook.imagepipeline.** { *; }
-keep class okhttp3.** { *; }
-dontwarn okhttp3.**

# Reanimated
-keep class com.swmansion.reanimated.** { *; }
-dontwarn com.swmansion.reanimated.**

# React Native Screens & Gesture Handler
-keep class com.swmansion.rnscreens.** { *; }
-keep class com.swmansion.gesturehandler.** { *; }

# Fast Image
-keep class com.dylanvann.fastimage.** { *; }

# Vector Icons
-keep class com.oblador.vectoricons.** { *; }

# Notifee & Firebase
-keep class io.invertase.notifee.** { *; }
-keep class io.invertase.firebase.** { *; }
-keep class com.google.firebase.** { *; }

# SMS Retriever & Google Play Services
-dontwarn com.google.android.gms.auth.api.credentials.**
-dontwarn com.google.android.gms.**
-dontwarn me.furtado.smsretriever.**
-keep class me.furtado.smsretriever.** { *; }

# Async Storage
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# Suppress harmless warnings from dependencies
-dontwarn javax.annotation.**
-dontwarn org.apache.commons.**
