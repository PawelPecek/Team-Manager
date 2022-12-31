import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Register from './pages/Register';
import Login from './pages/Login';
import Tablica from './pages/Tablica';
import Wiadomosci from './pages/Wiadomosci';
import Konto from './pages/Konto';
import Search from './pages/Search';
import FormMecz from './pages/FormMecz';
import FormChangeLogin from './pages/FormChangeLogin';
import FormChangePassword from './pages/FormChangePassword';
import FormLogout from './pages/FormLogout';
import ItemTablicaPage from './pages/ItemTablicaPage';
import FormWiadomosci from './pages/FormWiadomosci';
import FormGroup from './pages/FormGroup';
import FormMeczRemoveUser from './pages/FormMeczRemoveUser';
import UserList from './pages/UserList';

const Stack = createNativeStackNavigator();

const App = () => {

  return (
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ animation: 'none' }}>
            <Stack.Screen options={{headerShown: false}} name="Register" component={Register} />
            <Stack.Screen options={{headerShown: false}} name="Login" component={Login} />
            <Stack.Screen options={{headerShown: false}} name="Tablica" component={Tablica} />
            <Stack.Screen options={{headerShown: false}} name="Wiadomosci" component={Wiadomosci} />
            <Stack.Screen options={{headerShown: false}} name="Konto" component={Konto} />
            <Stack.Screen options={{headerShown: false}} name="Search" component={Search} />
            <Stack.Screen options={{headerShown: false}} name="FormMecz" component={FormMecz} />
            <Stack.Screen options={{headerShown: false}} name="FormChangeLogin" component={FormChangeLogin} />
            <Stack.Screen options={{headerShown: false}} name="FormChangePassword" component={FormChangePassword} />
            <Stack.Screen options={{headerShown: false}} name="FormLogout" component={FormLogout} />
            <Stack.Screen options={{headerShown: false}} name="ItemTablicaPage" component={ItemTablicaPage} />
            <Stack.Screen options={{headerShown: false}} name="FormWiadomosci" component={FormWiadomosci} />
            <Stack.Screen options={{headerShown: false}} name="FormGroup" component={FormGroup} />
            <Stack.Screen options={{headerShown: false}} name="FormMeczRemoveUser" component={FormMeczRemoveUser} />
            <Stack.Screen options={{headerShown: false}} name="UserList" component={UserList} />
          </Stack.Navigator>
        </NavigationContainer>
  )
};

export default App;