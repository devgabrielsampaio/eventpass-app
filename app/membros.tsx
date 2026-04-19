import { ScrollView, StyleSheet, View } from 'react-native';
import { InfoCard } from './InfoCard';
import { ParticipanteCard } from './ParticipanteCard';
export default function Membros() {
   const participants = [
    { name: 'Gabriel Fernandes dos Santos Sampaio', photo: require('../assets/images/user1.png') },
    { name: 'Gabriel Alves de Siqueira', photo: require('../assets/images/user2.jpeg') },
    { name: 'Lhuan Ricardo de Souza Gaudard', photo: require('../assets/images/user3.jpeg') },
    { name: 'Rian da Silva Bezerra', photo: require('../assets/images/user4.jpeg') },
    { name: 'João Victor Claudio de Moraes', photo: require('../assets/images/user5.jpeg') },
    { name: 'Thiago Ricardo Machado Silva', photo: require('../assets/images/user6.jpeg') },
  ];

  return (
    <ScrollView style={styles.container}>
      
      <InfoCard />

      <View style={styles.grid}>
        {participants.map((p, index) => (
          <ParticipanteCard
            key={index}
            name={p.name}
            photo={p.photo}
          />
        ))}
      </View>

    </ScrollView>
  );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        padding: 15,
    },

    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
});