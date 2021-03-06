import { ChakraProvider } from '@chakra-ui/react';
import { makeServer } from '../services/mirage';
import { SidebarDrawerProvider } from '../src/contexts/SidebarDrawerContext';
import { theme } from '../src/styles/theme';
import { QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools'
import { queryClient } from '../services/queryClient';
import { AuthProvider } from '../src/contexts/AuthContext';

if (process.env.NODE_ENV === 'development') {
  makeServer();
}


function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
    <QueryClientProvider client={queryClient}>
      <ChakraProvider theme={theme}>
        <SidebarDrawerProvider>
          <Component {...pageProps} />
        </SidebarDrawerProvider >
      </ChakraProvider>

      <ReactQueryDevtools />
    </QueryClientProvider>
    </AuthProvider>
  )
}

export default MyApp
