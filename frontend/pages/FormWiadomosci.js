import { useState, useEffect, useRef } from 'react'
import { View, Text, TouchableWithoutFeedback, FlatList, StyleSheet, TextInput } from 'react-native'
import Datastore from 'react-native-local-mongodb'
import AsyncStorage from '@react-native-async-storage/async-storage'
import NetInfo from '@react-native-community/netinfo'
import { useIsFocused } from '@react-navigation/native'
import DocumentPicker from 'react-native-document-picker'
import CONFIG from '../components/Config'
import AddIco from '../svg/AddIco'
import ReturnArrowIco from '../svg/ReturnArrowIco'
import ItemMessage from '../components/ItemMessage'
import ImageIco from '../svg/ImageIco'
import SendArrowIco from '../svg/SendArrowIco'
import PopUpServer from '../components/PopUpServer'
import SettingsIco from '../svg/SettingsIco'

/*
    Jak to działa?
    STAN:
        {
            login: string,
            target: string,
            id: int,    // grupy albo użytkownika
            data: {
                id: int,    // wiadomości
                nick: string,
                content: string,
                isImage: bool
            }
        }
    - wczytywanie wiadomości grupowych:
        - useEffect
        - wysyłanie rzeczy 
    - wczytywanie wiadomości użytkowników:
        - useEffect
        - wysyłanie rzeczy
    - wysyłanie wiadomości do grup:

    - wysyłanie obrazów do grup:

    - wysyłanie wiadomości do użytkowników:

    - wysyłanie obrazów do użytkowników:

    - opcja przejścia do ustawień grup:
        - chyba jest dobrze, przekazanie id, nazwy (z paramsów) i trybu edycji
    - opcja powrotu:
        - chyba jest dobrze, powrót z przekazaniem wiadomości o zakładce i wyszukiwanym stringu z paramsów
*/

/*
    1. Funkcja do ładowania danych jest jedna, wywoływana z różnych miejsc
    2. Funkcja potrzebuje danych, od których zależy jej działanie
*/

