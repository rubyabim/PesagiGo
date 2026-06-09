import { Suspense, lazy } from 'react';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ScreenLoader from '../screens/common/ScreenLoader';

const HomeScreen = lazy(() => import('../screens/home/HomeScreen'));
const LocationsScreen = lazy(() => import('../screens/LocationsScreen'));
const PanduanScreen = lazy(() => import('../screens/PanduanScreen'));
const TicketHistoryScreen = lazy(() => import('../screens/ticket/TicketHistoryScreen'));
const ProfileScreen = lazy(() => import('../screens/profile/ProfileScreen'));

export type BottomTabParamList = {
  Home: undefined;
  Locations: undefined;
  Weather: undefined;
  Map: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

const tabIcons: Record<keyof BottomTabParamList, keyof typeof FontAwesome.glyphMap> = {
  Home: 'home',
  Locations: 'id-card-o',
  Weather: 'ticket',
  Map: 'book',
  Profile: 'user-o',
};

const tabLabels: Record<keyof BottomTabParamList, string> = {
  Home: 'Beranda',
  Locations: 'Informasi',
  Weather: 'Tiket Saya',
  Map: 'Bantuan',
  Profile: 'Profil',
};

function AnimatedTabIcon({
  name,
  label,
  focused,
}: {
  name: keyof typeof FontAwesome.glyphMap;
  label: string;
  focused: boolean;
}) {
  const scale = useRef(new Animated.Value(focused ? 1 : 0.92)).current;
  const opacity = useRef(new Animated.Value(focused ? 1 : 0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: focused ? 1 : 0.92,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: focused ? 1 : 0.8,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused, opacity, scale]);

  const activeColor = '#135efd';
  const inactiveColor = '#374151';

  return (
    <Animated.View style={{ transform: [{ scale }], opacity }}>
      <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
        <FontAwesome name={name} size={23} color={focused ? activeColor : inactiveColor} />
      </View>
      <Text style={[styles.label, focused && styles.labelActive]}>{label}</Text>
    </Animated.View>
  );
}

export default function BottomTabs() {
  return (
    <Suspense fallback={<ScreenLoader />}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            height: 108,
            paddingBottom: 10,
            paddingTop: 10,
            backgroundColor: '#ffffff',
            borderTopColor: '#e5e7eb',
            borderTopWidth: 1,
            borderTopLeftRadius: 26,
            borderTopRightRadius: 26,
            position: 'absolute',
            overflow: 'hidden',
          },
          tabBarItemStyle: {
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 0,
            paddingVertical: 6,
          },
          tabBarIcon: ({ focused }) => (
            <AnimatedTabIcon name={tabIcons[route.name]} label={tabLabels[route.name]} focused={focused} />
          ),
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Locations" component={LocationsScreen} />
        <Tab.Screen name="Weather" component={TicketHistoryScreen} />
        <Tab.Screen name="Map" component={PanduanScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </Suspense>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 78,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  iconWrapActive: {
    backgroundColor: '#EAF1FF',
  },
  label: {
    marginTop: 6,
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: '#374151',
  },
  labelActive: {
    color: '#135efd',
  },
});
