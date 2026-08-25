import type { ReactNode } from "react";

export function LessonStage({
  currentStep,
  dark = false,
  children,
}: {
  currentStep: number;
  dark?: boolean;
  children: ReactNode;
}) {
  return (
    <section className={`lesson-stage${dark ? " dark-stage" : ""}`}>
      <div className="stage-inner" key={currentStep}>
        {children}
      </div>
    </section>
  );
}