const FormWiadomosciBottomBar = ({ target, id, setWiadomosci, messageList }) =>{
    const [text, setText] = useState("");
    const [error, setError] = useState(false);
    const changeText = val =>{
        setText(val);
    }
    const getMessages = async () =>{
        const defaultHeaders = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
        const db = new Datastore({ filename: 'user', storage: AsyncStorage, autoload: true });
        const credentials = {
            login: (await db.findAsync({}))[0].login,
            password: (await db.findAsync({}))[0].password
        }
        const messages = (await(await fetch(CONFIG.HOST_ADRES + "message/list", { headers: defaultHeaders, method: "POST", body: JSON.stringify({ login: credentials.login, password: credentials.password, type: target, target: id, pageSize: 25, pageNumber: (Math.ceil(messageList.length / 25) + 1) }) })).json()).data;
        const data = [];
        for(let i = 0; i < messages.length; i++) {
            data.push({
                id: messages[i]["id"],
                nick: messages[i]["sender"],
                avatar: messages[i]["avatar"],
                content: messages[i]["message"],
                isImage: (messages[i]["isImage"] == 1)
            });
        }
        data.sort((a, b)=>a["id"]-b["id"]);
        setWiadomosci({
            login: credentials.login,
            target: target,
            id: id,
            data: data
        });
        setText("");
    }
    const sendMessage = ()=>{
        const db = new Datastore({ filename: 'user', storage: AsyncStorage, autoload: true });
        db.find({}, (err, docs) =>{
            const url = (target == 'user') ? CONFIG.HOST_ADRES + "message/user/send-text" : CONFIG.HOST_ADRES + "message/group/send-text";
            fetch(url, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: "POST",
                body: JSON.stringify({
                    login: docs[0].login,
                    password: docs[0].password,
                    id: id,
                    message: text
                })
            })
            .then(response => response.json())
            .then(data =>{
                if (data.status == "ok") {
                    getMessages();
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
      const sendImage = ()=>{
        DocumentPicker.pickSingle({
            type: [DocumentPicker.types.images]
        })
        .then(res =>{
            const db = new Datastore({ filename: 'user', storage: AsyncStorage, autoload: true });
            db.find({}, (err, docs) =>{
                const formData = new FormData();
                formData.append('login', docs[0].login);
                formData.append('password', docs[0].password);
                formData.append('id', id);
                formData.append('image', res);
                const url = (target == 'user') ? CONFIG.HOST_ADRES + "message/user/send-image" : CONFIG.HOST_ADRES + "message/group/send-image";
                fetch(url, {
                    method: 'post',
                    body: formData,
                    headers: {
                       'Content-Type': 'multipart/form-data; ',
                        },
                    })
                    .then(res => res.json())
                    .then(data =>{
                        if (data.status == "ok") {
                            getMessages();
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
    return (
        <View style={style.bottomBar}>
            <TouchableWithoutFeedback onPress={sendImage}>
                <View style={style.button}>
                    <ImageIco />
                </View>
            </TouchableWithoutFeedback>
            <TextInput onChangeText={changeText} style={style.input} value={text} />
            <TouchableWithoutFeedback onPress={sendMessage}>
                <View style={style.button}>
                    <SendArrowIco />
                </View>
            </TouchableWithoutFeedback>
        </View>
    )
}

const FormWiadomosci = ({ route, navigation }) =>{
    const listRef = useRef(null);
    const [isLoading, setLoading] = useState(false);
    const [wiadomosci, setWiadomosci] = useState({
        login: "",
        target: "",
        id: -1,
        data: []
    });
    const [error, setError] = useState(false);
    const goBack = ()=>{
        const searchString = (('searchString' in route.params) && (typeof(route.params.searchString) != 'undefined')) ? route.params.searchString : '';
        if (route.params.target == "user") {
            navigation.navigate("Wiadomosci", { target: "user", searchString: searchString });
        } else {
            navigation.navigate("Wiadomosci", { target: "group", searchString: searchString });
        }
    }
    const goGroupSettings = ()=>{
        navigation.navigate("FormGroup", { createOrModify: 'modify', id: route.params.id, name: route.params.name });
    }
    const getMessages = async ()=>{
        const defaultHeaders = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
        const db = new Datastore({ filename: 'user', storage: AsyncStorage, autoload: true });
        const credentials = {
            login: (await db.findAsync({}))[0].login,
            password: (await db.findAsync({}))[0].password
        }
        const messages = (await(await fetch(CONFIG.HOST_ADRES + "message/list", { headers: defaultHeaders, method: "POST", body: JSON.stringify({ login: credentials.login, password: credentials.password, type: route.params.target, target: route.params.id, pageSize: 25, pageNumber: (Math.ceil(wiadomosci.data.length / 25) + 1) }) })).json()).data;
        const data = [];
        for(let i = 0; i < messages.length; i++) {
            data.push({
                id: messages[i]["id"],
                nick: messages[i]["sender"],
                avatar: messages[i]["avatar"],
                content: messages[i]["message"],
                isImage: (messages[i]["isImage"] == 1)
            });
        }
        data.sort((a, b)=>a["id"]-b["id"]);
        setWiadomosci({
            login: credentials.login,
            target: route.params.target,
            id: route.params.id,
            data: data
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
        if (isFocused) {
            listRef.current.scrollToOffset({ offset: 0, animated: false });
            getMessages();
        }
    }, [isFocused]);
  return (
    <View style={style.main}>
        <View style={style.topBar}>
            <TouchableWithoutFeedback onPress={goBack}>
                <View>
                    <ReturnArrowIco />
                </View>
            </TouchableWithoutFeedback>
            {
                (route.params.target == 'group') &&
                    <TouchableWithoutFeedback onPress={goGroupSettings}><View><SettingsIco /></View></TouchableWithoutFeedback>
            }
        </View>
        <View>
            <Text style={style.headerText}>{route.params.name}</Text>
        </View>
        <FlatList style={style.scrollView}
            ref={listRef}
            data={wiadomosci.data.reverse()}
            renderItem={({item})=><ItemMessage id={item.id} sender={item.nick} login={wiadomosci.login} content={item.content} isImage={item.isImage} avatar={item.avatar} />}
            onEndReachedThreshold={5}
            onEndReached={getMessages}
            inverted
        />
        {
            isLoading &&
                <View style={style.dataLoadingContainer}>
                    <Text style={style.dataLoadingText}>Ładowanie danych</Text>
                </View>
        }
        {/*
        <ScrollView style={style.scrollView} ref={scrollViewRef}
      onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: false })}>
        */}
        {
            /*
                Z route:
                    - ID - id docelowego użytkownika
                    - NAME - nazwa docelowego użytkownika
                    - AVATAR - avatar docelowego użytkownika
                    - TARGET - czy celem jest użytkownik, czy grupa
                Z serwera:
                    - ID - id wiadomości
                    - ISIMAGE - czy zdjęcie
                    - MESSAGE - wiadomość, albo zdjęcie
                    - RECEIVER - odbiorca wiadomości
                    - SENDER - nadawca wiadomości
                Z stanu:
                    - login, żeby jak najmniej logiki i zapytań było wewnątrz małych komponentów
            
            wiadomosci.data.map(el => <ItemMessage key={el.id} id={el.id} sender={el.nick} login={wiadomosci.login} content={el.content} isImage={el.isImage} avatar={el.avatar} />)
            */
        }
        {/*
        </ScrollView>
        */}
        {
            (error != "") && <PopUpServer message={error} closeHandler={()=>{setError("");}} />
        }
        <FormWiadomosciBottomBar target={route.params.target} id={route.params.id} setWiadomosci={setWiadomosci} messageList={wiadomosci.data} />
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
    headerText: {
        fontSize: 30,
        color: "white",
        marginBottom: 20,
        borderBottomColor: "white",
        borderBottomWidth: 2
    },
    scrollView: {
        width: "80%",
    },
    bottomBar: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        height: 80,
        marginBottom: 25
    },
    input: {
        color: "white",
        borderWidth: 1,
        borderColor: "white",
        borderRadius: 10,
        padding: 5,
        alignSelf: "center",
        width: "60%",
        marginLeft: 20,
        marginRight: 20
    },
    button: {
        width: 45,
        borderWidth: 1,
        borderColor: "white",
        borderRadius: 50,
        height: 45,
        paddingLeft: 5,
        paddingRight: 5,
        justifyContent: "center",
        alignItems: "center"
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

export default FormWiadomosci