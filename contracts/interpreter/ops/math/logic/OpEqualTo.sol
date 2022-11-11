// SPDX-License-Identifier: CAL
pragma solidity ^0.8.15;
import "../../../run/LibStackTop.sol";
import "../../../../type/LibCast.sol";
import "../../../run/LibInterpreterState.sol";
import "../../../deploy/LibIntegrityState.sol";

/// @title OpEqualTo
/// @notice Opcode to compare the top two stack values.
library OpEqualTo {
    using LibCast for bool;
    using LibStackTop for StackTop;
    using LibIntegrityState for IntegrityState;

    function _equalTo(uint256 a_, uint256 b_) internal pure returns (uint256) {
        return (a_ == b_).asUint256();
    }

    function integrity(
        IntegrityState memory integrityState_,
        Operand,
        StackTop stackTop_
    ) internal pure returns (StackTop) {
        return integrityState_.applyFn(stackTop_, _equalTo);
    }

    function equalTo(InterpreterState memory, Operand, StackTop stackTop_)
        internal
        view
        returns (StackTop)
    {
        return stackTop_.applyFn(_equalTo);
    }
}
