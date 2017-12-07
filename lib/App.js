import React from 'react';
import { StyleSheet, Text, Image, Button, View, PermissionsAndroid, Vibration, NativeModules } from 'react-native';
import firebase from 'react-native-firebase';
import { GoogleSignin, GoogleSigninButton } from 'react-native-google-signin';
import Pushy from 'pushy-react-native';
import codePush from "react-native-code-push";
import LinearGradient from 'react-native-linear-gradient';
import Sound from 'react-native-sound';

import config from './config';

const appState = {
	Loading: 0,
	LoggedOut: 1,
	Authenticating: 2,
	Ready: 3
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: 'center',
	},
	notificationContainer: {
		flex: 1,
		backgroundColor: '#ff0000',
		alignItems: 'center',
		justifyContent: 'center',
	},
	welcome: {
		fontSize: 36,
		margin: 30,
	},
	userName: {
		fontSize: 28,
	},
	loading: {
		fontSize: 36,
	},
	notificationMessage: {
		fontSize: 36,
		color: '#ffffff',
	},
});

const notificationGradientColors = ['#005C97', '#005C97'];
const notificationButtonColor = '#001D61'

/**
 * 
 * 
 * @export
 * @class App
 * @extends {React.Component}
 */
class App extends React.Component {
	/**
	 * Creates an instance of App.
	 * @param {any} props 
	 * @memberof App
	 */
	constructor(props) {
		super(props);
		this.state = {
			appState: appState.Loading,
			user: null,
			userSettings: null,
			pendingNotification: props.notificationMessage,
		};

		this.__renderers = {
			[appState.Loading]: this.__renderLoading.bind(this),
			[appState.LoggedOut]: this.__renderLoggedOut.bind(this),
			[appState.Authenticating]: this.__renderAuthenticating.bind(this),
			[appState.Ready]: this.__renderMainUI.bind(this),
		}

		this.__handleNotificationButtonPress = this.__handleNotificationButtonPress.bind(this);
		this.__notificationSound = null;
	}

	/**
	 * 
	 * 
	 * @memberof App
	 */
	componentDidMount() {
		this.__initPushy().then(() => {
			this.__firebaseAuthObserverUnsubscribe = firebase.auth().onAuthStateChanged(this.__handleFirebaseAuthChange.bind(this));
		});

		if (this.state.pendingNotification) {
			Vibration.vibrate(config.notification.vibrationPattern, true);

			// Enable sound playback in silence mode
			Sound.setCategory('Playback');

			// Play the notification sound
			this.__notificationSound = new Sound(config.notification.soundFile, (error) => {
				if (error) {
					console.log('Failed to load the notification sound:', error);
					return;
				}

				this.__notificationSound.setNumberOfLoops(-1).play((success) => {
					if (success) {
						console.log("YAY");
					} else {
						console.log("Failed to play notification sound (audio decoding error)");
						this.__notificationSound.reset();
					}
				});
			  });
		}
	}

	componentWillUnmount() {
		if (this.__firebaseAuthObserverUnsubscribe) {
			this.__firebaseAuthObserverUnsubscribe();
		}
	}
 
	/**
	 * 
	 * 
	 * @returns 
	 * @memberof App
	 */
	render() {
		if (this.state.pendingNotification) {
			return this.__renderNotification();
		}

		return this.__renderers[this.state.appState]();
	}

	/**
	 * Initializes pushy notification service
	 * 
	 * @memberof App
	 */
	async __initPushy() {
		try {
			console.log("PUSHY: " + (await Pushy.isRegistered()));

			console.log('Initializing pushy...');

			// Start the Pushy service
			Pushy.listen();

			// Check whether the user has granted the app the WRITE_EXTERNAL_STORAGE permission (needed for pushy)
			if (!(await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE))) {
				// Request the WRITE_EXTERNAL_STORAGE permission so that the Pushy SDK will be able to persist the device token in the external storage
				if (PermissionsAndroid.RESULTS.GRANTED !== await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE)) {
					// TODO
					console.log('User denied WRITE_EXTERNAL_STORAGE permission');
				}
			}

			// Register the device for push notifications
			const deviceToken = Pushy.register();
			console.log('Pushy is listening');

