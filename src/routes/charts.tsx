import { createFileRoute } from "@tanstack/react-router";
import { ChartsPage } from "@/components/charts-page";

export const Route = createFileRoute("/charts")({ component: ChartsPage });
