import React from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Image, Alert } from 'react-native';
import * as firebase from 'firebase'

export default class loginPage extends React.Component{
    constructor(){
        super();
        this.state={
            emailId: '',
            password: ''
        };
    }

    login = async(email, password) => {
        if(email && password){
            try{
                const response = await firebase.auth().signInWithEmailAndPassword(email, password);
                if(response){
                    this.props.navigation.navigate('transaction');
                }
            }
            catch(error){
                switch(error.code){
                    case 'auth/user-not-found': Alert.alert("User doesn't exist");
                        console.log("doesn't exist");
                        break;
                    case 'auth/invalid-email': Alert.alert("Incorect email/password");
                        console.log("Incorect email/password");
                        break; 
                }
            }
        }
        else{
            Alert.alert("Enter email/password");
        }
    }  

    render(){
        return(
            <KeyboardAvoidingView style = {{alignItems: 'center', marginTop: 20}}>
                <View>
                    <Image source = {require("../assets/booklogo.jpg")}
                    style = {{width: 200,height: 200}}/>
                    <Text style = {{textAlign:  'center', fontSize: 30}}>Login</Text>
                </View>
                <View>
                    <TextInput style = {styles.loginBox}
                    placeholder = "abc@email.com"
                    keyboardType = 'email-address'
                    onChangeText = {(text)=>{
                        this.setState({
                            emailId: text
                        });
                    }}/>

                    <TextInput style = {styles.loginBox}
                    placeholder = "password123"
                    secureTextEntry = {true}
                    onChangeText = {(text)=>{
                        this.setState({
                            password: text
                        });
                    }}/>
                </View>
                <View>
                    <TouchableOpacity style = {{height: 30, width: 90, borderWidth: 1, marginTop: 20, paddingTop: 5}}>
                        <Text style = {{textAlign: 'center'}} onPress = {()=>{
                            this.login(this.state.emailId, this.state.password);
                        }}>Login</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        );
    }
}

const styles = StyleSheet.create({
    loginBox: {
        width: 300,
        height: 40,
        borderWidth: 1.5,
        fontSize: 20,
        margin: 10,
        paddingLeft: 10
    }
})