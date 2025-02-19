import { useEffect, ReactElement, Fragment } from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'
import CheckCircle from '@material-ui/icons/CheckCircle'
import InputAdornment from '@material-ui/core/InputAdornment'
import MenuItem from '@material-ui/core/MenuItem'
import { Icon, Link, Text } from '@gnosis.pm/safe-react-components'
import { useForm } from 'react-final-form'

import Block from 'src/components/layout/Block'
import Paragraph from 'src/components/layout/Paragraph'
import AddressInput from 'src/components/forms/AddressInput'
import Button from 'src/components/layout/Button'
import Field from 'src/components/forms/Field'
import ButtonHelper from 'src/components/ButtonHelper'
import SelectField from 'src/components/forms/SelectField'
import { useStepper } from 'src/components/Stepper/stepperContext'
import { providerNameSelector } from 'src/logic/wallets/store/selectors'
import { disabled, extraSmallFontSize, lg, sm, xs } from 'src/theme/variables'
import Hairline from 'src/components/layout/Hairline'
import Row from 'src/components/layout/Row'
import Col from 'src/components/layout/Col'
import TextField from 'src/components/forms/TextField'
import {
  ADDRESS_REPEATED_ERROR,
  composeValidators,
  minMaxLength,
  minValue,
  required,
  THRESHOLD_ERROR,
} from 'src/components/forms/validator'
import {
  FIELD_MAX_OWNER_NUMBER,
  FIELD_NEW_SAFE_THRESHOLD,
  FIELD_SAFE_OWNER_ENS_LIST,
  FIELD_SAFE_OWNERS_LIST,
  FIELD_HSBC_SAFE_OWNERS_LIST,
  FIELD_HSBC_SAFE_OWNER_ENS_LIST,
} from '../fields/createSafeFields'
import { ScanQRWrapper } from 'src/components/ScanQRModal/ScanQRWrapper'
import { currentNetworkAddressBookAsMap } from 'src/logic/addressBook/store/selectors'
import NetworkLabel from 'src/components/NetworkLabel/NetworkLabel'
import { removeTld, reverseENSLookup } from 'src/logic/wallets/getWeb3'

export const ownersAndConfirmationsNewSafeStepLabel = 'Owners and Confirmations'

