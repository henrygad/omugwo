import { ZodError } from "zod";

export function apiError(error: unknown) {
  if (error instanceof ZodError) {
    return Response.json(
      { error: "Please check the submitted details.", issues: error.flatten() },
      { status: 400 },
    );
  }

  if (error instanceof Error && error.message === "Unauthorized") {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (
    error instanceof Error &&
    (error.message.includes("configuration is incomplete") ||
      error.message.includes("is not configured"))
  ) {
    return Response.json({ error: error.message }, { status: 503 });
  }

  console.error(error);
  return Response.json(
    { error: "The request could not be completed. Please try again." },
    { status: 500 },
  );
}
