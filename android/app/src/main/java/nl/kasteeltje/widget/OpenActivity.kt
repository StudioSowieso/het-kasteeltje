package nl.kasteeltje.widget

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Bundle

class OpenActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(KasteelWidget.BASE_URL)))
        finish()
    }
}
