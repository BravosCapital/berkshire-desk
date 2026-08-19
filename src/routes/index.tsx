import { createFileRoute } from "@tanstack/react-router";
import { TrackerPage } from "@/components/tracker-page";

export const Route = createFileRoute("/")({ component: TrackerPage });
