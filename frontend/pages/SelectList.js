import { useState, useEffect, useRef } from 'react'
import { View, FlatList, TouchableWithoutFeedback, Image, Text, StyleSheet } from 'react-native'
import Datastore from 'react-native-local-mongodb'
import AsyncStorage from '@react-native-async-storage/async-storage'
import PopUpServer from '../components/PopUpServer'
import NetInfo from '@react-native-community/netinfo'
import { useIsFocused } from '@react-navigation/native'
import CONFIG from '../components/Config'
import ItemTablica from '../components/ItemTablica'
import ReturnArrowIco from '../svg/ReturnArrowIco'
import SearchIco from '../svg/SearchIco'
import Avatar from '../img/avatar.png'

const SelectList = ({ route, navigation })=>{
    /*
    const [list, setList] = useState([])
    dodać labele:
        - dla FormGroup -> nazwa grupy
        - dla KontoJoined -> Dołączono
        - dla KontoCreated -> Stworzono
    */
    const [list, setList] = useState({
        label: '',
        data: []
    })
    const listRef = useRef(null)
    const [isLoading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const returnAction = ()=>{
        switch (route.params.source) {
            case 'FormGroup':
                navigation.navigate('FormGroup', {id: route.params.id, name: route.params.name, createOrModify: route.params.createOrModify});
            break;
            case 'KontoJoined':
            case 'KontoCreated':
                navigation.navigate('Konto');
            break;
        }
    }
    const searchAction = ()=>{
        switch (route.params.source) {
            case 'FormGroup':
                navigation.navigate('Search', {id: route.params.id, name: route.params.name, createOrModify: route.params.createOrModify, originSource: route.params.source, source: 'SelectListFormGroup'});
            break;
            case 'KontoJoined':
            case 'KontoCreated':
                navigation.navigate('Search', {originSource: route.params.source, source: 'SelectListKonto'});
            break;
        }
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
    const renderUser = ({item})=>(
        <TouchableWithoutFeedback onPress={()=>addUser(item.id)}>
            <View style={style.listPosition}>
                <Image style={style.img} source={(item.avatar == '') ? Avatar : { uri: CONFIG.HOST_ADRES + item.avatar + '?' + new Date() }} />
                <Text style={style.title}>{item.login}</Text>
            </View>
        </TouchableWithoutFeedback>
    )
    const renderGameJoined = ({item})=>(
        <ItemTablica
            id={item.id}
            navigation={navigation}
            name={item.name} 
            category={item.sport} 
            advancement={item.advancement} 
            location={item.location} 
            time={item.time} 
            pay={item.price} 
            openPosition={item.people_counter}
            users={item.users}
            source='SelectList'
            target='joined'
        />
    )
    const renderGameCreated = ({item})=>(
        <ItemTablica
            id={item.id}
            navigation={navigation}
            name={item.name} 
            category={item.sport} 
            advancement={item.advancement} 
            location={item.location} 
            time={item.time} 
            pay={item.price} 
            openPosition={item.people_counter}
            users={item.users}
            source='SelectList'
            target='created'
        />
    )
    const renderItemFunction = (()=>{
        switch (route.params.source) {
            case 'FromGroup':
                return renderUser;
            break;
            case 'KontoJoined':
                return renderGameJoined;
            break;
            case 'KontoCreated':
                return renderGameCreated;
            break;
        }
    })();
    const loadData = ()=>{
        const db = new Datastore({ filename: 'user', storage: AsyncStorage, autoload: true });
        switch (route.params.source) {
            case 'FormGroup':
                setLoading(true);
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
                                    pageSize: 25,
                                    pageNumber: (Math.ceil(list.data.length / 25) + 1),
                                    searchString: ("searchString" in route.params) ? route.params.searchString : ''
                                })
                            })
                            .then(response => response.json())
                            .then(data =>{
                                setLoading(false);
                                if (data.status == "ok") {
                                    // setList(data.data.filter(el => !users.data.users.map(x=>x.login).includes(el.login)));
                                    setList({
                                        label: route.params.name,
                                        data: data.data.filter(el => !users.data.users.map(x=>x.login).includes(el.login))
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
                                setLoading(false);
                                setError("Błąd w połączeniu, spróbuj ponownie");
                                console.log(err);
                            });
                        } else {
                            setLoading(false);
                            if (users.description != undefined) {
                                setError(users.description);
                            } else {
                                setError("Błąd po stronie serwera, spróbuj ponownie");
                                console.log(users);
                            }
                        }
                    }).catch(err =>{
                        setLoading(false);
                        setError("Błąd w połączeniu, spróbuj ponownie");
                        console.log(err);
                    });
                });
            break;
            case 'KontoJoined':
                setLoading(true);
                db.find({}, (err, docs) =>{
                    fetch(CONFIG.HOST_ADRES + "game/users/join/list", {
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        method: "POST",
                        body: JSON.stringify({
                            login: docs[0].login,
                            password: docs[0].password,
                            pageSize: 25,
                            pageNumber: (Math.ceil(list.data.length / 25) + 1),
                            searchString: ("searchString" in route.params) ? route.params.searchString : ''
                        })
                    })
                    .then(response => response.json())
                    .then(joinGame =>{
                        setLoading(false);
                        if (joinGame.status == "ok") {
                            // setList(joinGame.data);
                            setList({
                                label: "Gry, do których dołączyłeś:",
                                data: joinGame.data
                            });
                        } else {
                            if (joinGame.description != undefined) {
                                setError(joinGame.description);
                            } else {
                                setError("Błąd po stronie serwera, spróbuj ponownie");
                                console.log(joinGame);
                            }
                        }
                    }).catch(err =>{
                        setLoading(false);
                        setError("Błąd w połączeniu, spróbuj ponownie");
                        console.log(err);
                    });
                });
            break;
            case 'KontoCreated':
                setLoading(true);
                db.find({}, (err, docs) =>{
                    fetch(CONFIG.HOST_ADRES + "game/users/create/list", {
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        method: "POST",
                        body: JSON.stringify({
                            login: docs[0].login,
                            password: docs[0].password,
                            pageSize: 25,
                            pageNumber: (Math.ceil(list.data.length / 25) + 1),
                            searchString: ("searchString" in route.params) ? route.params.searchString : ''
                        })
                    })
                    .then(response => response.json())
                    .then(createGame =>{
                        setLoading(false);
                        if (createGame.status == "ok") {
                            //setList(createGame.data);
                            setList({
                                label: "Gry utworzone przez ciebie:",
                                data: createGame.data
                            });
                        } else {
                            if (createGame.description != undefined) {
                                setError(createGame.description);
                            } else {
                                setError("Błąd po stronie serwera, spróbuj ponownie");
                                console.log(createGame);
                            }
                        }
                    }).catch(err =>{
                        setLoading(false);
                        setError("Błąd w połączeniu, spróbuj ponownie");
                        console.log(err);
                    });
                });
            break;
        }
    }
    const isFocused = useIsFocused();
    useEffect(()=>{
        NetInfo.addEventListener(state =>{
            if (isFocused) {
                const offline = !state.isConnected;
                if (offline) {
                    setError("Brak internetu");
                } else {
                    setError(false);
                }
            }
        });
        if (isFocused) {
            listRef.current.scrollToOffset({ offset: 0, animated: false });
            loadData();
            /*
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
            */
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
            <View><Text style={style.textLabel}>{list.label}</Text></View>
            {
                ("searchString" in route.params) && <View><Text style={style.textSearchString}>{route.params.searchString}</Text></View>
            }
            <FlatList style={style.scrollView}
                data={list.data}
                ref={listRef}
                renderItem={renderItemFunction}
                onEndReachedThreshold={5}
                onEndReached={loadData}
            />
            {/*
            <ScrollView style={style.scrollView}>
                {
                    list.map(el => <TouchableWithoutFeedback key={el.id} onPress={()=>addUser(el.id)}><View style={style.listPosition}><Image style={style.img} source={(el.avatar == '') ? Avatar : { uri: "http://10.0.2.2:8000/api/" + el.avatar + '?' + new Date() }} /><Text style={style.title}>{el.login}</Text></View></TouchableWithoutFeedback>)
                }
            </ScrollView>
            */}
            {   
                isLoading &&
                    <View style={style.dataLoadingContainer}>
                        <Text style={style.dataLoadingText}>Ładowanie danych</Text>
                    </View>
            }
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
    },
    textLabel: {
        width: "100%",
        color: "white",
        fontSize: 35,
        textAlign: "center",
        marginBottom: 20,
        marginTop: 20
    }
});

export default SelectList