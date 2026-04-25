// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";

import "../src/SupplierPaymentExecutor.sol";

contract SupplierPaymentExecutorTest is Test {
    event InvoicePaid(
        string invoiceId,
        bytes32 indexed invoiceHash,
        address indexed beneficiary,
        uint256 amount,
        bytes32 indexed runId,
        address executor
    );

    SupplierPaymentExecutor internal executor;

    address internal beneficiary = makeAddr("beneficiary");
    address internal outsider = makeAddr("outsider");
    string internal constant INVOICE_ID = "INV-2026-0001";
    bytes32 internal constant RUN_ID = keccak256("run-001");
    uint256 internal constant PAYMENT_AMOUNT = 1 ether;

    function setUp() public {
        executor = new SupplierPaymentExecutor();
    }

    function testExecutePaymentTransfersFundsAndStoresRecord() public {
        vm.deal(address(this), 2 ether);
        executor.deposit{value: 2 ether}();

        executor.executePayment(INVOICE_ID, payable(beneficiary), PAYMENT_AMOUNT, RUN_ID);

        bytes32 invoiceHash = keccak256(bytes(INVOICE_ID));
        SupplierPaymentExecutor.PaymentRecord memory payment = executor.getPayment(INVOICE_ID);

        assertEq(beneficiary.balance, PAYMENT_AMOUNT);
        assertEq(address(executor).balance, 1 ether);
        assertTrue(executor.isInvoicePaid(INVOICE_ID));
        assertTrue(executor.isInvoiceHashPaid(invoiceHash));
        assertEq(payment.invoiceId, INVOICE_ID);
        assertEq(payment.beneficiary, beneficiary);
        assertEq(payment.amount, PAYMENT_AMOUNT);
        assertEq(payment.runId, RUN_ID);
        assertEq(payment.executor, address(this));
        assertEq(payment.paidAt, block.timestamp);
    }

    function testExecutePaymentEmitsAuditEvent() public {
        vm.deal(address(this), PAYMENT_AMOUNT);
        executor.deposit{value: PAYMENT_AMOUNT}();

        bytes32 invoiceHash = keccak256(bytes(INVOICE_ID));

        vm.expectEmit(true, true, true, true);
        emit InvoicePaid(INVOICE_ID, invoiceHash, beneficiary, PAYMENT_AMOUNT, RUN_ID, address(this));

        executor.executePayment(INVOICE_ID, payable(beneficiary), PAYMENT_AMOUNT, RUN_ID);
    }

    function testExecutePaymentRevertsForDuplicateInvoice() public {
        vm.deal(address(this), 2 ether);
        executor.deposit{value: 2 ether}();

        executor.executePayment(INVOICE_ID, payable(beneficiary), PAYMENT_AMOUNT, RUN_ID);

        vm.expectRevert(
            abi.encodeWithSelector(
                SupplierPaymentExecutor.InvoiceAlreadyPaid.selector, keccak256(bytes(INVOICE_ID))
            )
        );
        executor.executePayment(INVOICE_ID, payable(beneficiary), PAYMENT_AMOUNT, RUN_ID);
    }

    function testExecutePaymentRevertsWhenCallerIsNotOwner() public {
        vm.deal(address(this), PAYMENT_AMOUNT);
        executor.deposit{value: PAYMENT_AMOUNT}();

        vm.prank(outsider);
        vm.expectRevert(SupplierPaymentExecutor.NotOwner.selector);
        executor.executePayment(INVOICE_ID, payable(beneficiary), PAYMENT_AMOUNT, RUN_ID);
    }

    function testExecutePaymentRevertsWhenTreasuryIsInsufficient() public {
        vm.deal(address(this), 0.5 ether);
        executor.deposit{value: 0.5 ether}();

        vm.expectRevert(
            abi.encodeWithSelector(SupplierPaymentExecutor.InsufficientTreasuryBalance.selector, 0.5 ether, PAYMENT_AMOUNT)
        );
        executor.executePayment(INVOICE_ID, payable(beneficiary), PAYMENT_AMOUNT, RUN_ID);
    }

    function testExecutePaymentRevertsForInvalidInput() public {
        vm.deal(address(this), PAYMENT_AMOUNT);
        executor.deposit{value: PAYMENT_AMOUNT}();

        vm.expectRevert(SupplierPaymentExecutor.EmptyInvoiceId.selector);
        executor.executePayment("", payable(beneficiary), PAYMENT_AMOUNT, RUN_ID);

        vm.expectRevert(SupplierPaymentExecutor.InvalidBeneficiary.selector);
        executor.executePayment(INVOICE_ID, payable(address(0)), PAYMENT_AMOUNT, RUN_ID);

        vm.expectRevert(SupplierPaymentExecutor.InvalidAmount.selector);
        executor.executePayment(INVOICE_ID, payable(beneficiary), 0, RUN_ID);
    }
}
