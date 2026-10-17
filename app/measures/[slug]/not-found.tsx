import { NotFoundPanel } from "@/components/not-found-panel";

export default function NotFound() {
  return (
    <NotFoundPanel
      title="We don’t have that race or measure"
      body="It may not be on the November 3 ballot, or the link is out of date."
    />
  );
}
