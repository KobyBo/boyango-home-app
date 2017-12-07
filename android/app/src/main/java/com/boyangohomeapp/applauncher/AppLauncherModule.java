package com.boyango.homeapp.applauncher;

import android.graphics.Color;
import android.content.Intent;
import android.content.Context;
import android.app.PendingIntent;
import android.app.NotificationManager;
import android.app.Notification;
import android.support.v4.app.NotificationCompat;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class AppLauncherModule extends ReactContextBaseJavaModule {
	private static final int NOTIFICATION_ID = 0;
	private ReactApplicationContext mReactContext;

	public AppLauncherModule(ReactApplicationContext reactContext) {
		super(reactContext);
		mReactContext = reactContext;
	}

	@Override public String getName() {
		return "AppLauncher";
	}

	@ReactMethod
	public void launchWithNotification(String title, String message, String ledColor, int ledOnMs, int ledOffMs) {
		String packageName = mReactContext.getPackageName();

		// Init an Intent for launching our app
		Intent launchIntent = mReactContext.getPackageManager().getLaunchIntentForPackage(packageName);
		launchIntent.addCategory(Intent.CATEGORY_LAUNCHER);
		launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
		launchIntent.putExtra("notificationTitle", title);
		launchIntent.putExtra("notificationMessage", message);

		// Create a system notification
		NotificationCompat.Builder builder =
			new NotificationCompat.Builder(mReactContext)
			.setContentTitle(title)
			.setContentText(message)
			.setDefaults(Notification.FLAG_SHOW_LIGHTS)
			.setLights(Color.parseColor(ledColor), ledOnMs, ledOffMs)
			.setSmallIcon(mReactContext.getResources().getIdentifier("ic_launcher", "mipmap", packageName));

		NotificationManager manager = (NotificationManager)mReactContext.getSystemService(Context.NOTIFICATION_SERVICE);
		manager.notify(NOTIFICATION_ID, builder.build());

		// Lanuch the app
		mReactContext.startActivity(launchIntent);
	}

	@ReactMethod
	public void removeSystemNotification() {
		NotificationManager manager = (NotificationManager)mReactContext.getSystemService(Context.NOTIFICATION_SERVICE);
		manager.cancel(NOTIFICATION_ID);
	}
}