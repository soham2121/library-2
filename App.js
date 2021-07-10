//import { StatusBar } from 'expo-status-bar';
import React from 'react';
//import { render } from 'react-dom';
import { StyleSheet, Text, View, Image } from 'react-native';
import Register from "./screens/BookTransactionScreen";
import searchScreen from "./screens/SearchScreen";
import loginPage from "./screens/LoginPage";
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createBottomTabNavigator } from 'react-navigation-tabs';

export default class App extends React.Component{
  render(){
    return <AppContainer/>;
  }
}

const TabNavigator = createBottomTabNavigator({
  transaction: {screen: Register},
  search: {screen: searchScreen},
},
{defaultNavigationOptions : ({navigation}) => ({
  tabBarIcon: () => {
    const routeName = navigation.state.routeName;
    if(routeName === "transaction"){
      return(
        <Image source = {require("./assets/book.png")}
        style = {{width: 25, height: 25}}/>
      )
    }
    else if(routeName === "search"){
      return(
        <Image source = {require("./assets/searchingbook.png")}
        style = {{width: 25, height: 25}}/>
      )
    }
  }
}
)
}
);

const switchNavigator = createSwitchNavigator({
  loginPage: {screen: loginPage},
  TabNavigator: {screen: TabNavigator}
});

const AppContainer = createAppContainer(switchNavigator);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  }
});
