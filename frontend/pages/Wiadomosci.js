import { useEffect, useState, useRef } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableWithoutFeedback } from 'react-native'
import Datastore from 'react-native-local-mongodb'
import AsyncStorage from '@react-native-async-storage/async-storage'
import NetInfo from '@react-native-community/netinfo'
import { useIsFocused } from '@react-navigation/native'
import CONFIG from '../components/Config'
import SearchIco from '../svg/SearchIco'
import AddIco from '../svg/AddIco'
import ItemWiadomosci from '../components/ItemWiadomosci'
import BottomBar from '../components/BottomBar'
import PopUpServer from '../components/PopUpServer'

const Wiadomosci = ({ route, navigation }) => {
    const [list, setList] = useState({
        label: '',
        searchString: '',
        data: []
    });
    const [error, setError] = useState(false)
    const listRef = useRef(null)
    const [isLoading, setLoading] = useState(false)
    const isFocused = useIsFocused();

// funkcja do ładowania danych - START
    const dataLoader = target=>{
        if (target != list.label) {
            const searchString = (('searchString' in route.params) && (typeof(route.params.searchString) != 'undefined')) ? route.params.searchString : '';
            const db = new Datastore({ filename: 'user', storage: AsyncStorage, autoload: true });
            db.find({}, (err, docs) =>{
                const url = (target == 'user') ? CONFIG.HOST_ADRES + "user/list" : CONFIG.HOST_ADRES + "group/list";
                fetch(url, {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    method: "POST",
                    body: JSON.stringify({
                        login: docs[0].login,
                        password: docs[0].password,
                        pageSize: 25,
                        pageNumber: 1,
                        searchString: searchString
                    })
                })
                .then(response => response.json())
                .then(data =>{
                    if (data.status == "ok") {
                        setList({
                            label: target,
                            searchString: searchString,
                            data: data.data
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
            setLoading(true);
            const searchString = (('searchString' in route.params) && (typeof(route.params.searchString) != 'undefined')) ? route.params.searchString : '';
            const db = new Datastore({ filename: 'user', storage: AsyncStorage, autoload: true });
            db.find({}, (err, docs) =>{
                const url = (target == 'user') ? CONFIG.HOST_ADRES + "user/list" : CONFIG.HOST_ADRES + "group/list";
                fetch(url, {
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
                        searchString: searchString
                    })
                })
                .then(response => response.json())
                .then(data =>{
                    setLoading(false);
                    if (data.status == "ok") {
                        setList({
                            label: target,
                            searchString: searchString,
                            data: data.data
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
            });
        }
    }
// funkcja do ładowania danych - KONIEC

    const setUser = ()=>{
        if (list.label == 'group') dataLoader('user');
    };
    const setGroup = ()=>{
        if (list.label == 'user') dataLoader('group');
    };
    const searchAction = ()=>{
        if (list.label == "user") {
            navigation.navigate("Search", { source: "WiadomościUser" });
        } else {
            navigation.navigate("Search", { source: "WiadomościGroup" });
        }
    };
    const addAction = ()=>{
        navigation.navigate("FormGroup", { createOrModify: 'create' });
    };
    const loadMore = ()=>{dataLoader(list.label);}
    useEffect(()=>{
        NetInfo.addEventListener(state => {
            if (isFocused) {
                const offline = !state.isConnected;
                if (offline) {
                    setError("Brak internetu");
                } else {
                    setError(false);
                }
            }
        });
        if (isFocused && (error === false)) {
            listRef.current.scrollToOffset({ offset: 0, animated: false });
            dataLoader(route.params.target);
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
                        <View style={(list.label == "user") && style.invisible}>
                            <AddIco />
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </View>
            <View style={style.tabRow}>
                <TouchableWithoutFeedback onPress={setUser}>
                    <View style={(list.label == "user") ? style.tabActive : style.tabInactive}>
                        <Text style={style.text}>Użytkownicy</Text>
                    </View>
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback onPress={setGroup}>
                    <View style={(list.label == "group") ? style.tabActive : style.tabInactive}>
                        <Text style={style.text}>Grupy</Text>
                    </View>
                </TouchableWithoutFeedback>
            </View>
            {   (list.searchString != '') &&
                    <View style={style.searchStringContainer}><Text style={style.text}>{list.searchString}</Text></View>
            }
            <FlatList style={style.list}
                ref={listRef}
                data={list.data}
                keyExtractor={(item) => item.id}
                renderItem={({item})=>{
                    if (list.label == 'user') {
                        return <ItemWiadomosci id={item.id} name={item.login} avatar={item.avatar} navigation={navigation} target="user" searchString={route.params.searchString} />
                    } else {
                        return <ItemWiadomosci id={item.id} name={item.name} avatar="" navigation={navigation} target="group" searchString={route.params.searchString} />
                    }
                }}
                onEndReachedThreshold={5}
                onEndReached={loadMore}
            />
            {
                isLoading &&
                    <View style={style.dataLoadingContainer}>
                        <Text style={style.dataLoadingText}>Ładowanie danych</Text>
                    </View>
            }
            {/*
            <ScrollView style={style.list}>
                {
                    (list.label == "user") &&
                        list.data.map(el => <ItemWiadomosci key={el.id} id={el.id} name={el.login} avatar={el.avatar} navigation={navigation} target="user" searchString={route.params.searchString} />)
                }
                {
                    (list.label == "group") &&
                        list.data.map(el => <ItemWiadomosci key={el.id} id={el.id} name={el.name} avatar="" navigation={navigation} target="group" searchString={route.params.searchString} />)
                }
            </ScrollView>
            */}
            {
                (error != "") && <PopUpServer message={error} closeHandler={()=>{setError(false);}} />
            }
            <BottomBar navigation={navigation} activeOption="Wiadomosci"/>
        </View>
    )
}

const style = StyleSheet.create({
    main:{
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
    tabRow: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        marginTop: 15
    },
    tabActive: {
        width: 150,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "white",
        borderRadius: 20,
        paddingTop: 10,
        paddingBottom: 10,
        opacity: 1
    },
    tabInactive: {
        width: 150,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "white",
        borderRadius: 20,
        paddingTop: 10,
        paddingBottom: 10,
        opacity: 0.4
    },
    searchStringContainer: {
        justifyContent: "center",
        alignContent: "center",
        marginTop: 20
    },
    text: {
        color: "white",
        fontSize: 20
    },
    list: {
        width: "100%",
        marginTop: 15
    },
    invisible: {
        opacity: 0
    },
    dataLoadingContainer: {
        marginBottom: 20
    },
    dataLoadingText: {
        color: "white",
        fontSize: 15,
        textDecorationLine: "underline"
    }
});

export default Wiadomosci