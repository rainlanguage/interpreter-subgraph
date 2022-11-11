// SPDX-License-Identifier: CAL
pragma solidity =0.8.17;

import {LibEvidence, Verify} from "../Verify.sol";
import "../VerifyCallback.sol";
import "../../interpreter/run/StandardInterpreter.sol";
import "../../array/LibUint256Array.sol";
import {AllStandardOps} from "../../interpreter/ops/AllStandardOps.sol";

uint256 constant OP_EVIDENCE_DATA_APPROVED = 0;
uint256 constant LOCAL_OPS_LENGTH = 1;

contract AutoApprove is VerifyCallback, StandardInterpreter {
    using LibStackTop for StackTop;
    using LibUint256Array for uint256;
    using LibUint256Array for uint256[];
    using LibEvidence for uint256[];
    using LibStackTop for uint256[];
    using LibStackTop for StackTop;

    /// Contract has initialized.
    /// @param sender `msg.sender` initializing the contract (factory).
    /// @param config All initialized config.
    event Initialize(address sender, StateConfig config);

    using LibInterpreterState for InterpreterState;

    mapping(uint256 => uint256) private _approvedEvidenceData;

    constructor(address interpreterIntegrity_)
        StandardInterpreter(interpreterIntegrity_)
    {
        _disableInitializers();
    }

    function initialize(StateConfig calldata stateConfig_)
        external
        initializer
    {
        __VerifyCallback_init();
        _saveInterpreterState(stateConfig_);

        _transferOwnership(msg.sender);

        emit Initialize(msg.sender, stateConfig_);
    }

    function afterAdd(address, Evidence[] calldata evidences_)
        external
        virtual
        override
    {
        unchecked {
            uint256[] memory approvedRefs_ = new uint256[](evidences_.length);
            uint256 approvals_ = 0;
            uint256[] memory context_ = new uint256[](2);
            InterpreterState memory state_ = _loadInterpreterState();
            for (uint256 i_ = 0; i_ < evidences_.length; i_++) {
                // Currently we only support 32 byte evidence for auto approve.
                if (evidences_[i_].data.length == 0x20) {
                    context_[0] = uint256(uint160(evidences_[i_].account));
                    context_[1] = uint256(bytes32(evidences_[i_].data));
                    state_.context = context_.matrixFrom();
                    if (state_.eval().peek() > 0) {
                        _approvedEvidenceData[
                            uint256(bytes32(evidences_[i_].data))
                        ] = block.timestamp;
                        LibEvidence._updateEvidenceRef(
                            approvedRefs_,
                            evidences_[i_],
                            approvals_
                        );
                        approvals_++;
                    }
                }
            }
            if (approvals_ > 0) {
                approvedRefs_.truncate(approvals_);
                Verify(msg.sender).approve(approvedRefs_.asEvidences());
            }
        }
    }

    function _evidenceDataApproved(uint256 evidenceData_)
        internal
        view
        returns (uint256)
    {
        return _approvedEvidenceData[evidenceData_];
    }

    function opEvidenceDataApproved(
        InterpreterState memory,
        Operand,
        StackTop stackTop_
    ) internal view returns (StackTop) {
        return stackTop_.applyFn(_evidenceDataApproved);
    }

    function localEvalFunctionPointers()
        internal
        pure
        virtual
        override
        returns (
            function(InterpreterState memory, Operand, StackTop)
                view
                returns (StackTop)[]
                memory localFnPtrs_
        )
    {
        localFnPtrs_ = new function(InterpreterState memory, Operand, StackTop)
            view
            returns (StackTop)[](1);
        localFnPtrs_[0] = opEvidenceDataApproved;
    }
}
