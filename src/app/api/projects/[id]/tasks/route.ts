import { ProjectIdParams } from "@/app/api/projects/[id]/types";

export async function GET(request: Request, { params: { id } }: ProjectIdParams) {}
