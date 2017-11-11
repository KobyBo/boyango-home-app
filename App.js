import React from 'react';
import { StyleSheet, Text, Image, View, PermissionsAndroid } from 'react-native';
import {GoogleSignin, GoogleSigninButton} from 'react-native-google-signin';
import Pushy from 'pushy-react-native';

const config = {
	google: {
		webClientId: '376043488564-fkkqqdac2echpegcs56somp1rbm2audi.apps.googleusercontent.com'
	}
}

/**
 * 
 * 
 * @export
 * @class App
 * @extends {React.Component}
 */
export default class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isLoading: true,
			user: null
		};
	}

	/**
	 * 
	 * 
	 * @memberof App
	 */
	componentDidMount() {
		(async () => {
			await this.__initializeGoogleSignin();
			await this.__initPushy();
		})().then(() => {
			console.log('Initialized');
			this.setState({isLoading: false});
		});
	}
 
	/**
	 * 
	 * 
	 * @returns 
	 * @memberof App
	 */
	render() {
		if (this.state.isLoading) {
			return (
				<View style={styles.container}>
					<Text style={styles.loading}>טוען...</Text>
				</View>)
			;
		}

		if (!this.state.user) {
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

		console.log(this.state.user.photo);
		return (
			<View style={styles.container}>
				<Text style={styles.welcome}>ברוכים הבאים</Text>
				<Image 
					source={{uri: this.state.user.photo}}
					style={{width: 128, height: 128, borderRadius:100}} />
				<Text style={styles.userName}>{this.state.user.name}</Text>
			</View>
		);
	}

	/**
	 * Initializes pushy notification service
	 * 
	 * @memberof App
	 */
	async __initPushy() {
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
	}

	/**
	 * Initializes Google signin and checks if we already have a logged on user
	 * 
	 * @memberof App
	 */
	async __initializeGoogleSignin() {
		try {
			console.log('Setting up google signin...');
			await GoogleSignin.hasPlayServices({ autoResolve: true });
			await GoogleSignin.configure({
				webClientId: config.google.webClientId,
				offlineAccess: false
			});

			console.log('Checking for a logged on user...');
			const user = await GoogleSignin.currentUserAsync();
			if (user) {
				console.log(`Found a logged on user: ${JSON.stringify(user, null, 4)}`);
      			this.setState({user: user});
			} else {
				console.log('User is not logged in');
			}
		}
		catch (err) {
			console.log('Play services error', err.code, err.message);
		}
	}

	/**
	 * Performs Google signin
	 * 
	 * @memberof App
	 */
	__signIn() {
		GoogleSignin.signIn()
			.then((user) => {
				console.log(`Logged on user: ${JSON.stringify(user, null, 4)}`);
				this.setState({ user: user });
			})
			.catch((err) => {
				console.error('Failed to sign in', err);
			})
			.done();
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
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
		fontSize: 36
	},
});
