
import '../styles/globals.css';
import 'leaflet/dist/leaflet.css';
import { AppProvider } from '../context/AppContext';
import App from 'next/app';

export default function MyApp({ Component, pageProps }) {
  return (
    <AppProvider>
      <Component {...pageProps} />
    </AppProvider>
  );
}

MyApp.getInitialProps = async (appContext) => {
  const appProps = await App.getInitialProps(appContext);
  return { ...appProps };
};