function OwnersAndConfirmationsNewSafeStep(): ReactElement {
  const provider = useSelector(providerNameSelector)
  const { setCurrentStep } = useStepper()

  useEffect(() => {
    if (!provider) {
      setCurrentStep(0)
    }
  }, [provider, setCurrentStep])

  const createSafeForm = useForm()
  const addressBook = useSelector(currentNetworkAddressBookAsMap)

  const createSafeFormValues = createSafeForm.getState().values
  const formErrors = createSafeForm.getState().errors || {}

  const owners = createSafeFormValues[FIELD_SAFE_OWNERS_LIST]
  const ownersWithENSName = createSafeFormValues[FIELD_SAFE_OWNER_ENS_LIST]
  const hsbcOwners = createSafeFormValues[FIELD_HSBC_SAFE_OWNERS_LIST]
  const hsbcSafeOwnerENSList = createSafeFormValues[FIELD_HSBC_SAFE_OWNER_ENS_LIST]
  const threshold = createSafeFormValues[FIELD_NEW_SAFE_THRESHOLD]
  const maxOwnerNumber = createSafeFormValues[FIELD_MAX_OWNER_NUMBER]

  function onClickAddNewOwner() {
    const newEmptyOwner = {
      nameFieldName: `owner-name-${maxOwnerNumber}`,
      addressFieldName: `owner-address-${maxOwnerNumber}`,
    }
    createSafeForm.change(FIELD_SAFE_OWNERS_LIST, [...owners, newEmptyOwner])
    const updatedMaxOwnerNumbers = maxOwnerNumber + 1
    createSafeForm.change(FIELD_MAX_OWNER_NUMBER, updatedMaxOwnerNumbers)
  }

  function onClickRemoveOwner({ addressFieldName }) {
    const ownersUpdated = owners.filter((owner) => owner.addressFieldName !== addressFieldName)
    createSafeForm.change(FIELD_SAFE_OWNERS_LIST, ownersUpdated)
    createSafeForm.change(addressFieldName, undefined)

    const updatedMaxOwnerNumbers = maxOwnerNumber - 1
    createSafeForm.change(FIELD_MAX_OWNER_NUMBER, updatedMaxOwnerNumbers)

    // Updated Threshold validation to include hsbc wallets
    const hasToUpdateThreshold = threshold > ownersUpdated.length + hsbcOwners.length
    if (hasToUpdateThreshold) {
      createSafeForm.change(FIELD_NEW_SAFE_THRESHOLD, threshold - 1)
    }
  }

  const getENSName = async (address: string): Promise<void> => {
    const ensName = await reverseENSLookup(address)
    const ensDomain = removeTld(ensName)
    const newOwnersWithENSName: Record<string, string> = Object.assign(ownersWithENSName, {
      [address]: ensDomain,
    })
    createSafeForm.change(FIELD_SAFE_OWNER_ENS_LIST, newOwnersWithENSName)
  }

  return (
    <>
      <Block margin="md" padding="md">
        <RowHeader>
          {hsbcOwners.map(({ hsbcNameFieldName, hsbcAddressFieldName }) => {
            const hasOwnerAddressError = formErrors[hsbcAddressFieldName]
            const hsbcOwnerAddress = createSafeFormValues[hsbcAddressFieldName]
            const hsbcOwnerName = hsbcSafeOwnerENSList[hsbcOwnerAddress] || 'HSBC Owner'

            const handleScan = async (address: string, closeQrModal: () => void): Promise<void> => {
              await getENSName(address)
              createSafeForm.change(hsbcAddressFieldName, address)
              closeQrModal()
            }

            return (
              <Fragment key={hsbcAddressFieldName}>
                <ParagraphWithMargin color="primary" noMargin size="lg">
                  {createSafeFormValues[hsbcNameFieldName]}
                </ParagraphWithMargin>
                <Col xs={12}>
                  <AddressInput
                    fieldMutator={async (address) => {
                      createSafeForm.change(hsbcAddressFieldName, address)
                    }}
                    inputAdornment={
                      !hasOwnerAddressError && {
                        endAdornment: (
                          <InputAdornment position="end">
                            <CheckIconAddressAdornment data-testid={`${hsbcAddressFieldName}-valid-adornment`} />
                          </InputAdornment>
                        ),
                      }
                    }
                    name={hsbcAddressFieldName}
                    placeholder="Owner Address*"
                    text="Owner Address"
                    testId={hsbcAddressFieldName}
                    disabled={true}
                  />
                </Col>
              </Fragment>
            )
          })}
        </RowHeader>
      </Block>
      <Hairline />
      <RowHeader>
        <Col xs={3}>NAME</Col>
        <Col xs={7}>ADDRESS</Col>
      </RowHeader>
      <Hairline />
      <Block margin="md" padding="md">
        <RowHeader>
          {owners.map(({ nameFieldName, addressFieldName }) => {
            const hasOwnerAddressError = formErrors[addressFieldName]
            const ownerAddress = createSafeFormValues[addressFieldName]
            const showDeleteIcon = addressFieldName !== 'owner-address-0' // we hide de delete icon for the first owner
            const ownerName = ownersWithENSName[ownerAddress] || 'Owner Name'

            const handleScan = async (address: string, closeQrModal: () => void): Promise<void> => {
              await getENSName(address)
              createSafeForm.change(addressFieldName, address)
              closeQrModal()
            }

            return (
              <Fragment key={addressFieldName}>
                <Col xs={3}>
                  <OwnerNameField
                    component={TextField}
                    name={nameFieldName}
                    placeholder={ownerName}
                    text="Owner Name"
                    type="text"
                    validate={minMaxLength(0, 50)}
                    testId={nameFieldName}
                  />
                </Col>
                <Col xs={7}>
                  <AddressInput
                    fieldMutator={async (address) => {
                      await getENSName(address)
                      createSafeForm.change(addressFieldName, address)
                      const addressName = addressBook[address]?.name
                      if (addressName) {
                        createSafeForm.change(nameFieldName, addressName)
                      }
                    }}
                    inputAdornment={
                      !hasOwnerAddressError && {
                        endAdornment: (
                          <InputAdornment position="end">
                            <CheckIconAddressAdornment data-testid={`${addressFieldName}-valid-adornment`} />
                          </InputAdornment>
                        ),
                      }
                    }
                    name={addressFieldName}
                    placeholder="Owner Address*"
                    text="Owner Address"
                    testId={addressFieldName}
                  />
                </Col>
                <OwnersIconsContainer xs={1} center="xs" middle="xs">
                  <ScanQRWrapper handleScan={handleScan} testId={`${addressFieldName}-scan-QR`} />
                </OwnersIconsContainer>
                {showDeleteIcon && (
                  <OwnersIconsContainer xs={1} center="xs" middle="xs">
                    <ButtonHelper
                      onClick={() => onClickRemoveOwner({ addressFieldName })}
                      dataTestId={`${addressFieldName}-remove-button`}
                    >
                      <Icon size="sm" type="delete" color="icon" tooltip="Delete Owner" />
                    </ButtonHelper>
                  </OwnersIconsContainer>
                )}
              </Fragment>
            )
          })}
        </RowHeader>
        <OwnerContainer align="center" grow>
          <Button color="secondary" data-testid="add-new-owner" onClick={onClickAddNewOwner}>
            <Paragraph noMargin size="lg">
              + Add another owner
            </Paragraph>
          </Button>
        </OwnerContainer>
        <BlockWithPadding>
          <Block>
            <Paragraph>Any transaction requires the confirmation of:</Paragraph>
          </Block>
          <OwnerContainer align="center" grow>
            <Col xs={1}>
              <Field
                component={SelectField}
                data-testid="threshold-selector-input"
                name={FIELD_NEW_SAFE_THRESHOLD}
                validate={composeValidators(required, minValue(2))}
              >
                {[...owners, ...hsbcOwners].map((_, option) => (
                  <MenuItem
                    key={`threshold-selector-option-${option}`}
                    value={option + 1}
                    data-testid={`threshold-selector-option-${option + 1}`}
                  >
                    {option + 1}
                  </MenuItem>
                ))}
              </Field>
            </Col>
            <Col xs={11}>
              <StyledParagraph noMargin>out of {owners.length + hsbcOwners.length} owner(s)</StyledParagraph>
            </Col>
          </OwnerContainer>
        </BlockWithPadding>
      </Block>
    </>
  )
}

