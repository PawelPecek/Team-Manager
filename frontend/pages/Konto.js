import { useState, useEffect } from 'react'
import { View, Text, Image, StyleSheet, ScrollView, TouchableWithoutFeedback, FlatList } from 'react-native'
import Datastore from 'react-native-local-mongodb'
import AsyncStorage from '@react-native-async-storage/async-storage'
import NetInfo from '@react-native-community/netinfo'
import { useIsFocused } from '@react-navigation/native'
import DocumentPicker from 'react-native-document-picker'
import CONFIG from '../components/Config'
import ItemTablica from '../components/ItemTablica'
import SearchIco from '../svg/SearchIco'
import AddIco from '../svg/AddIco'
import BottomBar from '../components/BottomBar'
import PopUpServer from '../components/PopUpServer'
import Avatar from '../img/avatar.png'

const Konto = ({ route, navigation }) =>{
    const [list, setList] = useState({
        login: '',
        avatar: ''
    });
    const [error, setError] = useState(false)
    const changeAvatar = ()=>{
        DocumentPicker.pickSingle({
            type: [DocumentPicker.types.images]
        })
        .then(res =>{
            const db = new Datastore({ filename: 'user', storage: AsyncStorage, autoload: true });
            db.find({}, (err, docs) =>{
                const formData = new FormData();
                formData.append('login', docs[0].login);
                formData.append('password', docs[0].password);
                formData.append('avatar', res);
                fetch(CONFIG.HOST_ADRES + "user/change/avatar", {
                    method: 'post',
                    body: formData,
                    headers: {
                       'Content-Type': 'multipart/form-data;',
                        },
                    })
                    .then(res => res.json())
                    .then(data =>{
                          if (data.status == "ok") {
                            fetch(CONFIG.HOST_ADRES + "user/check", {
                                headers: {
                                    'Accept': 'application/json',
                                    'Content-Type': 'application/json'
                                },
                                method: "POST",
                                body: JSON.stringify({
                                    login: docs[0].login,
                                    password: docs[0].password
                                })
                            })
                            .then(response => response.json())
                            .then(userId =>{
                                if (userId.status == "ok") {
                                    fetch(CONFIG.HOST_ADRES + "user/avatar", {
                                        headers: {
                                            'Accept': 'application/json',
                                            'Content-Type': 'application/json'
                                        },
                                        method: "POST",
                                        body: JSON.stringify({
                                            login: docs[0].login,
                                            password: docs[0].password,
                                            id: userId.data
                                        })
                                    })
                                    .then(response => response.json())
                                    .then(userAvatar =>{
                                        if (userAvatar.status == "ok") {
                                            setList({
                                                login: docs[0].login,
                                                avatar: userAvatar.data,
                                                tab: "Dołączone",
                                                data: []
                                            });
                                        } else {
                                            if (userAvatar.description != undefined) {
                                                setError(userAvatar.description);
                                            } else {
                                                setError("Błąd po stronie serwera, spróbuj ponownie");
                                                console.log(userAvatar);
                                            }
                                        }
                                    }).catch(err =>{
                                        setError("Błąd w połączeniu, spróbuj ponownie");
                                        console.log(err);
                                    });
                                } else {
                                    if (userId.description != undefined) {
                                        setError(userId.description);
                                    } else {
                                        setError("Błąd po stronie serwera, spróbuj ponownie");
                                        console.log(userId);
                                    }
                                }
                            }).catch(err =>{
                                setError("Błąd w połączeniu, spróbuj ponownie");
                                console.log(err);
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
        }).catch(err =>{
            setError("Błąd w połączeniu, spróbuj ponownie");
            console.log(err);
        });
    }
    const changeLogin = ()=>{
        navigation.navigate("FormChangeLogin");
    }
    const changePassword = ()=>{
        navigation.navigate("FormChangePassword");
    }
    const logout = ()=>{
        navigation.navigate("FormLogout");
    }
    const openDolaczonePage = ()=>{
        navigation.navigate("SelectList", { source: "KontoJoined" });
        /*
        if (list.tab === "Dołączone") setLoading(true);
        const db = new Datastore({ filename: 'user', storage: AsyncStorage, autoload: true });
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
                    pageNumber: (list.tab == "Dołączone") ? (Math.ceil(list.data.length / 25) + 1) : 1,
                    searchString: searchString
                })
            })
            .then(response => response.json())
            .then(joinGame =>{
                if (joinGame.status == "ok") {
                    fetch(CONFIG.HOST_ADRES + "user/check", {
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        method: "POST",
                        body: JSON.stringify({
                            login: docs[0].login,
                            password: docs[0].password
                        })
                    })
                    .then(response => response.json())
                    .then(userId =>{
                        if (userId.status == "ok") {
                            fetch(CONFIG.HOST_ADRES + "user/avatar", {
                                headers: {
                                    'Accept': 'application/json',
                                    'Content-Type': 'application/json'
                                },
                                method: "POST",
                                body: JSON.stringify({
                                    login: docs[0].login,
                                    password: docs[0].password,
                                    id: userId.data
                                })
                            })
                            .then(response => response.json())
                            .then(userAvatar =>{
                                if (list.tab === "Dołączone") setLoading(false);
                                if (userAvatar.status == "ok") {
                                    setList({
                                        login: docs[0].login,
                                        avatar: userAvatar.data,
                                        searchString: searchString,
                                        tab: "Dołączone",
                                        data: joinGame.data
                                    });
                                } else {
                                    if (userAvatar.description != undefined) {
                                        setError(userAvatar.description);
                                    } else {
                                        setError("Błąd po stronie serwera, spróbuj ponownie");
                                        console.log(userAvatar);
                                    }
                                }
                            }).catch(err =>{
                                setError("Błąd w połączeniu, spróbuj ponownie");
                                console.log(err);
                            });
                        } else {
                            if (userId.description != undefined) {
                                setError(userId.description);
                            } else {
                                setError("Błąd po stronie serwera, spróbuj ponownie");
                                console.log(userId);
                            }
                        }
                    }).catch(err =>{
                        setError("Błąd w połączeniu, spróbuj ponownie");
                        console.log(err);
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
                setError("Błąd w połączeniu, spróbuj ponownie");
                console.log(err);
            });
        });
    */}
    const openStworzonePage = ()=>{
        navigation.navigate("SelectList", { source: "KontoCreated" });
        /*
        if (list.tab === "Stworzone") setLoading(true);
        const db = new Datastore({ filename: 'user', storage: AsyncStorage, autoload: true });
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
                    pageNumber: (list.tab == "Stworzone") ? (Math.ceil(list.data.length / 25) + 1) : 1,
                    searchString: searchString
                })
            })
            .then(response => response.json())
            .then(joinGame =>{
                if (joinGame.status == "ok") {
                    fetch(CONFIG.HOST_ADRES + "user/check", {
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        method: "POST",
                        body: JSON.stringify({
                            login: docs[0].login,
                            password: docs[0].password
                        })
                    })
                    .then(response => response.json())
                    .then(userId =>{
                        if (userId.status == "ok") {
                            fetch(CONFIG.HOST_ADRES + "user/avatar", {
                                headers: {
                                    'Accept': 'application/json',
                                    'Content-Type': 'application/json'
                                },
                                method: "POST",
                                body: JSON.stringify({
                                    login: docs[0].login,
                                    password: docs[0].password,
                                    id: userId.data
                                })
                            })
                            .then(response => response.json())
                            .then(userAvatar =>{
                                if (list.tab === "Stworzone") setLoading(false);
                                if (userAvatar.status == "ok") {
                                    setList({
                                        login: docs[0].login,
                                        avatar: userAvatar.data,
                                        searchString: searchString,
                                        tab: "Stworzone",
                                        data: joinGame.data
                                    });
                                } else {
                                    if (userAvatar.description != undefined) {
                                        setError(userAvatar.description);
                                    } else {
                                        setError("Błąd po stronie serwera, spróbuj ponownie");
                                        console.log(userAvatar);
                                    }
                                }
                            }).catch(err =>{
                                setError("Błąd w połączeniu, spróbuj ponownie");
                                console.log(err);
                            });
                        } else {
                            if (userId.description != undefined) {
                                setError(userId.description);
                            } else {
                                setError("Błąd po stronie serwera, spróbuj ponownie");
                                console.log(userId);
                            }
                        }
                    }).catch(err =>{
                        setError("Błąd w połączeniu, spróbuj ponownie");
                        console.log(err);
                    });
                } else {
                    if (joinGame.description != undefined) {
                        setError(joinGame.description);
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
    */}
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
        const db = new Datastore({ filename: 'user', storage: AsyncStorage, autoload: true });
        db.find({}, (err, docs) =>{
            fetch(CONFIG.HOST_ADRES + "user/check", {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: "POST",
                body: JSON.stringify({
                    login: docs[0].login,
                    password: docs[0].password
                })
            })
            .then(response => response.json())
            .then(userId =>{
                if (userId.status == "ok") {
                    fetch(CONFIG.HOST_ADRES + "user/avatar", {
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        method: "POST",
                        body: JSON.stringify({
                            login: docs[0].login,
                            password: docs[0].password,
                            id: userId.data
                        })
                    })
                    .then(response => response.json())
                    .then(userAvatar =>{
                        if (list.tab === "Stworzone") setLoading(false);
                        if (userAvatar.status == "ok") {
                            setList({
                                login: docs[0].login,
                                avatar: userAvatar.data
                            });
                        } else {
                            if (userAvatar.description != undefined) {
                                setError(userAvatar.description);
                            } else {
                                setError("Błąd po stronie serwera, spróbuj ponownie");
                                console.log(userAvatar);
                            }
                        }
                    }).catch(err =>{
                        setError("Błąd w połączeniu, spróbuj ponownie");
                        console.log(err);
                    });
                } else {
                    if (userId.description != undefined) {
                        setError(userId.description);
                    } else {
                        setError("Błąd po stronie serwera, spróbuj ponownie");
                        console.log(userId);
                    }
                }
            }).catch(err =>{
                setError("Błąd w połączeniu, spróbuj ponownie");
                console.log(err);
            });
        });
    }, [isFocused]);
    return (
        <View style={style.main}>
            <ScrollView style={style.list}>
                <View>
                    <Text style={style.loginText}>{list.login}</Text>
                </View>
                <View style={style.avatarContainer}>
                    {/* console.log(list) */}
                    {
                        (list.avatar == "") &&
                            <Image style={style.avatarImage} source={Avatar} />
                    }
                    {
                        (list.avatar != "") &&
                            <Image style={style.avatarImage} source={{ uri: CONFIG.HOST_ADRES + list.avatar + '?' + new Date() }} />
                    }
                </View>
                <View style={style.row}>
                    <TouchableWithoutFeedback onPress={openDolaczonePage}>
                        <View style={style.container}>
                            <Text style={style.text}>Dołączone</Text>
                            <Text style={style.text}>mecze</Text>
                        </View>
                    </TouchableWithoutFeedback>
                    <TouchableWithoutFeedback onPress={openStworzonePage}>
                        <View style={style.container}>
                            <Text style={style.text}>Stworzone</Text>
                            <Text style={style.text}>mecze</Text>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
                <View style={style.row}>
                    <TouchableWithoutFeedback onPress={changeLogin}>
                        <View style={style.container}>
                            <Text style={style.text}>Zmień</Text>
                            <Text style={style.text}>Login</Text>
                        </View>
                    </TouchableWithoutFeedback>
                    <TouchableWithoutFeedback onPress={changePassword}>
                        <View style={style.container}>
                            <Text style={style.text}>Zmień</Text>
                            <Text style={style.text}>Hasło</Text>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
                <View style={style.row}>
                    <TouchableWithoutFeedback onPress={changeAvatar}>
                        <View style={style.container}>
                            <Text style={style.text}>Zmień</Text>
                            <Text style={style.text}>Avatar</Text>
                        </View>
                    </TouchableWithoutFeedback>
                    <TouchableWithoutFeedback onPress={logout}>
                        <View style={style.container}>
                            <Text style={style.text}>Wyloguj</Text>
                            <Text style={style.text}>się</Text>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </ScrollView>
            {/*
                <FlatList
                    data={list.data}
                    ref={listRef}
                    keyExtractor={(item) => item.id}
                    renderItem={
                        ({item})=>
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
                            source="Konto"
                            target=""
                            />
                    }
                    onEndReachedThreshold={5}
                    onEndReached={()=>{
                        if (list.tab == "Dołączone") {
                            setDolaczoneTab();
                        } else {
                            setStworzoneTab();
                        }
                    }}
                />
            */}
            {
                (error != "") && <PopUpServer message={error} closeHandler={()=>{setError(false);}} />
            }
            <BottomBar navigation={navigation} activeOption="Konto"/>
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
    list: {
        width: "100%"
    },
    text: {
        color: "white",
        fontSize: 20
    },
    loginText: {
        width: "100%",
        textAlign: "center",
        color: "white",
        fontSize: 25,
        marginTop: 10,
        marginBottom: 10
    },
    avatarContainer: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "center",
        height: 200,
        marginBottom: 10
    },
    avatarImage: {
        margin: "auto",
        width: 200,
        height: 200
    },
    row: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-evenly"
    },
    container: {
        width: "45%",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        borderWidth: 1,
        borderColor: "white",
        borderRadius: 20,
        paddingTop: 10,
        paddingBottom: 10,
        marginTop: 10,
        marginBottom: 10
    }
});

export default Konto