import { List } from 'immutable'
import {
  Erc20Transfer,
  Erc721Transfer,
  MultisigExecutionInfo,
  Operation,
  TokenType,
} from '@gnosis.pm/safe-react-gateway-sdk'
import { useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useStyles } from './style'

import Modal, { ButtonStatus, Modal as GenericModal } from 'src/components/Modal'
import { ReviewInfoText } from 'src/components/ReviewInfoText'
import Block from 'src/components/layout/Block'
import Bold from 'src/components/layout/Bold'
import Hairline from 'src/components/layout/Hairline'
import Paragraph from 'src/components/layout/Paragraph'
import Row from 'src/components/layout/Row'
import { TX_NOTIFICATION_TYPES } from 'src/logic/safe/transactions'
import { processTransaction } from 'src/logic/safe/store/actions/processTransaction'
import { EstimationStatus, useEstimateTransactionGas } from 'src/logic/hooks/useEstimateTransactionGas'
import { useEstimationStatus } from 'src/logic/hooks/useEstimationStatus'
import { TxParameters } from 'src/routes/safe/container/hooks/useTransactionParameters'
import { TxParametersDetail } from 'src/routes/safe/components/Transactions/helpers/TxParametersDetail'
import { EditableTxParameters } from 'src/routes/safe/components/Transactions/helpers/EditableTxParameters'
import { EMPTY_DATA } from 'src/logic/wallets/ethTransactions'
import { userAccountSelector } from 'src/logic/wallets/store/selectors'
import { isThresholdReached } from 'src/routes/safe/components/Transactions/TxList/hooks/useTransactionActions'
import { ModalHeader } from 'src/routes/safe/components/Balances/SendModal/screens/ModalHeader'
import { Overwrite } from 'src/types/helpers'
import { ZERO_ADDRESS } from 'src/logic/wallets/ethAddresses'
import { makeConfirmation } from 'src/logic/safe/store/models/confirmation'
import { NOTIFICATIONS } from 'src/logic/notifications'
import enqueueSnackbar from 'src/logic/notifications/store/actions/enqueueSnackbar'
import { ExpandedTxDetails, isMultiSigExecutionDetails, Transaction } from 'src/logic/safe/store/models/types/gateway.d'
import { extractSafeAddress } from 'src/routes/routes'
import ExecuteCheckbox from 'src/components/ExecuteCheckbox'

export const APPROVE_TX_MODAL_SUBMIT_BTN_TEST_ID = 'approve-tx-modal-submit-btn'
export const REJECT_TX_MODAL_SUBMIT_BTN_TEST_ID = 'reject-tx-modal-submit-btn'

const getModalTitleAndDescription = (
  thresholdReached: boolean,
  isCancelTx: boolean,
): { title: string; description: string } => {
  const modalInfo = {
    title: 'Execute transaction rejection',
    description: 'This action will execute this transaction.',
  }

  if (isCancelTx) {
    return modalInfo
  }

  if (thresholdReached) {
    modalInfo.title = 'Execute transaction'
    modalInfo.description = 'This action will execute this transaction.'
  } else {
    modalInfo.title = 'Approve Transaction'
    modalInfo.description =
      'This action will approve this transaction. A separate Transaction will be performed to submit the approval.'
  }

  return modalInfo
}

