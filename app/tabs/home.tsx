// Home.tsx

import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import { Image } from 'expo-image';
import {
  ActivityIndicator,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import * as Location from 'expo-location';
import { useRouter } from 'expo-router'; // Alterado para useRouter para ser usado como hook
import { supabase } from '../../services/supabase';

type EventType = {
  id: string;
  title: string;
  description: string;
  city: string;
  state: string;
  image_url: string;
  date: string;
  price: number;
  location_name: string;
};

export default function Home() {
  const router = useRouter(); // Inicializando o router corretamente

  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);

  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  // ================= EVENTS =================
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 Buscando eventos para a cidade:', city || 'Todas as regiões');

      let query = supabase
        .from('tbl_events')
        .select('*')
        .order('date', { ascending: true });

      // Se o GPS encontrar uma cidade, filtra por ela no banco
      if (city) {
        query = query.eq('city', city);
      }

      const { data, error } = await query;

      if (error) {
        console.log('Erro Supabase:', error.message);
      } else {
        console.log('✅ EVENTOS CARREGADOS:', data?.length || 0, 'itens');
        setEvents(data || []);
      }
    } catch (err) {
      console.log('Erro try/catch Supabase:', err);
    } finally {
      setLoading(false); // Sempre desliga o spinner aqui
    }
  }, [city]);

  // ================= LOCATION =================
  async function getCurrentLocation() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        console.log('Permissão de localização negada');
        fetchEvents(); // Busca todos se não tiver permissão
        return;
      }

      const location = await Location.getCurrentPositionAsync({});

      const reverse = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (reverse.length > 0) {
        // Define os estados. O segundo useEffect vai disparar o fetchEvents() assim que city mudar
        setCity(reverse[0].city || '');
        setState(reverse[0].region || '');
      } else {
        fetchEvents(); // Busca sem filtro se a geocodificação falhar
      }
    } catch (err) {
      console.log('Erro ao pegar localização:', err);
      fetchEvents(); // Garante o fetch mesmo com falha no GPS
    }
  }

  // ================= EFFECTS =================
  // 1. Dispara a busca da localização na montagem do app
  useEffect(() => {
    getCurrentLocation();
  }, []);

  // 2. Sempre que a cidade mudar (ou se mantiver vazia), recarrega a lista de eventos
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // ================= IMAGES (UNSPLASH OPTIMIZED) =================
  function getImgCDN(url: string) {
    if (!url) return '';
    // Ajustado para '?' garantindo que a API do Unsplash comprima e reduza o peso da imagem
    return `${url}?auto=format&fit=crop&w=600&q=75`;
  }

  // ================= NAV =================
  function openEvent(eventId: string) {
    router.push({
      pathname: '/event/[id]',
      params: { id: eventId }
    });
  }

  // ================= CARD =================
  function renderEvent({ item }: { item: EventType }) {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.card}
        onPress={() => openEvent(item.id)}
      >
        <Image
          source={{ uri: getImgCDN(item.image_url) }}
          style={styles.image}
          contentFit="cover"
          transition={300}
          cachePolicy="disk"
        />

        <View style={styles.cardContent}>
          <Text style={styles.eventTitle} numberOfLines={2}>
            {item.title}
          </Text>

          <Text style={styles.location}>
            📍 {item.location_name}
          </Text>

          <Text style={styles.date}>
            {new Date(item.date).toLocaleDateString('pt-BR')}
          </Text>

          <View style={styles.footer}>
            <Text style={styles.price}>
              R$ {item.price}
            </Text>

            <View style={styles.button}>
              <Text style={styles.buttonText}>
                Comprar
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // ================= LOADING SCREEN =================
  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  // ================= UI =================
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <Text style={styles.title}>
          Descubra eventos
        </Text>

        <Text style={styles.subtitle}>
          📍 {city || 'Todas as regiões'}
          {state ? `, ${state}` : ''}
        </Text>
      </View>

      <FlatList
        data={events}
        renderItem={renderEvent}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 120,
        }}
      />
    </SafeAreaView>
  );
}

// ================= STYLES =================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },

  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4C1D95',
  },

  subtitle: {
    marginTop: 6,
    color: '#7C3AED',
    fontSize: 14,
  },

  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginHorizontal: 24,
    marginBottom: 18,
    borderRadius: 16,
    overflow: 'hidden',
  },

  image: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: '#F3F4F6', // Fundo cinza enquanto baixa
  },

  cardContent: {
    padding: 16,
  },

  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },

  location: {
    marginTop: 6,
    color: '#6B7280',
  },

  date: {
    marginTop: 4,
    color: '#9CA3AF',
    fontSize: 13,
  },

  footer: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4C1D95',
  },

  button: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});