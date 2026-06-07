import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaskedTextInput } from 'react-native-mask-text';
import { supabase } from '../services/supabase';

export default function Cadastrar() {
  const router = useRouter();

  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [telefoneRaw, setTelefoneRaw] = useState('');
  const [cpf, setCpf] = useState('');
  const [cpfRaw, setCpfRaw] = useState('');
  const [data_nascimento, setNascimento] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Converte DD/MM/YYYY -> YYYY-MM-DD
  const formatarData = (data: string) => {
    const [dia, mes, ano] = data.split('/');
    return `${ano}-${mes}-${dia}`;
  };

  const cadastrar = async () => {
    // Validação de campos obrigatórios
    if (
      !nome ||
      !email ||
      !password ||
      !confirmPassword ||
      !cpfRaw ||
      !data_nascimento
    ) {
      Alert.alert(
        'Erro',
        'Por favor, preencha todos os campos obrigatórios.'
      );
      return;
    }

    // Validação de senha
    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não conferem');
      return;
    }

    // Validação simples da data
    if (data_nascimento.length !== 10) {
      Alert.alert('Erro', 'Digite uma data válida');
      return;
    }

    // Criar usuário no Auth
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      Alert.alert('Erro no Cadastro', authError.message);
      return;
    }

    const userId = data.user?.id;

    if (!userId) {
      Alert.alert('Erro', 'Não foi possível obter o ID do usuário.');
      return;
    }

    // Salvar dados na tabela
    const { error: dbError } = await supabase.from('tbl_usuarios').insert({
      id: userId,
      nome,
      telefone: telefoneRaw,
      cpf: cpfRaw,
      data_nascimento: formatarData(data_nascimento),
    });

    if (dbError) {
      console.log(dbError);
      Alert.alert('Erro ao salvar dados', dbError.message);
      return;
    }

    Alert.alert('Sucesso', 'Conta criada com sucesso!');
    router.replace('/login');
  };

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Criar conta</Text>

        <Text style={styles.subtitle}>
          Preencha os dados para continuar
        </Text>
      </View>

      <View style={styles.form}>

        {/* Nome */}
        <View style={styles.field}>
          <Text style={styles.label}>Nome completo</Text>
          <TextInput
            placeholder="Digite seu nome"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
            value={nome}
            onChangeText={setNome}
          />
        </View>

        {/* Telefone */}
        <View style={styles.field}>
          <Text style={styles.label}>Telefone</Text>
          <MaskedTextInput
            value={telefone}
            onChangeText={(masked, rawText) => {
              setTelefone(masked);
              setTelefoneRaw(rawText);
            }}
            mask="(99) 99999-9999"
            placeholder="(00) 00000-0000"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
            keyboardType="numeric"
          />
        </View>

        {/* CPF */}
        <View style={styles.field}>
          <Text style={styles.label}>CPF</Text>
          <MaskedTextInput
            value={cpf}
            onChangeText={(masked, rawText) => {
              setCpf(masked);
              setCpfRaw(rawText);
            }}
            mask="999.999.999-99"
            placeholder="000.000.000-00"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
            keyboardType="numeric"
          />
        </View>

        {/* Data nascimento */}
        <View style={styles.field}>
          <Text style={styles.label}>Data de nascimento</Text>
          <MaskedTextInput
            value={data_nascimento}
            onChangeText={(text) => setNascimento(text)}
            mask="99/99/9999"
            placeholder="DD/MM/AAAA"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
            keyboardType="numeric"
          />
        </View>

        {/* E-mail */}
        <View style={styles.field}>
          <Text style={styles.label}>E-mail</Text>
          <TextInput
            placeholder="Digite seu e-mail"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Senha */}
        <View style={styles.field}>
          <Text style={styles.label}>Senha</Text>
          <TextInput
            placeholder="Digite sua senha"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {/* Confirmar senha */}
        <View style={styles.field}>
          <Text style={styles.label}>Confirmar senha</Text>
          <TextInput
            placeholder="Digite novamente sua senha"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={cadastrar}>
          <Text style={styles.buttonText}>Criar conta</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/login')}>
          <Text style={styles.link}>
            Já tem conta? Entrar
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
  },

  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  header: {
    marginTop: 100,
    alignItems: 'center',
    marginBottom: 40,
  },

  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#4C1D95',
  },

  subtitle: {
    color: '#7C3AED',
    marginTop: 8,
  },

  form: {
    flex: 1,
  },

  field: {
    marginBottom: 16,
  },

  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4C1D95',
    marginBottom: 8,
    marginLeft: 4,
  },

  input: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    color: '#4C1D95',
    fontSize: 16,
  },

  button: {
    backgroundColor: '#22C55E',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },

  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  link: {
    textAlign: 'center',
    marginTop: 20,
    color: '#7C3AED',
    fontWeight: 'bold',
  },
});