const useTxInfo = (transaction: Props['transaction']) => {
  const t = useRef(transaction)
  const safeAddress = extractSafeAddress()

  const confirmations = useMemo(
    () =>
      t.current.txDetails.detailedExecutionInfo && isMultiSigExecutionDetails(t.current.txDetails.detailedExecutionInfo)
        ? List(
            t.current.txDetails.detailedExecutionInfo.confirmations.map(({ signer, signature }) =>
              makeConfirmation({ owner: signer.value, signature }),
            ),
          )
        : List([]),
    [],
  )

  const data = useMemo(() => t.current.txDetails.txData?.hexData ?? EMPTY_DATA, [])

  const baseGas = useMemo(
    () =>
      isMultiSigExecutionDetails(t.current.txDetails.detailedExecutionInfo)
        ? t.current.txDetails.detailedExecutionInfo.baseGas
        : '0',
    [],
  )

  const gasPrice = useMemo(
    () =>
      isMultiSigExecutionDetails(t.current.txDetails.detailedExecutionInfo)
        ? t.current.txDetails.detailedExecutionInfo.gasPrice
        : '0',
    [],
  )

  const safeTxGas = useMemo(
    () =>
      isMultiSigExecutionDetails(t.current.txDetails.detailedExecutionInfo)
        ? t.current.txDetails.detailedExecutionInfo.safeTxGas
        : '0',
    [],
  )

  const gasToken = useMemo(
    () =>
      isMultiSigExecutionDetails(t.current.txDetails.detailedExecutionInfo)
        ? t.current.txDetails.detailedExecutionInfo.gasToken
        : ZERO_ADDRESS,
    [],
  )

  const nonce = useMemo(() => (t.current.executionInfo as MultisigExecutionInfo)?.nonce ?? 0, [])

  const refundReceiver = useMemo(
    () =>
      isMultiSigExecutionDetails(t.current.txDetails.detailedExecutionInfo)
        ? t.current.txDetails.detailedExecutionInfo.refundReceiver.value
        : ZERO_ADDRESS,
    [],
  )

  const safeTxHash = useMemo(
    () =>
      isMultiSigExecutionDetails(t.current.txDetails.detailedExecutionInfo)
        ? t.current.txDetails.detailedExecutionInfo.safeTxHash
        : EMPTY_DATA,
    [],
  )

  const value = useMemo(() => {
    switch (t.current.txInfo.type) {
      case 'Transfer':
        if (t.current.txInfo.transferInfo.type === TokenType.NATIVE_COIN) {
          return t.current.txInfo.transferInfo.value
        } else {
          return t.current.txDetails.txData?.value ?? '0'
        }
      case 'Custom':
        return t.current.txInfo.value
      case 'Creation':
      case 'SettingsChange':
      default:
        return '0'
    }
  }, [])

  const to = useMemo(() => {
    switch (t.current.txInfo.type) {
      case 'Transfer':
        if (t.current.txInfo.transferInfo.type === TokenType.NATIVE_COIN) {
          return t.current.txInfo.recipient.value
        } else {
          return (t.current.txInfo.transferInfo as Erc20Transfer | Erc721Transfer).tokenAddress
        }
      case 'Custom':
        return t.current.txInfo.to.value
      case 'Creation':
      case 'SettingsChange':
      default:
        return safeAddress
    }
  }, [safeAddress])

  const operation = useMemo(() => t.current.txDetails.txData?.operation ?? Operation.CALL, [])

  const origin = useMemo(
    () =>
      t.current.safeAppInfo ? JSON.stringify({ name: t.current.safeAppInfo.name, url: t.current.safeAppInfo.url }) : '',
    [],
  )

  const id = useMemo(() => t.current.id, [])

  return {
    confirmations,
    data,
    baseGas,
    gasPrice,
    safeTxGas,
    gasToken,
    nonce,
    refundReceiver,
    safeTxHash,
    value,
    to,
    operation,
    origin,
    id,
  }
}

type Props = {
  onClose: () => void
  isExecution?: boolean
  isCancelTx?: boolean
  isOpen: boolean
  transaction: Overwrite<Transaction, { txDetails: ExpandedTxDetails }>
  txParameters: TxParameters
}

