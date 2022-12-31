import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, TouchableWithoutFeedback, ScrollView, SectionList } from 'react-native'
import Datastore from 'react-native-local-mongodb'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useIsFocused } from '@react-navigation/native'
import CONFIG from '../components/Config'
import ReturnArrowIco from '../svg/ReturnArrowIco'
import RemoveIco from '../svg/RemoveIco'
import PopUpServer from '../components/PopUpServer'

const FormMeczRemoveUser = ({ route, navigation }) => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(false);
  const isFocused = useIsFocused();
  const returnAction = ()=>{
    navigation.goBack();
  }
  const remove = id => {
    const db = new Datastore({ filename: 'user', storage: AsyncStorage, autoload: true });
    db.find({}, (err, docs) =>{
        fetch(CONFIG.HOST_ADRES + "game/users/remove", {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify({
                login: docs[0].login,
                password: docs[0].password,
                idGame: route.params.id,
                idUser: id
            })
        })
        .then(response => response.json())
        .then(data =>{
            if (data.status == "ok") {
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
                        setUsers(data.data.users.filter(el => el.login != docs[0].login));
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
    const db = new Datastore({ filename: 'user', storage: AsyncStorage, autoload: true });
    db.find({}, (err, docs) =>{
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
               setUsers(data.data.users.filter(el => el.login != docs[0].login));
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
  }, [isFocused]);
  return (
    <View style={style.main}>
        <TouchableWithoutFeedback onPress={returnAction}>
            <View style={style.topBar}>
                <ReturnArrowIco />
            </View>
        </TouchableWithoutFeedback>
        <ScrollView style={style.scrollView}>
        {
            users.map(el => (
                <View key={el.id} style={style.cell}>
                    <View>
                        <Text style={style.titleText}>{el.login}</Text>
                    </View>
                    <TouchableWithoutFeedback onPress={()=>{remove(el.id)}}>
                        <View>
                            <RemoveIco />
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            ))
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
        width: "100%",
    },
    cell: {
        flexDirection: "row",
        width: "90%",
        marginLeft: "5%",
        padding:10,
        borderWidth: 2,
        borderColor: "white",
        borderRadius: 20,
        justifyContent: "space-between",
        marginTop: 15
    },
    titleText: {
        color: "white"
    }
});

export default FormMeczRemoveUser