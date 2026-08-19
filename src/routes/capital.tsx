import { createFileRoute } from "@tanstack/react-router";
import { CapitalPage } from "@/components/capital-page";

export const Route = createFileRoute("/capital")({ component: CapitalPage });
