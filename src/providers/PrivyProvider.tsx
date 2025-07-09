import Config from 'react-native-config'
import { PrivyProvider as PrivyProviderImpl } from '@privy-io/expo';
import { FC } from 'react';

const PrivyProvider: FC<PrivyProviderProps> = ({ children }) => {
  console.log('process.env.PRIVY_API_KEY ')
  return (
    <PrivyProviderImpl
      appId="cmawe29c801vul80mh223hy0z"
      clientId={"client-WY6LLC6Z7Xg1TpfLBxaEA6FEhKkX3iubm42uxg2JkFzr5"}
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