import React, { Component } from 'react';
import { SafeAreaView, Text, TouchableOpacity, View, StyleSheet, Image, Linking, Alert } from 'react-native';
import PropTypes from 'prop-types';
import RevealPrivateCredential from '../RevealPrivateCredential';
import Logger from '../../../util/Logger';
import { colors, fontStyles } from '../../../styles/common';
import { ScrollView } from 'react-native-gesture-handler';
import Clipboard from '@react-native-community/clipboard';
import { strings } from '../../../../locales/i18n';
import Icon from 'react-native-vector-icons/FontAwesome';
import ElevatedView from 'react-native-elevated-view';

// eslint-disable-next-line import/no-commonjs
const metamaskErrorImage = require('../../../images/metamask-error.png');

const styles = StyleSheet.create({
	container: {
		flex: 1
	},
	content: {
		paddingHorizontal: 24,
		flex: 1
	},
	header: {
		alignItems: 'center'
	},
	errorImage: {
		width: 50,
		height: 50,
		marginTop: 24
	},
	title: {
		color: colors.black,
		fontSize: 24,
		lineHeight: 34,
		...fontStyles.bold
	},
	subtitle: {
		fontSize: 14,
		lineHeight: 20,
		color: colors.grey500,
		marginTop: 8,
		textAlign: 'center',
		...fontStyles.normal
	},
	errorContainer: {
		backgroundColor: colors.red000,
		borderRadius: 8,
		marginTop: 24
	},
	error: {
		color: colors.black,
		padding: 8,
		fontSize: 14,
		lineHeight: 20,
		...fontStyles.normal
	},
	button: {
		marginTop: 24,
		borderColor: colors.blue,
		borderWidth: 1,
		borderRadius: 50,
		padding: 12,
		paddingHorizontal: 34
	},
	buttonText: {
		color: colors.blue,
		textAlign: 'center',
		...fontStyles.normal,
		fontWeight: '500'
	},
	textContainer: {
		marginTop: 24
	},
	text: {
		color: colors.black,
		fontSize: 14,
		lineHeight: 20,
		...fontStyles.normal
	},
	link: {
		color: colors.blue
	},
	reportTextContainer: {
		paddingLeft: 14,
		marginTop: 16,
		marginBottom: 24
	},
	reportStep: {
		marginTop: 14
	},
	backupAlertWrapper: {
		flex: 1,
		position: 'absolute'
	}
});

const Fallback = props => (
	<ElevatedView elevation={999999} style={[styles.backupAlertWrapper]}>
		<SafeAreaView style={styles.container}>
			<ScrollView style={styles.content}>
				<View style={styles.header}>
					<Image source={metamaskErrorImage} style={styles.errorImage} />
					<Text style={styles.title}>{strings('error_screen.title')}</Text>
					<Text style={styles.subtitle}>{strings('error_screen.subtitle')}</Text>
				</View>
				<View style={styles.errorContainer}>
					<Text style={styles.error}>{props.errorMessage}</Text>
				</View>
				<View style={styles.header}>
					<TouchableOpacity style={styles.button} onPress={props.resetError}>
						<Text style={styles.buttonText}>
							<Icon name="refresh" size={15} />
							{'  '}
							{strings('error_screen.try_again_button')}
						</Text>
					</TouchableOpacity>
				</View>
				<View style={styles.textContainer}>
					<Text style={styles.text}>
						<Text>{strings('error_screen.submit_ticket_1')}</Text>
					</Text>
					<View style={styles.reportTextContainer}>
						<Text style={styles.text}>
							<Icon name="mobile-phone" size={20} />
							{'  '}
							{strings('error_screen.submit_ticket_2')}
						</Text>

						<Text style={[styles.reportStep, styles.text]}>
							<Icon name="copy" size={14} />
							{'  '}
							<Text onPress={props.copyErrorToClipboard} style={styles.link}>
								{strings('error_screen.submit_ticket_3')}
							</Text>{' '}
							{strings('error_screen.submit_ticket_4')}
						</Text>

						<Text style={[styles.reportStep, styles.text]}>
							<Icon name="send-o" size={14} />
							{'  '}
							{strings('error_screen.submit_ticket_5')}{' '}
							<Text onPress={props.openTicket} style={styles.link}>
								{strings('error_screen.submit_ticket_6')}
							</Text>{' '}
							{strings('error_screen.submit_ticket_7')}
						</Text>
					</View>
					<Text style={styles.text}>
						{strings('error_screen.save_seedphrase_1')}{' '}
						<Text onPress={props.showExportSeedphrase} style={styles.link}>
							{strings('error_screen.save_seedphrase_2')}
						</Text>{' '}
						{strings('error_screen.save_seedphrase_3')}
					</Text>
				</View>
			</ScrollView>
		</SafeAreaView>
	</ElevatedView>
);

Fallback.propTypes = {
	errorMessage: PropTypes.string,
	resetError: PropTypes.func,
	showExportSeedphrase: PropTypes.func,
	copyErrorToClipboard: PropTypes.func,
	openTicket: PropTypes.func
};

class ErrorBoundary extends Component {
	state = { error: null };

	static propTypes = {
		children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
		view: PropTypes.string.isRequired
	};

	static getDerivedStateFromError(error) {
		return { error };
	}

	componentDidCatch(error, errorInfo) {
		Logger.error(error, { View: this.props.view, ...errorInfo });
	}

	resetError = () => {
		this.setState({ error: null });
	};

	showExportSeedphrase = () => {
		this.setState({ backupSeedphrase: true });
	};

	cancelExportSeedphrase = () => {
		this.setState({ backupSeedphrase: false });
	};

	getErrorMessage = () => `View: ${this.props.view}\n${this.state.error.toString()}`;

	copyErrorToClipboard = async () => {
		await Clipboard.setString(this.getErrorMessage());
		Alert.alert(strings('error_screen.copied_clipboard'), '', [{ text: strings('error_screen.ok') }], {
			cancelable: true
		});
	};

	openTicket = () => {
		const url = 'https://metamask.zendesk.com/hc/en-us/requests/new';
		Linking.openURL(url);
	};

	render() {
		return this.state.backupSeedphrase ? (
			<RevealPrivateCredential privateCredentialName={'seed_phrase'} cancel={this.cancelExportSeedphrase} />
		) : this.state.error ? (
			<Fallback
				errorMessage={this.getErrorMessage()}
				resetError={this.resetError}
				showExportSeedphrase={this.showExportSeedphrase}
				copyErrorToClipboard={this.copyErrorToClipboard}
				openTicket={this.openTicket}
			/>
		) : (
			this.props.children
		);
	}
}

export default ErrorBoundary;
