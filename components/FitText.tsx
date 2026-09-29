import { type ReactNode } from "react";

/** Let headings wrap at a readable size instead of shrinking to one line. */
export default function FitText({ children }: { children: ReactNode }) {
  return <span className="fit-text">{children}</span>;
}
