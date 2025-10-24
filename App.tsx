// import React from 'react';

// import Navigation from './src/navigation/Navigation';

// function App(): JSX.Element {
  
//   return <Navigation />;
//   // return <Toast />;
  
// }


// export default App;

import React, { useEffect, useState } from 'react';
import SplashScreen from './src/screens/splashScreen';
// import AppNavigator from './src/navigations/AppNavigator';
import Navigation from './src/navigation/Navigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar, StyleSheet } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import configureStore from "./src/redux/store";
import FlashMessage from "react-native-flash-message";
import Orientation from 'react-native-orientation-locker';


export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  let { store, persistor } = configureStore();

    useEffect(() => {
      Orientation.lockToPortrait();
    }, []);


  if (loading) return <SplashScreen />;

  return (
    // <SafeAreaView>
    <>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <SafeAreaView style={styles.safeArea}>
            <StatusBar backgroundColor={'#007bff'} barStyle="dark-content" />
            <Navigation />
            <FlashMessage position="top" />
          </SafeAreaView>
        </PersistGate>
      </Provider>
    </>
    //  </SafeAreaView> 
  );
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,   // full screen cover karega
    backgroundColor: '#0BB4D4', // background safe area me bhi white rahe
  },
});
// import React from 'react';
// import { View, StyleSheet } from 'react-native';
// import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

// export default function App() {
//   return (
//     <View style={styles.container}>
//       <MapView
//         provider={PROVIDER_GOOGLE}
//         style={styles.map}
//         initialRegion={{
//           latitude: 28.6139,
//           longitude: 77.2090,
//           latitudeDelta: 0.05,
//           longitudeDelta: 0.05,
//         }}
//       >
//         <Marker
//           coordinate={{ latitude: 28.6139, longitude: 77.2090 }}
//           title="Delhi"
//           description="Capital of India"
//         />
//       </MapView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   map: { flex: 1 }
// });

