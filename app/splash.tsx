import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';
import { supabase } from '../services/supabase'; // Adicionei a importação do Supabase

export default function Splash() {
  const router = useRouter();

  useEffect(() => {
    // Variável de controle para evitar vazamento de memória se o componente desmontar antes do tempo
    let isMounted = true; 

    const checkAuthAndRedirect = async () => {
      // 1. Verifica se existe uma sessão salva no AsyncStorage
      const { data: { session } } = await supabase.auth.getSession();

      // 2. Mantém o seu timer de 6 segundos
      setTimeout(() => {
        if (!isMounted) return;

        // 3. Decide para onde ir com base na sessão
        if (session) {
          router.replace('/tabs/home'); // Ajuste o nome da rota se necessário
        } else {
          router.replace('/login');
        }
      }, 6000); // 6000ms = 6 segundos
    };

    checkAuthAndRedirect();

    // Limpeza do useEffect
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/splash-screen.png')}
        style={styles.logo}
      />
      <ActivityIndicator size="large" color="#201d68" style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 250,
    height: 250,
    marginBottom: 20,
  },
  spinner:{
    marginTop: 20,
  }
});