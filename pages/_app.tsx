import { ChakraProvider } from '@chakra-ui/react';
import { SidebarDrawerProvider } from '../src/contexts/SidebarDrawerContext';
import { theme } from '../src/styles/theme';

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider theme={theme}>
      <SidebarDrawerProvider>
        <Component {...pageProps} />
        </SidebarDrawerProvider >
    </ChakraProvider>
  )
}

export default MyApp
