import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { supabase } from '../services/supabase';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = async () => {
    // Validar campos vazios
    if (!email || !password) {
      Alert.alert(
        'Campos obrigatórios',
        'Preencha e-mail e senha.'
      );
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      Alert.alert('Erro no login','Login ou senha incorretos.');
      return;
    }

    router.replace('/tabs/home');
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bem-vindo!</Text>

        <Text style={styles.subtitle}>
          Acesse sua conta para continuar
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>E-mail</Text>

          <TextInput
            placeholder="Digite Seu E-mail"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Senha</Text>

          <TextInput
            placeholder="Digite Sua Senha"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />
        </View>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={login}
        >
          <Text style={styles.loginButtonText}>Entrar</Text>
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.or}>ou</Text>
          <View style={styles.divider} />
        </View>

        <TouchableOpacity
          style={styles.registerButton}
          onPress={() => router.push('/cadastrar')}
        >
          <Text style={styles.registerButtonText}>
            Criar uma conta
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingTop: 110,
  },

  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },

  title: {
    color: '#4C1D95',
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  subtitle: {
    color: '#7C3AED',
    fontSize: 14,
  },

  form: {
    flex: 1,
  },

  inputGroup: {
    marginBottom: 20,
  },

  label: {
    color: '#4C1D95',
    fontWeight: 'bold',
    marginBottom: 8,
  },

  input: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    color: '#4C1D95',
  },

  loginButton: {
    backgroundColor: '#22C55E',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },

  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },

  or: {
    marginHorizontal: 16,
    color: '#A78BFA',
  },

  registerButton: {
    borderWidth: 2,
    borderColor: '#7C3AED',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },

  registerButtonText: {
    color: '#7C3AED',
    fontSize: 18,
    fontWeight: 'bold',
  },
});