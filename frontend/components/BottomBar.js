import { View, TouchableWithoutFeedback, Image, Text, StyleSheet } from "react-native"
import TablicaIco from "../svg/TablicaIco"
import WiadomosciIco from "../svg/WiadomosciIco"
import KontoIco from "../svg/KontoIco"

const BottomBar = ({navigation, activeOption}) => {

    const goTo = tab=>{
        if (tab != activeOption) {
            navigation.navigate(tab, { target: "user", searchString: "" });
        }
    }

    return (
        <View style={style.bar}>
            <TouchableWithoutFeedback onPress={()=>{goTo("Tablica")}}>
                <View style={style.tile}>
                    <TablicaIco isActive={(activeOption == "Tablica")} />
                    <Text style={(activeOption == "Tablica") ? style.textActive : style.textInactive}>Tablica</Text>
                </View>
            </TouchableWithoutFeedback>
            <TouchableWithoutFeedback onPress={()=>{goTo('Wiadomosci')}}>
                <View  style={style.tile}>
                    <WiadomosciIco isActive={(activeOption == "Wiadomosci")} />
                    <Text style={(activeOption == "Wiadomosci") ? style.textActive : style.textInactive}>Wiadomości</Text>
                </View>
            </TouchableWithoutFeedback>
            <TouchableWithoutFeedback onPress={()=>{navigation.navigate('Konto', { target:'joined', searchString:'' })}}>
                <View style={style.tile}>
                    <KontoIco isActive={(activeOption == "Konto")} />
                    <Text style={(activeOption == "Konto") ? style.textActive : style.textInactive}>Konto</Text>
                </View>
            </TouchableWithoutFeedback>
        </View>
    )
};

const style = StyleSheet.create({
    bar: {
        width: "100%",
        height: 80,
        paddingBottom: 10,
        paddingTop: 10,
        flexDirection: "row",
        justifyContent: "space-around"
    },
    tile: {
        flexDirection: "column",
        alignItems: "center"
    },
    textActive: {
        paddingTop: 5,
        color: "#ebebeb"
    },
    textInactive: {
        paddingTop: 5,
        color: "#ebebeb",
        opacity: 0.4
    }
});

export default BottomBar