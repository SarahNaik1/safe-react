import React from 'react'
import { Button, Card, Title, Text } from '@gnosis.pm/safe-react-components'
import styled from 'styled-components'

import Page from 'src/components/layout/Page'
import Block from 'src/components/layout/Block'
import Link from 'src/components/layout/Link'
import { CREATE_CUSTOMER_SAFE_PAGE } from 'src/routes/routes'
const CustomerFlow = () => {
  return (
    <Page>
      <Block>
        <CardsContainer>
          <StyledCard>
            {/* Create Safe */}
            <CardContentContainer>
              <Title size="sm" strong withoutMargin>
                HSBC Digital Assets Safe
              </Title>
              <CardDescriptionContainer>
                <Text size="xl">Create a new Gnosis Safe with HSBC .</Text>
                <Text size="xl">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque semper luctus sem et mollis.
                  Nullam at mollis est. Duis pellentesque feugiat pellentesque. Donec enim ipsum, commodo tristique
                  dapibus ut, lobortis eu felis. Nunc eu orci vel ipsum convallis aliquam. Vivamus non nulla lorem.
                  Nulla et lorem at quam gravida dictum. Donec tristique ac turpis fermentum mollis..
                </Text>
              </CardDescriptionContainer>
              <StyledButton
                size="lg"
                color="primary"
                variant="contained"
                component={Link}
                to={CREATE_CUSTOMER_SAFE_PAGE}
              >
                <Text size="xl" color="white">
                  Create Gnosis Safe with HSBC
                </Text>
              </StyledButton>
            </CardContentContainer>
          </StyledCard>
        </CardsContainer>
      </Block>
    </Page>
  )
}

export default CustomerFlow
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
`

const CardDescriptionContainer = styled.div`
  margin-top: 16px;
  margin-bottom: auto;
`
