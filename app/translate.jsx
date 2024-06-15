import { StyleSheet, Text, View, Button, findNodeHandle, TouchableOpacity } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { Camera, CameraView, useCameraPermissions } from 'expo-camera'
import * as MediaLibrary from 'expo-media-library';
import * as ScreenCapture from 'expo-screen-capture';
import { io } from 'socket.io-client';
import Canvas from 'react-native-canvas';
import { captureRef } from 'react-native-view-shot';
import ViewShot from 'react-native-view-shot';


const Translate = () => {

    const socket = useRef(null);
    const cameraRef = useRef(null);
    const viewRef = useRef(null);
    let counter = 0;

    const [message, setMessage] = useState('');
    //const [messages, setMessages] = useState('');

    useEffect(() => {
        socket.current = io("http://192.168.18.7:5000"); // Cambiar la URL y el puerto según corresponda
        socket.current.on("connect", () => {
            console.log("Conectado al servidor");
        });

        socket.current.on("prediction", function(data) {
            const prediction = data.prediction;
            //endTime = performance.now();
            console.log("Predicción:", prediction);
            //console.log("Tiempo de ejecución:", (endTime - startTime)/1000);

            setMessage(prediction);
            //setMessages((prevMessages) => `${prevMessages}\n${prediction}`);
        });

        const captureAndSendScreenshot = async () => {
            try {
                const uri = await captureScreen();
                const base64Image = await convertImageToBase64(uri);
                //console.log(base64Image);
                socket.current.emit('message', { frames: base64Image});
            } catch (error) {
                console.error('Error al capturar y enviar la captura de pantalla:', error);
            }
        };
        
        const intervalId = setInterval(captureAndSendScreenshot, 5000);

        return () => {
            clearInterval(intervalId);
            socket.current.disconnect();
        };
    }, []);

    const captureScreen = async () => {
        return new Promise((resolve, reject) => {
            const viewHandle = findNodeHandle(viewRef.current);
            if (!viewHandle) {
                reject(new Error('No se pudo obtener el handle de la vista'));
                return;
            }
            // Capturar la vista y devolver la URI de la imagen
            captureRef(viewHandle, { format: 'png' }).then(uri => {
                resolve(uri);
            }).catch(error => {
                reject(error);
            });
        });
    };

    const convertImageToBase64 = async (uri) => {
        const response = await fetch(uri);
        const blob = await response.blob();
        const base64 = await blobToBase64(blob);
        return base64;
    };

    const blobToBase64 = (blob) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = reject;
            reader.onload = () => {
            resolve(reader.result);
            };
            reader.readAsDataURL(blob);
        });
    };

    const [permission, requestPermission] = useCameraPermissions();
    const [facing, setFacing] = useState('back');

    if (!permission) {
        return <Text>Error en obtener permiso de cámara</Text>;
    }
    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
                <Button onPress={requestPermission} title="grant permission" />
            </View>
        )
    }

    return (
    <View ref={viewRef} style={styles.container}>
        <CameraView 
            ref={cameraRef}
            style={styles.camera} 
            facing={facing}
            >
        </CameraView>
        <View style={styles.bottomTextContainer}>
            <Text style={styles.bottomText}>{message}</Text>
        </View>
    </View>
    )
}

export default Translate

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
    },
    camera: {
        flex:1,
        borderRadius: 20,
    },
    bottomTextContainer: {
        position: 'absolute',
        bottom: 100,
        width: '50%',
        alignItems: 'center',
        alignSelf: 'center', // Centrar horizontalmente
        backgroundColor: '#000000',
        paddingTop: 15,
        elevation: 10, // Para Android
        zIndex: 10, // Para iOS
        borderRadius: 20, // Radio de los bordes
    },
    bottomText: {
        fontSize: 18,
        marginBottom: 20, // Espacio adicional opcional
        color: 'white',
    }
})