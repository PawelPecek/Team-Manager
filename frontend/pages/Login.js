import { useState, useEffect } from "react"
import { View, StyleSheet, TextInput, Text, TouchableWithoutFeedback, TouchableNativeFeedback } from "react-native"
import Datastore from 'react-native-local-mongodb'
import AsyncStorage from '@react-native-async-storage/async-storage'
import NetInfo from '@react-native-community/netinfo'
import { useIsFocused } from '@react-navigation/native'
import CONFIG from "../components/Config"
import PopUpServer from "../components/PopUpServer"

const Login = ({navigation}) => {
    const [form, setForm] = useState({
        login: "",
        password: ""
    });
    const [error, setError] = useState(false);
    const loginChange = text =>{
        setForm({
            login: text,
            password: form.password
        });
    }
    const passwordChange = text =>{
        setForm({
            login: form.login,
            password: text
        });
    }
    const register = ()=>{
        navigation.navigate("Register");
    }
    const login = ()=>{
        fetch(CONFIG.HOST_ADRES + "user/check", {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify(form)
        })
        .then(response => response.json())
        .then(data =>{
            console.log(data);
            if (data.status == "ok") {
                const db = new Datastore({ filename: 'user', storage: AsyncStorage, autoload: true });
                db.remove({}, { multi: true }, ()=>{
                    db.insert(form, ()=>{
                        navigation.navigate("Tablica");
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
    }
    const isFocused = useIsFocused();
    useEffect(()=>{
        NetInfo.addEventListener((state) => {
            if (isFocused) {
                const offline = !state.isConnected;
                if (offline) {
                    setError("Brak internetu");
                } else {
                    setError(false);
                }
            }
        });
    }, [isFocused]);

    return (
        <View style={style.main}>
            <Text style={style.header}>Zaloguj</Text>
            <TextInput style={style.loginForm} placeholder="Login" placeholderTextColor="white" value={form.login} onChangeText={loginChange}/>
            <TextInput style={style.passwordForm} placeholder="Hasło" placeholderTextColor="white" value={form.password} onChangeText={passwordChange}/>
            <TouchableWithoutFeedback onPress={login}>
                <View style={style.registerButtonContainer}>
                    <Text style={style.registerButtonText}>Zaloguj</Text>
                </View>
            </TouchableWithoutFeedback>
            <View style={{height : 50, alignItems: "center", width: "90%"}}>
            {
                (error != "") && <PopUpServer message={error} closeHandler={()=>{setError("");}} />
            }
            </View>
            <TouchableWithoutFeedback onPress={register}>
                <View style={style.getAccountNotificationContainer}>
                    <Text style={style.getAccountNotificationText}>Zarejestruj się</Text>
                </View>
            </TouchableWithoutFeedback>
        </View>
    )
}

const style = StyleSheet.create({
    main: {
        width: "100%",
        height: "100%",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#1c1c1c"
    },
    header: {
        fontSize: 40,
        color: "white"
    },
    loginForm: {
        width: "80%",
        color: "white" ,
        padding: 10,
        margin: 15,
        borderWidth: 1,
        borderColor: "white",
        borderRadius: 10
    },
    passwordForm: {
        width: "80%",
        color: "white" ,
        padding: 10,
        margin: 15,
        borderWidth: 1,
        borderColor: "white",
        borderRadius: 10
    },
    registerButtonContainer: {
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "white" ,
        padding: 10,
        margin: 15,
        borderWidth: 2,
        borderColor: "white",
        borderRadius: 10
    },
    registerButtonText: {
        color: "white",
        fontSize: 25,
        fontWeight: "bold"
    },
    getAccountNotificationContainer: {
        marginTop: 75
    },
    getAccountNotificationText: {
        color: "white",
        fontSize: 17,
        textDecorationLine: "underline"
    }
});

export default Login