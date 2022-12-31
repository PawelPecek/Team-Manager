import { useState, useEffect } from 'react'
import { View, FlatList, TouchableWithoutFeedback, Image, Text, StyleSheet } from 'react-native'
import Datastore from 'react-native-local-mongodb'
import AsyncStorage from '@react-native-async-storage/async-storage'
import PopUpServer from '../components/PopUpServer'
import { useIsFocused } from '@react-navigation/native'
import CONFIG from '../components/Config'
import ReturnArrowIco from '../svg/ReturnArrowIco'
import SearchIco from '../svg/SearchIco'
import Avatar from '../img/avatar.png'

const UserList = ({ route, navigation })=>{
    const [list, setList] = useState([])
    const [error, setError] = useState("")
    const returnAction = ()=>{
        navigation.navigate("FormGroup", { id: route.params.id });
    }
    const searchAction = ()=>{
        navigation.navigate("Search", { source: "UserList" , id: route.params.id, searchString: route.params.searchString });
    }
    const addUser = id =>{
        const db = new Datastore({ filename: 'user', storage: AsyncStorage, autoload: true });
        db.find({}, (err, docs) =>{
            fetch(CONFIG.HOST_ADRES + "group/join", {
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
                    navigation.navigate("FormGroup", { id: route.params.id, createOrModify: route.params.createOrModify });
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
    const isFocused = useIsFocused();
    useEffect(()=>{
        if (isFocused) {
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
                .then(users =>{
                    if (users.status == "ok") {
                        fetch(CONFIG.HOST_ADRES + "user/list", {
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json'
                            },
                            method: "POST",
                            body: JSON.stringify({
                                login: docs[0].login,
                                password: docs[0].password,
                                searchString: ("searchString" in route.params) ? route.params.searchString : ''
                            })
                        })
                        .then(response => response.json())
                        .then(data =>{
                            if (data.status == "ok") {
                                setList(data.data.filter(el => !users.data.users.map(x=>x.login).includes(el.login)));
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
                    } else {
                        if (users.description != undefined) {
                            setError(users.description);
                        } else {
                            setError("Błąd po stronie serwera, spróbuj ponownie");
                            console.log(users);
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
                <TouchableWithoutFeedback onPress={returnAction}>
                    <View>
                        <ReturnArrowIco />
                    </View>
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback onPress={searchAction}>
                    <View>
                        <SearchIco />
                    </View>
                </TouchableWithoutFeedback>
            </View>
            {
                ("searchString" in route.params) && <View><Text style={style.textSearchString}>{route.params.searchString}</Text></View>
            }
            <FlatList style={style.scrollView}
                data={list}
                renderItem={({item})=><TouchableWithoutFeedback onPress={()=>addUser(item.id)}><View style={style.listPosition}><Image style={style.img} source={(item.avatar == '') ? Avatar : { uri: CONFIG.HOST_ADRES + item.avatar + '?' + new Date() }} /><Text style={style.title}>{item.login}</Text></View></TouchableWithoutFeedback>}
            />
            {/*
            <ScrollView style={style.scrollView}>
                {
                    list.map(el => <TouchableWithoutFeedback key={el.id} onPress={()=>addUser(el.id)}><View style={style.listPosition}><Image style={style.img} source={(el.avatar == '') ? Avatar : { uri: "http://10.0.2.2:8000/api/" + el.avatar + '?' + new Date() }} /><Text style={style.title}>{el.login}</Text></View></TouchableWithoutFeedback>)
                }
            </ScrollView>
            */}
            <View style={{justifyContent: "center", alignItems: "center", paddingBottom: 30}}>
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
    scrollView: {

    },
    listPosition: {
        width: "100%",
        flexDirection: "row",
        borderWidth: 2,
        borderColor: "white",
        borderRadius: 10,
        marginBottom: 10
    },
    img: {
        width: 200,
        height: 200,
        borderRadius: 200,
        marginTop: 10,
        marginLeft: 10,
        marginBottom: 10
    },
    title: {
        width: "50%",
        color: "white",
        fontSize: 25,
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 50
    },
    textSearchString: {
        width: "100%",
        color: "white",
        fontSize: 35,
        textAlign: "center",
        marginBottom: 20,
        marginTop: 20
    }
});

export default UserList