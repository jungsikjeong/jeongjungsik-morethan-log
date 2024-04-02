import styled from "@emotion/styled"
import React from "react"
import usePostQuery from "src/hooks/usePostQuery"
import NotionRenderer from "../components/NotionRenderer"
type Props = {}

const PageDetail: React.FC<Props> = () => {
  const data = usePostQuery()

  if (!data) return null
  return (
    <StyledWrapper>
      <NotionRenderer pageId={data.id} recordMap={data.recordMap} />
    </StyledWrapper>
  )
}

export default PageDetail

const StyledWrapper = styled.div`
  margin: 0 auto;
  max-width: 56rem;
`
