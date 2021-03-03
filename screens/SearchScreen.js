import React from 'react';
import { Text, View, FlatList, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import db from '../config';

export default class searchScreen extends React.Component{
    constructor(props){
        super(props);
        this.state={
            allTransactions: [],
            lastVisibleTransaction: null,
            search: ''
        }
    }

    fetchMoreTransactions = async() => {


       
        var text = this.state.search.toUpperCase();
        var enteredText = text.split("");
       
        if(enteredText[0].toUpperCase() === "B"){
            const query = await db.collection("transaction").where('bookId','==',text).startAfter(this.state.lastVisibleTransaction).limit(10).get()
            query.docs.map((doc)=>{
                this.setState({
                    allTransactions: [...this.state.allTransactions, doc.data()],
                    lastVisibleTransaction: doc
                });
            });
        }
        else if(enteredText[0].toUpperCase() === "S"){
            const query = await db.collection("transaction").where('studentId','==',text).startAfter(this.state.lastVisibleTransaction).limit(10).get()
            query.docs.map((doc)=>{
                this.setState({
                    allTransactions: [...this.state.allTransactions, doc.data()],
                    lastVisibleTransaction: doc
                });
            });
        }
        // else{
        //     const query = await db.collection("transaction").startAfter(this.state.lastVisibleTransaction).limit(10).get()
        //     query.docs.map((doc)=>{
        //         this.setState({
        //             allTransactions: [...this.state.allTransactions, doc.data()],
        //             lastVisibleTransaction: doc
        //         });
        //     });
        // }
    }

    searchTransactions = async(text) => {
       
        var enteredText = text.split("")
        var text = text.toUpperCase()
        if(enteredText[0].toUpperCase() === "B"){
            const transaction = await db.collection("transaction").where('bookId','==',text).get()
            transaction.docs.map((doc)=>{
                this.setState({
                    allTransactions: [...this.state.allTransactions, doc.data()],
                    lastVisibleTransaction: doc
                });
            });
        }
        else if(enteredText[0].toUpperCase() === "S"){
            const transaction = await db.collection("transaction").where('studentId','==',text).get()
            transaction.docs.map((doc)=>{
                this.setState({
                    allTransactions: [...this.state.allTransactions, doc.data()],
                    lastVisibleTransaction: doc
                });
            });
        }
    }

    componentDidMount = async() => {
        const query = await db.collection("transaction").limit(10).get()
        query.docs.map((doc)=>{
            this.setState({
                allTransactions: [],
                lastVisibleTransaction: doc
            });
        });
    }

    render(){
        return(
            <View style = {styles.container}>
            <View style = {styles.searchBar}>
                <TextInput style = {styles.bar} placeholder = "Enter book id or student id" onChangeText = {(text)=>{this.setState({
                    search: text
                })}}/>
                <TouchableOpacity style = {styles.searchButton} onPress = {()=>{this.searchTransactions(this.state.search)}}>
                    <Text>Search</Text>
                </TouchableOpacity>
            </View>
            <FlatList data = {this.state.allTransactions}
            renderItem = {({item})=>(
                        <View style = {{borderBottomWidth: 2}}>
                            <Text>{"Book Id: " + item.bookId}</Text>
                            <Text>{"Student Id: " + item.studentId}</Text>
                            <Text>{"Transaction Type: " + item.transactionType}</Text>
                            <Text>{"Date: " + item.date}</Text>
                        </View>
            )}
            keyExtractor = {(item,index)=>index.toString()}
            onEndReached = {this.fetchMoreTransactions}
            onEndReachedThreshold = {0.7}/>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
        flex: 1
    },
    searchBar: {
        flexDirection: 'row',
        height: 40,
        width: 'auto',
        borderWidth: 0.5,
        alignItems: 'center',
        backgroundColor: 'grey'
    },
    searchButton: {
        borderWidth: 1,
        height: 30,
        width: 50,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'green'
    },
    bar: {
        borderWidth: 2,
        height: 30,
        width: 300,
        paddingLeft: 30
    }
})