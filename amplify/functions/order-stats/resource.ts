import { defineFunction } from '@aws-amplify/backend';

export const orderStats = defineFunction({
  name: 'order-stats',
  entry: './handler.ts'
});
