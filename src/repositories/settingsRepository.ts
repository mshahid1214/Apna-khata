import { RateSettings } from '../types';
import { storageAdapter } from './storageAdapter';
import { INITIAL_RATE_SETTINGS } from './sampleData';

const KEY = 'rate_settings';

export class SettingsRepository {
  public async getSettings(): Promise<RateSettings> {
    const settings = await storageAdapter.getItem<RateSettings>(KEY, INITIAL_RATE_SETTINGS);
    return settings;
  }

  public async saveSettings(settings: RateSettings): Promise<void> {
    await storageAdapter.setItem(KEY, settings);
  }

  public async resetToSample(): Promise<RateSettings> {
    await storageAdapter.setItem(KEY, INITIAL_RATE_SETTINGS);
    return INITIAL_RATE_SETTINGS;
  }
}

export const settingsRepository = new SettingsRepository();
