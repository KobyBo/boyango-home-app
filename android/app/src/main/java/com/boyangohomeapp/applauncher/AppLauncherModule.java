package com.boyango.homeapp.applauncher;

import android.content.Intent;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class AppLauncherModule extends ReactContextBaseJavaModule {
	private ReactApplicationContext mReactContext;

	public AppLauncherModule(ReactApplicationContext reactContext) {
		super(reactContext);
		mReactContext = reactContext;
	}

	@Override public String getName() {
		return "AppLauncher";
	}

	@ReactMethod
	public void launchWithNotification(String title, String message) {
		Intent launchIntent = mReactContext.getPackageManager().getLaunchIntentForPackage("com.boyango.homeapp");

		launchIntent.addCategory(Intent.CATEGORY_LAUNCHER);
		launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
		launchIntent.putExtra("notificationTitle", title);
		launchIntent.putExtra("notificationMessage", message);
		
		mReactContext.startActivity(launchIntent);
	}
}