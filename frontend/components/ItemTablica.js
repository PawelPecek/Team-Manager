import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, TouchableWithoutFeedback } from "react-native"
import Datastore from 'react-native-local-mongodb'
import AsyncStorage from '@react-native-async-storage/async-storage'
import CONFIG from './Config'
import AddIco from "../svg/AddIco"
import PopUpServer from './PopUpServer'

const ItemTablica = ({id, navigation, name, category, advancement, location, time, pay, openPosition, users, source, target})=>{
    const [canJoin, setCanJoin] = useState(true);
    const [error, setError] = useState(false);
    const open = ()=>{
        console.log("open");
        navigation.navigate("ItemTablicaPage", { id: id, source: source, target: target });
    }
    const join = ()=>{
        console.log("join");
        const db = new Datastore({ filename: 'user', storage: AsyncStorage, autoload: true });
        db.find({}, (err, docs) =>{
            const temp = {
                login: docs[0].login,
                password: docs[0].password,
                id: id
            }
            fetch(CONFIG.HOST_ADRES + "game/join", {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: "POST",
                body: JSON.stringify(temp)
             })
            .then(response => response.json())
            .then(data =>{
                if (data.status == "ok") {
                    setCanJoin(false);
                    navigation.navigate("ItemTablicaPage", { id: id, source: source, target: target });
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
    useEffect(()=>{
        console.log("ItemTablica - UseEffect");
        const db = new Datastore({ filename: 'user', storage: AsyncStorage, autoload: true });
        db.find({}, (err, docs) =>{
            const temp = [];
            users.forEach(el => {
                temp.push(el.login);
            });
            setCanJoin(!temp.includes(docs[0].login));
        });
    }, [users]);
    return (
        <>
        <View style={style.main}>
            <View style={style.leftCol}>
                <TouchableWithoutFeedback onPress={open}>
                    <View>
                        <Text style={style.fontBig}>{name}</Text>
                        <Text style={style.fontSmall}>{"Sport: " + category}</Text>
                        <Text style={style.fontSmall}>{"Zaawansowanie: " + advancement}</Text>
                        <Text style={style.fontSmall}>{"Miejsce: " + location}</Text>
                        <Text style={style.fontSmall}>{"Czas: " + time}</Text>
                        <Text style={style.fontSmall}>{"Wejściówka: " + pay}</Text>
                        <Text style={style.fontSmall}>{"Ilość miejsc: " + users.length.toString() + "/" + openPosition}</Text>
                    </View>
                </TouchableWithoutFeedback>
            </View>
            <View style={style.rightCol}>
                <TouchableWithoutFeedback onPress={join}>
                    <View style={{ display: canJoin ? "flex" : "none" }}>
                        <AddIco />
                    </View>
                </TouchableWithoutFeedback>
            </View>
        </View>
        {
            (error != "") && <View style={{ width: "100%", justifyContent: "center", alignItems: "center", marginBottom: 20 }}><PopUpServer message={error} closeHandler={()=>{setError("");}} /></View>
        }
        </>
    )
}

const style = StyleSheet.create({
    main: {
        width: "100%",
        flexDirection: "row",
        borderWidth: 2,
        borderColor: "#ebebeb",
        borderRadius: 20,
        marginBottom: 20
    },
    leftCol: {
        width: "80%",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        paddingLeft: 10,
        paddingTop: 10,
        paddingBottom: 10
    },
    rightCol: {
        flex: 1,
        justifyContent: "flex-end",
        alignItems: "flex-end",
        paddingRight: 10,
        paddingBottom: 10
    },
    fontBig: {
        color: "white",
        fontSize: 35
    },
    fontSmall: {
        color: "white",
        fontSize: 20
    }
});

export default ItemTablica