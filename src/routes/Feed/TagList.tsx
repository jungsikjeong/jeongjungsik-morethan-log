import styled from "@emotion/styled"
import { useRouter } from "next/router"
import React, { useEffect, useState } from "react"
import { Emoji } from "src/components/Emoji"
import { useTagsQuery } from "src/hooks/useTagsQuery"

type Props = {}

const TagList: React.FC<Props> = () => {
  const router = useRouter()
  const currentTag = router.query.tag || undefined
  const data = useTagsQuery()
  const [tags, setTags] = useState(new Map<String, String[]>())

  const handleClickTag = (value: any) => {
    // delete
    if (currentTag === value) {
      router.push({
        query: {
          ...router.query,
          tag: undefined,
        },
      })
    }
    // add
    else {
      router.push({
        query: {
          ...router.query,
          tag: value,
        },
      })
    }
  }

  const tagContents = () => {
    let mainTagIndex = 0
    return (
      <>
        {Array.from(tags).map(([key, value]) => {
          mainTagIndex++
          return (
            <li key={String(key)} className="mainTags">
              <div>{key}</div>
              {value.map((subTag, index) => {
                const originTag: String =
                  mainTagIndex + "::" + key + "::" + subTag
                return (
                  <a
                    key={index}
                    data-active={originTag === currentTag}
                    onClick={() => handleClickTag(originTag)}
                  >
                    - {subTag}
                  </a>
                )
              })}
            </li>
          )
        })}
      </>
    )
  }

  useEffect(() => {
    const tempMainTags = new Map<String, String[]>()
    Object.keys(data)
      .sort() //순서대로 정렬
      .map((value) => {
        const splitted: String[] = value.split("::") //[0,SW공부,CS], [0, SW공부, JavaScript], ...
        if (splitted[2] === undefined || splitted[2].length <= 1) return
        const currentSubTagsArray: String[] =
          tempMainTags.get(splitted[1]) || []
        currentSubTagsArray.push(splitted[2])
        tempMainTags.set(splitted[1], currentSubTagsArray)
      })
    setTags(tempMainTags)
  }, [])

  return (
    <StyledWrapper>
      <div className="top">
        <Emoji>🏷️</Emoji> 태그
      </div>
      <div className="list">{tagContents()}</div>
    </StyledWrapper>
  )
}

export default TagList

const StyledWrapper = styled.div`
  .top {
    display: none;
    padding: 0.25rem;
    margin-bottom: 0.75rem;

    @media (min-width: 1024px) {
      display: block;
    }
  }

  .list {
    display: flex;
    margin-bottom: 1rem;
    overflow: scroll;
    scrollbar-width: none;
    gap: 1.5rem;
    -ms-overflow-style: none;
    ::-webkit-scrollbar {
      width: 0;
      height: 0;
    }

    @media (min-width: 1024px) {
      display: block;
    }

    .mainTags {
      @media (min-width: 1024px) {
        display: block;
      }
      @media (max-width: 1023px) {
        div {
          display: flex;
          justify-content: center;
          align-items: center;
        }
      }
      display: flex;
      gap: 0.25rem;
      margin-bottom: 1rem;
      flex-shrink: 0;
      div {
        padding: 0.5rem;
        padding-left: 0.3rem;
        padding-right: 0.3rem;
        margin-top: 0.3rem;
        margin-bottom: 0.3rem;
        border-radius: 0.5rem;
        font-size: 0.975rem;
        line-height: 1rem;
        font-weight: 600;
        color: ${({ theme }) => theme.colors.gray11};
        flex-shrink: 0;
        cursor: default;
      }

      a {
        display: flex;
        align-items: center;
        padding: 0.25rem;
        padding-left: 1rem;
        padding-right: 1rem;
        margin-top: 0.25rem;
        margin-bottom: 0.25rem;
        border-radius: 0.75rem;
        font-size: 0.875rem;
        line-height: 1.25rem;
        color: ${({ theme }) => theme.colors.gray10};
        flex-shrink: 0;
        cursor: pointer;

        :hover {
          background-color: ${({ theme }) => theme.colors.gray4};
        }
        &[data-active="true"] {
          color: ${({ theme }) => theme.colors.gray12};
          background-color: ${({ theme }) => theme.colors.gray4};

          :hover {
            background-color: ${({ theme }) => theme.colors.gray4};
          }
        }
      }
    }
  }
`
