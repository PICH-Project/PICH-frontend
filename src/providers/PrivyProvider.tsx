import Config from 'react-native-config'
import { PrivyProvider as PrivyProviderImpl } from '@privy-io/expo';
import { FC } from 'react';
import { ConfigVariables } from '@/constants/configVariables';

const PrivyProvider: FC<PrivyProviderProps> = ({ children }) => {
  return (
    <PrivyProviderImpl
      appId={ConfigVariables.PRIVY_APP_ID}
      clientId={ConfigVariables.PRIVY_CLIENT_ID}
      config={{
        embedded: {
          ethereum: {
            createOnLogin: "off", 
          },
          solana: {
            createOnLogin: "off",
          },
        },
      }}
    >
      {children}
    </PrivyProviderImpl>
  );
}

interface PrivyProviderProps {
  children: React.ReactNode;
}

export default PrivyProvider;