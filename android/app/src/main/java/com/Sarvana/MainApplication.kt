package com.Sarvana

import android.app.Application
import com.facebook.common.internal.Supplier
import com.facebook.drawee.backends.pipeline.Fresco
import com.facebook.imagepipeline.cache.MemoryCacheParams
import com.facebook.imagepipeline.core.DownsampleMode
import com.facebook.imagepipeline.core.ImagePipelineConfig
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.react.shell.MainPackageConfig

import com.Sarvana.BuildConfig   // <-- REQUIRED IMPORT

class MainApplication : Application(), ReactApplication {

  override val reactNativeHost: ReactNativeHost =
      object : DefaultReactNativeHost(this@MainApplication) {
        override fun getPackages(): List<ReactPackage> {
          // Tune Fresco Image Pipeline to strictly cap native bitmap cache to 24MB (instead of 200MB+)
          // and enable downsampling so high-res images are downscaled at decode time
          val frescoConfig = ImagePipelineConfig.newBuilder(this@MainApplication)
              .setDownsampleMode(DownsampleMode.ALWAYS)
              .setBitmapMemoryCacheParamsSupplier(Supplier<MemoryCacheParams> {
                MemoryCacheParams(
                    24 * 1024 * 1024, // Max cache size in bytes (24 MB)
                    120,              // Max cache entries
                    8 * 1024 * 1024,  // Max eviction queue size (8 MB)
                    24,               // Max eviction queue entries
                    4 * 1024 * 1024   // Max single cache entry size (4 MB)
                )
              })
              .build()

          val mainPackageConfig = MainPackageConfig(frescoConfig)
          return PackageList(this, mainPackageConfig).packages.apply { }
        }

        override fun getJSMainModuleName(): String = "index"

        override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

        override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
        override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
      }

  override val reactHost: ReactHost
    get() = getDefaultReactHost(applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()
    loadReactNative(this)
  }

  override fun onTrimMemory(level: Int) {
    super.onTrimMemory(level)
    try {
      if (Fresco.hasBeenInitialized()) {
        Fresco.getImagePipeline().clearMemoryCaches()
      }
    } catch (_: Throwable) {}
  }

  override fun onLowMemory() {
    super.onLowMemory()
    try {
      if (Fresco.hasBeenInitialized()) {
        Fresco.getImagePipeline().clearMemoryCaches()
      }
    } catch (_: Throwable) {}
  }
}

