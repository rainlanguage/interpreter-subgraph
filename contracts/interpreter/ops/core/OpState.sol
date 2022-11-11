// SPDX-License-Identifier: CAL
pragma solidity ^0.8.15;

import {IERC20Upgradeable as IERC20} from "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "../../run/LibStackTop.sol";
import "../../run/LibInterpreterState.sol";
import "../../deploy/LibIntegrityState.sol";

uint256 constant OPCODE_MEMORY_TYPE_STACK = 0;
uint256 constant OPCODE_MEMORY_TYPE_CONSTANT = 1;

/// @title OpState
/// @notice Opcode for stacking from the state.
library OpState {
    using LibStackTop for StackTop;
    using LibInterpreterState for InterpreterState;
    using LibIntegrityState for IntegrityState;

    function integrity(
        IntegrityState memory integrityState_,
        Operand operand_,
        StackTop stackTop_
    ) internal pure returns (StackTop) {
        uint256 type_ = Operand.unwrap(operand_) & 0x1;
        uint256 offset_ = Operand.unwrap(operand_) >> 1;
        if (type_ == OPCODE_MEMORY_TYPE_STACK) {
            require(
                offset_ < integrityState_.stackBottom.toIndex(stackTop_),
                "OOB_STACK_READ"
            );
        } else {
            require(
                offset_ < integrityState_.constantsLength,
                "OOB_CONSTANT_READ"
            );
        }
        return integrityState_.push(stackTop_);
    }

    /// Stack a value from the state.
    function state(
        InterpreterState memory state_,
        Operand operand_,
        StackTop stackTop_
    ) internal pure returns (StackTop) {
        unchecked {
            uint256 type_ = Operand.unwrap(operand_) & 0x1;
            uint256 offset_ = Operand.unwrap(operand_) >> 1;
            assembly ("memory-safe") {
                mstore(
                    stackTop_,
                    mload(
                        add(
                            mload(add(state_, mul(0x20, type_))),
                            mul(0x20, offset_)
                        )
                    )
                )
            }
            return StackTop.wrap(StackTop.unwrap(stackTop_) + 0x20);
        }
    }
}
