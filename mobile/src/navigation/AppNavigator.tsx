import { Suspense, lazy } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import BottomTabs from './BottomTabs';
import AuthNavigator from './AuthNavigator';
import ScreenLoader from '../screens/common/ScreenLoader';

const BookingDetailScreen = lazy(() => import('../screens/booking/BookingDetailScreen'));
const TicketHistoryScreen = lazy(() => import('../screens/ticket/TicketHistoryScreen'));
const TicketScreen = lazy(() => import('../screens/ticket/TicketScreen'));
const SplashScreen = lazy(() => import('../screens/SplashScreen'));
const MountainDetailScreen = lazy(() => import('../screens/booking/MountainDetailScreen'));
const SelectDateScreen = lazy(() => import('../screens/booking/SelectDateScreen'));
const SelectSessionScreen = lazy(() => import('../screens/booking/SelectSessionScreen'));
const PaymentSuccessScreen = lazy(() => import('../screens/booking/PaymentSuccessScreen'));
const PaymentMethodScreen = lazy(() => import('../screens/booking/PaymentMethodScreen'));
const NewsDetailScreen = lazy(() => import('../screens/home/NewsDetailScreen'));

export type RootStackParamList = {
  Splash: undefined;
  MainTabs: undefined;
  Auth: undefined;
  MountainDetail: undefined;
  SelectDate: undefined;
  SelectSession: undefined;
  BookingDetail: { bookingId?: string } | undefined;
  PaymentMethod: { bookingId: string };
  PaymentSuccess: { bookingId?: string; ticketId?: string } | undefined;
  Ticket: { ticketId?: string } | undefined;
  TicketHistory: undefined;
  NewsDetail: {
    news: {
      id: string;
      title: string;
      description: string;
      imageUrl?: string | null;
      createdAt?: string;
      publishedAt?: string | null;
    };
  };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Suspense fallback={<ScreenLoader />}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: '#f4f7f5' },
          }}
        >
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="MainTabs" component={BottomTabs} />
          <Stack.Screen name="Auth" component={AuthNavigator} />
          <Stack.Screen name="MountainDetail" component={MountainDetailScreen} />
          <Stack.Screen name="SelectDate" component={SelectDateScreen} />
          <Stack.Screen name="SelectSession" component={SelectSessionScreen} />
          <Stack.Screen name="BookingDetail" component={BookingDetailScreen} />
          <Stack.Screen name="PaymentMethod" component={PaymentMethodScreen} />
          <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
          <Stack.Screen name="Ticket" component={TicketScreen} />
          <Stack.Screen name="TicketHistory" component={TicketHistoryScreen} />
          <Stack.Screen name="NewsDetail" component={NewsDetailScreen} />
        </Stack.Navigator>
      </Suspense>
    </NavigationContainer>
  );
}
