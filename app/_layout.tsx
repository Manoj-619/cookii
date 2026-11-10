import React from 'react';
import {Stack} from 'expo-router';
import {StatusBar} from 'expo-status-bar';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {colors} from '../src/theme';
export default function RootLayout(){return <GestureHandlerRootView style={{flex:1}}><SafeAreaProvider><StatusBar style="dark"/><Stack screenOptions={{headerShown:false,contentStyle:{backgroundColor:colors.mint},animation:'slide_from_right'}}><Stack.Screen name="book/address" options={{presentation:'modal'}}/></Stack></SafeAreaProvider></GestureHandlerRootView>}
