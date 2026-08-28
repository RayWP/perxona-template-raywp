import type { PresenterElement } from "@/lib/perxona/presenter.types";

declare global {
  namespace JSX { interface IntrinsicElements { "sv-presenter": React.DetailedHTMLProps<React.HTMLAttributes<PresenterElement>, PresenterElement>; } }
  namespace React { namespace JSX { interface IntrinsicElements { "sv-presenter": React.DetailedHTMLProps<React.HTMLAttributes<PresenterElement>, PresenterElement>; } } }
}

export {};
