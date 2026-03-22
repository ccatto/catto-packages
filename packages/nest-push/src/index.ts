/**
 * @catto/nest-push
 *
 * Catto Push - NestJS Firebase Cloud Messaging (FCM) push notification service.
 * Provides a config-driven push notification service with dynamic module support.
 *
 * ## Quick Start
 *
 * ```typescript
 * import { CattoPushModule, CattoPushService } from '@catto/nest-push';
 *
 * @Module({
 *   imports: [
 *     CattoPushModule.forRoot({
 *       firebaseCredential: JSON.parse(process.env.FIREBASE_CREDENTIALS),
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 *
 * Then inject `CattoPushService` in any provider:
 *
 * ```typescript
 * @Injectable()
 * export class MyService {
 *   constructor(private pushService: CattoPushService) {}
 *
 *   async notify(token: string) {
 *     await this.pushService.sendToDevice(token, {
 *       title: 'Hello',
 *       body: 'World',
 *     });
 *   }
 * }
 * ```
 */

export * from './interfaces/config.interfaces';
export * from './interfaces/push-result.interface';
export * from './constants';
export * from './catto-push.module';
export * from './catto-push.service';