			if (!(await Pushy.isRegistered())) {
				console.log('Pushy didn\'t register properly');
				return;
			}
		}
		catch (err) {
			console.log('Pushy error:', err);
		}
	}

	/**
	 * firebase.auth.onAuthStateChanged event handler
	 * 
	 * @param {firebase.auth.User} user 
	 * @memberof App
	 */
	__handleFirebaseAuthChange(user) {
		if (user) {
			if (appState.Ready !== this.state.appState) {
				this.__handleUserLoggedIn(user);
			}
		} else {
			if (appState.LoggedOut !== this.state.appState) {
				this.setState({ appState: appState.LoggedOut });
			}
		}
	}

	/**
	 * Handle firebase user log in (invoked by our firebase.auth.onAuthStateChanged when we have a user)
	 * 
	 * @param {firebase.auth.User} user 
	 * @memberof App
	 */
	async __handleUserLoggedIn(user) {
		const userSettings = (await firebase.firestore().collection("users").doc(user.uid).get()).data();
		console.log(userSettings);
		
		for (topic of userSettings.notificationTopics) {
			await Pushy.subscribe(topic);
			console.log(`Subscribed to ${topic} successfully`);
		}
			
		this.setState({ 
			appState: appState.Ready,
			user,
			userSettings
		});
	}

	/**
	 * Signs in to Google and the Firebase (using the Google account) 
	 * 
	 * @memberof App
	 */
	async __signIn() {
		try {
			this.setState({ appState: appState.Authenticating });

			// Setup google signin
			console.log('Setting up google signin...');
			await GoogleSignin.hasPlayServices({ autoResolve: true });
			await GoogleSignin.configure({
				webClientId: config.google.webClientId,
				offlineAccess: false
			});

			// Sign in to google
			const googleUser = await GoogleSignin.signIn();
			console.log(`Logged on google user: ${JSON.stringify(googleUser, null, 4)}`);

			// Create a new firebase credential with the user's token
			console.log("Logging in to Firebase...");
			const credential = firebase.auth.GoogleAuthProvider.credential(googleUser.idToken, googleUser.accessToken);
			
			// Finally, login to firebase with the user's credentials
			const user = await firebase.auth().signInWithCredential(credential);
			console.log(`Logged on user: ${JSON.stringify(user, null, 4)}`);
	
			this.setState({ 
				user: user,
				appState: appState.Ready
			});
		}
		catch (err) {
			console.log('Failed to log in', err.code, err.message);
		}
	}

	/**
	 * 
	 * 
	 * @returns 
	 * @memberof App
	 */
	__renderLoading() {
		return (
			<View style={styles.container}>
				<Text style={styles.loading}>טוען...</Text>
			</View>
		);
	}

	/**
	 * 
	 * 
	 * @returns 
	 * @memberof App
	 */
	__renderLoggedOut() {
		return (
			<View style={styles.container}>
				<Text style={styles.welcome}>ברוכים הבאים</Text>
				<GoogleSigninButton 
					style={{ width: 230, height: 48 }}
					color={GoogleSigninButton.Color.Light}
					size={GoogleSigninButton.Size.Standard}
					onPress={() => { this.__signIn(); }} />
			</View>
		);
	}

	/**
	 * 
	 * 
	 * @returns 
	 * @memberof App
	 */
	__renderAuthenticating() {
		return (
			<View style={styles.container}>
				<Text style={styles.loading}>מתחבר...</Text>
			</View>
		);
	}

	/**
	 * 
	 * 
	 * @returns 
	 * @memberof App
	 */
	__renderMainUI() {
		return (
			<View style={styles.container}>
				<Text style={styles.welcome}>ברוכים הבאים</Text>
				<Image 
					source={{uri: this.state.user.photoURL}}
					style={{width: 128, height: 128, borderRadius:100}} 
				/>
				<Text style={styles.userName}>{this.state.user.displayName}</Text>
			</View>
		);
	}

	/**
	 * 
	 * 
	 * @memberof App
	 */
	__renderNotification() {
		return (
			<LinearGradient colors={notificationGradientColors} style={styles.notificationContainer}>
				<Text style={styles.notificationMessage}>{this.props.notificationMessage}</Text>
				<Button
					onPress={this.__handleNotificationButtonPress}
					title="כבה"
					style={styles.notificationButton}
				/>
			</LinearGradient>
		);
	}

	/**
	 * 
	 * 
	 * @memberof App
	 */
	__handleNotificationButtonPress() {
		Vibration.cancel();
		NativeModules.AppLauncher.removeSystemNotification();

		if (this.__notificationSound) {
			this.__notificationSound.stop(() => {
				this.__notificationSound.release();
				this.__notificationSound = null;
			});
		}

		this.setState({ pendingNotification: null });
	}
}

App = codePush(App);
export default App;
