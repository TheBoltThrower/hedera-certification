const {
  AccountCreateTransaction,
  Hbar,
  Client,
  PrivateKey,
  KeyList,
  TransferTransaction,
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

// Acount 4
const account4 = PrivateKey.fromString(
  "302e020100300506032b6570042204205b6553f339942035a753c02821e1b3439257533e855538e34700fc386b993a8f"
);
const account4Id = "0.0.4568026";

const client = Client.forTestnet();
client.setOperator(account1Id, account1);

const publicKeys = [account1.publicKey, account2.publicKey, account3.publicKey];

const newKey = new KeyList(publicKeys, 2);

async function createWallet() {
  let tx = await new AccountCreateTransaction()
    .setKey(newKey)
    .setInitialBalance(new Hbar(20))
    .execute(client);

  return (await tx.getReceipt(client)).accountId;
}

async function spendFail(accId) {
  const tx = await new TransferTransaction()
    .addHbarTransfer(accId, new Hbar(-10))
    .addHbarTransfer(account4Id, new Hbar(10))
    .freezeWith(client)
    .sign(account1);

  const executed = await (await tx.execute(client)).getReceipt(client);
  return executed;
}

async function spend(accId) {
  const tx = await (
    await new TransferTransaction()
      .addHbarTransfer(accId, new Hbar(-10))
      .addHbarTransfer(account4Id, new Hbar(10))
      .freezeWith(client)
      .sign(account1)
  ).sign(account2);

  const executed = await (await tx.execute(client)).getReceipt(client);
  return executed;
}

async function main() {
  const accountId = await createWallet();
  console.log(accountId);
  await spendFail(accountId).catch((err) => console.error(`Error: ${err}`));
  const tx = await spend(accountId);
  console.log(tx);
  process.exit();
}

main();
