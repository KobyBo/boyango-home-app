const config = {
	google: {
		webClientId: '376043488564-fkkqqdac2echpegcs56somp1rbm2audi.apps.googleusercontent.com'
	},
	notification: {
		vibrationPattern: [250, 1000, 250],
		soundFile: require('../resources/notification.wav'),
		led: {
			color: '#ff0000', // Red
			onMs: 1000,
			offMs: 500,
		},
	},
};

export default config;
