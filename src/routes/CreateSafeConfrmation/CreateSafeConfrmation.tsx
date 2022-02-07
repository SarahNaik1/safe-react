import React from 'react'
import { Button, Card, Title, Text } from '@gnosis.pm/safe-react-components'
import styled from 'styled-components'

import Page from 'src/components/layout/Page'
import Block from 'src/components/layout/Block'
import Link from 'src/components/layout/Link'
import { ROOT_ROUTE } from 'src/routes/routes'
const CreateSafeConfrmation = () => {
  return (
    <Page>
      <Block>
        <CardsContainer>
          <StyledCard>
            {/* Create Safe */}
            <CardContentContainer>
              <Title size="sm" strong withoutMargin>
                We will create your safe
              </Title>
              <CardDescriptionContainer>
                <Text size="xl">We will notify you when the safe has been created.</Text>
                <Text size="xl">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque semper luctus sem et mollis.
                  Nullam at mollis est. Duis pellentesque feugiat pellentesque. Donec enim ipsum, commodo tristique
                </Text>
              </CardDescriptionContainer>
              <StyledButton size="lg" color="primary" variant="contained" component={Link} to={ROOT_ROUTE}>
                <Text size="xl">Back to my accounts</Text>
              </StyledButton>
            </CardContentContainer>
          </StyledCard>
        </CardsContainer>
      </Block>
    </Page>
  )
}

export default CreateSafeConfrmation
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
  background-color: white !important;
  border-radius: 0px !important;
  border: 1px solid black;
`

const CardDescriptionContainer = styled.div`
  margin-top: 16px;
  margin-bottom: auto;
`
