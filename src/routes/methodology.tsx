import { createFileRoute } from "@tanstack/react-router";
import { MethodologyPage } from "@/components/methodology-page";

export const Route = createFileRoute("/methodology")({ component: MethodologyPage });
