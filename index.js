import { AppRegistry } from 'react-native';
import App from './App';
import Pushy from 'pushy-react-native';

// Handle push notifications
Pushy.setNotificationListener(async (data) => {
	// Print notification payload data
	console.log('Received notification: ' + JSON.stringify(data));

	// Notification title
	let notificationTitle = 'Pushy';

	// Attempt to extract the "message" property from the payload: {"message":"Hello World!"}
	let notificationText = data.message || 'Test notification';

	// Display basic system notification
	Pushy.notify(notificationTitle, notificationText);
});

AppRegistry.registerComponent('BoyangoHomeApp', () => App);
