import { StyleSheet, View } from 'react-native';

export default function Skeleton({ height = 16, radius = 8 }: { height?: number; radius?: number }) {
  return <View style={[styles.bar, { height, borderRadius: radius }]} />;
}

const styles = StyleSheet.create({
  bar: {
    width: '100%',
    backgroundColor: '#E2E8F0',
    opacity: 0.8,
  },
});
