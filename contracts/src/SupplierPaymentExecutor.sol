// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract SupplierPaymentExecutor {
    error EmptyInvoiceId();
    error InvalidBeneficiary();
    error InvalidAmount();
    error InvoiceAlreadyPaid(bytes32 invoiceHash);
    error InsufficientTreasuryBalance(uint256 available, uint256 required);
    error PaymentTransferFailed();
    error NotOwner();
    error InvalidOwner();
    error ReentrancyGuard();

    struct PaymentRecord {
        string invoiceId;
        address beneficiary;
        uint256 amount;
        bytes32 runId;
        address executor;
        uint64 paidAt;
    }

    address public owner;

    mapping(bytes32 invoiceHash => PaymentRecord payment) private paymentsByInvoiceHash;

    uint256 private unlocked = 1;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event TreasuryDeposit(address indexed sender, uint256 amount, uint256 balanceAfter);
    event TreasuryWithdrawal(address indexed recipient, uint256 amount, uint256 balanceAfter);
    event InvoicePaid(
        string invoiceId,
        bytes32 indexed invoiceHash,
        address indexed beneficiary,
        uint256 amount,
        bytes32 indexed runId,
        address executor
    );

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier nonReentrant() {
        if (unlocked != 1) revert ReentrancyGuard();
        unlocked = 2;
        _;
        unlocked = 1;
    }

    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    receive() external payable {
        emit TreasuryDeposit(msg.sender, msg.value, address(this).balance);
    }

    function deposit() external payable {
        emit TreasuryDeposit(msg.sender, msg.value, address(this).balance);
    }

    function executePayment(
        string calldata invoiceId,
        address payable beneficiary,
        uint256 amount,
        bytes32 runId
    ) external onlyOwner nonReentrant {
        bytes32 invoiceHash = _invoiceHash(invoiceId);

        if (beneficiary == address(0)) revert InvalidBeneficiary();
        if (amount == 0) revert InvalidAmount();
        if (paymentsByInvoiceHash[invoiceHash].paidAt != 0) revert InvoiceAlreadyPaid(invoiceHash);

        uint256 availableBalance = address(this).balance;
        if (availableBalance < amount) {
            revert InsufficientTreasuryBalance(availableBalance, amount);
        }

        paymentsByInvoiceHash[invoiceHash] = PaymentRecord({
            invoiceId: invoiceId,
            beneficiary: beneficiary,
            amount: amount,
            runId: runId,
            executor: msg.sender,
            paidAt: uint64(block.timestamp)
        });

        (bool success,) = beneficiary.call{value: amount}("");
        if (!success) revert PaymentTransferFailed();

        emit InvoicePaid(invoiceId, invoiceHash, beneficiary, amount, runId, msg.sender);
    }

    function withdrawTreasury(address payable recipient, uint256 amount) external onlyOwner nonReentrant {
        if (recipient == address(0)) revert InvalidBeneficiary();
        if (amount == 0) revert InvalidAmount();

        uint256 availableBalance = address(this).balance;
        if (availableBalance < amount) {
            revert InsufficientTreasuryBalance(availableBalance, amount);
        }

        (bool success,) = recipient.call{value: amount}("");
        if (!success) revert PaymentTransferFailed();

        emit TreasuryWithdrawal(recipient, amount, address(this).balance);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert InvalidOwner();

        address previousOwner = owner;
        owner = newOwner;

        emit OwnershipTransferred(previousOwner, newOwner);
    }

    function isInvoicePaid(string calldata invoiceId) external view returns (bool) {
        return paymentsByInvoiceHash[_invoiceHash(invoiceId)].paidAt != 0;
    }

    function isInvoiceHashPaid(bytes32 invoiceHash) external view returns (bool) {
        return paymentsByInvoiceHash[invoiceHash].paidAt != 0;
    }

    function getPayment(string calldata invoiceId) external view returns (PaymentRecord memory) {
        return paymentsByInvoiceHash[_invoiceHash(invoiceId)];
    }

    function getPaymentByHash(bytes32 invoiceHash) external view returns (PaymentRecord memory) {
        return paymentsByInvoiceHash[invoiceHash];
    }

    function treasuryBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function invoiceHashOf(string calldata invoiceId) external pure returns (bytes32) {
        return _invoiceHash(invoiceId);
    }

    function _invoiceHash(string calldata invoiceId) internal pure returns (bytes32) {
        if (bytes(invoiceId).length == 0) revert EmptyInvoiceId();
        return keccak256(bytes(invoiceId));
    }
}
