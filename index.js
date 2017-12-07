import { AppRegistry, NativeModules } from 'react-native';
import App from './App';
import Pushy from 'pushy-react-native';

const NOTIFICATION_TITLE = 'בוינג\'ו';

// Handle push notifications
Pushy.setNotificationListener(async (data) => {
	console.log('Received notification: ' + JSON.stringify(data));
	//Pushy.notify(NOTIFICATION_TITLE, data.message);
	NativeModules.AppLauncher.launchWithNotification(NOTIFICATION_TITLE, data.message);
});

AppRegistry.registerComponent('BoyangoHomeApp', () => App);
