const MultiSig = artifacts.require("Enderun");

contract("MultiSig Wallet", (accounts) => {
    let contract;
    beforeEach(async () => {
        contract = await MultiSig.deployed();
    });

    describe("Deployment Check:", () => {
        it("Should deploy successfully", async () => {
            assert(contract.address != null);
            assert(contract.address != undefined);
            assert(contract.address != 0x0);
        });
    });

    describe("Transaction: Create Proposal", () => {
        it("Should recieve deposits", async () => {
            await contract.deposit({
                from: accounts[5],
                value: 100,
            });
            assert(contract.balance != 0, "contract was not funded");
        });
        it("Should create a transfer proposal", async () => {
            await contract.transactionProposal(accounts[4], 100, {
                from: accounts[1],
            });
            const transfer = await contract.transferLog(0);
            assert(transfer.id.toNumber() === 0);
            assert(transfer.amount.toNumber() === 100);
        });
        it("Should not create create transfer proposed by invalid address", async () => {
            try {
                await contract.transactionProposal(accounts[4], 100, {
                    from: accounts[6],
                });
            } catch (e) {
                assert(
                    e.message.includes("You do not have proper access rights")
                );
                return;
            }
        });
    });
    describe("Transaction: Execute Proposal", () => {
        it("Should NOT execute transaction if quorum not reached", async () => {
            const recipientBalanceBefore = web3.utils.toBN(
                await web3.eth.getBalance(accounts[6])
            );
            await contract.transactionProposal(accounts[6], 100, {
                from: accounts[1],
            });
            await contract.executeTransaction(1, { from: accounts[1] });
            const recipientBalanceAfter = web3.utils.toBN(
                await web3.eth.getBalance(accounts[6])
            );
            assert(
                recipientBalanceAfter.sub(recipientBalanceBefore).toNumber() ===
                    0
            );
        });
        it("Should execute transaction if quorum is reached", async () => {
            const recipientBalanceBefore = web3.utils.toBN(
                await web3.eth.getBalance(accounts[6])
            );
            await contract.transactionProposal(accounts[6], 100, {
                from: accounts[1],
            });
            await contract.executeTransaction(2, { from: accounts[1] });
            await contract.executeTransaction(2, { from: accounts[2] });
            const recipientBalanceAfter = web3.utils.toBN(
                await web3.eth.getBalance(accounts[6])
            );
            assert(
                recipientBalanceAfter.sub(recipientBalanceBefore).toNumber() ===
                    100
            );
        });
        it("Should NOT execute transaction if approver votes twice", async () => {
            await contract.transactionProposal(accounts[6], 100, {
                from: accounts[1],
            });
            try {
                await contract.executeTransaction(3, { from: accounts[2] });
                await contract.executeTransaction(3, { from: accounts[2] });
            } catch (e) {
                assert(e.message.includes("cannot vote more than once"));
            }
        });
        it("Should NOT duplicate transactions", async () => {
            try {
                await contract.executeTransaction(1, { from: accounts[2] });
            } catch (e) {
                assert(
                    e.message.includes("This transfer has aleady been sent")
                );
            }
        });
    });
    describe("Unknown Users:", () => {
        it("Should not execute function calls from unkown addresses", async () => {
            try {
                await contract.transactionProposal(accounts[6], 100, {
                    from: accounts[5],
                });
                await contract.executeTransaction(1, { from: accounts[5] });
            } catch (e) {
                assert(
                    e.message.includes("You do not have proper access rights")
                );
            }
        });
    });
});
