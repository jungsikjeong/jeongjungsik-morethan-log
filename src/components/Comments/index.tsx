import * as React from "react"

import axios from "axios"
import cs from "classnames"
import { formatDistance } from "date-fns"
import ko from "date-fns/locale/ko"
import { useFormik } from "formik"

import styled from "@emotion/styled"
import { useMutation, useQuery } from "@tanstack/react-query"
import { ExtendedRecordMap } from "notion-types"
import useScheme from "src/hooks/useScheme"
import { queryClient } from "src/libs/react-query"

const Container = styled.div<{ scheme: string }>`
  margin-top: 3rem;
  width: 100%;

  @media (min-width: 1400px) {
    width: calc(100% - 300px - 5rem);
    width: 100%;
  }
  .title {
    margin-bottom: 2rem;
    text-align: center;
    &::after {
      content: "";
      display: block;
      height: 2px;
      width: 4rem;
      background-color: ${({ theme }) =>
        theme.scheme === "light" ? "#2f3437" : "#fff"};
      margin-top: 0.5rem;
      border-radius: 5px;
    }
  }

  .item {
    width: 100%;
    display: flex;
    align-items: flex-end;

    + .item {
      margin-top: 1.5rem;
    }

    &.reverse {
      align-self: flex-end;
      flex-direction: row-reverse;

      .profileImage {
        margin-right: 0;
        margin-left: 1rem;
        border-radius: 50%;
      }

      .right {
        .content {
          align-self: flex-end;

          &::after {
            left: auto;
            right: -35px;
          }

          &::before {
            left: auto;
            right: -20px;
          }

          .texts {
            text-align: right;
          }
        }

        .profile {
          margin-left: 0;
          margin-right: 1.5rem;
          text-align: right;
          justify-content: flex-end;
        }
      }
    }

    .guest {
      filter: ${({ scheme }) => (scheme === "light" ? "invert(0.6)" : "")};
    }

    .profileImage {
      width: 40px;
      height: 40px;
      display: block;
      object-fit: contain;
      object-position: center;
      margin-right: 1rem;
      position: relative;
      z-index: 1;
      transition: 250ms filter;
    }

    .right {
      display: flex;
      flex-direction: column;
      width: 100%;

      .content {
        font-size: 0.95rem;
        line-height: 1.25;
        padding: 1rem 1.5rem;
        position: relative;
        display: inline-block;
        align-self: start;
        max-width: 80%;

        .texts {
          position: relative;
          z-index: 2;
          word-break: break-all;
        }

        .bg {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          background-color: ${({ theme }) => theme.colors.gray3};
          border-radius: 25px;
          z-index: 1;
          transition: 250ms background-color;
        }

        &::after {
          content: "";
          position: absolute;
          display: block;
          height: 40px;
          width: 40px;
          border-radius: 50%;
          z-index: 0;
          background-color: ${({ theme }) =>
            theme.scheme === "light" ? "white" : theme.colors.gray4};
          bottom: 4px;
          left: -35px;
          border-top-right-radius: 0;
          border-top-left-radius: 0;
        }

        &::before {
          content: "";
          position: absolute;
          display: block;
          height: 40px;
          width: 40px;
          border-radius: 50%;
          z-index: 0;
          background-color: ${({ theme }) => theme.colors.gray3};
          bottom: 1px;
          left: -20px;
          transition: 250ms background-color;
        }
      }

      .profile {
        margin-top: 0.5rem;
        margin-left: 1.5rem;
        display: flex;
        font-size: 0.85rem;
        line-height: 1;
        align-items: center;

        .name {
          svg {
            margin-right: 0.3rem;
            fill: #9ccc65;
            height: 0.9rem;
            transform: translateY(-1px);
          }
        }

        & > div:not(:last-child) {
          display: flex;
          align-items: center;

          &::after {
            content: "";
            display: block;
            width: 1px;
            height: 8px;
            background-color: ${({ theme }) => theme.colors.gray12};
            margin: 0 0.5rem;
            opacity: 0.5;
          }
        }
      }
    }
  }

  form {
    width: 100%;
    margin-bottom: 3rem;

    &.loading {
      textarea,
      button {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .right {
      width: 100%;
    }

    .content {
      margin-bottom: 1.5rem;
      width: 100%;
      display: flex !important;
      flex-direction: column;
      align-items: flex-end;

      textarea {
        width: 100%;
        position: relative;
        z-index: 2;
        background-color: transparent;
        border: none;
        outline: none;
        resize: none;

        transition: 250ms opacity;
      }

      button {
        position: relative;
        z-index: 2;
        outline: none;
        border: none;
        border-radius: 50%;
        width: 36px;
        height: 36px;
        background-color: ${({ theme }) =>
          theme.scheme === "light" ? "#2f3437" : "#fff"};
        display: flex;
        align-items: center;
        justify-content: center;
        transition: 250ms box-shadow, 250ms opacity;

        &:hover {
          box-shadow: 0 0 5px var(--fg-color);
        }

        svg {
          fill: ${({ theme }) =>
            theme.scheme === "light" ? "#fff" : "#2f3437"};
          width: 20px;
        }
      }
    }
  }
`

