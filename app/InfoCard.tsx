import { View, Text, StyleSheet } from 'react-native';

export function InfoCard() {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Turma</Text>
      <Text style={styles.value}>ADS0301N</Text>

      <Text style={styles.label}>Turno</Text>
      <Text style={styles.value}>Noturno</Text>

      <Text style={styles.label}>Unidade</Text>
      <Text style={styles.value}>Campo Grande</Text>
    </View>
  );
}
const styles = StyleSheet.create({
    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 5,
      marginTop: 40,
    },

    title: {
      color: '#201d68',
      fontSize: 14,
    },

    label: {
      color: '#201d68',
      marginTop: 10,
    },

    value: {
      color: '#201d68',
      fontSize: 18,
      fontWeight: 'bold',
    },
})