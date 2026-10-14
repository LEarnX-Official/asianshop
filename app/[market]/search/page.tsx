import { Suspense } from "react";
import { SearchResultsView } from "@/components/search/search-results";

export default function SearchPage() {
  return (
    <section className="mx-auto max-w-[1280px] px-4 pb-10 pt-8 sm:px-6">
      <Suspense fallback={<div className="skeleton h-12 w-72 rounded-xl" />}>
        <SearchResultsView />
      </Suspense>
    </section>
  );
}
