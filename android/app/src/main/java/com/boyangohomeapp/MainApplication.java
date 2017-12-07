package com.boyango.homeapp;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import io.invertase.firebase.RNFirebasePackage;
import io.invertase.firebase.auth.RNFirebaseAuthPackage;
import io.invertase.firebase.firestore.RNFirebaseFirestorePackage;
import co.apptailor.googlesignin.RNGoogleSigninPackage;

import com.microsoft.codepush.react.CodePush;
import me.pushy.sdk.react.PushyPackage;
import com.BV.LinearGradient.LinearGradientPackage;
import com.zmxv.RNSound.RNSoundPackage;

import java.util.Arrays;
import java.util.List;

import com.boyango.homeapp.applauncher.AppLauncherPackage;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {

    @Override
    protected String getJSBundleFile() {
        return CodePush.getJSBundleFile();
    }
    
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
          new PushyPackage(),
          new RNFirebasePackage(),
          new RNFirebaseAuthPackage(),
          new RNGoogleSigninPackage(),
          new RNFirebaseFirestorePackage(),
          new LinearGradientPackage(),
          new CodePush("pbTsASzwRYpN_TYpV9bSXWEepkve7768990f-7a53-4f44-a046-c7343a42f550", MainApplication.this, BuildConfig.DEBUG),
          new AppLauncherPackage(),
          new RNSoundPackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
