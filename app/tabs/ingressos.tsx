import {
  deleteAsync,
  documentDirectory,
  readAsStringAsync,
  readDirectoryAsync,
  writeAsStringAsync,
} from 'expo-file-system/legacy';

import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../services/supabase';

export default function Ingressos() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function syncTickets(userId: string) {
    try {
      const files = await readDirectoryAsync(documentDirectory!);

      const userFiles = files.filter(
        file =>
          file.startsWith(`ingresso_${userId}_`) &&
          file.endsWith('.json')
      );

      // Já possui ingressos locais
      if (userFiles.length > 0) {
        return;
      }

      console.log('📥 Nenhum ingresso local encontrado. Baixando...');

      const { data: compras, error } = await supabase
        .from('tbl_compras')
        .select(`
          *,
          tbl_events (
            id,
            title,
            date,
            image_url,
            location_name
          )
        `)
        .eq('user_id', userId);

      if (error) {
        console.log(error);
        return;
      }

      for (const compra of compras || []) {
        if (!compra.tbl_events) continue;

        const ticketData = {
          compra_id: compra.id,
          user_id: userId,

          nome: compra.nome_comprador,
          cpf: compra.cpf_comprador,

          qr_payload: compra.id.toString(),

          event: {
            id: compra.tbl_events.id,
            title: compra.tbl_events.title,
            date: compra.tbl_events.date,
            image_url: compra.tbl_events.image_url,
            location_name: compra.tbl_events.location_name,
          },

          data_compra: compra.created_at,
        };

        const fileUri =
          documentDirectory! +
          `ingresso_${userId}_${compra.id}.json`;

        await writeAsStringAsync(
          fileUri,
          JSON.stringify(ticketData),
          {
            encoding: 'utf8',
          }
        );
      }
    } catch (err) {
      console.log('Erro sincronizando ingressos:', err);
    }
  }

  async function loadTickets() {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setTickets([]);
        return;
      }

      // Sincroniza caso não exista nada local
      await syncTickets(user.id);

      const files = await readDirectoryAsync(documentDirectory!);

      const ticketFiles = files.filter(
        file =>
          file.startsWith(`ingresso_${user.id}_`) &&
          file.endsWith('.json')
      );

      const validTickets = [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (const file of ticketFiles) {
        try {
          const fileUri = documentDirectory! + file;

          const content = await readAsStringAsync(fileUri, {
            encoding: 'utf8',
          });

          const ticketData = JSON.parse(content);

          if (ticketData.user_id !== user.id) {
            continue;
          }

          const eventDate = new Date(ticketData.event.date);

          if (eventDate < today) {
            await deleteAsync(fileUri, {
              idempotent: true,
            });

            continue;
          }

          validTickets.push(ticketData);
        } catch (err) {
          console.log('Erro lendo ingresso:', err);
        }
      }

      validTickets.sort(
        (a, b) =>
          new Date(a.event.date).getTime() -
          new Date(b.event.date).getTime()
      );

      setTickets(validTickets);
    } catch (error) {
      console.log('Erro ao carregar ingressos:', error);
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadTickets();
    }, [])
  );

  const renderTicket = ({ item }: { item: any }) => (
    <View style={styles.ticketCard}>
      <Image
        source={{ uri: item.event.image_url }}
        style={styles.eventImage}
      />

      <View style={styles.ticketInfo}>
        <Text style={styles.eventTitle}>
          {item.event.title}
        </Text>

        <Text style={styles.eventDetails}>
          📍 {item.event.location_name}
        </Text>

        <Text style={styles.eventDetails}>
          📅{' '}
          {new Date(item.event.date).toLocaleDateString(
            'pt-BR'
          )}
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.qrContainer}>
        <Text style={styles.qrTitle}>
          Apresente na entrada
        </Text>

        <View style={styles.qrWrapper}>
          <QRCode
            value={item.qr_payload}
            size={180}
            color="black"
            backgroundColor="white"
          />
        </View>

        <Text style={styles.userName}>
          {item.nome}
        </Text>

        <Text style={styles.userCpf}>
          CPF: {item.cpf}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Meus Ingressos
        </Text>

        <Text style={styles.subtitle}>
          Seus ingressos salvos no dispositivo
        </Text>
      </View>

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator
            size="large"
            color="#7C3AED"
          />
        </View>
      ) : tickets.length === 0 ? (
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>🎫</Text>

          <Text style={styles.emptyTitle}>
            Nenhum ingresso ativo
          </Text>

          <Text style={styles.emptySub}>
            Você não tem ingressos ou os eventos já passaram.
          </Text>
        </View>
      ) : (
        <FlatList
          data={tickets}
          keyExtractor={(item) =>
            item.compra_id.toString()
          }
          renderItem={renderTicket}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={loadTickets}
              tintColor="#7C3AED"
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

// mantém exatamente os mesmos estilos que você já possui
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 24,
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    color: '#A78BFA',
    marginTop: 4,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  emptySub: {
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  ticketCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#374151',
  },
  eventImage: {
    width: '100%',
    height: 140,
  },
  ticketInfo: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  eventDetails: {
    color: '#D1D5DB',
    marginBottom: 4,
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#374151',
    marginHorizontal: 16,
    borderStyle: 'dashed',
  },
  qrContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#1F2937',
  },
  qrTitle: {
    color: '#9CA3AF',
    marginBottom: 16,
    fontWeight: '500',
  },
  qrWrapper: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
  },
  userName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userCpf: {
    color: '#6B7280',
    marginTop: 4,
  },
});