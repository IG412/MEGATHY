
import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  AsyncStorage
} from 'react-native';

// Navigation
import { DrawerNavigator, DrawerItems, StackNavigator } from 'react-navigation';

// Redux
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as actions from '../AppRedux/Actions/actions';

// Screens
import LoginScreen from '../Containers/LoginScreens/LoginScreen'
import SideMenu from '../Containers/MenuScreens/SideMenu'

import FirstScreen from '../Containers/MenuScreens/FirstSreen'
import SecondScreen from '../Containers/MenuScreens/SecondScreen'

// Constant
import constant from '../Helper/Constants'


// First Screen With Child Element
const FirstScreenNav = StackNavigator({
	FirstScreen: { screen: FirstScreen },
}, {
	headerMode:'screen',
})

// Second Screen With Child Element
const SecondScreenNav = StackNavigator({
	SecondScreen: { screen: SecondScreen, },
}, {
	headerMode:'screen',
})

// Side Menu With Menu Items
const AppDrawer = DrawerNavigator({
	FirstScreen: { screen: FirstScreenNav },
	SecondScreen: { screen: SecondScreenNav},
	}, {
	drawerWidth: 300,
	navigationOptions: {
		gesturesEnabled: false,
		headerStyle: {
			backgroundColor: 'yellow'
		}	
	},
	headerMode: 'screen',
	contentComponent: (props) => (
		// <View style={{flex:1, backgroundColor:'green'}}>
		<ScrollView >
			<View style={styles.maincontainer}>
				<View style={styles.headercontainer}>
				<Image style={styles.userimage} source={require('../Resources/Images/Recurso.png')} />
				<Text style={styles.headerTitle}> Android Studio </Text>
				<Text style={styles.headerSubTitle}> androidstudio@gmail.com </Text>
			</View>

			<View style={{flex:1, backgroundColor:'white'}}>
				<DrawerItems
					{...props}
					onItemPress = {
						({ route, focused }) =>       
						{    
						  props.onItemPress({ route, focused })
						  console.log("item pressed "+ route.key);
						  if (route.key === 'FirstScreen') {
							// props.getFirstScreenTap()
						  } else if (route.key === 'SecondScreen') {
							// props.getSecondScreenTap()
							// props.getSecondScreenTap()
						  }
						}
						}
					
					getLabel = {(scene) => (
						<View style={styles.rowView}>
							<Image style={styles.menuImage} source={require('../Resources/Images/Recurso.png')} />
							<Text style={styles.menuTitle}>{props.getLabel(scene)}</Text>
						</View>
					)}
				/>
			</View>
			<TouchableOpacity onPress={onPressLogout}>
				<View style={styles.rowView}>
					<Image style={styles.menuImage} source={require('../Resources/Images/Recurso.png')} />
					<Text style={styles.menuTitle}>Logout</Text>
				</View>
			</TouchableOpacity>
			</View>
		  </ScrollView>
		// </View>
		)
  });

// Main Navigation Flow
const App = StackNavigator({
	Home: { screen: AppDrawer },
},{
	headerMode:'none',
	navigationOptions: {
		gesturesEnabled: false,	
		headerStyle: {
			backgroundColor: 'yellow'
		} 
	}
} );


// Mics Methods
export function onPressLogout () {
	console.log ('Logout Pressed')
	constant.emitter.emit(constant.LOGOUT_EVENT, 'ok');
	AsyncStorage.removeItem(constant.LOGIN_STATUS)
	// this.props.onPressLogout()
}

function tapSecondScreen () {
	// this.props.getSecondScreenTap()
}

function mapStateToProps(state, props) {
	return {
	  secondComp: state.dataReducer.secondComp,
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(actions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(App); 

const styles = StyleSheet.create({
	maincontainer: {
		flex:1,
		// marginTop: (Platform.OS == 'ios') ? 20 : 0,
	},
	headercontainer: {
		flex:1,
		height:150,
		backgroundColor: 'green',
	},
	userimage: {
		height:60,
		width:60,
		resizeMode:'contain',
		marginTop:20,
		marginLeft:20,
		borderWidth:1,
		borderRadius: 30,
	},
	headerTitle: {
		fontSize:20,
		fontWeight: 'bold',
		color: 'white',
		marginLeft:20,
		marginTop: 10,
	},
	headerSubTitle: {
		fontSize:15,
		color: 'white',
		marginLeft:20,
	},
	rowView: {
		flexDirection: 'row',
		flex:1,
		// justifyContent: 'center',
		alignItems:'center',
		padding:10
		// marginTop:10
	},
	menuImage: {
		height:30,
		width:30,
		resizeMode:'contain',
		// marginTop:20,
		marginLeft:10,
		borderWidth:1,
		borderRadius: 15,
	},
	menuTitle: {
		fontSize:14,
		fontWeight: '400',
		marginLeft:16,
	},

})