import { View, Text, StyleSheet, Image, TouchableWithoutFeedback } from 'react-native'
import CONFIG from './Config'
import Avatar from '../img/avatar.png'

const ItemMessage = ({ id, sender, login, content, isImage, avatar }) => {
  const layoutGenerator = ()=>{
    if (sender == login) {
      if (isImage == 0) {
        return <View style={style.senderTextContainer}><Text style={style.senderText}>{content}</Text></View>
      } else {
        return <View style={style.senderImageContainer}><Image style={style.senderImage} source={{ uri: CONFIG.HOST_ADRES + content + '?' + new Date() }} /></View>
      }
    } else {
      if (isImage == 0) {
        if (avatar == "") {
          return <View style={style.receiverTextContainer}><Image style={style.receiverTextAvatar} source={Avatar} /><Text style={style.receiverText}>{content}</Text></View>
        } else {
          return <View style={style.receiverTextContainer}><Image style={style.receiverTextAvatar} source={{ uri: CONFIG.HOST_ADRES + avatar + '?' + new Date() }} /><Text style={style.receiverText}>{content}</Text></View>
        }
      } else {
        if (avatar == "") {
          return <View style={style.receiverImageContainer}><Image style={style.receiverImageAvatar} source={Avatar} /><Image style={style.receiverImage} source={{ uri: CONFIG.HOST_ADRES + content + '?' + new Date() }} /></View>
        } else {
          return <View style={style.receiverImageContainer}><Image style={style.receiverImageAvatar} source={{ uri: CONFIG.HOST_ADRES + avatar + '?' + new Date() }} /><Image style={style.receiverImage} source={{ uri: CONFIG.HOST_ADRES + content + '?' + new Date() }} /></View>
        }
      }
    }
  }

  return (
    <>
      {
        layoutGenerator()
      }
    </>
  )
}

const style = StyleSheet.create({
  senderTextContainer: {
    width: "85%",
    borderWidth: 2,
    borderColor: "white",
    alignItems: "flex-end",
    marginTop: 5,
    marginBottom: 5,
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 10,
    marginLeft: "auto",
    borderRadius: 10
  },
  senderImageContainer: {
    width: "100%",
    alignItems: "flex-end",
    marginTop: 5,
    marginBottom: 5,
  },
  senderText: {
    width: "100%",
    color: "white",
    fontSize: 20,
    textAlign: "left"
  },
  senderImage: {
    width: 200,
    height: 200
  },
  receiverTextContainer: {
    flexDirection: "row",
    width: "80%",
    borderWidth: 2,
    borderColor: "white",
    alignItems: "flex-start",
    marginTop: 5,
    marginBottom: 5,
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 5,
    marginRight: "auto",
    borderRadius: 10
  },
  receiverImageContainer: {
    flexDirection: "row",
    width: "100%",
    alignItems: "flex-start",
    marginTop: 5,
    marginBottom: 5,
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 5,
  },
  receiverText: {
    flexDirection: "row",
    width: "80%",
    color: "white",
    fontSize: 20,
    textAlign: "left",
    marginLeft: 10,
    alignSelf: "flex-start"
  },
  receiverTextAvatar: {
    width: 40,
    height: 40
  },
  receiverImage: {
    width: 200,
    height: 200,
    marginLeft: 10
  },
  receiverImageAvatar: {
    width: 40,
    height: 40
  }
});

export default ItemMessage