import 'reflect-metadata';

// Loading PagesResolver imports @ccatto/nest-auth's guards; mock it so this test
// doesn't drag in nest-auth's runtime deps (passport/jwt/bcrypt). The schema
// builder only needs the guard classes/decorators to exist as metadata.
jest.mock('@ccatto/nest-auth', () => ({
  GqlAuthGuard: class GqlAuthGuard {},
  PlatformAdminGuard: class PlatformAdminGuard {},
  CurrentUser: () => () => undefined,
}));

import { NestFactory } from '@nestjs/core';
import {
  GraphQLSchemaBuilderModule,
  GraphQLSchemaFactory,
} from '@nestjs/graphql';
import { PagesResolver } from '../pages.resolver';

/**
 * Builds the GraphQL schema straight from the resolver (no Apollo driver needed).
 * This reproduces the boot-time schema build, so a field missing an explicit
 * `@Field(() => Type)` throws UndefinedTypeError here — caught in CI, not at the
 * consuming app's runtime.
 */
describe('@ccatto/nest-pages GraphQL schema', () => {
  it('builds without UndefinedTypeError (all @Field types explicit)', async () => {
    // Standalone context (no HTTP platform needed to build a schema).
    const app = await NestFactory.createApplicationContext(
      GraphQLSchemaBuilderModule,
      { logger: false },
    );
    try {
      const factory = app.get(GraphQLSchemaFactory);
      const schema = await factory.create([PagesResolver]);

      expect(schema.getType('PageNode')).toBeDefined();
      expect(schema.getType('PageStatus')).toBeDefined();
      expect(schema.getType('CreatePageInput')).toBeDefined();
      expect(schema.getType('UpdatePageInput')).toBeDefined();
      // The field that regressed: PageNode.excerpt must be a String.
      const pageNode: any = schema.getType('PageNode');
      expect(String(pageNode.getFields().excerpt.type)).toBe('String');
    } finally {
      await app.close();
    }
  });
});
