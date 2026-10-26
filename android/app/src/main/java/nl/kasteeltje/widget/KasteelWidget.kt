package nl.kasteeltje.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.BroadcastReceiver
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.view.View
import android.widget.RemoteViews
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class KasteelWidget : AppWidgetProvider() {

    override fun onUpdate(context: Context, manager: AppWidgetManager, ids: IntArray) {
        refresh(context, manager, ids, goAsync())
    }

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == ACTION_REFRESH) {
            val manager = AppWidgetManager.getInstance(context)
            val ids = manager.getAppWidgetIds(ComponentName(context, KasteelWidget::class.java))
            refresh(context, manager, ids, goAsync())
        } else {
            super.onReceive(context, intent)
        }
    }

    private fun refresh(
        context: Context,
        manager: AppWidgetManager,
        ids: IntArray,
        pending: BroadcastReceiver.PendingResult,
    ) {
        Thread {
            try {
                val prefs = context.getSharedPreferences("kasteel", Context.MODE_PRIVATE)
                var offline = false
                val json: JSONObject? = try {
                    val text = download()
                    prefs.edit().putString("last", text).apply()
                    JSONObject(text)
                } catch (e: Exception) {
                    offline = true
                    prefs.getString("last", null)?.let { JSONObject(it) }
                }
                val views = render(context, json, offline)
                for (id in ids) manager.updateAppWidget(id, views)
            } finally {
                pending.finish()
            }
        }.start()
    }

    private fun download(): String {
        val conn = URL("$BASE_URL/api/widget").openConnection() as HttpURLConnection
        conn.connectTimeout = 10_000
        conn.readTimeout = 10_000
        try {
            if (conn.responseCode != 200) throw IllegalStateException("HTTP ${conn.responseCode}")
            return conn.inputStream.bufferedReader().use { it.readText() }
        } finally {
            conn.disconnect()
        }
    }

    private fun render(context: Context, json: JSONObject?, offline: Boolean): RemoteViews {
        val views = RemoteViews(context.packageName, R.layout.widget)
        val date = SimpleDateFormat("EEEE d MMMM", Locale.forLanguageTag("nl-NL")).format(Date())

        // Tikken op de widget opent de webapp, het icoontje vernieuwt.
        val open = PendingIntent.getActivity(
            context, 0, Intent(Intent.ACTION_VIEW, Uri.parse(BASE_URL)),
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
        )
        val refresh = PendingIntent.getBroadcast(
            context, 1,
            Intent(context, KasteelWidget::class.java).setAction(ACTION_REFRESH),
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
        )
        views.setOnClickPendingIntent(R.id.root, open)
        views.setOnClickPendingIntent(R.id.btn_refresh, refresh)

        if (json == null) {
            views.setTextViewText(R.id.title, "Geen verbinding")
            views.setTextViewText(R.id.subtitle, "Tik op ↻ om het opnieuw te proberen")
            for (i in 0 until MAX_ROWS) views.setViewVisibility(ROWS[i], View.GONE)
            views.setViewVisibility(R.id.more, View.GONE)
            return views
        }

        val items = json.getJSONArray("items")
        val count = items.length()

        views.setTextViewText(
            R.id.title,
            when (count) {
                0 -> "Alles gedaan!"
                1 -> "1 taak te doen"
                else -> "$count taken te doen"
            },
        )
        views.setTextViewText(
            R.id.subtitle,
            if (count == 0) "Het kasteel glimt." else date + if (offline) " · offline" else "",
        )

        for (i in 0 until MAX_ROWS) {
            if (i < count) {
                val item = items.getJSONObject(i)
                views.setViewVisibility(ROWS[i], View.VISIBLE)
                views.setTextViewText(TITLES[i], item.getString("title"))
                views.setTextViewText(
                    BADGES[i],
                    if (item.optBoolean("overdue")) "te laat" else item.optString("category"),
                )
                views.setInt(ROWS[i], "setBackgroundResource", pillFor(item.optString("color")))
            } else {
                views.setViewVisibility(ROWS[i], View.GONE)
            }
        }

        if (count > MAX_ROWS) {
            views.setViewVisibility(R.id.more, View.VISIBLE)
            views.setTextViewText(R.id.more, "+${count - MAX_ROWS} meer")
        } else {
            views.setViewVisibility(R.id.more, View.GONE)
        }
        return views
    }

    private fun pillFor(hex: String): Int = when (hex.uppercase(Locale.ROOT)) {
        "#F4B8DC" -> R.drawable.pill_rose
        "#A8BC82" -> R.drawable.pill_moss
        "#B8C4F0" -> R.drawable.pill_peri
        "#F28B82" -> R.drawable.pill_coral
        "#A9DDD3" -> R.drawable.pill_mint
        "#F8C9A0" -> R.drawable.pill_peach
        else -> R.drawable.pill_yellow
    }

    companion object {
        const val BASE_URL = "https://het-kasteeltje.vercel.app"
        const val ACTION_REFRESH = "nl.kasteeltje.widget.REFRESH"
        private const val MAX_ROWS = 5
        private val ROWS = intArrayOf(R.id.row1, R.id.row2, R.id.row3, R.id.row4, R.id.row5)
        private val TITLES = intArrayOf(R.id.row1_title, R.id.row2_title, R.id.row3_title, R.id.row4_title, R.id.row5_title)
        private val BADGES = intArrayOf(R.id.row1_badge, R.id.row2_badge, R.id.row3_badge, R.id.row4_badge, R.id.row5_badge)
    }
}
