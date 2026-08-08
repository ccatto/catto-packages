# @ccatto/react-comments

React **comment thread** + **moderation UI** for user-generated content — with a
client-side profanity pre-check, report/flag, and threaded replies. Pairs with
the backend `@ccatto/nest-comments`. **Transport-agnostic**: you inject async
data callbacks (wire them to Apollo/fetch/tRPC), so this package ships no data
client and no secrets — mirroring `@ccatto/react-contact`.

- **`<CommentThreadCatto>`** — approved comments + a submit form; optimistic
  "pending review" pill when `moderationMode='pre'`; sign-in / empty states;
  report + block affordances.
- **`<CommentModerationTableCatto>`** / **`useCommentModeration`** — admin queue
  with inline approve / hide / remove.

## Install

```bash
yarn add @ccatto/react-comments
```

Peer: `react` (>=18). No runtime deps. (Pass `isProfane` from `@ccatto/profanity`
as the `profanityCheck` prop if you want the instant client-side check.)

## Comment thread

```tsx
'use client';
import { CommentThreadCatto } from '@ccatto/react-comments';
import { useQuery, useMutation } from '@apollo/client';
import { isProfane } from '@ccatto/profanity';
import { useAuth } from '@lib/hooks/useAuth';
import {
  COMMENTS_BY_ENTITY,
  CREATE_COMMENT,
  REPORT_COMMENT,
} from '@lib/graphql/comments';

export function ArticleComments({ slug }: { slug: string }) {
  const { user } = useAuth();
  const client = useApolloClient();
  const [createComment] = useMutation(CREATE_COMMENT);
  const [reportComment] = useMutation(REPORT_COMMENT);

  return (
    <CommentThreadCatto
      entityType="pickle_talk_page"
      entityKey={slug}
      currentUser={user ? { id: user.id, name: user.name, role: user.role } : null}
      moderationMode="pre"
      profanityCheck={isProfane}
      fetchComments={async (vars) => {
        const { data } = await client.query({
          query: COMMENTS_BY_ENTITY,
          variables: vars,
          fetchPolicy: 'network-only',
        });
        return data.commentsByEntity; // { total, items }
      }}
      createComment={async (input) => {
        const { data } = await createComment({ variables: { input } });
        return data.createComment; // a CommentDTO (incl. status)
      }}
      reportComment={async (id) => {
        await reportComment({ variables: { id } });
      }}
      onBlockUser={(authorId) => blockUser(authorId)} // your app's block system
    />
  );
}
```

The callback return shapes match `@ccatto/nest-comments` (`CommentPage` =
`{ total, items }`; `createComment` returns a `CommentDTO` including its
`status`). When the created comment's status isn't `APPROVED`, the thread shows
it to the author with a **"Pending review"** pill.

## Moderation surface (admins)

```tsx
'use client';
import { CommentModerationTableCatto } from '@ccatto/react-comments';

<CommentModerationTableCatto
  fetchPending={async (vars) => (await client.query({
    query: COMMENTS_FOR_MODERATION, variables: vars, fetchPolicy: 'network-only',
  })).data.commentsForModeration}
  moderate={async (id, status) => {
    await moderateComment({ variables: { id, status } });
  }}
/>;
```

Or build your own UI with the `useCommentModeration` hook (same
fetch/approve/hide/remove logic, headless).

## i18n

Every string is overridable via the `labels` prop (a `Partial<CommentThreadLabels>`
/ `Partial<CommentModerationLabels>` object). Defaults are exported as
`DEFAULT_THREAD_LABELS` / `DEFAULT_MODERATION_LABELS`.

## App Store / Play safety ⚠️

Profanity is enforced **server-side** by `@ccatto/nest-comments` — the client
`profanityCheck` is convenience only. Ship UGC only with moderation enabled
(`moderationMode: 'pre'`, or actively moderate `'post'`), a working report button
(provided here), a moderation surface (provided here), and a **block-user** action
wired to your app (via `onBlockUser`). See the `@ccatto/nest-comments` README for
the full policy checklist.

## License

MIT
