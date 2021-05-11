function createAccount(pin, amount) {
    amount |= 0;
    const validatePin = (pwd) => pwd !== pin && "Invalid PIN.";

    return {
        checkBalance: (pwd) =>
            validatePin(pwd) || `$${amount}`
        ,

        deposit: (pwd, count) => (
            validatePin(pwd) ||
            (count < 0 ?
                "Invalid deposit amount. Transaction cancelled." :
                null
            ) ||
            `Succesfully deposited $${
                count
            }. Current balance: $${
                amount += count
            }.`
        ),

        withdraw: (pwd, count) => (
            validatePin(pwd) ||
            (count < 0 ?
                "Invalid withdrawl amount. Transaction cancelled." :
                null
            ) ||
            (count > amount ?
                "Withdrawal amount exceeds account balance. " +
                    "Transaction cancelled." :
                null
            ) ||
            `Succesfully withdrew $${
                count
            }. Current balance: $${
                amount -= count
            }.`
        ),

        changePin: (pwd, newPin) =>
            validatePin(pwd) || ((pin = newPin), "PIN successfully changed!")
    }
}

module.exports = { createAccount };
