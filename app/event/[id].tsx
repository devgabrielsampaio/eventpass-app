import { documentDirectory, writeAsStringAsync } from 'expo-file-system/legacy';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaskedTextInput } from 'react-native-mask-text';
import QRCode from 'react-native-qrcode-svg';
import { supabase } from '../../services/supabase';

export default function EventPage() {
  const { id } = useLocalSearchParams();

  // Estados do Evento
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Estados do Formulário de Compra
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [cpfRaw, setCpfRaw] = useState('');
  const quantidade = 1; // Travado em 1
  const [comprando, setComprando] = useState(false);

  // Estado do Ingresso Gerado
  const [ingressoLocal, setIngressoLocal] = useState<string | null>(null);

  // ================= 1. BUSCAR EVENTO =================
  async function fetchEvent() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tbl_events')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.log('Erro ao carregar evento:', error.message);
        return;
      }
      setEvent(data);
    } catch (err) {
      console.log('Erro no try/catch do evento:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) fetchEvent();
  }, [id]);

  // ================= 2. LÓGICA DE COMPRA E ARMAZENAMENTO =================
  async function handleCompra() {
    if (!nome.trim() || !cpf.trim()) {
      Alert.alert('Atenção', 'Preencha seu Nome e CPF para comprar.');
      return;
    }

    try {
      setComprando(true);

      // 🔐 1. PEGA O USUÁRIO LOGADO
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (!user || authError) {
        Alert.alert('Erro', 'Você precisa estar logado para comprar um ingresso.');
        return;
      }

      // 2. Salva no banco de dados com o ID DO USUÁRIO
      const { data: compraData, error } = await supabase
        .from('tbl_compras')
        .insert([
          {
            event_id: id,
            user_id: user.id, // <--- Salvando quem é o dono!
            nome_comprador: nome,
            cpf_comprador: cpf,
            quantidade: quantidade,
          }
        ])
        .select()
        .single();

      if (error) throw new Error(error.message);

      // 2. EXIGÊNCIA DO PROJETO: Salvar localmente no sistema de arquivos do Android
      const ticketData = {
        compra_id: compraData.id,
        user_id: user.id,

        nome,
        cpf: cpfRaw,

        event: {
          id: event.id,
          title: event.title,
          date: event.date,
          image_url: event.image_url,
          location_name: event.location_name,
        },

        qr_payload: compraData.id.toString(),

        data_compra: new Date().toISOString(),
      };

      // Transforma o objeto em uma string (JSON) para salvar no arquivo
      const stringData = JSON.stringify(ticketData);
      
      // Define o caminho do arquivo (usando a variável importada diretamente e com o !)
      const fileUri =documentDirectory! +`ingresso_${user.id}_${compraData.id}.json`;
      
      // Escreve o arquivo no celular passando 'utf8' diretamente
      await writeAsStringAsync(fileUri, stringData, {
        encoding: 'utf8',
      });

      console.log('✅ Arquivo salvo nativamente em:', fileUri);

      // Atualiza o estado para renderizar o QR Code usando a string salva
      setIngressoLocal(stringData);
      Alert.alert('Sucesso', 'Ingresso comprado e salvo no seu dispositivo!');

    } catch (error: any) {
      Alert.alert('Erro na compra', error.message);
      console.log(error);
    } finally {
      setComprando(false);
    }
  }

  // ================= TELAS DE CARREGAMENTO E ERRO =================
  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.loading}>
        <Text style={{ color: '#fff', fontSize: 18 }}>Evento não encontrado!</Text>
      </View>
    );
  }

  // ================= UI PRINCIPAL =================
  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: event.image_url }} style={styles.image} />

      <View style={styles.content}>
        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.location}>📍 {event.location_name}</Text>
        <Text style={styles.description}>{event.description}</Text>

        <View style={styles.divider} />

        {/* SE O INGRESSO JÁ FOI COMPRADO: MOSTRA O QR CODE */}
        {ingressoLocal ? (
          <View style={styles.ticketContainer}>
            <Text style={styles.ticketTitle}>Seu Ingresso</Text>
            <Text style={styles.ticketSub}>Apresente este QR Code na entrada</Text>
            
            <View style={styles.qrCodeWrapper}>
              <QRCode
                value={ingressoLocal} 
                size={200}
                color="black"
                backgroundColor="white"
              />
            </View>
            <Text style={styles.ticketInfo}>Nome: {nome}</Text>
            <Text style={styles.ticketInfo}>CPF: {cpf}</Text>
          </View>
        ) : (
          /* SE AINDA NÃO COMPROU: MOSTRA O FORMULÁRIO */
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Comprar Ingresso</Text>
            
            <Text style={styles.label}>Quantidade (Máximo 1)</Text>
            <TextInput
              style={[styles.input, { color: '#9CA3AF', backgroundColor: '#1F2937' }]}
              value="1"
              editable={false} 
            />

            <Text style={styles.label}>Nome Completo</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite seu nome"
              placeholderTextColor="#6B7280"
              value={nome}
              onChangeText={setNome}
            />

            <Text style={styles.label}>CPF</Text>
            <MaskedTextInput
              value={cpf}
              onChangeText={(masked, rawText) => {
                setCpf(masked);
                setCpfRaw(rawText);
              }}
              mask="999.999.999-99"
              placeholder="CPF"
              style={styles.input}
              keyboardType="numeric"
            />

            <TouchableOpacity 
              style={styles.button} 
              onPress={handleCompra}
              disabled={comprando}
            >
              {comprando ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Finalizar Compra</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

// ================= STYLES =================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0712',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0B0712',
  },
  image: {
    width: '100%',
    height: 340,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
  },
  location: {
    color: '#A78BFA',
    marginTop: 12,
  },
  description: {
    color: '#E5E7EB',
    marginTop: 20,
    lineHeight: 24,
  },
  divider: {
    height: 1,
    backgroundColor: '#374151',
    marginVertical: 24,
  },
  // Formulário
  formContainer: {
    backgroundColor: '#111827',
    padding: 20,
    borderRadius: 16,
  },
  formTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  label: {
    color: '#D1D5DB',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#1F2937',
    color: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  button: {
    backgroundColor: '#7C3AED',
    marginTop: 12,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  // Ingresso (QR Code)
  ticketContainer: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  ticketTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  ticketSub: {
    color: '#6B7280',
    marginBottom: 20,
  },
  qrCodeWrapper: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  ticketInfo: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
    marginTop: 4,
  }
});