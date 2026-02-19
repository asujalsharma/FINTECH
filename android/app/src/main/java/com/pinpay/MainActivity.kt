package com.ClubTYL

import android.os.Bundle
import android.util.Log
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled

class MainActivity : ReactActivity() {

    override fun getMainComponentName(): String = "ClubTYL"

    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Generate App Hash
        val helper = AppSignatureHelper(this)
        val hashes = helper.getAppSignatures()

        Log.e("APP_HASH", "Your App Hashes: $hashes")
    }
}
