import { useState } from 'react'
import { View, Text, StyleSheet, TouchableWithoutFeedback, TextInput } from 'react-native'
import Datastore from 'react-native-local-mongodb'
import AsyncStorage from '@react-native-async-storage/async-storage'
import CONFIG from '../components/Config'
import ReturnArrowIco from '../svg/ReturnArrowIco'
import PopUpServer from '../components/PopUpServer'

const FormChangePassword = ({navigation}) => {
    const [error, setError] = useState(false);
    let newPassword = "";
    const newPasswordChange = text=>{newPassword = text;};
    const accept = ()=>{
        const db = new Datastore({ filename: 'user', storage: AsyncStorage, autoload: true });
        db.find({}, (err, docs) =>{
            fetch(CONFIG.HOST_ADRES + "user/change/password", {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: "POST",
                body: JSON.stringify({
                    login: docs[0].login,
                    password: docs[0].password,
                    newPassword: newPassword
                })
            })
            .then(response => response.json())
            .then(data =>{
                if (data.status == "ok") {
                    db.remove({}, { multi: true }, ()=>{
                        db.insert({
                            login: docs[0].login,
                            password: newPassword
                        }, ()=>{
                            navigation.goBack()
                        });
                    });
                } else {
                    if (data.description != undefined) {
                        setError(data.description);
                    } else {
                        setError("Błąd po stronie serwera, spróbuj ponownie");
                        console.log(data);
                    }
                }
            }).catch(err =>{
                setError("Błąd w połączeniu, spróbuj ponownie");
                console.log(err);
            });
        });
    }
    const cancel = ()=>{
        navigation.goBack();
    }
    return (
        <View style={style.main}>
            <View style={style.topBar}>
                <TouchableWithoutFeedback onPress={cancel}>
                    <View>
                        <ReturnArrowIco />
                    </View>
                </TouchableWithoutFeedback>
            </View>
            <View style={style.container}>
                <View style={style.headerContainer}>
                    <Text style={style.headerText}>Ustaw nowe hasło</Text>
                </View>
                <View style={style.inputContainer}>
                    <TextInput style={style.inputForm} onChangeText={newPasswordChange} />
                </View>
                <View style={style.optionRow}>
                    <TouchableWithoutFeedback onPress={accept}>
                        <View style={style.optionContainer}>
                            <Text style={style.optionText}>Zmień</Text>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
                {
                    (error != "") && <PopUpServer message={error} closeHandler={()=>{setError("");}} />
                }
            </View>
        </View>
    )
}

const style = StyleSheet.create({
    main: {
        width: "100%",
        height: "100%",
        flexDirection: "column",
        backgroundColor: "#1c1c1c"
    },
    topBar: {
        width: "100%",
        height: 65,
        paddingTop: 15,
        paddingLeft: 15,
        paddingRight: 15,
        flexDirection: "row",
        justifyContent: "space-between",
        alignContent: "center"
    },
    container: {
        width: "100%",
        height: "100%",
        alignItems: "center",
        marginTop: "30%"
    },
    headerContainer: {
        width: "100%",
        marginBottom: 40
    },
    headerText: {
        color: "white",
        textAlign: "center",
        fontSize: 20
    },
    inputContainer: {
        width: "100%",
        alignItems: "center"
    },
    inputForm: {
        width: "75%",
        color: "white",
        borderWidth: 1,
        borderColor: "white",
        borderRadius: 20,
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 10,
        paddingBottom: 10
    },
    optionRow: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 10,
        marginBottom: 10
    },
    optionContainer: {
        width: 150,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "white",
        borderRadius: 20,
        paddingTop: 10,
        paddingBottom: 10,
        marginTop: 10,
        marginBottom: 10
    },
    optionText: {
        color: "white"
    }
});

export default FormChangePassword