import React, { useState } from 'react';
import { Button, Card, Text ,TextField} from '@gnosis.pm/safe-react-components'
import styled from 'styled-components'
import Page from 'src/components/layout/Page'
import Block from 'src/components/layout/Block'
import Link from 'src/components/layout/Link'
import LinkWithRef from 'src/components/layout/Link'
import { CREATE_CUSTOMER_CONFIRMATION } from 'src/routes/routes'
const CreateCustomerSafe=()=>{
    const[safeName,setSafeName]=useState('');
    const[walletAddress,setWalletAddress]=useState('');
    const[showAnotherWallet,setShowAnotherWallet]=useState(false);
    const[walletAddress1,setWalletAddress1]=useState('');
    const getAnotherWalletAddress=()=>{
        console.log("GET ANOTHER");
        if(showAnotherWallet)
        {
            //setShowAnotherWallet(false);
            return <div>
            <TextField
            id="wallet-address1"
            label="Enter your wallet address"
            value={walletAddress1}
            onChange={(e) => setWalletAddress1(e.target.value)}
          />
            </div>
        }
    }
    return(
        <Page>
        <Block>
          <CardsContainer>
            <StyledCard>
              {/* Create Safe */}
              <CardContentContainer>
                  <CardDescriptionContainer>
     <div>
         <label>Safe name</label>
         <div>
         <StyledTextField
        id="safe-name"
        label="Enter your safe name"
        value={safeName}
        onChange={(e) => setSafeName(e.target.value)}
      />
        </div>

        <label>Your wallet address</label>
         <div>
         <StyledTextField
        id="wallet-address"
        label="Enter your wallet address"
        value={walletAddress}
        onChange={(e) => setWalletAddress(e.target.value)}
      /> 
        </div>
        {showAnotherWallet && getAnotherWalletAddress()}
        <div>
        <StyledLink
                  aria-label="Hide details of the transaction"
                  onClick={() => setShowAnotherWallet(true)}
                  rel="noopener noreferrer"
                  target="_blank"
                >+ Add another wallet address</StyledLink>
        </div>
  

     </div>
     </CardDescriptionContainer>
              <StyledButton
                size="lg"
                color="primary"
                variant="contained"
                component={Link}
                to={CREATE_CUSTOMER_CONFIRMATION}
              >
                <Text size="xl" color="white">
                  Create Safe
                </Text>
              </StyledButton>
            </CardContentContainer>
          </StyledCard>
        </CardsContainer>
      </Block>
    </Page>
    )
}

export default CreateCustomerSafe;

const CardsContainer = styled.div`
  display: flex;
  height: 300px;
  max-width: 850px;
`

const StyledCard = styled(Card)`
  display: flex;
  flex: 0 1 100%;
  padding: 0;
`

const CardContentContainer = styled.div`
  flex: 1 1 50%;
  display: flex;
  flex-direction: column;
  padding: 24px;
  align-items: flex-start;
`

const StyledButton = styled(Button)`
  background-color: #ca0808 !important;
  border-radius: 0px !important;
  min-width:20px;
  margin-top:30px;
`

const CardDescriptionContainer = styled.div`
  margin-top: 16px;
  margin-bottom: auto;
`
const StyledLink=styled(LinkWithRef)`
  color:black !important;
`
const StyledTextField=styled(TextField)`
paddingTop: lg,
paddingBottom: '12px',
lineHeight: 0,
margin-top:10px,
margin-bottom:10px
`
