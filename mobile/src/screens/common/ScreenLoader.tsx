import { ActivityIndicator, StyleSheet, View } from 'react-native';

export default function ScreenLoader() {
  return (
    <View style={styles.wrap}>
      <ActivityIndicator size="large" color="#135efd" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: '#F3F5F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
