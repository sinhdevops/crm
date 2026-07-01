import { PipelineClient } from "./_components/PipelineClient";
import { getPipeline } from "@/server/queries/deals";

export default async function PipelinePage() {
  const initialPipeline = await getPipeline();

  return <PipelineClient initialPipeline={initialPipeline} />;
}
