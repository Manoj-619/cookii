import React, {useEffect} from 'react';
import {View,Text,StyleSheet,ActivityIndicator} from 'react-native';
import {router} from 'expo-router';
import {useAuthStore} from '../src/store';
export default function SplashScreen(){
  useEffect(()=>{
    let active=true;
    const start=async()=>{
      try{
        await Promise.all([useAuthStore.persist.rehydrate(),new Promise(resolve=>setTimeout(resolve,900))]);
        if(!active)return;
        router.replace(useAuthStore.getState().isLoggedIn?'/(tabs)/home':'/(auth)/login');
      }catch(error){console.error('Startup navigation',error);if(active)router.replace('/(auth)/login')}
    };
    void start();
    return ()=>{active=false};
  },[]);
  return <View style={styles.container}><Text style={styles.mark}>🍳</Text><Text style={styles.logo}>Cookii</Text><Text style={styles.tagline}>Fresh cooking, right at home.</Text><ActivityIndicator style={{marginTop:30}} color="#26784D"/></View>
}
const styles=StyleSheet.create({container:{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'#F4FBF6'},mark:{fontSize:52},logo:{fontSize:38,fontWeight:'800',color:'#1F3A2E'},tagline:{fontSize:15,color:'#6B7F72',marginTop:8}});
