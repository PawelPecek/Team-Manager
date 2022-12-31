import { useState, useEffect } from 'react'
import { View, Text, TouchableWithoutFeedback, TextInput, StyleSheet, ScrollView } from 'react-native'
import Datastore from 'react-native-local-mongodb'
import AsyncStorage from '@react-native-async-storage/async-storage'
import PopUpServer from '../components/PopUpServer'
import { useIsFocused } from '@react-navigation/native'
import CONFIG from '../components/Config'
import ReturnArrowIco from '../svg/ReturnArrowIco'
import RemoveIco from '../svg/RemoveIco'

const FormGroup = ({ route, navigation }) =>{
    /*
        - zainicjować parametr w route createOrModify dla dodawania lub edytowania grupy
        - nazwa pusta przy tworzeniu, wypełniona przy modyfikowaniu
        - lista członków z możliwością ich wywalenia
        - ?dodawanie użytkowników?
        - ?usuwanie grupy? - w prawym górnym rogu, tak żeby było trudno trafić przypadkiem

        CO JEST CZYM:
        jest zdefiniowane route.params.id (w sensie grupy), jeśli route.params.createOrModify = 'create'
    */
    const [group, setGroup] = useState({
        name: (route.params.createOrModify == 'modify') ? route.params.name : '',
        is_admin: false,
        userList: []
    });
    const changeName = text => { 
        setGroup({
            name: text,
            is_admin: group.is_admin,
            userList: group.userList
        });
    }
    const [error, setError] = useState(false);
    const action = ()=>{
        if (route.params.createOrModify == 'create') {
            const db = new Datastore({ filename: 'user', storage: AsyncStorage, autoload: true });
            db.find({}, (err, docs) =>{
                fetch(CONFIG.HOST_ADRES + "group/create", {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    method: "POST",
                    body: JSON.stringify({
                        login: docs[0].login,
                        password: docs[0].password,
                        name: group.name
                    })
                })
                .then(response => response.json())
                .then(data =>{
                    if (data.status == "ok") {
                        navigation.navigate("Wiadomosci", { target: "group", searchString: "" });
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
            const db = new Datastore({ filename: 'user', storage: AsyncStorage, autoload: true });
            db.find({}, (err, docs) =>{
                fetch(CONFIG.HOST_ADRES + "group/change", {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    method: "POST",
                    body: JSON.stringify({
                        login: docs[0].login,
                        password: docs[0].password,
                        id: route.params.id,
                        name: group.name
                    })
                })
                .then(response => response.json())
                .then(data =>{
                    if (data.status == "ok") {
                        navigation.navigate("Wiadomosci", { target: "group", searchString: "" });
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
    }
    const remove = ()=>{
        const db = new Datastore({ filename: 'user', storage: AsyncStorage, autoload: true });
        db.find({}, (err, docs) =>{
            fetch(CONFIG.HOST_ADRES + "group/delete", {
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
                    navigation.navigate("Wiadomosci", { target: 'group', searchString: '' });
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
    const removeUser = id =>{
        const db = new Datastore({ filename: 'user', storage: AsyncStorage, autoload: true });
        db.find({}, (err, docs) =>{
            fetch(CONFIG.HOST_ADRES + "group/leave", {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: "POST",
                body: JSON.stringify({
                    login: docs[0].login,
                    password: docs[0].password,
                    idUser: id,
                    idGroup: route.params.id
                })
            })
            .then(response => response.json())
            .then(data =>{
                if (data.status == "ok") {
                    setGroup({
                        name: group.name,
                        is_admin: group.is_admin,
                        userList: group.userList.filter(el => el.id != id)
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
    const addUser = ()=>{
        navigation.navigate("UserList", { id: route.params.id, createOrModify: route.params.createOrModify });
    }
    const cancel = ()=>{
        navigation.navigate("Wiadomosci", { target: "group" });
    }
    const isFocused = useIsFocused();
    useEffect(()=>{
        if (isFocused && ('createOrModify' in route.params) && (route.params.createOrModify == 'modify')) {
            const db = new Datastore({ filename: 'user', storage: AsyncStorage, autoload: true });
            db.find({}, (err, docs) =>{
                fetch(CONFIG.HOST_ADRES + "group/get", {
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
                        setGroup({
                            name: group.name,
                            is_admin: data.data.is_admin,
                            userList: data.data.users
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
    }, [isFocused]);
  return (
    <View style={style.main}>
        <View style={style.topBar}>
            <TouchableWithoutFeedback onPress={cancel}>
                <View>
                    <ReturnArrowIco />
                </View>
            </TouchableWithoutFeedback>
            <TouchableWithoutFeedback onPress={remove}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", display:(group.is_admin) ? 'flex' : 'none' }}>
                    <Text style={style.removeText}>Usuń</Text><RemoveIco />
                </View>
            </TouchableWithoutFeedback>
        </View>
        <View style={style.container}>
            <Text style={style.header}>Nazwa grupy:</Text>
            <TextInput style={style.input} value={group.name} onChangeText={changeName} placeholder="Podaj nazwę grupy" placeholderTextColor="white" />
            <Text style={((route.params.createOrModify == "create") ? style.hide : style.header)}>Lista członków:</Text>
            <View style={((route.params.createOrModify == "create") ? style.hide : style.scrollViewFrame )}>
                <ScrollView style={style.scrollView}>
                    {
                        group.userList.map(el => <View style={style.groupItemContainer} key={el.id}><Text style={style.groupItemText}>{el.login}</Text><TouchableWithoutFeedback onPress={()=>{removeUser(el.id)}}><View><RemoveIco /></View></TouchableWithoutFeedback></View>)
                    }
                </ScrollView>
            </View>
            <View style={((route.params.createOrModify == "create") ? style.hide : style.row )}>
                <TouchableWithoutFeedback onPress={addUser}>
                    <View style={style.buttonContainer}>
                        <Text style={style.buttonText}>Dodaj Użytkownika</Text>
                    </View>
                </TouchableWithoutFeedback>
            </View>
            <View style={style.row}>
                <TouchableWithoutFeedback onPress={action}>
                    <View style={style.buttonContainer}>
                        <Text style={style.buttonText}>{(route.params.createOrModify == 'create') ? "Utwórz" : "Modyfikuj" }</Text>
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
        marginTop: 25
    },
    header: {
        fontSize: 30,
        color: "white",
    },
    input: {
        color: "white",
        borderWidth: 1,
        borderColor: "white",
        borderRadius: 10,
        padding: 5,
        paddingLeft: 15,
        alignSelf: "center",
        width: "85%",
        marginTop: 20,
        marginBottom: 20
    },
    scrollViewFrame: {
        width: "85%",
        marginTop: 25,
        height: "30%",
        padding: 15,
        borderWidth: 2,
        borderColor: "white"
    },
    scrollView: {
        width: "100%",
    },
    groupItemContainer: {
        width: "100%",
        marginBottom: 20,
        flexDirection: "row",
        justifyContent: "space-between"
    },
    groupItemText: {
        color: "white",
        alignSelf: "center"
    },
    row: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        marginTop: 25
    },
    buttonContainer: {
        marginLeft: 20,
        borderWidth: 1,
        borderColor: "white",
        borderRadius: 50,
        padding: 15
    },
    buttonText: {
        fontSize: 20,
        color: "white",
        textAlign: "center"
    },
    removeText: {
        color: "red",
        fontSize: 20,
        paddingRight: 10
    },
    hide: {
        display: "none"
    }
});

export default FormGroup