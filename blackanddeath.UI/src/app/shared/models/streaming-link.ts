import { StreamingPlatform } from './enums/streaming-platform.enum';

export interface StreamingLink {
  platform: StreamingPlatform;
  embedCode: string;
}
