const {
  PrivateKey,
  Client,
  Hbar,
  ContractCreateFlow,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  ContractCallQuery,
} = require("@hashgraph/sdk");

// Acount 1
const account1 = PrivateKey.fromString(
  "302e020100300506032b65700422042002e3fc9441dc666332e60d2c7c73f415070bd104e384a8c046e1eb07cda3cc70"
);
const account1Id = "0.0.4568023";

const client = Client.forTestnet();
client.setOperator(account1Id, account1);
client.setDefaultMaxTransactionFee(new Hbar(100));

const contractJson = require("./CertificationC1.json");

async function deployContract() {
  const contractTx = await new ContractCreateFlow()
    .setBytecode(contractJson.bytecode)
    .setGas(200_000)
    .execute(client);

  const contractId = (await contractTx.getReceipt(client)).contractId;
  return contractId;
}

async function interactWithContractFunction1(contractId) {
  const tx = await new ContractExecuteTransaction()
    .setContractId(contractId)
    .setGas(100_000)
    .setFunction(
      "function1",
      new ContractFunctionParameters().addUint16(4).addUint16(3)
    )
    .execute(client);

  return Buffer.from((await tx.getRecord(client)).contractFunctionResult.bytes)
    .toJSON()
    .data.at(-1);
}

async function interactWithContractFunction2(contractId, n) {
  const tx = await new ContractExecuteTransaction()
    .setContractId(contractId)
    .setGas(100_000)
    .setFunction("function2", new ContractFunctionParameters().addUint16(n))
    .execute(client);

  return Buffer.from((await tx.getRecord(client)).contractFunctionResult.bytes)
    .toJSON()
    .data.at(-1);
}

async function main() {
  let contractId = await deployContract();
  console.log(`ContractId: ${contractId}`);
  let result1 = await interactWithContractFunction1(contractId);
  console.log(`Result-one: ${result1}`);
  let result2 = await interactWithContractFunction2(contractId, result1);
  console.log(`Result-two: ${result2}`);

  process.exit();
}

main();
