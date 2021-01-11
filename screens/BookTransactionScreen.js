import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet, KeyboardAvoidingView, TextInput, Image, ToastAndroid, Alert } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as Permissions from 'expo-permissions';
import * as firebase from 'firebase';
import 'firebase/firestore';
import db from '../config';

export default class Register extends React.Component {
    constructor(){
        super();
        this.state = {
            hasCameraPermissions: null,
            scanned: false,
            scannedData: '',
            buttonState: 'normal',
            scannedBookId: '',
            scannedStudentId: '',
            transactionMessage: ''
        }
    }

    getCameraPermissions = async()=>{
        const {status} = await Permissions.askAsync(Permissions.CAMERA);
        this.setState({
            hasCameraPermissions: status === "granted",
            buttonState: "clicked",
            scanned: false
        });
    }

    handleTransaction = async() => {
        var transactionType = await this.checkBookEligibility();
        console.log("Tran type "+ transactionType)
        if(!transactionType){
            Alert.alert("The book doesn't exists in the library database");
            this.setState({
                scannedStudentId: "",
                scannedBookId: ""
            });
        }      
        else if(transactionType === "Issue"){
            var isStudentEligible = await this.checkStudentEligibilityForBookIssue();
            if(isStudentEligible){
                this.initiateBookIssue();
                Alert.alert("Book issued to the student");
            }
        }  
        else{
            var isStudentEligible = await this.checkStudentEligibilityForBookReturn();
            if(isStudentEligible){
                this.initiateBookReturn();
                Alert.alert("Book returned to the library");
            }
        }
    }

    checkBookEligibility = async() => {
        const bookRef = await db.collection("books").where("bookId", "==", this.state.scannedBookId).get();
        var transactionType = "";
        if(bookRef.docs.length == 0){
            transactionType = false;
        }
        else{
            bookRef.docs.map((doc)=>{
                var book = doc.data();
                if(book.bookAvailability){
                    transactionType = "Issue";
                }
                else{
                    transactionType = "Return";
                }
            })
        }
        return transactionType;
    }

    checkStudentEligibilityForBookIssue = async() => {
        console.log("Student id scanned " + this.state.scannedStudentId)
        const studentRef = await db.collection("students").where("studentId", "==", this.state.scannedStudentId).get();
        var isStudentEligible = "";
        if(studentRef.docs.length == 0){
            this.setState({
                scannedStudentId: '',
                scannedBookId: ''
            });
            isStudentEligible = false;
            Alert.alert("The student id doesn't exist in the database");
        }
        else{
            studentRef.docs.map((doc)=>{
                var student = doc.data();
                console.log("Resp docs ck bk issue " + student)
                console.log("stdid " + student.studentId)
                console.log("Number bks ck bk issue" + student.numberOfBookIssued )
                if(student.numberOfBookIssued < 2){
                    isStudentEligible = true;
                }
                else{
                    isStudentEligible = false;
                    Alert.alert("The student has already issued 2 books");
                    this.setState({
                        scannedStudentId: '',
                        scannedBookId: ''
                    });
                }
            });
        }
        return isStudentEligible;
    }
    
    checkStudentEligibilityForBookReturn = async() => {
        const transactionRef = await db.collection("transaction").where("bookId", "==", this.state.scannedBookId).limit(1).get();
        var isStudentEligible = "";
            transactionRef.docs.map((doc)=>{
                var lastBookTransaction = doc.data();
                if(lastBookTransaction.studentId === this.state.scannedStudentId){
                    isStudentEligible = true;
                }
                else{
                    isStudentEligible = false;
                    Alert.alert("The book wasn't issued by the student");
                    this.setState({
                        scannedStudentId: '',
                        scannedBookId: ''
                    });
                }
            });
        return isStudentEligible;
    }

