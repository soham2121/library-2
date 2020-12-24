import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as Permissions from 'expo-permissions';
import * as firebase from 'firebase';
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

    handleTransaction = () => {
        var transactionMessage;
        db.collection("books").doc(this.state.scannedBookId).get()
        .then((doc)=>{
            var book = doc.data();
            if(book.bookAvailability){
                this.initiateBookIssue();
                transactionMessage = "Book Issued";
            }
            else{
                this.initiateBookReturn();
                transactionMessage = "Book Returned";
            }
        })
        this.setState({
            transactionMessage: transactionMessage
        });
    }

    initiateBookIssue = async() => {
        db.collection("transaction").add({
            'studentId': this.state.scannedStudentId,
            'bookId': this.state.scannedBookId,
            'date': firebase.firestore.Timestamp.now().toDate(),
            'transactionType': "Issue"
        })
        db.collection("books").doc(this.state.scannedBookId).update({
            'book.bookAvailability': false
        })
        db.collection("students").doc(this.state.scannedStudentId).update({
            'numberOfBooksIssued': firebase.firestore.FieldValue.increment(1)
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
            'book.bookAvailability': true
        })
        db.collection("students").doc(this.state.scannedStudentId).update({
            'numberOfBooksIssued': firebase.firestore.FieldValue.increment(-1)
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
            <View>
                <Text style = {styles.displayText}>{hasCameraPermissions === true ? this.state.scannedData : "Request camera permissions"}</Text>
                <TouchableOpacity style = {styles.scanButton} onPress={this.getCameraPermissions}><Text style = {styles.buttonText}>Scan QR code</Text></TouchableOpacity>
                <TouchableOpacity style = {styles.submitButton} onPress ={async()=>{this.handleTransaction()}}><Text style = {styles.submitButtonText}>Submit</Text></TouchableOpacity>
            </View>
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
        backgroundColor: 'fbc02d',
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
