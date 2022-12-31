import { Image, View, Text, StyleSheet, TouchableWithoutFeedback } from 'react-native'
import CONFIG from './Config'
import Avatar from '../img/avatar.png'

const ItemWiadomosci = ({ id, avatar, name, navigation, target, searchString }) => {
  const open = ()=>{
    navigation.navigate("FormWiadomosci", { id: id, target: target, name: name, avatar: avatar, searchString: searchString });
  }
  return (
    <TouchableWithoutFeedback onPress={open}>
      <View style={style.main}>
        {
          ((target == 'user') && (avatar == "")) &&
            <View><Image style={style.img} source={Avatar} /></View>
        }
        {
          ((target == 'user') && (avatar != "")) &&
            <View><Image style={style.img} source={{ uri: CONFIG.HOST_ADRES + avatar + '?' + new Date() }} /></View>
        }
        <View style={(target == 'user') ? style.textContainerUser : style.textContainerGroup}>
          <Text style={(target == 'user') ? style.textUser : style.textGroup}>{name}</Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  )
}

const style = StyleSheet.create({
    main: {
      width: "100%",
      flexDirection: "row",
      borderWidth: 2,
      borderColor: "white",
      borderRadius: 10,
      marginBottom: 10
    },
    img: {
      width: 200,
      height: 200,
      borderRadius: 200,
      marginTop: 10,
      marginLeft: 10,
      marginBottom: 10
    },
    textContainerUser: {
      width: "50%",
      padding: 5
    },
    textContainerGroup: {
      width: "100%",
      paddingTop: 20,
      paddingBottom: 20,
      marginTop: 10,
      marginBottom: 10
    },
    textUser: {
      color: "white",
      fontSize: 25,
      paddingLeft: 10,
      paddingRight: 10,
      paddingTop: 50
    },
    textGroup: {
      color: "white",
      fontSize: 25,
      textAlign: "center"
    }
});

export default ItemWiadomosci