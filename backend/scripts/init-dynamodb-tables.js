
const {
  DynamoDBClient,
  CreateTableCommand,
  DeleteTableCommand,
  ListTablesCommand,
} = require('@aws-sdk/client-dynamodb');

const endpoint = process.env.AWS_ENDPOINT || 'http://localhost:4566';
const region = process.env.AWS_REGION || 'us-east-1';
const force = process.argv.includes('--force');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const client = new DynamoDBClient({
  region,
  endpoint,
  credentials: endpoint.includes('localhost')
    ? { accessKeyId: 'test', secretAccessKey: 'test' }
    : undefined,
});

const tables = [
  {
    TableName: 'OrderAuditLog',
    AttributeDefinitions: [
      { AttributeName: 'orderId', AttributeType: 'S' },
      { AttributeName: 'timestamp', AttributeType: 'S' },
    ],
    KeySchema: [
      { AttributeName: 'orderId', KeyType: 'HASH' },
      { AttributeName: 'timestamp', KeyType: 'RANGE' },
    ],
    BillingMode: 'PAY_PER_REQUEST',
  },
  {
    TableName: 'ReservationAuditLog',
    AttributeDefinitions: [
      { AttributeName: 'orderId', AttributeType: 'S' },
      { AttributeName: 'timestamp', AttributeType: 'S' },
    ],
    KeySchema: [
      { AttributeName: 'orderId', KeyType: 'HASH' },
      { AttributeName: 'timestamp', KeyType: 'RANGE' },
    ],
    BillingMode: 'PAY_PER_REQUEST',
  },
  {
    TableName: 'NotificationAuditLog',
    AttributeDefinitions: [
      { AttributeName: 'orderId', AttributeType: 'S' },
      { AttributeName: 'timestamp', AttributeType: 'S' },
    ],
    KeySchema: [
      { AttributeName: 'orderId', KeyType: 'HASH' },
      { AttributeName: 'timestamp', KeyType: 'RANGE' },
    ],
    BillingMode: 'PAY_PER_REQUEST',
  },
  {
    TableName: 'OrderSummaries',
    AttributeDefinitions: [{ AttributeName: 'orderId', AttributeType: 'S' }],
    KeySchema: [{ AttributeName: 'orderId', KeyType: 'HASH' }],
    BillingMode: 'PAY_PER_REQUEST',
  },
  {
    TableName: 'UserNotifications',
    AttributeDefinitions: [
      { AttributeName: 'userId', AttributeType: 'S' },
      { AttributeName: 'timestamp', AttributeType: 'S' },
    ],
    KeySchema: [
      { AttributeName: 'userId', KeyType: 'HASH' },
      { AttributeName: 'timestamp', KeyType: 'RANGE' },
    ],
    BillingMode: 'PAY_PER_REQUEST',
  },
];

async function main() {
  console.log('DynamoDB endpoint:', endpoint);
  if (force) console.log('Modo --force: apagando e recriando tabelas.');

  for (const table of tables) {
    if (force) {
      try {
        await client.send(new DeleteTableCommand({ TableName: table.TableName }));
        console.log('Apagada tabela:', table.TableName);
        await sleep(2000);
      } catch (err) {
        if (err.name !== 'ResourceNotFoundException') {
          console.error('Erro ao apagar', table.TableName, err.message);
          process.exit(1);
        }
      }
    }

    try {
      await client.send(new CreateTableCommand(table));
      console.log('Criada tabela:', table.TableName);
    } catch (err) {
      if (err.name === 'ResourceInUseException') {
        console.log('Tabela já existe:', table.TableName);
      } else {
        console.error('Erro ao criar', table.TableName, err.message);
        process.exit(1);
      }
    }
  }

  const list = await client.send(new ListTablesCommand({}));
  console.log('Tabelas existentes:', list.TableNames?.join(', ') || 'nenhuma');
}

main();
