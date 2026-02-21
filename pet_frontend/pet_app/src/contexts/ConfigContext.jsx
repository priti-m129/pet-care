import React, { createContext } from 'react';
import { defaultConfig } from '../utils/constants';

export const ConfigContext = createContext(defaultConfig);

export const ConfigProvider = ({ children }) => {
  return (
    <ConfigContext.Provider value={defaultConfig}>
      {children}
    </ConfigContext.Provider>
  );
};