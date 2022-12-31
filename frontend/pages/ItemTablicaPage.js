import { useState, useEffect } from 'react'
import { View, ScrollView, Text, TouchableWithoutFeedback, StyleSheet } from 'react-native'
import Datastore from 'react-native-local-mongodb'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useIsFocused } from '@react-navigation/native'
import CONFIG from '../components/Config'
import AddIco from '../svg/AddIco'
import ReturnArrowIco from '../svg/ReturnArrowIco'
import PopUpServer from '../components/PopUpServer'

const ItemTablicaPage = ({ route, navigation }) => {
    const [game, setGame] = useState({
        name: "",
        category: "",
        advancement: "",
        location: "",
        time: "",
        price: "",
        people_counter: "",
        users: [],
        can_join_flag: true,
        is_admin: false
    });
    const [error, setError] = useState(false);
    const isFocused = useIsFocused();
    useEffect(()=>{
        const db = new Datastore({ filename: 'user', storage: AsyncStorage, autoload: true });
        db.find({}, (err, docs) =>{
            if (isFocused) {
                fetch(CONFIG.HOST_ADRES + "game/get", {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    method: "POST",
                    body: JSON.stringify({
                        login: docs[0].login,
                        password: docs[0].password,
                        id: route.params.id
                    })
                })
                .then(response => response.json())
                .then(data =>{
                    if (data.status == "ok") {
                        const users = [];
                        data.data.users.forEach(el => {
                            users.push(el.login);
                        });
                        setGame({
                            name: data.data.name,
                            category: data.data.sport,
                            advancement: data.data.advancement.toString(),
                            location: data.data.location,
                            time: data.data.time,
                            price: data.data.price,
                            people_counter: data.data.people_counter.toString(),
                            users: data.data.users,
                            can_join_flag: !users.includes(docs[0].login),
                            is_admin: data.data.is_admin
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
        });
    }, [isFocused]);
    const returnAction = ()=>{
        switch (route.params.source) {
            case 'Tablica':
                navigation.navigate('Tablica');
            break;
            case 'Konto':
                navigation.navigate('Konto', { target: route.params.target, searchString: '' });
            break;
        }
    }
    const removeUser = ()=>{
        navigation.navigate("FormMeczRemoveUser", {id: route.params.id});
    }
    const getStyleActionButton = el=>{
        if (el === "text") {
            if (game.is_admin) {
                return style.buttonTextChange;
            } else {
                if (game.can_join_flag) {
                    return style.buttonTextJoin;
                } else {
                    return style.buttonTextCancel;
                }
            }
        }
        if (el === "container") {
            if (game.is_admin) {
                return style.buttonContainerChange;
            } else {
                if (game.can_join_flag) {
                    return style.buttonContainerJoin;
                } else {
                    return style.buttonContainerCancel;
                }
            }
        }

    }
    const action = ()=>{
        const join = ()=>{
            const db = new Datastore({ filename: 'user', storage: AsyncStorage, autoload: true });
            db.find({}, (err, docs) => {               
                fetch(CONFIG.HOST_ADRES + "game/join", {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    method: "POST",
                    body: JSON.stringify({
                        login: docs[0].login,
                        password: docs[0].password,
                        id: route.params.id
                    })
                })
                .then(response => response.json())
                .then(data =>{
                    if (data.status == "ok") {
                        db.find({}, (err, docs) => {
                            fetch(CONFIG.HOST_ADRES + "game/get", {
                                headers: {
                                    'Accept': 'application/json',
                                    'Content-Type': 'application/json'
                                },
                                method: "POST",
                                body: JSON.stringify({
                                    login: docs[0].login,
                                    password: docs[0].password,
                                    id: route.params.id
                                })
                            })
                            .then(response => response.json())
                            .then(data =>{
                                if (data.status == "ok") {
                                    const users = [];
                                    data.data.users.forEach(el => {
                                        users.push(el.login);
                                    });
                                    setGame({
                                        name: data.data.name,
                                        category: data.data.sport,
                                        advancement: data.data.advancement.toString(),
                                        location: data.data.location,
                                        time: data.data.time,
                                        price: data.data.price,
                                        people_counter: data.data.people_counter.toString(),
                                        users: data.data.users,
                                        can_join_flag: !users.includes(docs[0].login),
                                        is_admin: data.data.is_admin
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
                    } else {
                        setError("Błąd po stronie serwera, spróbuj ponownie");
                        console.log(data);
                    }
                })
                .catch(err =>{
                    console.log(err);
                });
            });
        }
        const change = ()=>{
            navigation.navigate("FormMecz", { target: "modify", id: route.params.id });
        }
        const leave = ()=>{
            const db = new Datastore({ filename: 'user', storage: AsyncStorage, autoload: true });
            db.find({}, (err, docs) =>{               
                fetch(CONFIG.HOST_ADRES + "game/leave", {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    method: "POST",
                    body: JSON.stringify({
                        login: docs[0].login,
                        password: docs[0].password,
                        id: route.params.id
                    })
                })
                .then(response => response.json())
                .then(data =>{
                    if (data.status == "ok") {
                        db.find({}, (err, docs) => {
                            fetch(CONFIG.HOST_ADRES + "game/get", {
                                headers: {
                                    'Accept': 'application/json',
                                    'Content-Type': 'application/json'
                                },
                                method: "POST",
                                body: JSON.stringify({
                                    login: docs[0].login,
                                    password: docs[0].password,
                                    id: route.params.id
                                })
                            })
                            .then(response => response.json())
                            .then(data =>{
                                if (data.status == "ok") {
                                    const users = [];
                                    data.data.users.forEach(el => {
                                        users.push(el.login);
                                    });
                                    setGame({
                                        name: data.data.name,
                                        category: data.data.sport,
                                        advancement: data.data.advancement.toString(),
                                        location: data.data.location,
                                        time: data.data.time,
                                        price: data.data.price,
                                        people_counter: data.data.people_counter.toString(),
                                        users: data.data.users,
                                        can_join_flag: !users.includes(docs[0].login),
                                        is_admin: data.data.is_admin
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
                    } else {
                        if (data.description != undefined) {
                            setError(data.description);
                        } else {
                            setError("Błąd po stronie serwera, spróbuj ponownie");
                            console.log(data);
                        }
                    }
                })
                .catch(err=>{
                    setError("Błąd w połączeniu, spróbuj ponownie");
                    console.log(err);
                });   
            });
        }

        if (game.is_admin) {
            change();
        } else {
            if (game.can_join_flag) {
                join();
            } else {
                leave();
            }
        }
    }
    return (
        <View style={style.main}>
            <View style={style.topBar}>
                <TouchableWithoutFeedback onPress={returnAction}>
                    <View>
                        <ReturnArrowIco />
                    </View>
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback onPress={action}>
                    <View style={(()=>getStyleActionButton("container"))()}>
                        <Text style={(()=>getStyleActionButton("text"))()}>
                            {((game.is_admin) ? "Modyfikuj" : ((game.can_join_flag) ? "Dołącz" : "Opuść"))}
                        </Text>
                    </View>
                </TouchableWithoutFeedback>
            </View>
            <ScrollView style={style.scrollView}>
                <View style={style.rowContainer}><Text style={style.rowText}>{ "Nazwa: " + game.name }</Text></View>
                <View style={style.rowContainer}><Text style={style.rowText}>{ "Sport: " + game.category }</Text></View>
                <View style={style.rowContainer}><Text style={style.rowText}>{ "Zaawansowanie: " + game.advancement + " / 10" }</Text></View>
                <View style={style.rowContainer}><Text style={style.rowText}>{ "Miejsce: " + game.location }</Text></View>
                <View style={style.rowContainer}><Text style={style.rowText}>{ "Czas: " + game.time }</Text></View>
                <View style={style.rowContainer}><Text style={style.rowText}>{ "Cena: " + game.price }</Text></View>
                <View style={style.rowContainer}><Text style={style.rowText}>{ "Ilość wolnych miejsc: " + game.users.length.toString() + " / " + game.people_counter }</Text></View>
                <View style={style.rowContainer}><Text style={style.rowText}>Użytkownicy:</Text></View>
                {
                    game.users.map((el, ind)=>(<View key={ind} style={style.rowContainer}><Text style={style.rowText}>- {el.login}</Text></View>))
                }
                {
                    (game.is_admin) && <TouchableWithoutFeedback onPress={removeUser}><View style={style.buttonContainerRemoveUsers}><Text style={style.buttonTextRemoveUsers}>Wybierz użytowników do wyrzucenia</Text></View></TouchableWithoutFeedback>
                }
            </ScrollView>
            {
                (error != "") && <PopUpServer message={error} closeHandler={()=>{setError("");}} />
            }
        </View>
    )
}

const style = StyleSheet.create({
    main: {
        width: "100%",
        height: "100%",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "#1c1c1c"
    },
    scrollView: {
        width: "100%",
        paddingTop: 20
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
    rowContainer: {
        width: "100%",
        paddingLeft: 20
    },
    rowText: {
        color: "white",
        fontSize: 20
    },
    buttonContainerJoin: {
        borderWidth: 2,
        borderColor: "green",
        padding: 10,
        borderRadius: 20
    },
    buttonTextJoin: {
        color: "green",
        fontSize: 20
    },
    buttonContainerCancel: {
        borderWidth: 2,
        borderColor: "red",
        padding: 10,
        borderRadius: 20
    },
    buttonTextCancel: {
        color: "red",
        fontSize: 20
    },
    buttonContainerChange: {
        borderWidth: 2,
        borderColor: "white",
        padding: 10,
        borderRadius: 20
    },
    buttonTextChange: {
        color: "white",
        fontSize: 20
    },
    buttonContainerRemoveUsers: {
        width: "90%",
        marginLeft: "5%",
        marginTop: 50,
        borderWidth: 2,
        borderColor: "red",
        padding: 10,
        borderRadius: 20
    },
    buttonTextRemoveUsers: {
        textAlign: "center",
        color: "red",
        fontSize: 20
    }
});

export default ItemTablicaPage