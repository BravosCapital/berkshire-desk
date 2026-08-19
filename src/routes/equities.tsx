import { createFileRoute } from "@tanstack/react-router";
import { EquitiesPage } from "@/components/equities-page";

export const Route = createFileRoute("/equities")({ component: EquitiesPage });
