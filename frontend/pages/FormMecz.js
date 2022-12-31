import { useState, useEffect } from "react"
import { ScrollView, View, Text, TouchableWithoutFeedback, StyleSheet, TextInput } from "react-native"
import { useIsFocused } from '@react-navigation/native'
import Datastore from 'react-native-local-mongodb'
import AsyncStorage from '@react-native-async-storage/async-storage'
import CONFIG from "../components/Config"
import DatePicker, { getFormatedDate } from 'react-native-modern-datepicker'
import { Slider } from '@miblanchard/react-native-slider'
import ReturnArrowIco from "../svg/ReturnArrowIco"
import PopUpServer from "../components/PopUpServer"

const FormMecz = ({ route, navigation }) => {
    const createOrModify = (() => {
        if (route.params.target == "create") {
            return "create";
        }
        return "modify";
    })();
    const [game, setGame] = useState({
        name: "",
        sport: "",
        advancement: 2,
        location: "",
        time: "",
        price: "",
        people_counter: ""
    });
    const [error, setError] = useState(false);

    const nameChange = text => {
        setGame({
            name: text,
            sport: game.sport,
            advancement: game.advancement,
            location: game.location,
            time: game.time,
            price: game.price,
            people_counter: game.people_counter
        });
    }
    const sportChange = text => {
        setGame({
            name: game.name,
            sport: text,
            advancement: game.advancement,
            location: game.location,
            time: game.time,
            price: game.price,
            people_counter: game.people_counter
        });
    }
    const advancementChange = text => {
        setGame({
            name: game.name,
            sport: game.sport,
            advancement: text,
            location: game.location,
            time: game.time,
            price: game.price,
            people_counter: game.people_counter
        });
    }
    const locationChange = text => {
        setGame({
            name: game.name,
            sport: game.sport,
            advancement: game.advancement,
            location: text,
            time: game.time,
            price: game.price,
            people_counter: game.people_counter
        });
    }
    const timeChange = text => {
        const temp = text.replaceAll('/','-') + ":00";
        if(temp !== game.time) {
            setGame({
                name: game.name,
                sport: game.sport,
                advancement: game.advancement,
                location: game.location,
                time: text.replaceAll('/','-') + ":00",
                price: game.price,
                people_counter: game.people_counter
            });
        }
    }
    const priceChange = text => {
        setGame({
            name: game.name,
            sport: game.sport,
            advancement: game.advancement,
            location: game.location,
            time: game.time,
            price: text,
            people_counter: game.people_counter
        });
    }
    const people_counterChange = text => {
        setGame({
            name: game.name,
            sport: game.sport,
            advancement: game.advancement,
            location: game.location,
            time: game.time,
            price: game.price,
            people_counter: text
        });
    }
    const isFocused = useIsFocused();

    useEffect(() =>{
        if (createOrModify === "modify") {
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
                .then(data => {
                    if(data.status == "ok") {
                        setGame({
                            name: data.data.name,
                            sport: data.data.sport,
                            advancement: data.data.advancement.toString(),
                            location: data.data.location,
                            time: data.data.time,
                            price: data.data.price,
                            people_counter: data.data.people_counter.toString()
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

    const action = () => {
        const add = () => {
            const db = new Datastore({ filename: 'user', storage: AsyncStorage, autoload: true });
            db.find({}, (err, docs) =>{
                fetch(CONFIG.HOST_ADRES + "game/create", {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    method: "POST",
                    body: JSON.stringify({
                        login: docs[0].login,
                        password: docs[0].password,
                        name: game.name,
                        sport: game.sport,
                        advancement: game.advancement,
                        location: game.location,
                        time: game.time,
                        price: game.price,
                        people_counter: game.people_counter
                    })
                })
                .then(response => response.json())
                .then(data =>{
                    if (data.status == "ok") {
                        navigation.navigate("Tablica");
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
        const change = () =>{
            const db = new Datastore({ filename: 'user', storage: AsyncStorage, autoload: true });
            db.find({}, (err, docs) =>{
                fetch(CONFIG.HOST_ADRES + "game/change", {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    method: "POST",
                    body: JSON.stringify({
                        login: docs[0].login,
                        password: docs[0].password,
                        id: route.params.id,
                        name: game.name,
                        sport: game.sport,
                        advancement: game.advancement,
                        location: game.location,
                        time: game.time,
                        price: game.price,
                        people_counter: game.people_counter
                    })
                })
                .then(response => response.json())
                .then(data =>{
                    if (data.status == "ok") {
                        navigation.navigate("Tablica");
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
        if(createOrModify === "create") {
            add();
        } else {
            change();
        }
    }
    const actionReturn = ()=>{
        switch (route.params.source) {
            case 'Tablica':
                navigation.navigate('Tablica');
            break;
            case 'Konto':
                navigation.navigate('Konto', { target: 'created', searchString: '' });
            break;
        }
    }
    return (
        <View style={style.main}>
            <View style={style.topBar}>
                <TouchableWithoutFeedback onPress={()=>{navigation.navigate("Tablica")}}>
                    <View>
                        <ReturnArrowIco />
                    </View>
                </TouchableWithoutFeedback>
            </View>
            <ScrollView style={style.background}>
                <Text style={[style.text, style.label]}>Nazwa</Text>
                <View style={style.formContainer}>
                    <TextInput style={style.formText} onChangeText={nameChange} value={game.name} />
                </View>
                <Text style={[style.text, style.label]}>Sport</Text>
                <View style={style.formContainer}>
                    <TextInput style={style.formText} onChangeText={sportChange} value={game.sport} />
                </View>
                <Text style={[style.text, style.label]}>{"Zaawansowanie: " + game.advancement}</Text>
                <View style={style.formContainer}>
                    <Text style={style.text}>0 </Text>
                    <Slider
                        containerStyle={{ width: "70%" }}
                        thumbTintColor="white"
                        minimumTrackTintColor="white"
                        maximumTrackTintColor="white"
                        minimumValue={0}
                        maximumValue={10}
                        step={1}
                        value={game.advancement}
                        onValueChange={advancementChange}
                    />
                    <Text style={style.text}> 10</Text>
                </View>
                <Text style={[style.text, style.label]}>Lokacja</Text>
                <View style={style.formContainer}>
                    <TextInput style={style.formText} onChangeText={locationChange} value={game.location} />
                </View>
                <Text style={[style.text, style.label]}>Czas</Text>
                <View style={style.formContainer}>
                <DatePicker
                    onSelectedChange={timeChange}
                    options={{
                        backgroundColor: '#1c1c1c',
                        textHeaderColor: 'white',
                        textDefaultColor: 'white',
                        mainColor: '#F4722B'
                    }}
                    current={getFormatedDate(new Date(), 'YYYY-MM-DD h:m')}
                    selected={getFormatedDate(new Date(), 'YYYY-MM-DD h:m')}
                    minuteInterval={5}
                />
                </View>
                <Text style={[style.text, style.label]}>Płatne</Text>
                <View style={style.formContainer}>
                    <TextInput style={style.formText} keyboardType='numeric' onChangeText={priceChange} value={game.price} />
                </View>
                <Text style={[style.text, style.label]}>Ilość miejsc</Text>
                <View style={style.formContainer}>
                    <TextInput style={style.formText} keyboardType='numeric' onChangeText={people_counterChange} value={game.people_counter} />
                </View>
                <View style={style.center}>
                    <TouchableWithoutFeedback onPress={action}>
                        <View style={style.button}>
                            <Text style={style.text}>{(createOrModify === "create") ? "Utwórz" : "Zmień"}</Text>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
                {
                    (error != "") && <PopUpServer message={error} closeHandler={()=>{setError("");}} />
                }
            </ScrollView>
        </View>
    )
}

const style = StyleSheet.create({
    background: {
        backgroundColor: "#1c1c1c"
    },
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
    button: {
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "white",
        width: 100,
        height: 50,
        borderRadius: 10,
        marginTop: 15,
        marginBottom: 25
    },
    text: {
        color: "white",
        fontSize: 25
    },
    label: {
        marginLeft: 30
    },
    center: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "center"
    },
    formContainer: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 10,
        marginBottom: 10
    },
    formText: {
        color: "white",
        borderWidth: 1,
        borderColor: "white",
        borderRadius: 10,
        padding: 5,
        width: "85%"
    }
});

export default FormMecz