import { useState, useEffect } from 'react'
import { View, Text, Image, StyleSheet, ScrollView, TouchableWithoutFeedback } from 'react-native'
import Datastore from 'react-native-local-mongodb'
import AsyncStorage from '@react-native-async-storage/async-storage'
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
        avatar: '',
        searchString: '',
        tab: '',
        data: []
    });
    const [error, setError] = useState(false);
    const searchAction = ()=>{
        if (list.tab == "Dołączone") {
            navigation.navigate("Search", { source: "KontoJoined" });
        } else {
            navigation.navigate("Search", { source: "KontoCreated" });
        }
    }
    const addAction = ()=>{
        navigation.navigate("FormMecz", { source: "Konto", target: "create"});
    }
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
    const setDolaczoneTab = searchString =>{
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
    }
    const setStworzoneTab = searchString =>{
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
    }
    const isFocused = useIsFocused();
    useEffect(()=>{
        if (isFocused) {
            const searchString = ('searchString' in route.params) ? route.params.searchString : "";
            if ('target' in route.params) {
                if (route.params.target == 'created') {
                    setStworzoneTab(searchString);
                } else {
                    setDolaczoneTab(searchString);
                }
            } else {
                setDolaczoneTab(searchString);
            }
        }
    }, [isFocused]);
    return (
        <View style={style.main}>
            <View style={style.topBar}>
                <View>
                    <TouchableWithoutFeedback onPress={searchAction}>
                        <View>
                            <SearchIco />
                        </View>
                    </TouchableWithoutFeedback>
                </View>
                <View>
                    <TouchableWithoutFeedback onPress={addAction}>
                        <View style={(list.tab == "Dołączone") && style.invisible}>
                            <AddIco />
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </View>
            <ScrollView style={style.list}>
                <View style={style.userConfig}>
                    <View>
                        <Text style={style.loginText}>{list.login}</Text>
                    </View>
                    <View style={style.center}>
                        <View style={style.avatarContainer}>
                            { console.log(list) }
                            {
                                (list.avatar == "") &&
                                    <Image style={style.avatarImage} source={Avatar} />
                            }
                            {
                                (list.avatar != "") &&
                                    <Image style={style.avatarImage} source={{ uri: CONFIG.HOST_ADRES + list.avatar + '?' + new Date() }} />
                            }
                            
                        </View>
                    </View>
                    <View style={style.center}>
                        <TouchableWithoutFeedback onPress={changeAvatar}>
                            <View style={style.changeAvatarContainer}>
                                <Text style={style.changeAvatarText}>Zmień Avatar</Text>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                    <View style={style.center}>
                        <TouchableWithoutFeedback onPress={changeLogin}>
                            <View style={style.changeLoginContainer}>
                                <Text style={style.changeLoginText}>Zmień Login</Text>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                    <View style={style.center}>
                        <TouchableWithoutFeedback onPress={changePassword}>
                            <View style={style.changePasswordContainer}>
                                <Text style={style.changePasswordText}>Zmień Hasło</Text>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                    <View style={style.center}>
                        <TouchableWithoutFeedback onPress={logout}>
                            <View style={style.logoutContainer}>
                                <Text style={style.logoutText}>Wyloguj się</Text>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </View>
                <View style={style.tabRow}>
                    <TouchableWithoutFeedback onPress={()=>{setDolaczoneTab('')}}>
                        <View style={(list.tab == "Dołączone") ? style.tabActive : style.tabInactive}>
                            <Text style={style.text}>Dołączone mecze</Text>
                        </View>
                    </TouchableWithoutFeedback>
                    <TouchableWithoutFeedback onPress={()=>{setStworzoneTab('')}}>
                        <View style={(list.tab == "Stworzone") ? style.tabActive : style.tabInactive}>
                            <Text style={style.text}>Stworzone mecze</Text>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
                {
                    (list.searchString != '') && 
                        <View><Text style={style.textSearchstring}>{list.searchString}</Text></View>
                }
                {
                    (list.tab == "Dołączone") && list.data.map(el => <ItemTablica key={el.id}
                        id={el.id}
                        navigation={navigation}
                        name={el.name}
                        category={el.category}
                        advancement={el.advancement}
                        location={el.location}
                        time={el.time}
                        pay={el.pay}
                        openPosition={el.openPosition}
                        users={el.users}
                        source="Konto"
                        target="joined" />)
                }
                {
                    (list.tab == "Stworzone") && list.data.map(el => <ItemTablica key={el.id}
                        id={el.id}
                        navigation={navigation}
                        name={el.name}
                        category={el.category}
                        advancement={el.advancement}
                        location={el.location}
                        time={el.time}
                        pay={el.pay}
                        openPosition={el.openPosition}
                        users={el.users}
                        source="Konto"
                        target="created" />)
                }
            </ScrollView>
            {
                (error != "") && <PopUpServer message={error} closeHandler={()=>{setError("");}} />
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
    topBar: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingTop: 15,
        paddingLeft: 15,
        paddingRight: 15,
        height: 65
    },
    userConfig: {
        width: "100%"
    },
    tabRow: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 10,
        marginBottom: 25
    },
    tabActive: {
        borderColor: "white",
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
        opacity: 1
    },
    tabInactive: {
        borderColor: "white",
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
        opacity: 0.4
    },
    list: {
        width: "100%"
    },
    text: {
        color: "white",
        fontSize: 20
    },
    textSearchstring: {
        color: "white",
        fontSize: 35,
        textAlign: "center",
        marginBottom: 20
    },
    invisible: {
        opacity: 0
    },
    center: {
        width: "100%",
        alignItems: "center"
    },
    loginText: {
        width: "100%",
        textAlign: "center",
        color: "white",
        fontSize: 25
    },
    avatarContainer: {
        width: 200,
        height: 200
    },
    avatarImage: {
        width: 200,
        height: 200
    },
    changeAvatarContainer: {
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
    changeAvatarText: {
        color: "white"
    },
    changeLoginContainer: {
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
    changeLoginText: {
        color: "white"
    },
    changePasswordContainer: {
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
    changePasswordText: {
        color: "white"
    },
    logoutContainer: {
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
    logoutText: {
        color: "white"
    }
});

/*
    1. Obrazy o dużej rozdzielczości się nie ładują
    2. Jest problem z tym, że aplikacja trzyma te obrazy w cache

    ---

    Zmniejszyć rozmiary obrazów i spróbować je ładować przez base64
*/

export default Konto