interface CommentsProps {
  author:
    | { id: string; name: string; profile_photo?: string | undefined }[]
    | undefined
  pageId: string | undefined
  recordMap: ExtendedRecordMap
}

const Comments = ({ author, pageId, recordMap }: CommentsProps) => {
  const [scheme] = useScheme()

  // useQuery 훅을 사용하여 데이터 가져오기
  const { data, isLoading, isError } = useQuery(
    ["comments", pageId],
    () => axios.get(`/api/comments/${pageId}`).then((res) => res.data),
    {
      refetchOnWindowFocus: false,
    }
  )

  const mutation = useMutation({
    mutationFn: ({ content }: { content: string }) =>
      axios.post(`/api/comments/${pageId}`, { content }),
    onSuccess: () => {
      formik.resetForm()
      queryClient.invalidateQueries({ queryKey: ["comments", pageId] })
    },
  })

  const addCommentMutation = useMutation(
    (values) => axios.post(`/api/comments/${pageId}`, values),
    {
      onSuccess: () => {
        formik.resetForm()
      },
    }
  )

  const formik = useFormik({
    initialValues: {
      content: "",
    },
    onSubmit: async (values) => {
      if (values.content.trim()) {
        const content = values.content.trim()
        mutation.mutate({ content })
      }
    },
  })

  const comments = (data?.results || []).map((item: any) => {
    const user =
      author && author[0]?.id === item.created_by.id
        ? author[0]
        : {
            id: "guest",
            name: "익명",
            profile_photo: "/comment.png",
          }

    return {
      id: item.id,
      user: user,
      text: item?.rich_text?.[0]?.plain_text || "내용을 불러올 수 없습니다.",
      isOwner: user?.id !== "guest",
      createdAt: formatDistance(new Date(), new Date(item.created_time), {
        locale: ko as any,
      }),
    }
  })

  return (
    <Container className="notion-comments" scheme={scheme}>
      <h2 className="notion-h notion-h1 title">댓글</h2>

      <form
        className={cs("item", isLoading && "loading")}
        onSubmit={formik.handleSubmit}
      >
        <img className="profileImage guest" src="/comment.png" alt="guest" />

        <div className="right">
          <div className="content">
            <div className="bg" />
            <textarea
              name="content"
              placeholder={`안녕하세요 👋\n이곳에 댓글 내용을 작성해주세요.`}
              rows={6}
              value={formik.values.content}
              onChange={formik.handleChange}
            />

            <button type="submit">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path d="M16 2H8C4.691 2 2 4.691 2 8v12a1 1 0 0 0 1 1h13c3.309 0 6-2.691 6-6V8c0-3.309-2.691-6-6-6zm4 13c0 2.206-1.794 4-4 4H4V8c0-2.206 1.794-4 4-4h8c2.206 0 4 1.794 4 4v7z"></path>
                <circle cx="9.5" cy="11.5" r="1.5"></circle>
                <circle cx="14.5" cy="11.5" r="1.5"></circle>
              </svg>
            </button>
          </div>
        </div>
      </form>

      <div className="items">
        {comments.map((item: any) => (
          <div key={item.id} className={cs("item", item.isOwner && "reverse")}>
            <img
              className={cs(
                "profileImage",
                item.user.id === "guest" && "guest"
              )}
              src={item.user.profile_photo}
              alt={item.user.name}
            />

            <div className="right">
              <div className="content">
                <div className="bg" />
                <div className="texts">
                  {item.text.split("\n").map((text: any, i: any) => (
                    <React.Fragment key={i}>
                      {text}

                      <br />
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <div className="profile">
                <div className="name">
                  {item.isOwner && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path d="M20.995 6.9a.998.998 0 0 0-.548-.795l-8-4a1 1 0 0 0-.895 0l-8 4a1.002 1.002 0 0 0-.547.795c-.011.107-.961 10.767 8.589 15.014a.987.987 0 0 0 .812 0c9.55-4.247 8.6-14.906 8.589-15.014zM12 19.897C5.231 16.625 4.911 9.642 4.966 7.635L12 4.118l7.029 3.515c.037 1.989-.328 9.018-7.029 12.264z"></path>
                      <path d="m11 12.586-2.293-2.293-1.414 1.414L11 15.414l5.707-5.707-1.414-1.414z"></path>
                    </svg>
                  )}

                  {item.user.name}
                </div>

                <div className="createdAt">{item.createdAt}전</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Container>
  )
}

export default Comments
