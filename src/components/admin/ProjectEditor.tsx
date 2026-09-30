"use client";

import { startTransition, useActionState } from "react";
import { deleteProject, saveProject, type SaveProjectState } from "@/app/admin/(app)/work/actions";
import { TextArea, TextField } from "@/components/forms/fields";
import { buttonClass } from "@/components/ui/Button";
import { emptyProjectFields, projectTextFields } from "@/lib/admin/project-form";
import type { ProjectRow } from "@/lib/work";

const card = "flex flex-col gap-5 rounded-md border border-border bg-surface-raised p-5 lg:p-6";
const cardTitle = "font-display text-h3 text-heading";

export function ProjectEditor({
  project,
  saved,
  images,
}: {
  project: ProjectRow | null;
  saved: boolean;
  /** Logo and screenshots, once the project exists. */
  images?: React.ReactNode;
}) {
  const [state, action, pending] = useActionState<SaveProjectState, FormData>(saveProject.bind(null, project?.id ?? null), {
    errors: {},
    message: null,
  });
  const e = state.errors;
  const empty = project ? emptyProjectFields(project) : [];

  return (
    <form method="post"
      // Submitted by hand so a refused save keeps everything typed.
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        startTransition(() => action(data));
      }}
      noValidate
      className="flex flex-col gap-6"
    >
      {saved && !state.message && (
        <p role="status" className="rounded-sm bg-secondary-subtle px-4 py-3 text-body-sm text-secondary">
          Saved. The site shows the change now.
        </p>
      )}
      {state.message && (
        <p role="alert" className="rounded-sm bg-danger-subtle px-4 py-3 text-body-sm text-danger">
          {state.message}
        </p>
      )}
      {project?.published && empty.length > 0 && (
        <p className="rounded-sm bg-warning-subtle px-4 py-3 text-body-sm text-warning">
          Still empty, so the site shows a [bracketed] placeholder: {empty.join(", ")}.
        </p>
      )}

      <div className="grid items-start gap-6 xl:grid-cols-2">
        <div className="flex flex-col gap-6">
          <section aria-labelledby="project-title" className={card}>
            <h2 id="project-title" className={cardTitle}>
              Project
            </h2>
            <TextField id="name" label="Name" defaultValue={project?.name} error={e.name} placeholder="TrustCircle" required />
            {project ? (
              <p className="text-body-sm text-ink-secondary">
                Case study: <span className="font-mono text-ink">sherohq.com/work/{project.slug}</span> (fixed, so shared links keep working)
              </p>
            ) : (
              <TextField
                id="slug"
                label="Case study address"
                error={e.slug}
                placeholder="made from the name if left empty"
                hint="sherohq.com/work/… It can't change later."
              />
            )}
            <TextField
              id="url"
              label="Live link (optional)"
              type="url"
              defaultValue={project?.url ?? ""}
              error={e.url}
              placeholder="https://trustcircle.app"
              hint="Adds a Visit link. Only with the client's agreement."
            />
            <div className="grid items-end gap-5 sm:grid-cols-2">
              <TextField
                id="displayOrder"
                label="Order"
                inputMode="numeric"
                defaultValue={String(project?.displayOrder ?? 0)}
                error={e.displayOrder}
                hint="Lower numbers come first."
              />
              <label className="flex h-10 items-center gap-2.5 text-body-sm text-ink">
                <input type="checkbox" name="published" defaultChecked={project?.published ?? false} className="size-4 accent-primary" />
                Show on the site (client agreed)
              </label>
            </div>
          </section>
          {images ?? (
            <p className="rounded-sm border border-dashed border-border-strong px-4 py-3 text-body-sm text-ink-secondary">
              Save the project first, then add its logo and screenshots.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <section aria-labelledby="story-title" className={card}>
            <h2 id="story-title" className={cardTitle}>
              Case study
            </h2>
            <p className="-mt-2 text-body-sm text-ink-secondary">Leave a field empty rather than guess; the site marks it as missing.</p>
            {projectTextFields.map((field) =>
              "long" in field && field.long ? (
                <TextArea
                  key={field.key}
                  id={field.key}
                  label={field.label}
                  defaultValue={project?.[field.key] ?? ""}
                  error={e[field.key]}
                  hint={"hint" in field ? field.hint : undefined}
                />
              ) : (
                <TextField
                  key={field.key}
                  id={field.key}
                  label={field.label}
                  defaultValue={project?.[field.key] ?? ""}
                  error={e[field.key]}
                  placeholder={"placeholder" in field ? field.placeholder : undefined}
                  hint={"hint" in field ? field.hint : undefined}
                />
              ),
            )}
          </section>

          <section aria-label="Save" className={card}>
            <div className="flex flex-wrap items-center gap-3">
              <button type="submit" disabled={pending} className={buttonClass({ size: "lg" })}>
                {pending ? "Saving…" : project ? "Save" : "Create project"}
              </button>
              {project && (
                <button
                  type="button"
                  className={buttonClass({ variant: "danger", size: "lg" })}
                  onClick={async () => {
                    if (confirm(`Delete ${project.name}, with its logo and screenshots? This can't be undone.`)) await deleteProject(project.id);
                  }}
                >
                  Delete
                </button>
              )}
            </div>
          </section>
        </div>
      </div>
    </form>
  );
}
