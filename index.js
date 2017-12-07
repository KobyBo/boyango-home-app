import { AppRegistry, NativeModules } from 'react-native';
import Pushy from 'pushy-react-native';

import App from './lib/App';
import config from './lib/config';

const NOTIFICATION_TITLE = 'בוינג\'ו';

// Handle push notifications
Pushy.setNotificationListener(async (data) => {
	console.log('Received notification: ' + JSON.stringify(data));
	
	const led = config.notification.led;
	NativeModules.AppLauncher.launchWithNotification(NOTIFICATION_TITLE, data.message, led.color, led.onMs, led.offMs);
});

AppRegistry.registerComponent('BoyangoHomeApp', () => App);
