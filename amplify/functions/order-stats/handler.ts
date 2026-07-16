import type { Handler } from 'aws-lambda';

export const handler: Handler = async (event) => {
  console.log('Calculating order statistics event:', JSON.stringify(event, null, 2));

  // In a real application, you would connect to DynamoDB or parse payload.
  // For the learning path, we return a mock dashboard payload.
  return JSON.stringify({
    totalRevenue: 2450.00,
    totalOrders: 42,
    pendingOrders: 5,
    completedOrders: 35,
    cancelledOrders: 2,
    popularProducts: [
      { name: 'Pistachio sweet', count: 18 },
      { name: 'Almond sweet', count: 14 },
      { name: 'Peanut sweet', count: 10 }
    ]
  });
};
