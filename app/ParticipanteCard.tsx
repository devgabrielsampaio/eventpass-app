import { Image, StyleSheet, Text, View } from 'react-native';

export function ParticipanteCard({ name, photo }) {
  return (
    <View style={styles.card}>
      <Image source={photo} style={styles.image} />
      <Text style={styles.name}>{name}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 10,
    alignItems: 'center',
    width: '47%',
    marginBottom: 15,
  },

  image: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },

  name: {
    color: '#201d68',
    fontSize: 14,
    textAlign: 'center',
  },
})