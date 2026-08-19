import { createFileRoute } from "@tanstack/react-router";
import { BusinessesPage } from "@/components/businesses-page";

export const Route = createFileRoute("/businesses")({ component: BusinessesPage });
