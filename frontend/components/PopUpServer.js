import { View, Text, StyleSheet, TouchableWithoutFeedback } from 'react-native'
import CloseIco from '../svg/CloseIco'

const PopUpServer = ({message, closeHandler}) => {
  const close = () => {
    closeHandler();
  }
  return (
    <View style={style.main}>
        <Text>{message}</Text>
        <TouchableWithoutFeedback onPress={close}>
            <View>
                <CloseIco />
            </View>
        </TouchableWithoutFeedback>
    </View>
  )
}

const style = StyleSheet.create({
    main: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 10,
        borderRadius: 20,
        width: "80%",
        backgroundColor: "white"
    }
});

export default PopUpServer