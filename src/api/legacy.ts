import { BaseAPI } from './base';
import { LegacyRoleDetailType } from 'src/api';

export class LegacyAPI extends BaseAPI {
  API_VERSION = 'v1';

  cachedLegacyRole: LegacyRoleDetailType;

  constructor() {
    super(API_HOST + API_BASE_PATH);
  }

  getApiPath(url: string) {
    const newUrl = `/${this.API_VERSION}/${url}`;
    console.log('getapipath', url, newUrl);
    return newUrl;
  }
}