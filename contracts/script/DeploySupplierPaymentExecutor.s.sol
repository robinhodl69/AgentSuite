// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";

import "../src/SupplierPaymentExecutor.sol";

contract DeploySupplierPaymentExecutor is Script {
    function run() external returns (SupplierPaymentExecutor executor) {
        vm.startBroadcast();
        executor = new SupplierPaymentExecutor();
        console.log("SupplierPaymentExecutor deployed at:", address(executor));
        vm.stopBroadcast();
    }
}
