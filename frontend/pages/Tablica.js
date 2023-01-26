import { useState, useEffect, useRef } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableWithoutFeedback } from 'react-native'
import Datastore from 'react-native-local-mongodb'
import AsyncStorage from '@react-native-async-storage/async-storage'
import NetInfo from '@react-native-community/netinfo'
import { useIsFocused } from '@react-navigation/native'
import CONFIG from '../components/Config'
import SearchIco from '../svg/SearchIco'
import AddIco from '../svg/AddIco'
import BottomBar from '../components/BottomBar'
import ItemTablica from '../components/ItemTablica'
import PopUpServer from '../components/PopUpServer'

/*
    Lista wszystkich miejsc, gdzie jest infinite scroll do wstawienia:
    1. Tablica (X)
    2. Wiadomości
    3. Chat
    4. Konto
    5. UserList
    6. FormWiadomosci
 */

/*
    Rzeczy przeznaczone do upgradu:
    - taki sam mechanizm podziału zwracanych list i dociągania
    - komunikat, że się ładuje, dla scrolujących jak pojebani
*/

const Tablica = ({route, navigation}) => {
    const searchString = (() => {
        if(typeof(route.params) == "string") {
            return route.params.searchString;
        }
        return "";
    })();
    const [meczState, setMeczState] = useState([]);
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const listRef = useRef(null);
    const isFocused = useIsFocused();
    useEffect(()=>{
        console.log("Tablica - UseEffect");
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
            if (isFocused && (error === false)) {
                listRef.current.scrollToOffset({ offset: 0, animated: false });
                fetch(CONFIG.HOST_ADRES + "game/list", {
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
                        setMeczState(data.data);
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

    const searchAction = ()=>{
        navigation.navigate("Search", { source: "Tablica" });
    }
    const addAction = ()=>{
        navigation.navigate("FormMecz", { source: "Tablica", target: "create" });
    }
    const loadMore = ()=>{
        setLoading(true);
        const db = new Datastore({ filename: 'user', storage: AsyncStorage, autoload: true });
        db.find({}, (err, docs) =>{
            if (isFocused) {
                fetch(CONFIG.HOST_ADRES + "game/list", {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    method: "POST",
                    body: JSON.stringify({
                        login: docs[0].login,
                        password: docs[0].password,
                        pageSize: 25,
                        pageNumber: (Math.ceil(meczState.length / 25) + 1),
                        searchString: searchString
                    })
                })
                .then(response => response.json())
                .then(data =>{
                    setLoading(false);
                    if (data.status == "ok") {
                        setMeczState(data.data);
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
    }

    return (
        <View style={style.main}>
            <View style={style.topBar}>
                <TouchableWithoutFeedback onPress={searchAction}>
                    <View>
                        <SearchIco />
                    </View>
                </TouchableWithoutFeedback>
                <View>
                    <Text style={style.searchStringText}>{ searchString }</Text>
                </View>
                <TouchableWithoutFeedback onPress={addAction}>
                    <View>
                        <AddIco />
                    </View>
                </TouchableWithoutFeedback>
            </View>
            <FlatList style={style.scrollView}
                ref={listRef}
                data={meczState}
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
                        source="Tablica"
                        target=""
                        />
                }
                onEndReachedThreshold={5}
                onEndReached={loadMore}
            />
            {
                isLoading &&
                <View style={style.dataLoadingContainer}>
                    <Text style={style.dataLoadingText}>Ładowanie danych</Text>
                </View>
            }
            {
                (error != "") && <PopUpServer message={error} closeHandler={()=>{setError(false);}} />
            }
            <BottomBar navigation={navigation} activeOption="Tablica" />
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
        height: 65,
        paddingTop: 15,
        paddingLeft: 15,
        paddingRight: 15,
        flexDirection: "row",
        justifyContent: "space-between",
        alignContent: "center"
    },
    scrollView: {
        width: "100%"
    },
    searchStringText: {
        color: "white",
        fontSize: 25
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

export default Tablica