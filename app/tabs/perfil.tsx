import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../services/supabase';

export default function Perfil() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    nome: '',
    email: '',
    dataNascimento: '',
  });

  const { width } = useWindowDimensions();

  // Função para formatar a data de "AAAA-MM-DD" para "DD/MM/AAAA"
  const formatarData = (dataString: string) => {
    if (!dataString) return 'Não informada';
    const partes = dataString.split('-');
    if (partes.length !== 3) return dataString;
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  };

  // ================= 1. BUSCAR DADOS DO USUÁRIO =================
  useEffect(() => {
    async function loadUserProfile() {
      try {
        setLoading(true);
        
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
          throw new Error('Usuário não encontrado');
        }

        const { data: profileData, error: profileError } = await supabase
          .from('tbl_usuarios')
          .select('nome, data_nascimento')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) {
          console.log('Erro ao buscar tbl_usuarios:', profileError.message);
        }

        setUserData({
          email: user.email || '',
          nome: profileData?.nome || 'Usuário',
          dataNascimento: profileData?.data_nascimento ? formatarData(profileData.data_nascimento) : 'Não informada',
        });

      } catch (error) {
        console.log('Erro ao carregar perfil:', error);
      } finally {
        setLoading(false);
      }
    }

    loadUserProfile();
  }, []);

  // ================= 2. LÓGICA DE SAIR (LOGOUT) =================
  async function handleSignOut() {
    Alert.alert(
      "Sair da conta",
      "Tem certeza que deseja sair do aplicativo?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Sair",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await supabase.auth.signOut();
              await AsyncStorage.removeItem('userToken');
              router.replace('/'); 
            } catch (error: any) {
              Alert.alert('Erro ao sair', error.message);
              setLoading(false);
            }
          }
        }
      ]
    );
  }

  // ================= UI DO PERFIL =================
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  const avatarSize = Math.min(Math.max(width * 0.25, 80), 120);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Meu Perfil</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.innerContent}>
          {/* Avatar Responsivo */}
          <View style={[
            styles.avatarContainer, 
            { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }
          ]}>
            <Text style={[styles.avatarText, { fontSize: avatarSize * 0.4 }]}>
              {userData.nome.charAt(0).toUpperCase()}
            </Text>
          </View>

          {/* Informações do Usuário */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Nome</Text>
              <Text style={styles.value} numberOfLines={2} adjustsFontSizeToFit>
                {userData.nome}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.label}>E-mail</Text>
              <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
                {userData.email}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.label}>Data de Nascimento</Text>
              <Text style={styles.value}>{userData.dataNascimento}</Text>
            </View>
          </View>

          {/* Botão de Sair */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
            <Text style={styles.logoutButtonText}>Sair da Conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ================= ESTILOS =================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0B0712',
  },
  header: {
    padding: 24,
    paddingTop: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0B0712',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  innerContent: {
    width: '100%',
    maxWidth: 500,
    alignItems: 'center',
  },
  avatarContainer: {
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 10,
  },
  avatarText: {
    fontWeight: 'bold',
    color: '#fff',
  },
  infoCard: {
    width: '100%',
    backgroundColor: '#7C3AED',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#374151',
    marginBottom: 40,
  },
  infoRow: {
    marginVertical: 8,
  },
  label: {
    color: '#E9D5FF',
    fontSize: 14,
    marginBottom: 4,
  },
  value: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#6D28D9',
    marginVertical: 12,
  },
  logoutButton: {
    width: '100%',
    backgroundColor: 'transparent',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EF4444',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: 'bold',
  },
});