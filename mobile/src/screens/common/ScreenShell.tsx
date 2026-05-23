import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

type ScreenShellProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

export default function ScreenShell({
  title,
  description,
  actionLabel,
  onActionPress,
}: ScreenShellProps) {
  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        {actionLabel && onActionPress ? (
          <Pressable style={styles.button} onPress={onActionPress}>
            <Text style={styles.buttonText}>{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#f4f7f5' },
  content: { padding: 16, paddingBottom: 100 },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#d9e3dd',
    backgroundColor: '#ffffff',
    padding: 18,
    gap: 10,
  },
  title: { color: '#13231d', fontSize: 26, fontWeight: '900' },
  description: { color: '#4b5b53', fontSize: 16, lineHeight: 24 },
  button: {
    marginTop: 4,
    borderRadius: 12,
    backgroundColor: '#135efd',
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
});
