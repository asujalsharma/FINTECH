package com.ClubTYL

import android.content.Context
import android.content.pm.PackageManager
import android.util.Base64
import android.util.Log
import java.security.MessageDigest

class AppSignatureHelper(private val context: Context) {

    companion object {
        private const val TAG = "APP_HASH"
        private const val HASH_TYPE = "SHA-256"
        private const val NUM_HASHED_BYTES = 9
    }

    fun getAppSignatures(): ArrayList<String> {
        val appCodes = ArrayList<String>()

        try {
            val packageInfo = context.packageManager.getPackageInfo(
                context.packageName,
                PackageManager.GET_SIGNATURES
            )

            val signatures = packageInfo.signatures ?: return appCodes

            for (signature in signatures) {
                val hash = hash(context.packageName, signature.toCharsString())
                if (hash != null) appCodes.add(hash)
            }

        } catch (e: Exception) {
            Log.e(TAG, "Error retrieving hashes", e)
        }

        return appCodes
    }

    private fun hash(packageName: String, signature: String): String? {
        val appInfo = "$packageName $signature"

        return try {
            val digest = MessageDigest.getInstance(HASH_TYPE)
            digest.update(appInfo.toByteArray(Charsets.UTF_8))

            val hashSignature = digest.digest()
            val truncated = hashSignature.copyOfRange(0, NUM_HASHED_BYTES)

            Base64.encodeToString(truncated, Base64.NO_PADDING or Base64.NO_WRAP).also {
                Log.e(TAG, "Generated Hash: $it")
            }

        } catch (e: Exception) {
            Log.e(TAG, "Hash error", e)
            null
        }
    }
}
