import { getClientConfig } from './client';
import { getElectronConfig } from './electron';
import { getServerConfig } from './server';

export function getConfigs(env) {
  return {
    client: getClientConfig(env),
    electron: getElectronConfig(env),
    server: getServerConfig(env),
  }
}

export default getConfigs(process.env.NODE_ENV || 'development');