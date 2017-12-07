package com.boyango.homeapp;

import android.app.Activity;
import android.os.Bundle;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;

import javax.annotation.Nullable;

public class MainActivity extends ReactActivity {
	/**
	 * Returns the name of the main component registered from JavaScript.
	 * This is used to schedule rendering of the component.
	 */
	@Override
	protected String getMainComponentName() {
		return "BoyangoHomeApp";
	}

	public static class MainActivityDelegate extends ReactActivityDelegate {
		private static final String TITLE_FILED = "notificationTitle";
		private static final String MESSAGE_FILED = "notificationMessage";
		private Bundle mInitialProps = null;
		private final @Nullable Activity mActivity;

		public MainActivityDelegate(Activity activity, String mainComponentName) {
			super(activity, mainComponentName);
			this.mActivity = activity;
		}

		@Override
		protected void onCreate(Bundle savedInstanceState) {
			Bundle bundle = mActivity.getIntent().getExtras();
			if (bundle != null && bundle.containsKey(TITLE_FILED)) {
				mInitialProps = new Bundle();
				mInitialProps.putString(TITLE_FILED, bundle.getString(TITLE_FILED));
				mInitialProps.putString(MESSAGE_FILED, bundle.getString(MESSAGE_FILED));
			}
			super.onCreate(savedInstanceState);
		}

		@Override
		protected Bundle getLaunchOptions() {
			return mInitialProps;
		}
	};

	@Override
	protected ReactActivityDelegate createReactActivityDelegate() {
		return new MainActivityDelegate(this, getMainComponentName());
	}
}
