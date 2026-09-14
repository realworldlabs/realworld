// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

/// @notice Fixed-supply launch token. No owner, no mint after construction, no transfer restrictions.
contract LaunchToken is ERC20, ERC20Burnable {
    struct Socials {
        string twitter;
        string telegram;
        string website;
    }

    string public logo;
    string public description;
    Socials private _socials;

    constructor(
        string memory name_,
        string memory symbol_,
        string memory logo_,
        string memory description_,
        Socials memory socials_,
        uint256 supply,
        address to
    ) ERC20(name_, symbol_) {
        logo = logo_;
        description = description_;
        _socials = socials_;
        _mint(to, supply);
    }

    function socials() external view returns (Socials memory) {
        return _socials;
    }
}
