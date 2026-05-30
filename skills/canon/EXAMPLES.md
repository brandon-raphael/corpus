# Canon Examples

## Fallbacks

Bad:

```ts
const title = input.title ?? "";
const items = response.items ?? [];
```

Canon:

```ts
const parseCreateRequest = (input: unknown): CreateRequest => {
  const parsed = createRequestSchema.safeParse(input);

  if (!parsed.success) {
    throw new UserFacingError("The request is missing a valid title.", {
      cause: parsed.error,
      action: "Enter a title and try again.",
    });
  }

  return parsed.data;
};
```

Use defaults only when absence is valid product behavior, not to hide broken inputs.

## Exhaustive state

Bad:

```ts
if (session.isLoading) return "Loading";
if (session.error) return "Failed";
return session.data?.name ?? "Unknown";
```

Canon:

```ts
type SessionState =
  | { status: "loading" }
  | { status: "failed"; message: string }
  | { status: "loaded"; session: Session };

const getSessionLabel = (state: SessionState): string => {
  switch (state.status) {
    case "loading":
      return "Loading";
    case "failed":
      return state.message;
    case "loaded":
      return state.session.name;
    default:
      return assertNever(state);
  }
};
```

Prefer a model where invalid combinations cannot be expressed.

## Big-bang contract cleanup

Bad:

```ts
const getProjectName = (project: OldProject | NewProject): string => {
  if ("displayName" in project) return project.displayName;
  return project.name ?? "Untitled project";
};
```

Canon:

```ts
type Project = {
  id: ProjectId;
  name: NonEmptyString;
};

const getProjectName = (project: Project): string => project.name;
```

Then refactor callers to produce the canonical `Project` shape. Do not keep old shapes alive unless compatibility is an explicit requirement.

## Logging and errors

Bad:

```ts
try {
  await importProject(path);
} catch {
  throw new Error("Failed");
}
```

Canon:

```ts
logger.info("Importing project", { path });

try {
  const project = await importProject(path);
  logger.info("Project imported", { projectId: project.id, path });
  return project;
} catch (cause) {
  logger.error("Project import failed", { path, cause });
  throw new UserFacingError("Kira could not import this project.", {
    cause,
    action: "Check that the folder exists and that Kira has permission to read it.",
  });
}
```

Match the project logger and error conventions first. If none exist, pause and offer to set them up.

## Extraction threshold

Bad third copy:

```ts
const label = value.trim().toLowerCase().replaceAll(" ", "-");
```

Canon:

```ts
const toSlug = (value: string): Slug => slugSchema.parse(value);
```

Extract on the third real use of the same concept. Keep it feature-local unless multiple features need it.