export const ApproveTxModal = ({
  onClose,
  isExecution = false,
  isCancelTx = false,
  isOpen,
  transaction,
}: Props): React.ReactElement => {
  const dispatch = useDispatch()
  const userAddress = useSelector(userAccountSelector)
  const classes = useStyles()
  const safeAddress = extractSafeAddress()
  const [shouldExecute, setShouldExecute] = useState(isExecution)
  const executionInfo = transaction.executionInfo as MultisigExecutionInfo
  const thresholdReached = !!(transaction.executionInfo && isThresholdReached(executionInfo))
  const _threshold = executionInfo?.confirmationsRequired ?? 0
  const _countingCurrentConfirmation = (executionInfo?.confirmationsSubmitted ?? 0) + 1
  const { description, title } = getModalTitleAndDescription(thresholdReached, isCancelTx)
  const oneConfirmationLeft = !thresholdReached && _countingCurrentConfirmation === _threshold
  const isTheTxReadyToBeExecuted = oneConfirmationLeft ? true : thresholdReached
  const [manualGasPrice, setManualGasPrice] = useState<string | undefined>()
  const [manualMaxPrioFee, setManualMaxPrioFee] = useState<string | undefined>()
  const [manualGasLimit, setManualGasLimit] = useState<string | undefined>()
  const willExecute = isExecution && shouldExecute

  const {
    confirmations,
    data,
    baseGas,
    gasPrice,
    safeTxGas,
    gasToken,
    nonce,
    refundReceiver,
    safeTxHash,
    value,
    to,
    operation,
    origin,
    id,
  } = useTxInfo(transaction)
  const {
    gasLimit,
    gasPriceFormatted,
    gasCostFormatted,
    gasMaxPrioFeeFormatted,
    txEstimationExecutionStatus,
    isOffChainSignature,
    isCreation,
  } = useEstimateTransactionGas({
    txRecipient: to,
    txData: data,
    txConfirmations: confirmations,
    txAmount: value,
    preApprovingOwner: shouldExecute ? userAddress : undefined,
    safeTxGas,
    operation,
    manualGasPrice,
    manualMaxPrioFee,
    manualGasLimit,
    isExecution: willExecute,
  })
  const [buttonStatus] = useEstimationStatus(txEstimationExecutionStatus)

  const approveTx = (txParameters: TxParameters) => {
    if (thresholdReached && confirmations.size < _threshold) {
      dispatch(enqueueSnackbar(NOTIFICATIONS.TX_FETCH_SIGNATURES_ERROR_MSG))
    } else {
      dispatch(
        processTransaction({
          safeAddress,
          tx: {
            id,
            baseGas,
            confirmations,
            data,
            gasPrice,
            gasToken,
            nonce,
            operation,
            origin,
            refundReceiver,
            safeTxGas,
            safeTxHash,
            to,
            value,
          },
          userAddress,
          notifiedTransaction: TX_NOTIFICATION_TYPES.CONFIRMATION_TX,
          approveAndExecute: isExecution && shouldExecute && isTheTxReadyToBeExecuted,
          ethParameters: txParameters,
          thresholdReached,
        }),
      )
    }
    onClose()
  }

  const getParametersStatus = () => {
    if (isExecution || shouldExecute) {
      return 'SAFE_DISABLED'
    }

    return 'DISABLED'
  }

  const closeEditModalCallback = (txParameters: TxParameters) => {
    const oldGasPrice = gasPriceFormatted
    const newGasPrice = txParameters.ethGasPrice
    const oldGasLimit = gasLimit
    const newGasLimit = txParameters.ethGasLimit
    const oldMaxPrioFee = gasMaxPrioFeeFormatted
    const newMaxPrioFee = txParameters.ethMaxPrioFee

    if (oldGasPrice !== newGasPrice) {
      setManualGasPrice(newGasPrice)
    }

    if (oldMaxPrioFee !== newMaxPrioFee) {
      setManualMaxPrioFee(newMaxPrioFee)
    }

    if (oldGasLimit !== newGasLimit) {
      setManualGasLimit(newGasLimit)
    }
  }

  return (
    <Modal description={description} handleClose={onClose} open={isOpen} title={title}>
      <EditableTxParameters
        isOffChainSignature={isOffChainSignature}
        isExecution={willExecute}
        parametersStatus={getParametersStatus()}
        ethGasLimit={gasLimit}
        ethGasPrice={gasPriceFormatted}
        ethMaxPrioFee={gasMaxPrioFeeFormatted}
        safeNonce={nonce.toString()}
        safeTxGas={safeTxGas}
        closeEditModalCallback={closeEditModalCallback}
      >
        {(txParameters, toggleEditMode) => {
          return (
            <>
              <ModalHeader onClose={onClose} title={title} />

              <Hairline />

              {/* Tx info */}
              <Block className={classes.container}>
                <Row style={{ flexDirection: 'column' }}>
                  <Paragraph>{description}</Paragraph>
                  <Paragraph color="medium" size="sm">
                    Transaction nonce:
                    <br />
                    <Bold className={classes.nonceNumber}>{nonce}</Bold>
                  </Paragraph>

                  {oneConfirmationLeft && isExecution && !isCancelTx && <ExecuteCheckbox onChange={setShouldExecute} />}

                  {/* Tx Parameters */}
                  {(shouldExecute || !isOffChainSignature) && (
                    <TxParametersDetail
                      txParameters={txParameters}
                      onEdit={toggleEditMode}
                      parametersStatus={getParametersStatus()}
                      isTransactionCreation={isCreation}
                      isTransactionExecution={willExecute}
                      isOffChainSignature={isOffChainSignature}
                    />
                  )}
                </Row>
              </Block>

              {txEstimationExecutionStatus === EstimationStatus.LOADING ? null : (
                <ReviewInfoText
                  gasCostFormatted={gasCostFormatted}
                  isCreation={isCreation}
                  isExecution={willExecute}
                  safeNonce={txParameters.safeNonce}
                  txEstimationExecutionStatus={txEstimationExecutionStatus}
                />
              )}

              {/* Footer */}
              <GenericModal.Footer withoutBorder={buttonStatus !== ButtonStatus.LOADING}>
                <GenericModal.Footer.Buttons
                  cancelButtonProps={{ onClick: onClose, text: 'Close' }}
                  confirmButtonProps={{
                    onClick: () => approveTx(txParameters),
                    type: 'submit',
                    status: buttonStatus,
                    text: txEstimationExecutionStatus === EstimationStatus.LOADING ? 'Estimating' : undefined,
                    testId: isCancelTx ? REJECT_TX_MODAL_SUBMIT_BTN_TEST_ID : APPROVE_TX_MODAL_SUBMIT_BTN_TEST_ID,
                  }}
                />
              </GenericModal.Footer>
            </>
          )
        }}
      </EditableTxParameters>
    </Modal>
  )
}
