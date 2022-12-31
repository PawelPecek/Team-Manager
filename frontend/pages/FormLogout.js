import { View, Text, StyleSheet, TouchableWithoutFeedback } from 'react-native'
import Datastore from 'react-native-local-mongodb'
import AsyncStorage from '@react-native-async-storage/async-storage'
import CONFIG from '../components/Config'

const FormLogout = ({navigation}) => {
    const accept = ()=>{
        const db = new Datastore({ filename: 'user', storage: AsyncStorage, autoload: true });
        db.remove({}, { multi: true }, ()=>{ navigation.navigate("Login") });
    }
    const cancel = ()=>{
        navigation.goBack();
    }
    return (
        <View style={style.main}>
            <View style={style.headerContainer}>
                <Text style={style.headerText}>Czy na pewno chcesz się wylogować?</Text>
            </View>
            <View style={style.optionRow}>
                <TouchableWithoutFeedback onPress={accept}>
                    <View style={style.optionContainer}>
                        <Text style={style.optionText}>Tak</Text>
                    </View>
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback onPress={cancel}>
                    <View style={style.optionContainer}>
                        <Text style={style.optionText}>Nie</Text>
                    </View>
                </TouchableWithoutFeedback>
            </View>
        </View>
    )
}

const style = StyleSheet.create({
    main: {
        width: "100%",
        height: "100%",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#1c1c1c"
    },
    headerContainer: {
        width: "100%",
        marginBottom: 40
    },
    headerText: {
        color: "white",
        textAlign: "center",
        fontSize: 20
    },
    optionRow: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 10,
        marginBottom: 10
    },
    optionContainer: {
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
    optionText: {
        color: "white"
    }
});

export default FormLogout