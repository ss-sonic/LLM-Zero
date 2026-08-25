import type { Metadata } from "next";
import { GradientDescentLab } from "../../../labs/gradient-descent/GradientDescentLab";

export const metadata: Metadata = {
  title: "Gradient Descent Interaction Lab",
  description: "An internal LLM Zero prototype for continuous, numeric, and symbolic learning interactions.",
};

export default function GradientDescentLabPage() {
  return <GradientDescentLab />;
}
