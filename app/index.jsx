import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import { Link } from 'expo-router';

export default function App() {
    return (
        <View className="flex-1 items-center justify-center bg-white">
            <Text className="text-3xl">SignBridge</Text>
            <StatusBar style="auto" />
            <Link href="/translate" className="text-2xl mt-5" style="{{color:blue;marginTop:10}}">Translate</Link>
        </View>
    );
}

