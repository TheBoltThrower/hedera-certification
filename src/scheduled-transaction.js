const {
  TransferTransaction,
  Client,
  ScheduleCreateTransaction,
  ScheduleDeleteTransaction,
  PrivateKey,
  Hbar,
  ScheduleInfoQuery,
  ScheduleSignTransaction,
} = require("@hashgraph/sdk");

const myAccountId = "0.0.4567580";
const myPrivateKey = PrivateKey.fromString(
  "302e020100300506032b657004220420431538468f27543310515662c90d76f096fc1330767d732952d378d2d70a318e"
);

const otherAccountId = "0.0.4568023";
const otherPrivateKey = PrivateKey.fromString(
  "302e020100300506032b65700422042002e3fc9441dc666332e60d2c7c73f415070bd104e384a8c046e1eb07cda3cc70"
);

const otherAccountId2 = "0.0.4568024";
const client = Client.forTestnet();

client.setOperator(myAccountId, myPrivateKey);

async function main() {
  //Create a transaction to schedule
  const transferTransaction = new TransferTransaction()
    .addHbarTransfer(otherAccountId, Hbar.fromTinybars(-100))
    .addHbarTransfer(otherAccountId2, Hbar.fromTinybars(100));

  //Schedule a transaction
  const scheduleTransaction = await new ScheduleCreateTransaction()
    .setScheduledTransaction(transferTransaction)
    .setScheduleMemo("Scheduled Transaction Test Cert!")
    .setAdminKey(myPrivateKey)
    .execute(client);

  //Get the receipt of the transaction
  const scheduledTxReceipt = await scheduleTransaction.getReceipt(client);

  //Get the schedule ID
  const scheduleId = scheduledTxReceipt.scheduleId;
  console.log("The schedule ID is " + scheduleId);

  //Get the scheduled transaction ID
  const scheduledTxId = scheduledTxReceipt.scheduledTransactionId;
  console.log("The scheduled transaction ID is " + scheduledTxId);

  //Create the transaction and sign with the admin key
  const transaction = await new ScheduleDeleteTransaction()
    .setScheduleId(scheduleId)
    .freezeWith(client)
    .sign(myPrivateKey);

  //Sign with the operator key and submit to a Hedera network
  const txResponse = await transaction.execute(client);

  //Get the transaction receipt
  const receipt = await txResponse.getReceipt(client);

  //Get the transaction status
  const transactionStatus = receipt.status;
  console.log("The transaction consensus status is " + transactionStatus);

  //Try to execute the deleted scheduled tx
  const scheduledSignTransaction = await new ScheduleSignTransaction()
    .setScheduleId(scheduleId)
    .freezeWith(client)
    .sign(otherPrivateKey);

  const txResponse1 = await scheduledSignTransaction.execute(client);
  const receipt1 = await txResponse1.getReceipt(client);

  //Get the transaction status - should fail
  const transactionStatus1 = receipt1.status;
  console.log("The transaction consensus status is " + transactionStatus1);

  process.exit();
}

main();
