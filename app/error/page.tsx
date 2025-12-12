import { ErrorDisplay } from "@/components/error-display"

export default function ErrorPage({
  searchParams,
}: {
  searchParams: { message?: string }
}) {
  return <ErrorDisplay message={searchParams.message} />
}
