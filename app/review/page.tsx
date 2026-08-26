import type { Metadata } from "next";
import { ReviewSession } from "../../components/review/ReviewSession";

export const metadata: Metadata = {
  title: "Spaced review",
  description: "Bring back ideas from lessons you have already finished — a day later, then further apart.",
};

export default function ReviewPage() {
  return <ReviewSession />;
}
