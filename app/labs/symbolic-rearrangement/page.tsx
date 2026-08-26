import type { Metadata } from "next";
import { SymbolicLab } from "../../../labs/symbolic-rearrangement/SymbolicLab";

export const metadata: Metadata = {
  title: "Symbolic Rearrangement Interaction Lab",
  description: "An internal LLM Zero prototype testing whether the learning format can carry symbolic manipulation rather than evaluation.",
};

export default function SymbolicRearrangementLabPage() {
  return <SymbolicLab />;
}
