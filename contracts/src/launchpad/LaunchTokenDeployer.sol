// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {LaunchToken} from "./LaunchToken.sol";

/// @notice Deploys launch tokens with CREATE2 for the factory. Split out to keep the factory under the size limit.
contract LaunchTokenDeployer {
    address public immutable deployer;
    address public factory;

    error Unauthorized();
    error AlreadyWired();

    constructor() {
        deployer = msg.sender;
    }

    function setFactory(address factory_) external {
        if (msg.sender != deployer) revert Unauthorized();
        if (factory != address(0)) revert AlreadyWired();
        factory = factory_;
    }

    function deploy(
        bytes32 salt,
        string calldata name,
        string calldata symbol,
        string calldata logo,
        string calldata description,
        LaunchToken.Socials calldata socials,
        uint256 supply
    ) external returns (address) {
        if (msg.sender != factory) revert Unauthorized();
        return address(new LaunchToken{salt: salt}(name, symbol, logo, description, socials, supply, msg.sender));
    }
}
