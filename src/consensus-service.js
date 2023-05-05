const {
  Client,
  PrivateKey,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  AccountId,
  Hbar,
} = require("@hashgraph/sdk");

// Acount 1
const account1 = PrivateKey.fromString(
  "302e020100300506032b65700422042002e3fc9441dc666332e60d2c7c73f415070bd104e384a8c046e1eb07cda3cc70"
);
const account1Id = "0.0.4568023";

// Acount 2
const account2 = PrivateKey.fromString(
  "302e020100300506032b657004220420c07535c0d346d28f3cf6c98aad1cd0d498d835754ebc45b6dbcdc3d86693e25e"
);
const account2Id = "0.0.4568024";

// Acount 3
const account3 = PrivateKey.fromString(
  "302e020100300506032b65700422042048b20281c1d9d5e40b5bb025373f0b8934cb41b3f24978855701973a74ce94b3"
);
const account3Id = "0.0.4568025";

const client = Client.forTestnet()
  .setOperator(account1Id, account1)
  .setDefaultMaxTransactionFee(new Hbar(10));

const client2 = Client.forTestnet()
  .setOperator(account2Id, account2)
  .setDefaultMaxTransactionFee(new Hbar(10));

const client3 = Client.forTestnet()
  .setOperator(account3Id, account3)
  .setDefaultMaxTransactionFee(new Hbar(10));

async function createTopic() {
  let txResponse = await new TopicCreateTransaction()
    .setSubmitKey(account1.publicKey)
    .setSubmitKey(account2.publicKey)
    .execute(client);

  let receipt = await txResponse.getReceipt(client);
  return receipt.topicId.toString();
}

async function send_message(topicId, client) {
  const message = new Date().toISOString();

  const response = await new TopicMessageSubmitTransaction({
    topicId,
    message,
  }).execute(client);

  let receipt = await response.getReceipt(client);
  console.log(`\nSent message to topic: ${topicId}, message: ${message}`);
  return receipt.status.toString();
}

async function main() {
  let topicId = await createTopic();
  console.log(`Created topic with id: ${topicId}`);
  console.log(
    `Look at topic messages: https://hashscan.io/testnet/topic/${topicId}`
  );
  await new Promise((resolve) => setTimeout(resolve, 5000));
  await send_message(topicId, client3).catch((error) =>
    console.log(`Err: ${error}`)
  );
  await send_message(topicId, client2);
  process.exit();
}

main();