    initiateBookIssue = async() => {
        db.collection("transaction").add({
            'studentId': this.state.scannedStudentId,
            'bookId': this.state.scannedBookId,
            'date': firebase.firestore.Timestamp.now().toDate(),
            'transactionType': "Issue"
        })
        db.collection("books").doc(this.state.scannedBookId).update({
            'bookAvailability': false
        })
        db.collection("students").doc(this.state.scannedStudentId).update({
            'numberOfBookIssued': firebase.firestore.FieldValue.increment(1)
        })
    }
   
    initiateBookReturn = async() => {
        db.collection("transaction").add({
            'studentId': this.state.scannedStudentId,
            'bookId': this.state.scannedBookId,
            'date': firebase.firestore.Timestamp.now().toDate(),
            'transactionType': "Returned"
        })
        db.collection("books").doc(this.state.scannedBookId).update({
            'bookAvailability': true
        })
        db.collection("students").doc(this.state.scannedStudentId).update({
            'numberOfBookIssued': firebase.firestore.FieldValue.increment(-1)
        })
    }

    handleBarCodeScanned = async({type, data}) => {
        const {buttonState} = this.state;
        if(buttonState === "BookId"){
            this.setState({
                scanned: true,
                scannedBookId: data,
                buttonState: 'normal',
            });
        }
        else if(buttonState === "StudentId"){
            this.setState({
                scanned: true,
                scannedStudentId: data,
                buttonState: 'normal'
            });
        }
        else{
            this.setState({
                scanned: true,
                scannedData: data,
                buttonState: 'normal'
            });
        }
    }

    render(){
        const hasCameraPermissions = this.state.hasCameraPermissions;
        const scanned = this.state.scanned;
        const buttonState = this.state.buttonState;
        if(buttonState === "clicked" && hasCameraPermissions){
            return(
                <BarCodeScanner onBarCodeScanned = {scanned ? undefined : this.handleBarCodeScanned}
                style = {StyleSheet.absoluteFillObject}/>
            )
        }
        else if(buttonState === "normal"){
        return(
            <KeyboardAvoidingView style = {styles.container} behavior = "padding" enabled>
                <View>
                    <Image source = {require("../assets/booklogo.jpg")} style = {{width:200, height: 200}}/>
                    <Text style = {{textAlign: 'center', fontSize: 30}}>Willy</Text>
                </View>
                <View style = {styles.inputView}>
                    <TextInput style = {styles.inputBox} placeholder = "Book Id" onChangeText = {text => this.setState({scannedBookId: text})}
                    value = {this.state.scannedBookId}/>                   
                    <TouchableOpacity style = {styles.scanButton} onPress={()=>{this.getCameraPermissions("BookId")}}><Text style = {styles.buttonText}>Scan</Text></TouchableOpacity>
                </View>
                <View style = {styles.inputView}>
                    <TextInput style = {styles.inputBox} placeholder = "Student Id" onChangeText = {text => this.setState({scannedStudentId: text})}
                    value = {this.state.scannedStudentId}/>  
                    <TouchableOpacity style = {styles.scanButton} onPress={()=>{this.getCameraPermissions("StudentId")}}><Text style = {styles.buttonText}>Scan</Text></TouchableOpacity>
                </View>                
                    <TouchableOpacity style = {styles.submitButton} onPress ={async()=>{var transactionMessage = 
                        this.handleTransaction();
                        // this.setState({
                        //     scannedBookId: '',
                        //     scannedStudentId: ''
                        // })
                        }}><Text style = {styles.submitButtonText}>Submit</Text></TouchableOpacity>
            </KeyboardAvoidingView>
        );
        }
    }
}

const styles = StyleSheet.create({
    container:{
        flex: 1,
        justifyContent: 'center',
        //alignItems: 'center'
    },
    displayText:{
        fontSize: 15,
        textDecorationLine: 'underline'
    },
    scanButton:{
        backgroundColor: '#60dfff',
        padding: 10,
        margin: 10
    },
    buttonText:{
        fontSize: 20
    },
    submitButton:{
        backgroundColor: '#fbc02d',
        width: 100,
        height: 50
    },
    submitButtonText:{
        padding: 10,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white'
    },
    inputView:{

    }
});
