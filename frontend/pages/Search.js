import { useState } from 'react'
import { Text, TextInput, View, StyleSheet, TouchableWithoutFeedback, ScrollView } from 'react-native'
import ReturnArrowIco from '../svg/ReturnArrowIco'
import SearchIco from '../svg/SearchIco'

const Search = ({ route, navigation })=>{
    const [searchString, setSearchString] = useState("");
    const changeText = text => { setSearchString(text) }
    const search = ()=>{
        switch (route.params.source) {
            case "Tablica":
                navigation.navigate("Tablica", {searchString: searchString});
            break;
            case "WiadomościUser":
                navigation.navigate("Wiadomosci", {target: "user", searchString: searchString});
            break;
            case "WiadomościGroup":
                navigation.navigate("Wiadomosci", {target: "group", searchString: searchString});
            break;
            case "KontoJoined":
                navigation.navigate("Konto", {target: "joined", searchString: searchString});
            break;
            case "KontoCreated":
                navigation.navigate("Konto", {target: "created", searchString: searchString});
            break;
            case "UserList":
                if (searchString != "") {
                    navigation.navigate("UserList", {searchString: searchString, id: route.params.id});
                } else {
                    navigation.navigate("UserList", {id: route.params.id});
                }
            break;
        }
    }
    const returnAction = ()=>{
        switch (route.params.source) {
            case "Tablica":
                navigation.navigate("Tablica", {searchString: ""});
            break;
            case "WiadomościUser":
                navigation.navigate("Wiadomosci", {target: "user", searchString: ""});
            break;
            case "WiadomościGroup":
                navigation.navigate("Wiadomosci", {target: "group", searchString: ""});
            break;
            case "KontoJoined":
                navigation.navigate("Konto", {target: "joined", searchString: ""});
            break;
            case "KontoCreated":
                navigation.navigate("Konto", {target: "created", searchString: ""});
            break;
            case "UserList":
                navigation.navigate("UserList", {id: route.params.id})
            break;
        }
    }
    return (
        <View style={style.main}>
            <View style={style.topBar}>
                <TouchableWithoutFeedback onPress={returnAction}>
                    <View>
                        <ReturnArrowIco />
                    </View>
                </TouchableWithoutFeedback>
            </View>
            <ScrollView style={style.scrollView}>
                <Text style={style.text}>Wyszukaj</Text>
                <View style={style.searchRow}>
                    <TextInput style={style.searchBar} onChangeText={changeText} value={searchString} />
                    <TouchableWithoutFeedback onPress={search}>
                        <View style={style.searchIcoContainer}>
                            <SearchIco />
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </ScrollView>
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
        paddingTop: 10,
        paddingLeft: 10,
        alignItems: "flex-start"
    },
    scrollView: {
        width: "100%",
        textAlign: "center"
    },
    text: {
        color: "white",
        textAlign: "center",
        fontSize: 25,
        marginBottom: 15,
        marginTop: 15
    },
    searchRow: {
        justifyContent: "center"
    },
    searchBar: {
        color: "white",
        borderWidth: 1,
        borderColor: "white",
        borderRadius: 10,
        padding: 5,
        alignSelf: "center",
        width: "75%"
    },
    searchIcoContainer: {
        color: "white",
        borderWidth: 3,
        borderColor: "white",
        borderRadius: 10,
        padding: 10,
        justifyContent: "center",
        alignContent: "center",
        marginTop: 20,
        width: 60,
        alignSelf: "center"
    },
});

export default Search