export default OwnersAndConfirmationsNewSafeStep

export const ownersAndConfirmationsNewSafeStepValidations = (values: {
  [FIELD_SAFE_OWNERS_LIST]: Array<Record<string, string>>
  [FIELD_NEW_SAFE_THRESHOLD]: number
}): Record<string, string> => {
  const errors = {}

  const owners = values[FIELD_SAFE_OWNERS_LIST]
  const hsbcOwners = values[FIELD_HSBC_SAFE_OWNERS_LIST]
  const threshold = values[FIELD_NEW_SAFE_THRESHOLD]
  const addresses = owners.map(({ addressFieldName }) => values[addressFieldName])

  // we check repeated addresses
  owners.forEach(({ addressFieldName }, index) => {
    const address = values[addressFieldName]
    const previousOwners = addresses.slice(0, index)
    const isRepeated = previousOwners.includes(address)
    if (isRepeated) {
      errors[addressFieldName] = ADDRESS_REPEATED_ERROR
    }
  })

  const isValidThreshold = !!threshold && threshold <= owners.length + hsbcOwners.length
  if (!isValidThreshold) {
    errors[FIELD_NEW_SAFE_THRESHOLD] = THRESHOLD_ERROR
  }

  return errors
}

const BlockWithPadding = styled(Block)`
  padding: ${lg};
`

const ParagraphWithMargin = styled(Paragraph)`
  margin-bottom: 12px;
`

const StyledLink = styled(Link)`
  padding: 0 ${xs};
  & svg {
    position: relative;
    top: 1px;
    left: ${xs};
    height: 14px;
    width: 14px;
  }
`
const RowHeader = styled(Row)`
  padding: ${sm} ${lg};
  font-size: ${extraSmallFontSize};
  color: ${disabled};
`

const OwnerNameField = styled(Field)`
  margin-right: ${sm};
  margin-bottom: ${sm};
`
const CheckIconAddressAdornment = styled(CheckCircle)`
  color: #03ae60;
  height: 20px;
`

const OwnersIconsContainer = styled(Col)`
  height: 56px;
  max-width: 32px;
  cursor: pointer;
`

const OwnerContainer = styled(Row)`
  justify-content: center;
`

const StyledParagraph = styled(Paragraph)`
  padding-left: 12px;
`
